import { RequestHandler } from "express";
import { db } from "../../client/lib/firebase";
import { setDoc, doc } from "firebase/firestore";

function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const handleGenerateKey: RequestHandler = async (req, res) => {
  try {
    // This endpoint should be protected - only admins should be able to generate keys
    // In production, add proper authentication and authorization checks

    // Generate key parts
    const part1 = generateRandomString(4);
    const part2 = generateRandomString(4);
    const part3 = generateRandomString(4);
    const keyId = `PINPIN-${part1}-${part2}-${part3}`;

    // Save to Firestore
    await setDoc(doc(db, "premiumKeys", keyId), {
      id: keyId,
      created: new Date().toISOString(),
      used: false,
      usedBy: null,
      usedAt: null,
    });

    res.json({
      success: true,
      key: keyId,
      message: "Premium key generated successfully",
    });
  } catch (error) {
    console.error("Error generating key:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate key",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export interface GenerateKeyResponse {
  success: boolean;
  key?: string;
  error?: string;
  message: string;
}
