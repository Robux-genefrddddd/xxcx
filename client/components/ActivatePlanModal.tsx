import { useState, useEffect } from "react";
import { X, CheckCircle, Loader } from "lucide-react";
import { validateActivationKey, activatePremiumPlan } from "@/lib/use-auth";
import confetti from "canvas-confetti";

interface ActivatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
  theme: string;
}

export default function ActivatePlanModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
  theme,
}: ActivatePlanModalProps) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await validateActivationKey(userId, key.trim());
      await activatePremiumPlan(userId);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSuccess(true);
      setKey("");

      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const themeColors = {
    dark: {
      bg: "#111214",
      border: "#1F2124",
      text: "#FFFFFF",
      textMuted: "#9CA3AF",
      input: "#141518",
    },
    light: {
      bg: "#FFFFFF",
      border: "#E5E7EB",
      text: "#111827",
      textMuted: "#6B7280",
      input: "#FFFFFF",
    },
    blue: {
      bg: "#1E3A8A",
      border: "#1E40AF",
      text: "#FFFFFF",
      textMuted: "#93C5FD",
      input: "#1E3A8A",
    },
  };

  const colors =
    themeColors[theme as keyof typeof themeColors] || themeColors.dark;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 perspective">
      <style>{`
        .perspective {
          perspective: 1000px;
        }

        @keyframes float3d {
          0%, 100% {
            transform: translateY(0px) rotateX(0deg) rotateY(0deg);
          }
          25% {
            transform: translateY(-5px) rotateX(1deg) rotateY(-1deg);
          }
          50% {
            transform: translateY(-10px) rotateX(0deg) rotateY(0deg);
          }
          75% {
            transform: translateY(-5px) rotateX(-1deg) rotateY(1deg);
          }
        }

        .modal-3d {
          animation: float3d 6s ease-in-out infinite;
        }

        .modal-glow {
          box-shadow: 0 0 30px rgba(96, 165, 250, 0.3), 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .modal-ornament {
          position: absolute;
          bottom: -20px;
          left: -20px;
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
          border-radius: 50%;
          filter: blur(20px);
          z-index: -1;
        }
      `}</style>

      <div
        className="rounded-lg p-8 max-w-md w-full mx-4 relative modal-3d modal-glow"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          border: "1px solid",
        }}
      >
        <div className="modal-ornament"></div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:opacity-70 transition"
          style={{ color: colors.textMuted }}
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center space-y-4 py-8">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
            <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
              Congratulations!
            </h2>
            <p style={{ color: colors.textMuted }}>
              Your Premium plan has been activated. Enjoy unlimited storage!
            </p>
          </div>
        ) : (
          <>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: colors.text }}
            >
              Activate Premium Plan
            </h2>
            <p className="mb-6" style={{ color: colors.textMuted }}>
              Enter your activation key to upgrade to Premium
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="px-4 py-3 rounded text-sm border"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    borderColor: "#EF4444",
                    color: "#EF4444",
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: colors.textMuted }}
                >
                  Activation Key
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none"
                  style={{
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                  required
                  disabled={loading}
                />
              </div>

              <div
                className="p-4 rounded-lg border text-sm space-y-2"
                style={{
                  backgroundColor: "rgba(96, 165, 250, 0.1)",
                  borderColor: "#60A5FA",
                }}
              >
                <p style={{ color: colors.text }} className="font-medium">
                  Premium Benefits:
                </p>
                <ul className="space-y-1" style={{ color: colors.textMuted }}>
                  <li>✓ Unlimited Storage (vs 1GB Free)</li>
                  <li>✓ Priority Support</li>
                  <li>✓ Advanced Sharing Options</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || !key.trim()}
                className="w-full py-3 px-4 rounded-lg text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, #1A2647 0%, #0F0F10 100%)",
                }}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Activate Premium"
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full py-2 px-4 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                Cancel
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
