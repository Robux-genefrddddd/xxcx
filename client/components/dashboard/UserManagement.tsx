import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { getThemeColors } from "@/lib/theme-colors";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface UserManagementProps {
  users: User[];
  theme: string;
  onAddUser: (name: string, email: string, role: "admin" | "user") => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUserRole: (userId: string, role: "admin" | "user") => void;
}

export function UserManagement({
  users,
  theme,
  onAddUser,
  onDeleteUser,
  onUpdateUserRole,
}: UserManagementProps) {
  const colors = getThemeColors(theme);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserName, setDeleteUserName] = useState("");

  const handleSubmit = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert("Please fill all fields");
      return;
    }
    onAddUser(newUserName, newUserEmail, newUserRole);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("user");
  };

  const inputStyle = {
    backgroundColor: colors.card,
    borderColor: colors.border,
    color: colors.text,
  };

  const selectStyle = {
    backgroundColor: colors.card,
    borderColor: colors.border,
    color: colors.text,
  };

  return (
    <div className="space-y-6">
      {/* Add User Form */}
      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
          Add New User
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            className="px-4 py-2 rounded-xl border text-sm focus:outline-none"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="px-4 py-2 rounded-xl border text-sm focus:outline-none"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
          />
          <select
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value as "admin" | "user")}
            className="px-4 py-2 rounded-xl border text-sm focus:outline-none"
            style={selectStyle}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
            style={{
              backgroundColor: colors.accentLight,
              color: colors.primary,
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add User</span>
          </button>
        </div>
      </div>

      {/* Users List */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            borderColor: colors.border,
          }}
        >
          <h2 className="text-xl font-bold" style={{ color: colors.text }}>
            Team Members {users.length > 0 && `(${users.length})`}
          </h2>
        </div>

        <div
          className="divide-y"
          style={{
            borderColor: colors.border,
          }}
        >
          {users.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p
                style={{
                  color: colors.textSecondary,
                }}
              >
                No team members yet. Add one to get started!
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="px-6 py-4 flex items-center justify-between hover:opacity-75 transition-opacity"
                style={{
                  backgroundColor: colors.card,
                }}
              >
                <div className="flex-1">
                  <p
                    className="font-medium"
                    style={{
                      color: colors.text,
                    }}
                  >
                    {user.name}
                  </p>
                  <p
                    className="text-sm"
                    style={{
                      color: colors.textSecondary,
                    }}
                  >
                    {user.email}
                  </p>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      onUpdateUserRole(
                        user.id,
                        e.target.value as "admin" | "user",
                      )
                    }
                    className="px-3 py-1 rounded text-sm border focus:outline-none"
                    style={selectStyle}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => {
                      setDeleteUserId(user.id);
                      setDeleteUserName(user.name);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-2 rounded-lg hover:opacity-60 transition-opacity"
                    title="Delete user"
                    style={{
                      color: "#EF4444",
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteUserId(null);
          setDeleteUserName("");
        }}
        onConfirm={() => {
          if (deleteUserId) {
            onDeleteUser(deleteUserId);
            setDeleteConfirmOpen(false);
            setDeleteUserId(null);
            setDeleteUserName("");
          }
        }}
        title="Delete User?"
        description={`Are you sure you want to delete "${deleteUserName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        theme={theme}
      />
    </div>
  );
}
