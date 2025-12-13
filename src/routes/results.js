import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import requireRole from "../middleware/requireRole.js";
import { db } from "../config/firebaseAdmin.js";

const router = express.Router();

// Student fetch own results
router.get("/my-results", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const doc = await db.collection("results").doc(req.user.uid).get();
    if (!doc.exists) return res.json({ paymentStatus: "unpaid", results: null });

    const data = doc.data();
    if (data.paymentStatus !== "paid") return res.json({ paymentStatus: "unpaid", results: null });

    res.json({ paymentStatus: "paid", results: data.results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Teacher/Admin upload single student result
router.post("/upload", verifyToken, requireRole("teacher"), async (req, res) => {
  const { studentUid, results } = req.body;
  if (!studentUid || !results) return res.status(400).json({ message: "studentUid and results required" });

  try {
    await db.collection("results").doc(studentUid).set({ results, paymentStatus: "paid" }, { merge: true });
    res.json({ message: "Results uploaded successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bulk upload results (Admin)
router.post("/bulk-upload", verifyToken, requireRole("admin"), async (req, res) => {
  const { results } = req.body;
  if (!results || Object.keys(results).length === 0)
    return res.status(400).json({ message: "No results provided" });

  try {
    const batch = db.batch();
    Object.entries(results).forEach(([studentUid, studentResults]) => {
      const ref = db.collection("results").doc(studentUid);
      batch.set(ref, { results: studentResults, paymentStatus: "paid" }, { merge: true });
    });
    await batch.commit();
    res.json({ message: "Bulk results uploaded successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Edit student score (Admin)
router.patch("/edit", verifyToken, requireRole("admin"), async (req, res) => {
  const { studentUid, subject, delta } = req.body;
  if (!studentUid || !subject || delta === undefined) return res.status(400).json({ message: "studentUid, subject, delta required" });

  try {
    const ref = db.collection("results").doc(studentUid);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: "Student results not found" });

    const data = doc.data();
    const currentScore = data.results?.[subject] || 0;
    await ref.set({ results: { ...data.results, [subject]: currentScore + delta }, paymentStatus: "paid" }, { merge: true });

    res.json({ message: `Updated ${subject} score by ${delta}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
