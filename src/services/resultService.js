import { db } from "../config/firebaseAdmin.js";

// Get student results
export async function getStudentResults(uid) {
  const doc = await db.collection("results").doc(uid).get();
  if (!doc.exists) return { paymentStatus: "unpaid", results: null };

  const data = doc.data();
  if (data.paymentStatus !== "paid") return { paymentStatus: "unpaid", results: null };

  return { paymentStatus: "paid", results: data.results };
}

// Upload student results (teacher/admin only)
export async function setStudentResults(studentUid, results) {
  await db.collection("results").doc(studentUid).set(
    { results, paymentStatus: "paid" },
    { merge: true }
  );
  return true;
}
