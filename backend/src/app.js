import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import pool from "./config/db.js";
import studentRoutes from "./routes/studentRoutes.js";

dotenv.config();

const app = express();

// Allow frontend to communicate with backend
app.use(cors({
    origin: "http://localhost:5173"
}));

// Allow backend to receive JSON data
app.use(express.json());

// Connect student routes
app.use("/api/students", studentRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "PlaceMate backend is running!"
    });
});

// Database test route
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "PlaceMate database connected successfully!",
            databaseTime: result.rows[0].now
        });

    } catch (error) {
        console.error("FULL DATABASE ERROR:", error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`PlaceMate backend running on port ${PORT}`);
});