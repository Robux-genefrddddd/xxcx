import { useState, useEffect } from "react";
import { Plus, Copy, Trash2, Check } from "lucide-react";
import { getThemeColors } from "@/lib/theme-colors";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserRole, canCreateKeys } from "@/lib/auth-utils";

interface PremiumKey {
  id: string;
  key: string;
  status: "unused" | "used";
  assignedTo?: string;
  assignedEmail?: string;
  createdAt: string;
  usedAt?: string;
}

interface AdminKeyManagementProps {
  theme: string;
  userRole: UserRole;
}

export function AdminKeyManagement({
  theme,
  userRole,
}: AdminKeyManagementProps) {
  const colors = getThemeColors(theme);
  const [keys, setKeys] = useState<PremiumKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const docsSnapshot = await getDocs(collection(db, "premiumKeys"));
      const keyList: PremiumKey[] = docsSnapshot.docs.map((doc) => ({
        id: doc.id,
        key: doc.data().key,
        status: doc.data().status || "unused",
        assignedTo: doc.data().assignedTo,
        assignedEmail: doc.data().assignedEmail,
        createdAt: new Date(doc.data().createdAt).toLocaleDateString(),
        usedAt: doc.data().usedAt
          ? new Date(doc.data().usedAt).toLocaleDateString()
          : undefined,
      }));
      setKeys(keyList);
    } catch (error) {
      console.error("Error loading keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    if (!canCreateKeys(userRole)) {
      alert("You don't have permission to create keys");
      return;
    }

    setGeneratingKey(true);
    try {
      const newKey = `KEY_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      await addDoc(collection(db, "premiumKeys"), {
        key: newKey,
        status: "unused",
        createdAt: new Date().toISOString(),
      });
      loadKeys();
    } catch (error) {
      console.error("Error generating key:", error);
      alert("Failed to generate key");
    } finally {
      setGeneratingKey(false);
    }
  };

  const deleteKey = async (keyId: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "premiumKeys", keyId));
      loadKeys();
    } catch (error) {
      console.error("Error deleting key:", error);
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
            onClick={generateKey}
            disabled={generatingKey}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: colors.accent,
              color: colors.accentForeground,
            }}
          >
            <Plus className="w-4 h-4" />
            Generate Key
          </button>
        )}
      </div>

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
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: colors.accent }}></div>
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
                    Status
                  </th>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ color: colors.text }}
                  >
                    Assigned To
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
                {keys.map((key, idx) => (
                  <tr
                    key={key.id}
                    className="border-b hover:opacity-75 transition-opacity"
                    style={{
                      borderBottomColor: colors.border,
                      backgroundColor:
                        idx % 2 === 0 ? colors.card : colors.sidebar,
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
                            <Check className="w-4 h-4" style={{ color: "#22C55E" }} />
                          ) : (
                            <Copy className="w-4 h-4" style={{ color: colors.textSecondary }} />
                          )}
                        </button>
                      </div>
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
                            key.status === "used" ? "#22C55E" : colors.primary,
                        }}
                      >
                        {key.status === "used" ? "✓ Used" : "○ Unused"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p style={{ color: colors.text }}>
                        {key.assignedEmail || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4" style={{ color: colors.textSecondary }}>
                      {key.createdAt}
                    </td>
                    {canCreateKeys(userRole) && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteKey(key.id)}
                          className="p-2 rounded hover:opacity-60 transition-opacity"
                          title="Delete key"
                        >
                          <Trash2 className="w-4 h-4" style={{ color: "#EF4444" }} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
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
          <p className="text-2xl font-bold mt-2" style={{ color: colors.accent }}>
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
      </div>
    </div>
  );
}
