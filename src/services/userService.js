import { auth, db } from "../config/firebaseAdmin.js";

// Assign role to a user
export async function assignRole(uid, role) {
  await auth.setCustomUserClaims(uid, { role });
  return `Role ${role} assigned to user ${uid}`;
}

// Set student payment status
export async function setPaymentStatus(uid, status) {
  await db.collection("results").doc(uid).set({ paymentStatus: status }, { merge: true });
  return `Payment status for ${uid} set to ${status}`;
}
