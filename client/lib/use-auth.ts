import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface UserPlan {
  type: "free" | "premium";
  storageLimit: number | null;
  storageUsed: number;
  activatedAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);

          const planDocRef = doc(db, "userPlans", firebaseUser.uid);
          const planDoc = await getDoc(planDocRef);

          if (planDoc.exists()) {
            setUserPlan(planDoc.data() as UserPlan);
          } else {
            const defaultPlan: UserPlan = {
              type: "free",
              storageLimit: 1 * 1024 * 1024 * 1024,
              storageUsed: 0,
              activatedAt: new Date().toISOString(),
            };
            await setDoc(planDocRef, defaultPlan);
            setUserPlan(defaultPlan);
          }
        } else {
          setUser(null);
          setUserPlan(null);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, userPlan, loading, error };
}

export async function activatePremiumPlan(userId: string) {
  try {
    const planDocRef = doc(db, "userPlans", userId);
    const premiumPlan: UserPlan = {
      type: "premium",
      storageLimit: null,
      storageUsed: 0,
      activatedAt: new Date().toISOString(),
    };
    await setDoc(planDocRef, premiumPlan, { merge: true });
    return premiumPlan;
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error("Failed to activate premium plan");
  }
}

export async function validateActivationKey(userId: string, key: string) {
  try {
    const keysRef = doc(db, "activationKeys", key);
    const keyDoc = await getDoc(keysRef);

    if (!keyDoc.exists()) {
      throw new Error("Invalid activation key");
    }

    const keyData = keyDoc.data();
    if (keyData.used) {
      throw new Error("This key has already been used");
    }

    if (new Date(keyData.expiresAt) < new Date()) {
      throw new Error("This key has expired");
    }

    await setDoc(
      keysRef,
      {
        ...keyData,
        used: true,
        usedBy: userId,
        usedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return true;
  } catch (err) {
    throw err instanceof Error ? err : new Error("Key validation failed");
  }
}
