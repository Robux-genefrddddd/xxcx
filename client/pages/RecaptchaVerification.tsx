import { useState, useEffect } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
        }
      ) => void;
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
    };
    onRecaptchaSuccess?: (token: string) => void;
  }
}

const RECAPTCHA_KEY = "6Lf6tSksAAAAACrv64btZy5rTd6XsfFDjdLOL-bi";

interface LocationState {
  email?: string;
}

export default function RecaptchaVerification() {
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState || {};
  const email = state.email || "";

  useEffect(() => {
    if (!email) {
      navigate("/");
    }
  }, [email, navigate]);

  useEffect(() => {
    window.onRecaptchaSuccess = (token: string) => {
      setRecaptchaToken(token);
      console.log("reCAPTCHA completed with token:", token);
    };

    if (window.grecaptcha && document.getElementById("recaptcha-container")) {
      try {
        window.grecaptcha.render("recaptcha-container", {
          sitekey: RECAPTCHA_KEY,
          callback: window.onRecaptchaSuccess,
          "error-callback": () => {
            setError("reCAPTCHA failed to load. Please refresh and try again.");
          },
        });
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || "Failed to render reCAPTCHA");
      }
    }
  }, []);

  const handleContinue = async () => {
    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA verification first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Proceeding with reCAPTCHA token:", recaptchaToken);
      setVerificationComplete(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null;
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
        <div className="flex items-center gap-2 mb-12 text-slate-400">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F91e2732f1c03487e879c66ee97e72712%2Fee08390eccc04e8dbea3ce5415d97e92?format=webp&width=800"
            alt="PinPinCloud"
            className="w-6 h-6"
          />
          <span className="text-sm font-medium">PinPinCloud</span>
        </div>

        {/* Card */}
        <div
          className="rounded-lg p-8 space-y-6 border"
          style={{
            backgroundColor: "#111214",
            borderColor: "#1F2124",
          }}
        >
          {!verificationComplete ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
                  Verify Identity
                </h1>
                <p className="text-slate-400 text-base">
                  Complete the reCAPTCHA verification to continue
                </p>
              </div>

              {/* Email Display */}
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: "#141518",
                  borderColor: "#1F2124",
                }}
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Signing in as
                    </p>
                    <p className="text-white font-medium text-sm">{email}</p>
                  </div>
                </div>
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

              {/* reCAPTCHA Widget */}
              <div className="flex flex-col items-center">
                <p className="text-sm text-slate-300 mb-4 text-center">
                  Please verify that you're not a robot
                </p>
                <div
                  id="recaptcha-container"
                  className="flex justify-center mb-6"
                ></div>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={loading || !recaptchaToken}
                className="w-full py-3 px-4 rounded-lg text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative"
                style={{
                  background: `linear-gradient(135deg, #1A2647 0%, #0F0F10 100%)`,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Continuing...</span>
                  </>
                ) : recaptchaToken ? (
                  <>
                    <span>Continue to Dashboard</span>
                  </>
                ) : (
                  <>
                    <span>Complete reCAPTCHA</span>
                  </>
                )}
              </button>

              {/* Back to Login */}
              <div
                className="text-center pt-4 border-t"
                style={{ borderColor: "#1F2124" }}
              >
                <button
                  onClick={() => navigate("/")}
                  className="text-slate-400 hover:text-slate-200 text-sm font-medium transition"
                >
                  Back to Sign In
                </button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6 py-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: "#1A2647" }}
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Verified!
                </h2>
                <p className="text-slate-400 text-sm">
                  You have been verified successfully. Redirecting to dashboard...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
