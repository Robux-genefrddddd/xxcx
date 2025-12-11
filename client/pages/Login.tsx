import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password");
      } else if (error.code === "auth/user-not-found") {
        setError("User not found");
      } else if (error.code === "auth/wrong-password") {
        setError("Wrong password");
      } else {
        setError(error.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "GitHub sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden flex items-center justify-center px-6">
      {/* Animated gradient sphere background */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400 via-blue-300 to-orange-200 rounded-full blur-3xl opacity-30 animate-pulse -mr-48"></div>
      <div
        className="absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-t from-cyan-400 to-transparent rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 mb-8 hover:opacity-80 transition"
          >
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-gray-900">Studio</span>
          </Link>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600 mb-8">Sign in to your account</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-900 focus:ring-0 transition"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-blue-900 hover:text-blue-800 transition font-medium"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-900 focus:ring-0 transition"
                  required
                />
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-900 focus:ring-0 cursor-pointer"
                defaultChecked
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-4 my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="bg-gray-50 border border-gray-200 py-3 rounded-lg hover:bg-gray-100 font-medium transition text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Google
              </button>
              <button
                type="button"
                onClick={handleGithubSignIn}
                disabled={loading}
                className="bg-gray-50 border border-gray-200 py-3 rounded-lg hover:bg-gray-100 font-medium transition text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                GitHub
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-900 hover:text-blue-800 font-bold transition"
              >
                Create one
              </Link>
            </p>
          </div>

          {/* Back Link */}
          <Link
            to="/"
            className="block mt-6 text-center text-sm text-gray-600 hover:text-gray-900 transition"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
