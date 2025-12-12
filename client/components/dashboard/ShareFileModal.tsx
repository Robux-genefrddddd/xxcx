import { X, Lock, Link2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { getThemeColors } from "@/lib/theme-colors";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ShareFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
  theme: string;
  onShareComplete?: () => void;
}

export function ShareFileModal({
  isOpen,
  onClose,
  fileId,
  fileName,
  theme,
  onShareComplete,
}: ShareFileModalProps) {
  const colors = getThemeColors(theme);
  const [shareType, setShareType] = useState<"link" | "password">("link");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"options" | "confirm">("options");

  const generateShareUrl = () => {
    return `${window.location.origin}/share/${fileId}`;
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const url = generateShareUrl();
      const fileRef = doc(db, "files", fileId);

      const updateData: any = {
        shared: true,
        shareUrl: url,
        sharePassword: shareType === "password" ? password : null,
        shareCreatedAt: new Date().toISOString(),
      };

      await updateDoc(fileRef, updateData);
      setShareUrl(url);
      setStep("confirm");

      if (onShareComplete) {
        onShareComplete();
      }
    } catch (error) {
      console.error("Error sharing file:", error);
      alert("Failed to share file");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStep("options");
    setPassword("");
    setShareUrl("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border shadow-2xl overflow-hidden"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Header */}
            <motion.div
              className="flex items-center justify-between p-6 border-b relative z-10"
              style={{
                borderColor: colors.border,
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.accentLight }}
                >
                  <Link2
                    className="w-5 h-5"
                    style={{ color: colors.primary }}
                  />
                </div>
                <div>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: colors.text }}
                  >
                    {step === "options" ? "Share File" : "Link Ready"}
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {fileName.length > 30
                      ? fileName.substring(0, 27) + "..."
                      : fileName}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="p-1 rounded hover:opacity-60 transition-opacity"
                style={{
                  color: colors.textSecondary,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Content */}
            <div className="p-6 space-y-6 relative z-10">
              <AnimatePresence mode="wait">
                {step === "options" ? (
                  <motion.div
                    key="options"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Share Type Selection */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <label
                        className="block text-sm font-medium mb-3"
                        style={{ color: colors.text }}
                      >
                        Share Type
                      </label>
                      <div className="space-y-2">
                        {[
                          {
                            type: "link",
                            label: "Public Link",
                            desc: "Anyone with the link can view",
                            icon: "🔗",
                          },
                          {
                            type: "password",
                            label: "Password Protected",
                            desc: "Requires a password to access",
                            icon: "🔐",
                          },
                        ].map((option) => (
                          <motion.button
                            key={option.type}
                            onClick={() =>
                              setShareType(option.type as "link" | "password")
                            }
                            className="w-full p-3 rounded-lg border-2 transition-all text-left"
                            style={{
                              backgroundColor:
                                shareType === option.type
                                  ? colors.accentLight
                                  : "transparent",
                              borderColor:
                                shareType === option.type
                                  ? colors.primary
                                  : colors.border,
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-xl mt-0.5">
                                {option.icon}
                              </span>
                              <div>
                                <p
                                  className="font-medium"
                                  style={{ color: colors.text }}
                                >
                                  {option.label}
                                </p>
                                <p
                                  className="text-xs mt-0.5"
                                  style={{ color: colors.textSecondary }}
                                >
                                  {option.desc}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Password Input */}
                    {shareType === "password" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: colors.text }}
                        >
                          Password
                        </label>
                        <motion.input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter a strong password"
                          className="w-full px-4 py-3 rounded-lg border text-sm transition-all"
                          style={{
                            backgroundColor: colors.sidebar,
                            borderColor: colors.border,
                            color: colors.text,
                          }}
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: `0 0 0 3px ${colors.primary}33`,
                          }}
                        />
                        <p
                          className="text-xs mt-2"
                          style={{ color: colors.textSecondary }}
                        >
                          Passwords should be at least 6 characters
                        </p>
                      </motion.div>
                    )}

                    {/* Info Box */}
                    <motion.div
                      className="p-3 rounded-lg border"
                      style={{
                        backgroundColor: colors.sidebar,
                        borderColor: colors.border,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        ✓ Shared files are only accessible via direct link
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: colors.textSecondary }}
                      >
                        ✓ Text files and documents will display inline
                      </p>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                  >
                    <motion.div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                      style={{
                        backgroundColor: "rgba(34, 197, 94, 0.1)",
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{
                          duration: 0.6,
                          ease: "easeInOut",
                          repeat: Infinity,
                        }}
                      >
                        <Check className="w-8 h-8 text-green-500" />
                      </motion.div>
                    </motion.div>

                    <div>
                      <h3
                        className="font-bold text-lg"
                        style={{ color: "#22C55E" }}
                      >
                        Share Link Ready!
                      </h3>
                      <p
                        className="text-sm mt-1"
                        style={{ color: colors.textSecondary }}
                      >
                        Your file is ready to share
                      </p>
                    </div>

                    <motion.div
                      className="p-3 rounded-lg border-2 overflow-hidden"
                      style={{
                        backgroundColor: colors.sidebar,
                        borderColor: colors.primary,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p
                        className="text-xs break-all font-mono"
                        style={{ color: colors.textSecondary }}
                      >
                        {shareUrl}
                      </p>
                    </motion.div>

                    {shareType === "password" && (
                      <motion.div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                          borderLeft: `3px solid ${colors.primary}`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <p
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          Password protected with: <strong>{password}</strong>
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <motion.div
              className="px-6 py-4 border-t space-y-3 relative z-10"
              style={{
                borderColor: colors.border,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: step === "options" ? 0.3 : 0.2 }}
            >
              {step === "options" ? (
                <>
                  <motion.button
                    onClick={handleShare}
                    disabled={
                      loading ||
                      (shareType === "password" && password.length < 6)
                    }
                    className="w-full py-2 px-4 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: colors.accentLight,
                      color: colors.primary,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      >
                        Creating share link...
                      </motion.span>
                    ) : (
                      "Create Share Link"
                    )}
                  </motion.button>
                  <motion.button
                    onClick={onClose}
                    className="w-full py-2 px-4 rounded-lg font-medium transition-all border"
                    style={{
                      backgroundColor: "transparent",
                      borderColor: colors.border,
                      color: colors.textSecondary,
                    }}
                    whileHover={{
                      backgroundColor: colors.sidebar,
                    }}
                  >
                    Cancel
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    onClick={handleCopyLink}
                    className="w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: colors.accentLight,
                      color: colors.primary,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handleReset}
                    className="w-full py-2 px-4 rounded-lg font-medium transition-all border"
                    style={{
                      backgroundColor: "transparent",
                      borderColor: colors.border,
                      color: colors.textSecondary,
                    }}
                    whileHover={{
                      backgroundColor: colors.sidebar,
                    }}
                  >
                    Create Another Link
                  </motion.button>
                  <motion.button
                    onClick={onClose}
                    className="w-full py-2 px-4 rounded-lg font-medium transition-all border"
                    style={{
                      backgroundColor: "transparent",
                      borderColor: colors.border,
                      color: colors.textSecondary,
                    }}
                    whileHover={{
                      backgroundColor: colors.sidebar,
                    }}
                  >
                    Done
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
