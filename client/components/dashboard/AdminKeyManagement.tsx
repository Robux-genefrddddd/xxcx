import { useState, useEffect } from "react";
import { Plus, Copy, Trash2, Check, AlertTriangle } from "lucide-react";
import { getThemeColors } from "@/lib/theme-colors";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserRole, canCreateKeys } from "@/lib/auth-utils";
import { PremiumKeyData } from "@shared/api";

interface PremiumKey extends PremiumKeyData {
  id: string;
}

interface AdminKeyManagementProps {
  theme: string;
  userRole: UserRole;
  userId: string;
}

interface KeyForm {
  type: "monthly" | "yearly" | "lifetime";
  maxEmojis: number;
}

export function AdminKeyManagement({
  theme,
  userRole,
  userId,
}: AdminKeyManagementProps) {
  const colors = getThemeColors(theme);
  const [keys, setKeys] = useState<PremiumKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<KeyForm>({
    type: "monthly",
    maxEmojis: 1000,
  });

  useEffect(() => {
    if (!canCreateKeys(userRole)) return;

    const unsubscribe = onSnapshot(
      collection(db, "premiumKeys"),
      (snapshot) => {
        const keyList: PremiumKey[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            key: data.key,
            status: data.status || "unused",
            type: data.type || "monthly",
            maxEmojis: data.maxEmojis || 1000,
            assignedTo: data.assignedTo,
            assignedEmail: data.assignedEmail,
            isActive: data.isActive !== false,
            createdAt: data.createdAt,
            usedAt: data.usedAt,
            expiresAt: data.expiresAt,
            createdBy: data.createdBy,
          };
        });
        setKeys(keyList);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading keys:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userRole]);

  const generateKey = async () => {
    if (!canCreateKeys(userRole)) {
      alert("You don't have permission to create keys");
      return;
    }

    setGeneratingKey(true);
    try {
      const generateRandomSegment = () => {
        return Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase()
          .padEnd(4, "0");
      };
      const newKey = `PINPIN-${generateRandomSegment()}-${generateRandomSegment()}-${generateRandomSegment()}`;
      const now = new Date();
      let expiresAt: string | undefined;

      if (formData.type === "monthly") {
        const expires = new Date(now);
        expires.setMonth(expires.getMonth() + 1);
        expiresAt = expires.toISOString();
      } else if (formData.type === "yearly") {
        const expires = new Date(now);
        expires.setFullYear(expires.getFullYear() + 1);
        expiresAt = expires.toISOString();
      }

      await setDoc(doc(db, "premiumKeys", newKey), {
        key: newKey,
        status: "unused",
        type: formData.type,
        maxEmojis: formData.maxEmojis,
        isActive: true,
        used: false,
        createdAt: now.toISOString(),
        createdBy: userId,
      } as PremiumKeyData);

      setShowGenerateForm(false);
      setFormData({ type: "monthly", maxEmojis: 1000 });
    } catch (error) {
      console.error("Error generating key:", error);
      alert("Failed to generate key");
    } finally {
      setGeneratingKey(false);
    }
  };

  const deleteKey = async (keyId: string, key: PremiumKey) => {
    try {
      await deleteDoc(doc(db, "premiumKeys", keyId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting key:", error);
      alert("Failed to delete key");
    }
  };

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold" style={{ color: colors.text }}>
          Premium Keys Management
        </h3>
        {canCreateKeys(userRole) && (
          <button
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{
              backgroundColor: colors.accent,
              color: "#FFFFFF",
            }}
          >
            <Plus className="w-4 h-4" />
            {showGenerateForm ? "Cancel" : "Generate Key"}
          </button>
        )}
      </div>

      {/* Generate Key Form */}
      {showGenerateForm && canCreateKeys(userRole) && (
        <div
          className="p-6 rounded-lg border space-y-4"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <h4 className="font-semibold" style={{ color: colors.text }}>
            Generate New Key
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                Key Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as KeyForm["type"],
                  })
                }
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={{
                  backgroundColor: colors.sidebar,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                Max Emojis
              </label>
              <input
                type="number"
                value={formData.maxEmojis}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxEmojis: parseInt(e.target.value) || 0,
                  })
                }
                min="1"
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={{
                  backgroundColor: colors.sidebar,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />
            </div>
          </div>

          <button
            onClick={generateKey}
            disabled={generatingKey}
            className="w-full px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: colors.accent,
              color: "#FFFFFF",
            }}
          >
            {generatingKey ? "Generating..." : "Create Key"}
          </button>
        </div>
      )}

      {/* Keys Table */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        {loading ? (
          <div className="px-6 py-8 text-center">
            <div
              className="inline-block animate-spin rounded-full h-6 w-6 border-b-2"
              style={{ borderColor: colors.accent }}
            ></div>
            <p className="mt-2" style={{ color: colors.textSecondary }}>
              Loading keys...
            </p>
          </div>
        ) : keys.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p style={{ color: colors.textSecondary }}>No premium keys yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    backgroundColor: colors.sidebar,
                    borderBottomColor: colors.border,
                  }}
                  className="border-b"
                >
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ color: colors.text }}
                  >
                    Key
                  </th>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ color: colors.text }}
                  >
                    Type
                  </th>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ color: colors.text }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ color: colors.text }}
                  >
                    Max Emojis
                  </th>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ color: colors.text }}
                  >
                    Created
                  </th>
                  {canCreateKeys(userRole) && (
                    <th
                      className="px-6 py-4 text-left font-semibold"
                      style={{ color: colors.text }}
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {keys.map((key, idx) => {
                  const isExpired =
                    key.expiresAt && new Date(key.expiresAt) < new Date();

                  return (
                    <tr
                      key={key.id}
                      className="border-b hover:opacity-75 transition-opacity"
                      style={{
                        borderBottomColor: colors.border,
                        backgroundColor:
                          idx % 2 === 0 ? colors.card : colors.sidebar,
                        opacity: isExpired ? 0.6 : 1,
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code
                            className="px-2 py-1 rounded text-xs font-mono"
                            style={{
                              backgroundColor: colors.sidebar,
                              color: colors.accent,
                            }}
                          >
                            {key.key.substring(0, 20)}...
                          </code>
                          <button
                            onClick={() => copyToClipboard(key.key, key.id)}
                            className="p-1 rounded hover:opacity-60 transition-opacity"
                            title="Copy to clipboard"
                          >
                            {copiedId === key.id ? (
                              <Check
                                className="w-4 h-4"
                                style={{ color: "#22C55E" }}
                              />
                            ) : (
                              <Copy
                                className="w-4 h-4"
                                style={{ color: colors.textSecondary }}
                              />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium inline-block"
                          style={{
                            backgroundColor:
                              key.type === "lifetime"
                                ? "rgba(168, 85, 247, 0.1)"
                                : "rgba(59, 130, 246, 0.1)",
                            color:
                              key.type === "lifetime"
                                ? "#A855F7"
                                : colors.primary,
                          }}
                        >
                          {key.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor:
                              key.status === "used"
                                ? "rgba(34, 197, 94, 0.1)"
                                : "rgba(59, 130, 246, 0.1)",
                            color:
                              key.status === "used"
                                ? "#22C55E"
                                : colors.primary,
                          }}
                        >
                          {key.status === "used" ? "✓ Used" : "○ Unused"}
                        </span>
                        {isExpired && (
                          <span
                            className="ml-2 px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                              color: "#EF4444",
                            }}
                          >
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4" style={{ color: colors.text }}>
                        {key.maxEmojis || "-"}
                      </td>
                      <td
                        className="px-6 py-4"
                        style={{ color: colors.textSecondary }}
                      >
                        {new Date(key.createdAt).toLocaleDateString()}
                      </td>
                      {canCreateKeys(userRole) && (
                        <td className="px-6 py-4">
                          {deleteConfirm === key.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => deleteKey(key.id, key)}
                                className="px-2 py-1 rounded text-xs font-medium transition-opacity hover:opacity-80"
                                style={{
                                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                                  color: "#EF4444",
                                }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 rounded text-xs font-medium transition-opacity hover:opacity-80"
                                style={{
                                  backgroundColor: colors.sidebar,
                                  color: colors.textSecondary,
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(key.id)}
                              className="p-2 rounded hover:opacity-60 transition-opacity"
                              title="Delete key"
                            >
                              <Trash2
                                className="w-4 h-4"
                                style={{ color: "#EF4444" }}
                              />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <p style={{ color: colors.textSecondary }} className="text-sm">
            Total Keys
          </p>
          <p
            className="text-2xl font-bold mt-2"
            style={{ color: colors.accent }}
          >
            {keys.length}
          </p>
        </div>
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <p style={{ color: colors.textSecondary }} className="text-sm">
            Keys Used
          </p>
          <p className="text-2xl font-bold mt-2" style={{ color: "#22C55E" }}>
            {keys.filter((k) => k.status === "used").length}
          </p>
        </div>
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <p style={{ color: colors.textSecondary }} className="text-sm">
            Lifetime Keys
          </p>
          <p className="text-2xl font-bold mt-2" style={{ color: "#A855F7" }}>
            {keys.filter((k) => k.type === "lifetime").length}
          </p>
        </div>
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <p style={{ color: colors.textSecondary }} className="text-sm">
            Expired Keys
          </p>
          <p className="text-2xl font-bold mt-2" style={{ color: "#F59E0B" }}>
            {
              keys.filter(
                (k) => k.expiresAt && new Date(k.expiresAt) < new Date(),
              ).length
            }
          </p>
        </div>
      </div>
    </div>
  );
}
