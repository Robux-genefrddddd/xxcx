import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload,
  Share2,
  Trash2,
  Users,
  LogOut,
  Plus,
  Palette,
  FolderOpen,
  Zap,
  HardDrive,
  Download,
  Crown,
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
  deleteObject,
} from "firebase/storage";
import { useTheme, getThemeColors } from "@/lib/theme-context";
import { useAuth } from "@/lib/use-auth";
import ActivatePlanModal from "@/components/ActivatePlanModal";
import DashboardStats from "@/components/DashboardStats";
import StorageChart from "@/components/StorageChart";

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

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const fileRef = ref(storage, `files/${auth.currentUser?.uid}/${fileName}`);
      const url = await getBytes(fileRef);
      const blob = new Blob([url]);
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Download failed");
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

  const sharedFilesCount = files.filter((f) => f.shared).length;
  const storagePercentage =
    userPlan && userPlan.storageLimit
      ? (userPlan.storageUsed / userPlan.storageLimit) * 100
      : 0;

  const navItems = [
    { id: "files", label: "Files", icon: FolderOpen },
    { id: "users", label: "Manage Users", icon: Users },
    { id: "theme", label: "Customize", icon: Palette },
  ];

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
          className="flex items-center gap-2 mb-12 hover:opacity-80 transition"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F91e2732f1c03487e879c66ee97e72712%2Fee08390eccc04e8dbea3ce5415d97e92?format=webp&width=800"
            alt="PinPinCloud"
            className="w-7 h-7"
          />
          <span className="text-lg font-bold">PinPinCloud</span>
        </Link>

        {/* Navigation */}
        <nav className="space-y-3 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200`}
                style={{
                  backgroundColor:
                    activeTab === item.id
                      ? "rgba(96, 165, 250, 0.2)"
                      : "transparent",
                  color:
                    activeTab === item.id ? colors.primary : colors.textMuted,
                  borderLeft: activeTab === item.id ? `3px solid ${colors.primary}` : "3px solid transparent",
                  paddingLeft: "13px",
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
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
              className="w-10 h-10 rounded-lg object-cover"
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
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: colors.primary }} />
                <span className="text-xs font-medium" style={{ color: colors.text }}>
                  {userPlan.type === "premium" ? "Premium Plan" : "Free Plan"}
                </span>
              </div>
              
              {userPlan.type === "free" && (
                <>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: colors.text }}>Storage</span>
                    <span style={{ color: colors.textMuted }}>
                      {(storagePercentage).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${Math.min(storagePercentage, 100)}%`,
                        backgroundColor: "#60a5fa",
                      }}
                    />
                  </div>
                </>
              )}
              
              {userPlan.type === "free" && (
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="w-full py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 border"
                  style={{
                    backgroundColor: "rgba(96, 165, 250, 0.1)",
                    color: colors.primary,
                    borderColor: colors.primary,
                  }}
                >
                  Upgrade to Premium
                </button>
              )}

              {userPlan.type === "premium" && (
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                  <p className="text-xs text-emerald-400 font-medium">Unlimited Storage</p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border hover:bg-opacity-50"
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
          className="border-b px-8 py-6 sticky top-0 z-40 backdrop-blur-sm"
          style={{
            backgroundColor: colors.sidebar,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
                Welcome back, {userName}! 
              </h1>
              <p style={{ color: colors.textMuted }}>
                {activeTab === "files" && "Manage and share your files securely"}
                {activeTab === "users" && "Manage team members and permissions"}
                {activeTab === "theme" && "Customize your interface appearance"}
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* FILES TAB */}
          {activeTab === "files" && (
            <div className="space-y-8">
              {/* Stats */}
              <DashboardStats
                totalFiles={files.length}
                sharedFiles={sharedFilesCount}
                storageUsed={userPlan?.storageUsed || 0}
                storageLimit={userPlan?.storageLimit || 0}
                theme={theme}
              />

              {/* Upload Section */}
              <div
                className="rounded-xl border p-8 text-center transition-all hover:border-opacity-100"
                style={{
                  backgroundColor: `linear-gradient(135deg, rgba(96, 165, 250, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%)`,
                  borderColor: colors.border,
                  borderStyle: "dashed",
                }}
              >
                <label className="cursor-pointer block">
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: `rgba(96, 165, 250, 0.1)`,
                      }}
                    >
                      <Upload
                        className="w-8 h-8"
                        style={{
                          color: colors.primary,
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-lg" style={{ color: colors.text }}>
                        Click to upload or drag and drop
                      </p>
                      <p style={{ color: colors.textMuted }} className="text-sm mt-1">
                        PNG, JPG, PDF or any file up to 1GB
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
                className="rounded-xl border overflow-hidden"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <div
                  className="px-6 py-4 border-b backdrop-blur-sm"
                  style={{
                    borderColor: colors.border,
                  }}
                >
                  <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: colors.text }}>
                    <FolderOpen className="w-5 h-5" />
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
                    <div className="px-6 py-12 text-center">
                      <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                      <p style={{ color: colors.textMuted }}>
                        Loading files...
                      </p>
                    </div>
                  ) : files.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <FolderOpen className="w-12 h-12 mx-auto mb-3" style={{ color: colors.textMuted, opacity: 0.5 }} />
                      <p style={{ color: colors.textMuted }}>
                        No files yet. Upload one to get started!
                      </p>
                    </div>
                  ) : (
                    files.map((file) => (
                      <div
                        key={file.id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-opacity-50 transition-colors"
                        style={{
                          backgroundColor: "transparent",
                        }}
                      >
                        <div className="flex-1 flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{
                              backgroundColor: `rgba(96, 165, 250, 0.1)`,
                            }}
                          >
                            <FolderOpen className="w-4 h-4" style={{ color: colors.primary }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate" style={{ color: colors.text }}>
                              {file.name}
                            </p>
                            <p className="text-sm" style={{ color: colors.textMuted }}>
                              {file.size} • {file.uploadedAt}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.shared && (
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                              style={{
                                backgroundColor: "rgba(96, 165, 250, 0.1)",
                                color: colors.primary,
                              }}
                            >
                              <Share2 className="w-3 h-3" />
                              Shared
                            </span>
                          )}
                          <button
                            onClick={() => handleDownloadFile(file.id, file.name)}
                            className="p-2 rounded-lg hover:bg-opacity-50 transition-colors"
                            title="Download"
                            style={{ color: colors.textMuted }}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShareFile(file.id)}
                            className="p-2 rounded-lg hover:bg-opacity-50 transition-colors"
                            title="Share"
                            style={{ color: colors.textMuted }}
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id, file.name)}
                            className="p-2 rounded-lg hover:bg-opacity-50 transition-colors"
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
                className="rounded-xl border p-6"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <Users className="w-5 h-5" />
                  Add New User
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="px-4 py-2 rounded-lg border text-sm focus:outline-none transition-colors"
                    style={{
                      backgroundColor: colors.sidebar,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="px-4 py-2 rounded-lg border text-sm focus:outline-none transition-colors"
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
                    className="px-4 py-2 rounded-lg border text-sm focus:outline-none transition-colors"
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
                    className="px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.sidebar,
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add User
                  </button>
                </div>
              </div>

              {/* Users List */}
              <div
                className="rounded-xl border overflow-hidden"
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
                  <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: colors.text }}>
                    <Users className="w-5 h-5" />
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
                        className="px-6 py-4 flex items-center justify-between hover:bg-opacity-30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold"
                            style={{
                              backgroundColor: `rgba(96, 165, 250, 0.1)`,
                              color: colors.primary,
                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: colors.text }}>
                              {user.name}
                            </p>
                            <p className="text-sm" style={{ color: colors.textMuted }}>
                              {user.email}
                            </p>
                          </div>
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
                            className="p-2 rounded-lg hover:bg-opacity-50 transition-colors"
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
                className="rounded-xl border p-6"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: colors.text }}>
                  <Palette className="w-5 h-5" />
                  Select Theme
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      id: "dark",
                      name: "Dark Mode",
                      color: "bg-slate-900",
                      description: "Professional dark theme",
                    },
                    {
                      id: "light",
                      name: "Light Mode",
                      color: "bg-white",
                      description: "Clean light theme",
                    },
                    {
                      id: "blue",
                      name: "Blue Theme",
                      color: "bg-blue-900",
                      description: "Deep blue theme",
                    },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as "dark" | "light" | "blue")}
                      className={`p-6 rounded-xl border-2 transition-all hover:scale-105`}
                      style={{
                        backgroundColor: colors.sidebar,
                        borderColor:
                          theme === t.id
                            ? "#3B82F6"
                            : colors.border,
                      }}
                    >
                      <div
                        className={`w-full h-24 rounded-lg mb-4 ${t.color} shadow-lg`}
                      ></div>
                      <p className="font-bold text-lg" style={{ color: colors.text }}>
                        {t.name}
                      </p>
                      <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                        {t.description}
                      </p>
                      {theme === t.id && (
                        <div className="mt-4 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium inline-block">
                          ✓ Active
                        </div>
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
