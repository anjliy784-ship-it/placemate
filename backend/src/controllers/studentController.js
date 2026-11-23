import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const registerStudent = async (req, res) => {

    try {

        // 1. Extract student details
        const {
            fullName,
            email,
            phone,
            college,
            department,
            graduationYear,
            password
        } = req.body;

        // 2. Check required fields
        if (
            !fullName ||
            !email ||
            !phone ||
            !college ||
            !department ||
            !graduationYear ||
            !password
        ) {
            return res.status(400).json({
                message: "Please fill in all required fields."
            });
        }

        // 3. Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        // 4. Check whether email already exists
        const existingStudent = await pool.query(
            "SELECT * FROM students WHERE email = $1",
            [email]
        );

        if (existingStudent.rows.length > 0) {
            return res.status(409).json({
                message: "A student with this email already exists."
            });
        }

        // 5. Hash the student's password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 6. Save student information in PostgreSQL
        const newStudent = await pool.query(
            `INSERT INTO students
            (full_name, email, phone, college, department, graduation_year, password_hash)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING student_id, full_name, email`,
            [
                fullName,
                email,
                phone,
                college,
                department,
                graduationYear,
                hashedPassword
            ]
        );

        // 7. Send successful registration response
        return res.status(201).json({
            message: "Student registered successfully!",
            student: newStudent.rows[0]
        });

    } catch (error) {

        console.error("Student registration error:", error);

        return res.status(500).json({
            message: "Internal server error during registration."
        });

    }

};
export const loginStudent = async (req, res) => {
    try {
        // 1. Receive login details
        const { email, password } = req.body;

        // 2. Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        // 3. Find student in database
        const result = await pool.query(
            "SELECT * FROM students WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found. Please register first."
            });
        }

        const student = result.rows[0];

        // 4. Compare entered password with stored hash
        const isPasswordValid = await bcrypt.compare(
            password,
            student.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // 5. Generate JWT token
        const token = jwt.sign(
            {
                studentId: student.student_id,
                email: student.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 6. Send successful response
        return res.status(200).json({
            message: "Login successful!",
            token,
            student: {
                student_id: student.student_id,
                full_name: student.full_name,
                email: student.email
            }
        });

    } catch (error) {
        console.error("Student login error:", error);

        return res.status(500).json({
            message: "Internal server error during login."
        });
    }
};
export const getStudentProfile = async (req, res) => {
    try {
        const studentId = req.user.studentId;

        const result = await pool.query(
            `SELECT
                student_id,
                full_name,
                email,
                phone,
                college,
                department,
                graduation_year,
                created_at
             FROM students
             WHERE student_id = $1`,
            [studentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        return res.status(200).json({
            message: "Student profile fetched successfully!",
            student: result.rows[0]
        });

    } catch (error) {
        console.error("Get student profile error:", error);

        return res.status(500).json({
            message: "Unable to fetch student profile."
        });
    }
};

