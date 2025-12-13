import express from "express";
import { auth } from "../config/firebaseAdmin.js";
import { assignRole } from "../services/userService.js";
import verifyToken from "../middleware/verifyToken.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

// =======================
// Student self-registration
// =======================
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Create Firebase user
    const userRecord = await auth.createUser({ email, password });

    // Assign role: student only
    await auth.setCustomUserClaims(userRecord.uid, { role: "student" });

    res.status(201).json({ message: "Student account created successfully", uid: userRecord.uid });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// =======================
// Admin assigns role
// =======================
router.post("/assign-role", verifyToken, requireRole("admin"), async (req, res) => {
  const { uid, role } = req.body;
  try {
    const result = await assignRole(uid, role);
    res.json({ message: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =======================
// Check token
// =======================
router.get("/me", verifyToken, (req, res) => {
  res.json({ uid: req.user.uid, role: req.user.role });
});

export default router;
