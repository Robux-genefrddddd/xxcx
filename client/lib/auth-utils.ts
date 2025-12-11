import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export type UserRole = "user" | "admin" | "founder";

export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const userDocRef = doc(db, "userRoles", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const role = userDocSnap.data().role as UserRole;
      return role;
    } else {
      // Initialize new user with "user" role
      await setDoc(userDocRef, { role: "user" });
      return "user";
    }
  } catch (error) {
    console.error("Error getting user role:", error);
    return "user";
  }
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole,
): Promise<void> {
  try {
    const userDocRef = doc(db, "userRoles", userId);
    await updateDoc(userDocRef, { role: newRole });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === "admin" || role === "founder";
}

export function canManageKeys(role: UserRole): boolean {
  return role === "founder";
}

export function canCreateKeys(role: UserRole): boolean {
  return role === "founder";
}

export function canManageUsers(role: UserRole): boolean {
  return role === "founder" || role === "admin";
}

export function canPerformCriticalActions(role: UserRole): boolean {
  return role === "founder";
}

export function canToggleMaintenance(role: UserRole): boolean {
  return role === "founder";
}

export function canViewStats(role: UserRole): boolean {
  return role === "founder" || role === "admin";
}
