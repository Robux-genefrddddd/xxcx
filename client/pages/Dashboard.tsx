import { useState, useEffect } from "react";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { FilesList } from "@/components/dashboard/FilesList";
import { UserManagement } from "@/components/dashboard/UserManagement";
import { ThemeSelector } from "@/components/dashboard/ThemeSelector";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { UploadModal, MAX_FILE_SIZE } from "@/components/dashboard/UploadModal";
import { auth, db, storage } from "@/lib/firebase";
import { getThemeColors, getThemeBackgroundImage } from "@/lib/theme-colors";
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
import { ref, uploadBytes, deleteObject } from "firebase/storage";

interface FileItem {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  shared: boolean;
  shareUrl?: string;
  storagePath?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("files");
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<
    "validating" | "uploading" | "processing" | "complete" | "error"
  >("validating");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      setUserName(auth.currentUser.displayName || "User");
      setUserEmail(auth.currentUser.email || "");
    }
    const savedTheme = localStorage.getItem("app-theme") || "dark";
    setTheme(savedTheme);
    loadFiles();
    loadUsers();
  }, []);

  // ============= FILES MANAGEMENT =============
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
        storagePath: doc.data().storagePath,
      }));
      setFiles(fileList);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !auth.currentUser) return;

    // Reset upload state
    setUploadFileName(file.name);
    setUploadProgress(0);
    setUploadStage("validating");
    setUploadError(null);
    setUploadModalOpen(true);
    setUploading(true);

    try {
      // Stage 1: Validate file
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check file size (100MB limit)
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(
          `File size exceeds 100MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        );
        setUploadStage("error");
        setUploading(false);
        return;
      }

      setUploadProgress(20);

      // Stage 2: Upload to storage
      setUploadStage("uploading");
      const fileRef = ref(
        storage,
        `files/${auth.currentUser.uid}/${Date.now()}_${file.name}`,
      );

      // Simulate upload progress
      let lastProgress = 20;
      const progressInterval = setInterval(() => {
        if (lastProgress < 80) {
          lastProgress += Math.random() * 30;
          setUploadProgress(Math.min(lastProgress, 80));
        }
      }, 500);

      await uploadBytes(fileRef, file);
      clearInterval(progressInterval);
      setUploadProgress(85);

      const fileSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(2)}MB`
          : `${(file.size / 1024).toFixed(2)}KB`;

      // Stage 3: Process file
      setUploadStage("processing");
      await new Promise((resolve) => setTimeout(resolve, 800));

      await addDoc(collection(db, "files"), {
        userId: auth.currentUser.uid,
        name: file.name,
        size: fileSize,
        uploadedAt: new Date().toISOString(),
        shared: false,
        storagePath: fileRef.fullPath,
      });

      // Complete
      setUploadProgress(100);
      setUploadStage("complete");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      loadFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError("Upload failed. Please try again.");
      setUploadStage("error");
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
    } catch (error) {
      console.error("Error sharing file:", error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!confirm("Delete this file? This action cannot be undone.")) return;

    try {
      await deleteDoc(doc(db, "files", fileId));
      if (file?.storagePath) {
        const fileRef = ref(storage, file.storagePath);
        await deleteObject(fileRef);
      }
      loadFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  // ============= USERS MANAGEMENT =============
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

  const handleAddUser = async (
    name: string,
    email: string,
    role: "admin" | "user",
  ) => {
    try {
      await addDoc(collection(db, "users"), {
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      });
      loadUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user? This action cannot be undone.")) return;
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

  // ============= THEME MANAGEMENT =============
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
  };

  const handleCloseUploadModal = () => {
    if (
      uploadStage !== "uploading" &&
      uploadStage !== "validating" &&
      uploadStage !== "processing"
    ) {
      setUploadModalOpen(false);
      setUploadProgress(0);
      setUploadStage("validating");
      setUploadFileName("");
      setUploadError(null);
    }
  };

  const themeColors = getThemeColors(theme);

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundColor: themeColors.background,
        backgroundImage: getThemeBackgroundImage(theme),
      }}
    >
      {/* Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={userName}
        userEmail={userEmail}
        theme={theme}
      />

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto">
        {/* Header */}
        <header
          className="border-b px-8 py-6 sticky top-0 z-40"
          style={{
            backgroundColor: theme === "dark" ? "#111214" : "#FFFFFF",
            borderColor: theme === "dark" ? "#1F2124" : "#E5E7EB",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold mb-1"
                style={{ color: theme === "dark" ? "#FFFFFF" : "#111827" }}
              >
                Welcome {userName}!
              </h1>
              <p style={{ color: theme === "dark" ? "#9CA3AF" : "#6B7280" }}>
                {activeTab === "files" &&
                  "Upload, organize and share your files securely"}
                {activeTab === "users" &&
                  "Manage your team members and their roles"}
                {activeTab === "theme" &&
                  "Personalize your dashboard appearance"}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {/* Files Tab */}
          {activeTab === "files" && (
            <div className="space-y-6">
              <FileUpload
                onFileSelected={handleFileUpload}
                uploading={uploading}
                theme={theme}
              />
              <FilesList
                files={files}
                loading={loading}
                theme={theme}
                onShare={handleShareFile}
                onDelete={handleDeleteFile}
                onCopyShareLink={(url) => {
                  alert("Share link copied to clipboard!");
                }}
              />
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <UserManagement
              users={users}
              theme={theme}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onUpdateUserRole={handleUpdateUserRole}
            />
          )}

          {/* Theme Tab */}
          {activeTab === "theme" && (
            <ThemeSelector theme={theme} onThemeChange={handleThemeChange} />
          )}
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        fileName={uploadFileName}
        progress={uploadProgress}
        stage={uploadStage}
        error={uploadError || undefined}
        onClose={handleCloseUploadModal}
        theme={theme}
      />
    </div>
  );
}
