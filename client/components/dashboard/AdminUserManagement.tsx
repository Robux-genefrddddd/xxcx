import { useState, useEffect } from "react";
import { Trash2, Shield } from "lucide-react";
import { getThemeColors } from "@/lib/theme-colors";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  UserRole,
  canPerformCriticalActions,
  canManageUsers,
} from "@/lib/auth-utils";

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  plan: "free" | "premium" | "lifetime";
  storageUsed: number;
  createdAt: string;
}

interface AdminUserManagementProps {
  theme: string;
  userRole: UserRole;
  currentUserId: string;
}

export function AdminUserManagement({
  theme,
  userRole,
  currentUserId,
}: AdminUserManagementProps) {
  const colors = getThemeColors(theme);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, "userRoles"));
      const userList: AdminUser[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const roleData = userDoc.data();

        // Get plan info
        let plan: "free" | "premium" | "lifetime" = "free";
        let storageUsed = 0;
        try {
          const planDoc = await getDoc(doc(db, "userPlans", userId));
          if (planDoc.exists()) {
            plan = planDoc.data().type || "free";
            storageUsed = planDoc.data().storageUsed || 0;
          }
        } catch (error) {
          console.error(`Error loading plan for ${userId}:`, error);
        }

        // Get user email from auth or alternative source
        let email = "";
        let name = "";
        try {
          const fileQuery = query(collection(db, "files"));
          const filesSnapshot = await getDocs(fileQuery);
          const userFile = filesSnapshot.docs.find(
            (doc) => doc.data().userId === userId,
          );
          if (userFile) {
            // Try to extract from user context if available
          }
        } catch (error) {
          console.error(`Error loading user info for ${userId}:`, error);
        }

        userList.push({
          id: userId,
          email: email || `user_${userId.substring(0, 6)}`,
          name: name || "Unknown",
          role: roleData.role || "user",
          plan,
          storageUsed,
          createdAt: new Date().toLocaleDateString(),
        });
      }

      setUsers(userList);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (userId === currentUserId) {
      alert("Cannot change your own role");
      return;
    }

    try {
      await updateDoc(doc(db, "userRoles", userId), { role: newRole });
      loadUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role");
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === currentUserId) {
      alert("Cannot delete your own account");
      return;
    }

    if (
      !confirm("Are you sure? This will delete the user and all their data.")
    ) {
      return;
    }

    if (!canPerformCriticalActions(userRole)) {
      alert("You don't have permission to delete users");
      return;
    }

    try {
      // Delete user role
      await deleteDoc(doc(db, "userRoles", userId));
      // Delete user plan
      await deleteDoc(doc(db, "userPlans", userId));
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1) + "MB";
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold" style={{ color: colors.text }}>
        User Management
      </h3>

      {/* Users Table */}
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
              Loading users...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p style={{ color: colors.textSecondary }}>No users found</p>
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
                    Email
                  </th>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ color: colors.text }}
                  >
                    Role
                  </th>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ color: colors.text }}
                  >
                    Plan
                  </th>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ color: colors.text }}
                  >
                    Storage Used
                  </th>
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    style={{ color: colors.text }}
                  >
                    Joined
                  </th>
                  {canManageUsers(userRole) && (
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
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="border-b hover:opacity-75 transition-opacity"
                    style={{
                      borderBottomColor: colors.border,
                      backgroundColor:
                        idx % 2 === 0 ? colors.card : colors.sidebar,
                    }}
                  >
                    <td className="px-6 py-4">
                      <p style={{ color: colors.text }}>{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {canManageUsers(userRole) ? (
                        <select
                          value={user.role}
                          onChange={(e) =>
                            updateUserRole(user.id, e.target.value as UserRole)
                          }
                          className="px-2 py-1 rounded text-xs border focus:outline-none"
                          style={{
                            backgroundColor: colors.sidebar,
                            borderColor: colors.border,
                            color: colors.text,
                          }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="founder">Founder</option>
                        </select>
                      ) : (
                        <span
                          className="px-2 py-1 rounded text-xs font-medium inline-block"
                          style={{
                            backgroundColor:
                              user.role === "founder"
                                ? "rgba(34, 197, 94, 0.1)"
                                : user.role === "admin"
                                  ? "rgba(59, 130, 246, 0.1)"
                                  : "rgba(156, 163, 175, 0.1)",
                            color:
                              user.role === "founder"
                                ? "#22C55E"
                                : user.role === "admin"
                                  ? colors.primary
                                  : colors.textSecondary,
                          }}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor:
                            user.plan === "premium"
                              ? "rgba(34, 197, 94, 0.1)"
                              : user.plan === "lifetime"
                                ? "rgba(168, 85, 247, 0.1)"
                                : "rgba(59, 130, 246, 0.1)",
                          color:
                            user.plan === "premium"
                              ? "#22C55E"
                              : user.plan === "lifetime"
                                ? "#A855F7"
                                : colors.primary,
                        }}
                      >
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4" style={{ color: colors.text }}>
                      {formatStorage(user.storageUsed)}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ color: colors.textSecondary }}
                    >
                      {user.createdAt}
                    </td>
                    {canManageUsers(userRole) && (
                      <td className="px-6 py-4">
                        {canPerformCriticalActions(userRole) && (
                          <button
                            onClick={() => deleteUser(user.id)}
                            disabled={user.id === currentUserId}
                            className="p-2 rounded hover:opacity-60 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                            title={
                              user.id === currentUserId
                                ? "Cannot delete your own account"
                                : "Delete user"
                            }
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <p style={{ color: colors.textSecondary }} className="text-sm">
            Total Users
          </p>
          <p
            className="text-2xl font-bold mt-2"
            style={{ color: colors.accent }}
          >
            {users.length}
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
            Admins
          </p>
          <p
            className="text-2xl font-bold mt-2"
            style={{ color: colors.primary }}
          >
            {
              users.filter((u) => u.role === "admin" || u.role === "founder")
                .length
            }
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
            Premium Users
          </p>
          <p className="text-2xl font-bold mt-2" style={{ color: "#22C55E" }}>
            {users.filter((u) => u.plan !== "free").length}
          </p>
        </div>
      </div>
    </div>
  );
}
