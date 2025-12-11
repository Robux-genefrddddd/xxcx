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
      <div
        className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
        style={{
          backgroundColor: "#0E0E0F",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23222223' fill-opacity='0.08'%3E%3Cpath d='M29 30l-1-1 1-1 1 1-1 1M30 29l-1-1 1-1 1 1-1 1M30 31l-1 1 1 1 1-1-1-1M31 30l 1-1-1-1-1 1 1 1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      >
        <div className="relative z-10 text-center space-y-6 max-w-md">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: "#1A2647" }}
          >
            <Check className="w-8 h-8 text-slate-200" />
          </div>
          <h1 className="text-4xl font-bold text-white">Account created!</h1>
          <p className="text-slate-400">
            Your account is ready to use. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{
        backgroundColor: "#0E0E0F",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23222223' fill-opacity='0.08'%3E%3Cpath d='M29 30l-1-1 1-1 1 1-1 1M30 29l-1-1 1-1 1 1-1 1M30 31l-1 1 1 1 1-1-1-1M31 30l 1-1-1-1-1 1 1 1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 mb-12 text-slate-400 hover:text-white transition"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F91e2732f1c03487e879c66ee97e72712%2Fee08390eccc04e8dbea3ce5415d97e92?format=webp&width=800"
            alt="PinPinCloud"
            className="w-6 h-6"
          />
          <span className="text-sm font-medium">PinPinCloud</span>
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Create account
          </h1>
          <p className="text-slate-400 text-base">
            Join and start managing your projects
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-lg p-8 space-y-6 border"
          style={{
            backgroundColor: "#111214",
            borderColor: "#1F2124",
          }}
        >
          {/* Error Message */}
          {error && (
            <div
              className="px-4 py-3 rounded text-sm border"
              style={{
                backgroundColor: "#1F1315",
                borderColor: "#4A2428",
                color: "#FF6B6B",
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 pl-11 text-white placeholder-slate-600 text-sm rounded-lg border transition-colors focus:outline-none"
                  style={{
                    backgroundColor: "#141518",
                    borderColor: "#1F2124",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2A2E33";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#1F2124";
                  }}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 pl-11 text-white placeholder-slate-600 text-sm rounded-lg border transition-colors focus:outline-none"
                  style={{
                    backgroundColor: "#141518",
                    borderColor: "#1F2124",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2A2E33";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#1F2124";
                  }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pl-11 text-white placeholder-slate-600 text-sm rounded-lg border transition-colors focus:outline-none"
                  style={{
                    backgroundColor: "#141518",
                    borderColor: "#1F2124",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2A2E33";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#1F2124";
                  }}
                  required
                />
              </div>

              {/* Password Strength */}
              {formData.password && (
                <div className="space-y-2 pt-3">
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(passwordStrength).map(([key, value]) => (
                      <div
                        key={key}
                        className={`h-1 rounded-full transition ${
                          value ? "bg-blue-500" : "bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      isPasswordStrong ? "text-blue-400" : "text-slate-500"
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
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pl-11 text-white placeholder-slate-600 text-sm rounded-lg border transition-colors focus:outline-none"
                  style={{
                    backgroundColor: "#141518",
                    borderColor: "#1F2124",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2A2E33";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#1F2124";
                  }}
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                className="w-4 h-4 rounded bg-slate-800 border mt-1 cursor-pointer accent-blue-500"
                style={{
                  borderColor: "#2A2E33",
                }}
                required
              />
              <span className="text-sm text-slate-400">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition font-medium"
                >
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isPasswordStrong}
              className="w-full py-3 px-4 rounded-lg text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-8"
              style={{
                background: `linear-gradient(135deg, #1A2647 0%, #0F0F10 100%)`,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
              }}
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
            <div className="flex items-center gap-3 py-3">
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "#1F2124" }}
              ></div>
              <span className="text-xs text-slate-600 uppercase tracking-wide">
                Or
              </span>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "#1F2124" }}
              ></div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="py-2.5 px-4 rounded-lg text-slate-300 text-sm font-medium transition-colors hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border"
                style={{
                  backgroundColor: "#0F1113",
                  borderColor: "#1F2124",
                }}
              >
                Google
              </button>
              <button
                type="button"
                onClick={handleGithubSignUp}
                disabled={loading}
                className="py-2.5 px-4 rounded-lg text-slate-300 text-sm font-medium transition-colors hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border"
                style={{
                  backgroundColor: "#0F1113",
                  borderColor: "#1F2124",
                }}
              >
                GitHub
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center pt-6 border-t" style={{ borderColor: "#1F2124" }}>
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-slate-200 hover:text-white font-semibold transition"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Back Link */}
          <Link
            to="/"
            className="block text-center text-xs text-slate-500 hover:text-slate-400 transition mt-2"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
