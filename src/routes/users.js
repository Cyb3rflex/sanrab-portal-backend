import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import requireRole from "../middleware/requireRole.js";
import { auth, db } from "../config/firebaseAdmin.js";

const router = express.Router();

/**
 * Add new user (Admin only)
 * POST /api/users/add
 * Body: { email, role }
 */
router.post("/add", verifyToken, requireRole("admin"), async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ message: "Email and role required" });

  try {
    // Create Firebase user
    const userRecord = await auth.createUser({ email, password: "Default@123" });

    // Assign custom role
    await auth.setCustomUserClaims(userRecord.uid, { role });

    // Store user info in Firestore
    await db.collection("users").doc(userRecord.uid).set({ email, role, name: email.split("@")[0] });

    res.json({ message: `${role} created with email ${email}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * Get all users (Admin only)
 * GET /api/users/all
 */
router.get("/all", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const usersSnap = await db.collection("users").get();
    const students = [];
    const teachers = [];

    usersSnap.forEach((doc) => {
      const data = doc.data();
      if (data.role === "student") students.push({ uid: doc.id, ...data });
      if (data.role === "teacher") teachers.push({ uid: doc.id, ...data });
    });

    res.json({ students, teachers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Set teacher/class result upload window
 * POST /api/users/set-upload-window
 * Body: { start, end } ISO datetime strings
 */
router.post("/set-upload-window", verifyToken, requireRole("admin"), async (req, res) => {
  const { start, end } = req.body;
  if (!start || !end) return res.status(400).json({ message: "Start and end required" });

  try {
    await db.collection("config").doc("uploadWindow").set({ start, end });
    res.json({ message: "Upload window set successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
