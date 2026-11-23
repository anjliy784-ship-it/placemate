
import express from "express";

import {
    registerStudent,
    loginStudent,
    getStudentProfile
} from "../controllers/studentController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerStudent);
router.post("/login", loginStudent);

// Protected route
router.get("/profile", authMiddleware, getStudentProfile);

export default router;
