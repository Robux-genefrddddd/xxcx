import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*]/.test(formData.password),
  };

  const isPasswordStrong =
    Object.values(passwordStrength).filter(Boolean).length >= 3;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isPasswordStrong) {
      setError("Password is not strong enough");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      await updateProfile(userCredential.user, {
        displayName: formData.name,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError(error.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Google sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignUp = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "GitHub sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden flex items-center justify-center px-6">
        {/* Animated gradient sphere background */}
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400 via-blue-300 to-orange-200 rounded-full blur-3xl opacity-30 animate-pulse -mr-48"></div>
        <div
          className="absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-t from-cyan-400 to-transparent rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="relative z-10 text-center space-y-6 max-w-md">
          <div className="w-16 h-16 bg-cyan-400 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-blue-900" />
          </div>
          <h1 className="text-4xl font-bold text-white">Account created!</h1>
          <p className="text-white/80">
            Welcome to Studio. Your account is ready to use. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden flex items-center justify-center px-6 py-12">
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
            Create account
          </h1>
          <p className="text-gray-600 mb-8">
            Join thousands of teams building amazing things
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-900 focus:ring-0 transition"
                  required
                />
              </div>
            </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-900 focus:ring-0 transition"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-900 focus:ring-0 transition"
                  required
                />
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(passwordStrength).map(([key, value]) => (
                      <div
                        key={key}
                        className={`h-1 rounded-full transition ${
                          value ? "bg-cyan-400" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      isPasswordStrong ? "text-cyan-600" : "text-gray-600"
                    }`}
                  >
                    {isPasswordStrong
                      ? "Strong password"
                      : "Add uppercase, numbers, and symbols"}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-900 focus:ring-0 transition"
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-900 focus:ring-0 cursor-pointer mt-1"
                required
              />
              <span className="text-sm text-gray-600">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-blue-900 hover:text-blue-800 transition font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-blue-900 hover:text-blue-800 transition font-medium"
                >
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isPasswordStrong}
              className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
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
                  Or sign up with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="bg-gray-50 border border-gray-200 py-3 rounded-lg hover:bg-gray-100 font-medium transition text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Google
              </button>
              <button
                type="button"
                onClick={handleGithubSignUp}
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
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-900 hover:text-blue-800 font-bold transition"
              >
                Sign in
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
