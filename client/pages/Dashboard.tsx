import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload,
  Download,
  Share2,
  Trash2,
  Users,
  Settings,
  LogOut,
  Plus,
  Copy,
  Palette,
} from "lucide-react";
import { auth, db, storage } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getBytes,
  deleteObject,
  listAll,
} from "firebase/storage";
import { useTheme, getThemeColors } from "@/lib/theme-context";
import { useAuth, activatePremiumPlan } from "@/lib/use-auth";
import ActivatePlanModal from "@/components/ActivatePlanModal";

interface FileItem {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  shared: boolean;
  shareUrl?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

const LOGO_URL = "https://marketplace.canva.com/Dz63E/MAF4KJDz63E/1/tl/canva-user-icon-MAF4KJDz63E.png";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const { user, userPlan, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("files");
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user");
  const [showPlanModal, setShowPlanModal] = useState(false);

  const colors = getThemeColors(theme as "dark" | "light" | "blue");

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/login");
      return;
    }

    setUserName(user.displayName || "User");
    setUserEmail(user.email || "");
    loadFiles();
    loadUsers();
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p style={{ color: colors.textMuted }}>Loading...</p>
        </div>
      </div>
    );
  }

  const loadFiles = async () => {
    setLoading(true);
    try {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, "files"),
        where("userId", "==", auth.currentUser.uid),
      );
      const docs = await getDocs(q);
      const fileList: FileItem[] = docs.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        size: doc.data().size,
        uploadedAt: new Date(doc.data().uploadedAt).toLocaleDateString(),
        shared: doc.data().shared || false,
        shareUrl: doc.data().shareUrl,
      }));
      setFiles(fileList);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);
    try {
      const fileRef = ref(
        storage,
        `files/${auth.currentUser.uid}/${Date.now()}_${file.name}`,
      );
      await uploadBytes(fileRef, file);

      const fileSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(2)}MB`
          : `${(file.size / 1024).toFixed(2)}KB`;

      await addDoc(collection(db, "files"), {
        userId: auth.currentUser.uid,
        name: file.name,
        size: fileSize,
        uploadedAt: new Date().toISOString(),
        shared: false,
        storagePath: fileRef.fullPath,
      });

      loadFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleShareFile = async (fileId: string) => {
    try {
      const shareUrl = `${window.location.origin}/share/${fileId}`;
      const fileRef = doc(db, "files", fileId);
      await updateDoc(fileRef, {
        shared: true,
        shareUrl: shareUrl,
      });
      loadFiles();
      alert("File shared! URL: " + shareUrl);
    } catch (error) {
      console.error("Error sharing file:", error);
    }
  };

  const handleDeleteFile = async (fileId: string, storagePath: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      await deleteDoc(doc(db, "files", fileId));
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
      loadFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const docs = await getDocs(collection(db, "users"));
      const userList: User[] = docs.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email,
        role: doc.data().role || "user",
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleAddUser = async () => {
    if (!newUserName || !newUserEmail) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        createdAt: new Date().toISOString(),
      });
      setNewUserName("");
      setNewUserEmail("");
      loadUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleUpdateUserRole = async (
    userId: string,
    newRole: "admin" | "user",
  ) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handlePlanModalSuccess = () => {
    loadFiles();
  };

  const storagePercentage = userPlan
    ? (userPlan.storageUsed / userPlan.storageLimit) * 100
    : 0;

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: colors.background }}
    >
      {/* Sidebar */}
      <aside
        className="w-64 text-white p-6 flex flex-col fixed left-0 top-0 h-screen overflow-y-auto border-r"
        style={{
          backgroundColor: colors.sidebar,
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 mb-10 hover:opacity-80 transition"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F91e2732f1c03487e879c66ee97e72712%2Fee08390eccc04e8dbea3ce5415d97e92?format=webp&width=800"
            alt="PinPinCloud"
            className="w-7 h-7"
          />
          <span className="text-lg font-bold">PinPinCloud</span>
        </Link>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {[
            { id: "files", label: "Files" },
            { id: "users", label: "Manage Users" },
            { id: "theme", label: "Customize" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-blue-900 text-blue-400"
                  : "hover:opacity-80"
              }`}
              style={{
                backgroundColor:
                  activeTab === item.id ? "rgba(30, 58, 138, 0.5)" : "transparent",
                color:
                  activeTab === item.id ? colors.primary : colors.textMuted,
              }}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div
          className="mt-6 p-4 rounded-lg border space-y-4"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="User avatar"
              className="w-10 h-10 rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: colors.text }}>
                {userName}
              </p>
              <p className="text-xs truncate" style={{ color: colors.textMuted }}>
                {userEmail}
              </p>
            </div>
          </div>

          {userPlan && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: colors.text }}>
                  {userPlan.type === "premium" ? "Premium Plan" : "Free Plan"}
                </span>
                <span style={{ color: colors.textMuted }}>
                  {(storagePercentage).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(storagePercentage, 100)}%`,
                    backgroundColor: userPlan.type === "premium" ? "#10b981" : "#60a5fa",
                  }}
                />
              </div>
              {userPlan.type === "free" && (
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="w-full py-2 rounded-lg text-sm font-medium transition-colors border"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.sidebar,
                    borderColor: colors.primary,
                  }}
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border"
            style={{
              backgroundColor: "transparent",
              borderColor: colors.border,
              color: colors.textMuted,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.textMuted;
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto">
        {/* Header */}
        <header
          className="border-b px-8 py-6 sticky top-0 z-40"
          style={{
            backgroundColor: colors.sidebar,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
                Welcome {userName}!
              </h1>
              <p style={{ color: colors.textMuted }}>
                {activeTab === "files" && "Manage and share your files"}
                {activeTab === "users" && "Manage team members"}
                {activeTab === "theme" && "Customize your interface"}
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* FILES TAB */}
          {activeTab === "files" && (
            <div className="space-y-6">
              {/* Upload Section */}
              <div
                className="rounded-lg border p-8 text-center"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderStyle: "dashed",
                }}
              >
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <Upload
                      className="w-10 h-10"
                      style={{
                        color: colors.primary,
                      }}
                    />
                    <div>
                      <p className="font-semibold" style={{ color: colors.text }}>
                        Click to upload or drag and drop
                      </p>
                      <p style={{ color: colors.textMuted }}>
                        PNG, JPG, PDF or any file up to 100MB
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Files List */}
              <div
                className="rounded-lg border overflow-hidden"
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
                    My Files {files.length > 0 && `(${files.length})`}
                  </h2>
                </div>
                <div
                  className="divide-y"
                  style={{
                    borderColor: colors.border,
                  }}
                >
                  {loading ? (
                    <div className="px-6 py-8 text-center">
                      <p style={{ color: colors.textMuted }}>
                        Loading files...
                      </p>
                    </div>
                  ) : files.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p style={{ color: colors.textMuted }}>
                        No files yet. Upload one to get started!
                      </p>
                    </div>
                  ) : (
                    files.map((file) => (
                      <div
                        key={file.id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-opacity-50"
                        style={{
                          backgroundColor: "transparent",
                        }}
                      >
                        <div className="flex-1">
                          <p className="font-medium" style={{ color: colors.text }}>
                            {file.name}
                          </p>
                          <p className="text-sm" style={{ color: colors.textMuted }}>
                            {file.size} • {file.uploadedAt}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.shared && (
                            <span
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{
                                backgroundColor: "rgba(96, 165, 250, 0.1)",
                                color: colors.primary,
                              }}
                            >
                              Shared
                            </span>
                          )}
                          <button
                            onClick={() => handleShareFile(file.id)}
                            className="p-2 rounded hover:opacity-80"
                            title="Share"
                            style={{ color: colors.textMuted }}
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id, file.name)}
                            className="p-2 rounded hover:opacity-80"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Add User */}
              <div
                className="rounded-lg border p-6"
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
                    placeholder="Name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="px-4 py-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: colors.sidebar,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="px-4 py-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: colors.sidebar,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                  />
                  <select
                    value={newUserRole}
                    onChange={(e) =>
                      setNewUserRole(e.target.value as "admin" | "user")
                    }
                    className="px-4 py-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: colors.sidebar,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={handleAddUser}
                    className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-80"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.sidebar,
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Users List */}
              <div
                className="rounded-lg border overflow-hidden"
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
                    Team Members
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
                      <p style={{ color: colors.textMuted }}>
                        No users yet
                      </p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        className="px-6 py-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium" style={{ color: colors.text }}>
                            {user.name}
                          </p>
                          <p className="text-sm" style={{ color: colors.textMuted }}>
                            {user.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleUpdateUserRole(
                                user.id,
                                e.target.value as "admin" | "user",
                              )
                            }
                            className="px-3 py-1 rounded text-sm border"
                            style={{
                              backgroundColor: colors.sidebar,
                              borderColor: colors.border,
                              color: colors.text,
                            }}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 rounded hover:opacity-80"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* THEME TAB */}
          {activeTab === "theme" && (
            <div className="space-y-6">
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
                  Select Theme
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      id: "dark",
                      name: "Dark Mode",
                      color: "bg-slate-900",
                    },
                    {
                      id: "light",
                      name: "Light Mode",
                      color: "bg-white",
                    },
                    {
                      id: "blue",
                      name: "Blue Theme",
                      color: "bg-blue-900",
                    },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as "dark" | "light" | "blue")}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        theme === t.id
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                      style={{
                        backgroundColor: colors.sidebar,
                        borderColor:
                          theme === t.id
                            ? "#3B82F6"
                            : colors.border,
                      }}
                    >
                      <div
                        className={`w-full h-20 rounded-lg mb-3 ${t.color}`}
                      ></div>
                      <p className="font-medium" style={{ color: colors.text }}>
                        {t.name}
                      </p>
                      {theme === t.id && (
                        <p className="text-sm mt-2" style={{ color: "#3B82F6" }}>
                          Active
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <ActivatePlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        userId={user?.uid || ""}
        onSuccess={handlePlanModalSuccess}
        theme={theme}
      />
    </div>
  );
}
