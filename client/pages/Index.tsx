import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    grecaptcha?: {
      enterprise?: {
        execute: (key: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

const RECAPTCHA_KEY = "6Lf6tSksAAAAACrv64btZy5rTd6XsfFDjdLOL-bi";

const executeRecaptcha = async (action: string): Promise<string> => {
  if (!window.grecaptcha?.enterprise) {
    throw new Error("reCAPTCHA not loaded");
  }
  return window.grecaptcha.enterprise.execute(RECAPTCHA_KEY, { action });
};

export default function Index() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };

  const isPasswordStrong =
    Object.values(passwordStrength).filter(Boolean).length >= 3;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before signing in");
        await signOut(auth);
        return;
      }

      navigate("/recaptcha-verification", { state: { email } });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password");
      } else if (error.code === "auth/user-not-found") {
        setError("User not found");
      } else {
        setError(error.message || "Sign in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isPasswordStrong) {
      setError("Password is not strong enough");
      return;
    }

    setLoading(true);

    try {
      const recaptchaToken = await executeRecaptcha("register");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Send verification email
      await sendEmailVerification(userCredential.user);
      setVerificationSent(true);
      setError("");

      console.log(
        "Registration successful with reCAPTCHA token:",
        recaptchaToken,
      );

      setTimeout(() => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
        setIsLogin(true);
        setVerificationSent(false);
      }, 3000);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else {
        setError(error.message || "Registration failed");
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
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{
        backgroundColor: "#0E0E0F",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23222223' fill-opacity='0.08'%3E%3Cpath d='M29 30l-1-1 1-1 1 1-1 1M30 29l-1-1 1-1 1 1-1 1M30 31l-1 1 1 1 1-1-1-1M31 30l 1-1-1-1-1 1 1 1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      <style>{`
        @keyframes sheenSlant {
          0% {
            left: -100%;
            top: 0;
          }
          100% {
            left: 100%;
            top: 0;
          }
        }

        .sheen-button {
          position: relative;
          overflow: hidden;
        }

        .sheen-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 8%;
          height: 100%;
          background: linear-gradient(
            135deg,
            transparent,
            rgba(255, 255, 255, 0.25),
            transparent
          );
          animation: sheenSlant 3s ease-in-out infinite;
        }

        .sheen-button > * {
          position: relative;
          z-index: 1;
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-12 text-slate-400">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F91e2732f1c03487e879c66ee97e72712%2Fee08390eccc04e8dbea3ce5415d97e92?format=webp&width=800"
            alt="PinPinCloud"
            className="w-6 h-6"
          />
          <span className="text-sm font-medium">PinPinCloud</span>
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          {verificationSent ? (
            <>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                Verify your email
              </h1>
              <p className="text-slate-400 text-base">
                We've sent a verification link to {email}. Check your inbox and
                click the link to activate your account.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                {isLogin ? "Welcome back" : "Create account"}
              </h1>
              <p className="text-slate-400 text-base">
                {isLogin
                  ? "Sign in to your account to continue"
                  : "Join and start managing your projects"}
              </p>
            </>
          )}
        </div>

        {/* Card */}
        <div
          className="rounded-lg p-8 space-y-6 border"
          style={{
            backgroundColor: "#111214",
            borderColor: "#1F2124",
          }}
        >
          {!verificationSent ? (
            <>
              {/* Tabs */}
              <div
                className="flex gap-3 p-1 bg-slate-800/50 rounded-lg border"
                style={{ borderColor: "#1F2124" }}
              >
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-colors ${
                    isLogin
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-colors ${
                    !isLogin
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Sign Up
                </button>
              </div>

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
              <form
                onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}
                className="space-y-5"
              >
                {/* Name Field (Register Only) */}
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                  {isLogin && (
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                        Password
                      </label>
                      <a
                        href="#"
                        className="text-xs text-blue-400 hover:text-blue-300 transition font-medium"
                      >
                        Forgot?
                      </a>
                    </div>
                  )}
                  {!isLogin && (
                    <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                      Password
                    </label>
                  )}
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pl-11 pr-11 text-white placeholder-slate-600 text-sm rounded-lg border transition-colors focus:outline-none"
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
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-400 transition"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength (Register Only) */}
                  {!isLogin && password && (
                    <div className="space-y-2 pt-3">
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(passwordStrength).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className={`h-1 rounded-full transition ${
                                value ? "bg-blue-500" : "bg-slate-700"
                              }`}
                            />
                          ),
                        )}
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

                {/* Confirm Password (Register Only) */}
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 pl-11 pr-11 text-white placeholder-slate-600 text-sm rounded-lg border transition-colors focus:outline-none"
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
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-400 transition"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember Me (Login Only) */}
                {isLogin && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded bg-slate-800 border cursor-pointer accent-blue-500"
                      style={{
                        borderColor: "#2A2E33",
                      }}
                      defaultChecked
                    />
                    <span className="text-sm text-slate-400">Remember me</span>
                  </label>
                )}

                {/* Terms (Register Only) */}
                {!isLogin && (
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
                )}

                {/* Submit Button with Sheen Effect */}
                <button
                  type="submit"
                  disabled={loading || (!isLogin && !isPasswordStrong)}
                  className="sheen-button w-full py-3 px-4 rounded-lg text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-8 relative"
                  style={{
                    background: `linear-gradient(135deg, #1A2647 0%, #0F0F10 100%)`,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>
                        {isLogin ? "Signing in..." : "Creating account..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
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
                    onClick={handleGoogleSignIn}
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
                    onClick={handleGithubSignIn}
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
              <div
                className="text-center pt-6 border-t"
                style={{ borderColor: "#1F2124" }}
              >
                <p className="text-slate-400 text-sm">
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                      setEmail("");
                      setPassword("");
                      setName("");
                      setConfirmPassword("");
                    }}
                    className="text-slate-200 hover:text-white font-semibold transition"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6 py-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: "#1A2647" }}
              >
                <Mail className="w-8 h-8 text-slate-200" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Check your inbox
                </h2>
                <p className="text-slate-400 text-sm">
                  Verification email has been sent. Click the link to activate
                  your account.
                </p>
              </div>
              <button
                onClick={() => setIsLogin(true)}
                className="w-full py-2.5 px-4 rounded-lg text-slate-300 text-sm font-medium border"
                style={{
                  backgroundColor: "#0F1113",
                  borderColor: "#1F2124",
                }}
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
