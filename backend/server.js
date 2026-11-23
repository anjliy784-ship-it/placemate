import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import pool from "./src/config/db.js";

const require = createRequire(import.meta.url);
const pdfParseModule = require("pdf-parse");

// Universal production helper: safely extracts text across pdf-parse v1 and v2
async function extractTextFromPdf(dataBuffer) {
  if (typeof pdfParseModule === "function") {
    const data = await pdfParseModule(dataBuffer);
    return data.text || "";
  }
  if (pdfParseModule && typeof pdfParseModule.default === "function") {
    const data = await pdfParseModule.default(dataBuffer);
    return data.text || "";
  }
  if (pdfParseModule && typeof pdfParseModule.PDFParse === "function") {
    const parser = new pdfParseModule.PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    return result.text || "";
  }
  throw new Error("Unsupported pdf-parse export structure");
}

// Strict Resume Document Validator: blocks hackathon brochures, certificates, or blank PDFs
function validateIsResumeDocument(rawText) {
  const text = (rawText || "").toLowerCase();

  if (text.trim().length < 150) {
    return {
      valid: false,
      reason: "Document contains too little text. Please upload a valid text-based PDF resume.",
    };
  }

  const resumeSections = [
    "education",
    "skills",
    "projects",
    "experience",
    "internship",
    "certifications",
    "achievements",
    "objective",
    "summary",
    "b.tech",
    "cgpa",
    "github",
    "linkedin",
  ];

  const matchedSections = resumeSections.filter((sec) => text.includes(sec));

  if (matchedSections.length < 3) {
    return {
      valid: false,
      reason:
        "Invalid Document: This PDF does not appear to be a standard resume (missing core sections like Education, Skills, or Projects).",
    };
  }

  return { valid: true };
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "placemate_secret_key_123";

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `resume_${req.params.id}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"));
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

// Health Check
app.get("/", (req, res) => {
  res.send("Welcome to PlaceMate Backend!");
});

// ==========================================
// 1. Student Authentication Endpoints
// ==========================================

app.post("/api/students/register", async (req, res) => {
  try {
    const { fullName, email, phone, college, department, graduationYear, password, cgpa } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const allowedDomain = "@vitbhopal.ac.in";
    if (!cleanEmail.endsWith(allowedDomain)) {
      return res.status(400).json({
        message: `Registration restricted. Please use your official university email (${allowedDomain}).`,
      });
    }

    const existingUser = await pool.query("SELECT id FROM users WHERE LOWER(TRIM(email)) = $1", [cleanEmail]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanPassword, salt);

    const newUser = await pool.query(
      `INSERT INTO users (full_name, email, phone, college, department, graduation_year, password, role, cgpa)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'student', $8)
       RETURNING id, full_name, email, phone, college, department, graduation_year, role, cgpa, created_at`,
      [
        fullName.trim(),
        cleanEmail,
        phone ? phone.trim() : null,
        college ? college.trim() : "VIT Bhopal University",
        department ? department.trim() : "ECE",
        graduationYear || null,
        hashedPassword,
        cgpa || 7.5,
      ]
    );

    return res.status(201).json({
      message: "Student account created successfully!",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error("Error during registration:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/api/students/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const userQuery = await pool.query("SELECT * FROM users WHERE LOWER(TRIM(email)) = $1", [cleanEmail]);
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = userQuery.rows[0];
    const isPasswordValid = await bcrypt.compare(cleanPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        department: user.department,
        graduationYear: user.graduation_year,
        role: user.role,
        cgpa: user.cgpa || 7.5,
        resumeUrl: user.resume_url,
      },
    });
  } catch (err) {
    console.error("Error during student login:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// ==========================================
// 2. Admin & Placement Cell Authentication Endpoints
// ==========================================

app.post("/api/admin/register", async (req, res) => {
  try {
    const { fullName, email, password, adminKey } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const REQUIRED_ADMIN_KEY = process.env.ADMIN_PASSKEY || "PLACEMATE_TPO_2026";
    if (adminKey !== REQUIRED_ADMIN_KEY) {
      return res.status(403).json({
        message: "Invalid Institutional Passkey. Only authorized TPO staff can register.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(TRIM(email)) = $1",
      [cleanEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanPassword, salt);

    const newAdmin = await pool.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, full_name, email, role`,
      [fullName.trim(), cleanEmail, hashedPassword]
    );

    return res.status(201).json({
      message: "Admin account registered successfully! You can now log in.",
      user: newAdmin.rows[0],
    });
  } catch (err) {
    console.error("Error during admin registration:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Institutional admin email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const userQuery = await pool.query("SELECT * FROM users WHERE LOWER(TRIM(email)) = $1", [cleanEmail]);
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ message: "Unauthorized admin account or incorrect password." });
    }

    const user = userQuery.rows[0];

    const adminRoles = ["admin", "college", "superadmin"];
    if (!adminRoles.includes((user.role || "").toLowerCase())) {
      return res.status(403).json({
        message: "Access Denied: Your account does not have administrative clearance for the Placement Cell.",
      });
    }

    const isPasswordValid = await bcrypt.compare(cleanPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Unauthorized admin account or incorrect password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Placement Cell Admin Login successful!",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error during admin login:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/api/students/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNewPassword = newPassword.trim();

    const userCheck = await pool.query("SELECT id FROM users WHERE LOWER(TRIM(email)) = $1", [cleanEmail]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanNewPassword, salt);

    await pool.query("UPDATE users SET password = $1 WHERE LOWER(TRIM(email)) = $2", [hashedPassword, cleanEmail]);
    return res.status(200).json({ message: "Password updated successfully! Please sign in." });
  } catch (err) {
    console.error("Error updating password:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/api/students/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userQuery = await pool.query(
      `SELECT id, full_name, email, phone, college, department, graduation_year, role, resume_url, COALESCE(cgpa, 7.50) as cgpa
       FROM users WHERE id = $1`,
      [id]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    return res.status(200).json(userQuery.rows[0]);
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.put("/api/students/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, department, graduationYear, cgpa } = req.body;

    // Validate CGPA bounds (0.00 to 10.00)
    if (cgpa !== undefined && cgpa !== null && cgpa !== "") {
      const parsedCgpa = parseFloat(cgpa);
      if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
        return res.status(400).json({
          message: "Invalid CGPA: Please enter a valid CGPA between 0.00 and 10.00.",
        });
      }
    }

    const updatedUser = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           department = COALESCE($3, department),
           graduation_year = COALESCE($4, graduation_year),
           cgpa = COALESCE($5, cgpa)
       WHERE id = $6
       RETURNING id, full_name, email, phone, college, department, graduation_year, role, resume_url, cgpa`,
      [fullName, phone, department, graduationYear, cgpa, id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.status(200).json({
      message: "Profile updated successfully!",
      user: updatedUser.rows[0],
    });
  } catch (err) {
    console.error("Error updating profile:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/api/students/upload-resume/:id", upload.single("resume"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: "Please select a valid PDF file to upload." });
    }

    // Verify that the PDF is an actual resume before saving to PostgreSQL
    const dataBuffer = fs.readFileSync(req.file.path);
    const rawText = await extractTextFromPdf(dataBuffer);
    const validation = validateIsResumeDocument(rawText);

    if (!validation.valid) {
      // Remove invalid non-resume file from disk
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: validation.reason });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const resumeUrl = `${baseUrl}/uploads/${req.file.filename}`;

    await pool.query("UPDATE users SET resume_url = $1 WHERE id = $2", [resumeUrl, id]);

    return res.status(200).json({
      message: "Verified resume uploaded successfully!",
      resumeUrl,
    });
  } catch (err) {
    console.error("Error uploading resume:", err.message);
    return res.status(500).json({ message: err.message || "Failed to upload resume." });
  }
});

// ==========================================
// 3. Placement Drives Endpoints
// ==========================================

app.get("/api/drives", async (req, res) => {
  try {
    const drives = await pool.query("SELECT * FROM drives ORDER BY id DESC");
    return res.status(200).json(drives.rows);
  } catch (err) {
    console.error("Error fetching drives:", err.message);
    return res.status(500).json({ message: "Could not fetch drives." });
  }
});

app.post("/api/drives", async (req, res) => {
  try {
    const { company, role, package: pkg, location, deadline, eligibility, minCgpa, status } = req.body;
    if (!company || !role || !pkg) {
      return res.status(400).json({ message: "Company, role, and package are required." });
    }

    const newDrive = await pool.query(
      `INSERT INTO drives (company, role, package, location, deadline, eligibility, min_cgpa, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        company,
        role,
        pkg,
        location || "Pan India",
        deadline || "TBA",
        eligibility || "All Branches",
        minCgpa || 6.0,
        status || "open",
      ]
    );

    return res.status(201).json({
      message: "Placement drive created successfully!",
      drive: newDrive.rows[0],
    });
  } catch (err) {
    console.error("Error creating drive:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.put("/api/drives/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { company, role, package: pkg, location, deadline, eligibility, minCgpa, status } = req.body;

    const updated = await pool.query(
      `UPDATE drives
       SET company = COALESCE($1, company),
           role = COALESCE($2, role),
           package = COALESCE($3, package),
           location = COALESCE($4, location),
           deadline = COALESCE($5, deadline),
           eligibility = COALESCE($6, eligibility),
           min_cgpa = COALESCE($7, min_cgpa),
           status = COALESCE($8, status)
       WHERE id = $9
       RETURNING *`,
      [company, role, pkg, location, deadline, eligibility, minCgpa, status, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Placement drive not found." });
    }

    return res.status(200).json({
      message: "Drive updated successfully!",
      drive: updated.rows[0],
    });
  } catch (err) {
    console.error("Error updating drive:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// ==========================================
// 4. Applications & Dashboard Endpoints
// ==========================================

app.post("/api/applications/apply", async (req, res) => {
  try {
    const userId = req.body.userId || req.body.studentId || req.body.user_id;
    const driveId = req.body.driveId || req.body.drive_id;

    if (!userId || !driveId) {
      return res.status(400).json({ message: "User ID and Drive ID are required." });
    }

    const existing = await pool.query(
      "SELECT id FROM applications WHERE user_id = $1 AND drive_id = $2",
      [userId, driveId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "You have already applied to this drive." });
    }

    const userRes = await pool.query(
      "SELECT id, full_name, resume_url, COALESCE(cgpa, 7.50) AS cgpa FROM users WHERE id = $1",
      [userId]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    const student = userRes.rows[0];
    if (!student.resume_url) {
      return res.status(400).json({ message: "Please upload your resume before applying." });
    }

    const driveRes = await pool.query("SELECT * FROM drives WHERE id = $1", [driveId]);
    if (driveRes.rows.length === 0) {
      return res.status(404).json({ message: "Placement drive not found." });
    }

    const drive = driveRes.rows[0];
    const studentCgpa = parseFloat(student.cgpa || 0);
    const requiredCgpa = parseFloat(drive.min_cgpa || 0);

    if (studentCgpa < requiredCgpa) {
      return res.status(403).json({
        message: `Ineligible: Your CGPA (${studentCgpa}) does not meet the minimum requirement of ${requiredCgpa} for ${drive.company}.`,
      });
    }

    const appliedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newApp = await pool.query(
      `INSERT INTO applications (user_id, drive_id, applied_date, status, stage)
       VALUES ($1, $2, $3, 'Applied', 'Aptitude Screening')
       RETURNING *`,
      [userId, driveId, appliedDate]
    );

    return res.status(201).json({
      message: "Application submitted successfully!",
      application: newApp.rows[0],
    });
  } catch (err) {
    console.error("Error applying to drive:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
});

const getStudentApplicationsHandler = async (req, res) => {
  try {
    const studentId = req.params.userId || req.params.studentId;
    const result = await pool.query(
      `SELECT a.id, a.drive_id, a.applied_date, a.status, a.stage,
              d.company, d.role, d.package, d.location
       FROM applications a
       JOIN drives d ON a.drive_id = d.id
       WHERE a.user_id = $1
       ORDER BY a.id DESC`,
      [studentId]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching user applications:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

app.get("/api/applications/user/:userId", getStudentApplicationsHandler);
app.get("/api/applications/student/:studentId", getStudentApplicationsHandler);

app.get("/api/students/stats/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const drivesRes = await pool.query("SELECT COUNT(*) FROM drives");
    const totalDrives = parseInt(drivesRes.rows[0]?.count || 0, 10);

    const appliedRes = await pool.query(
      "SELECT COUNT(*) FROM applications WHERE user_id = $1",
      [studentId]
    );
    const appliedCount = parseInt(appliedRes.rows[0]?.count || 0, 10);

    const shortlistedRes = await pool.query(
      "SELECT COUNT(*) FROM applications WHERE user_id = $1 AND (status ILIKE '%shortlist%' OR stage ILIKE '%shortlist%')",
      [studentId]
    );
    const shortlistedCount = parseInt(shortlistedRes.rows[0]?.count || 0, 10);

    const interviewsRes = await pool.query(
      "SELECT COUNT(*) FROM applications WHERE user_id = $1 AND (stage ILIKE '%interview%' OR status ILIKE '%interview%')",
      [studentId]
    );
    const interviewCount = parseInt(interviewsRes.rows[0]?.count || 0, 10);

    return res.status(200).json({
      availableDrives: totalDrives,
      appliedDrives: appliedCount,
      shortlisted: shortlistedCount,
      interviews: interviewCount,
    });
  } catch (err) {
    console.error("Error fetching student stats:", err.message);
    return res.status(500).json({ message: "Failed to calculate dashboard statistics." });
  }
});

// ==========================================
// 5. TPO Admin Endpoints
// ==========================================

app.get("/api/admin/metrics", async (req, res) => {
  try {
    const totalStudents = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'student'");
    const totalDrives = await pool.query("SELECT COUNT(*) FROM drives");
    const totalApplications = await pool.query("SELECT COUNT(*) FROM applications");
    const shortlistedCount = await pool.query(
      "SELECT COUNT(*) FROM applications WHERE status ILIKE '%shortlist%' OR stage ILIKE '%shortlist%'"
    );

    return res.status(200).json({
      totalStudents: parseInt(totalStudents.rows[0]?.count || 0, 10),
      totalDrives: parseInt(totalDrives.rows[0]?.count || 0, 10),
      totalApplications: parseInt(totalApplications.rows[0]?.count || 0, 10),
      shortlisted: parseInt(shortlistedCount.rows[0]?.count || 0, 10),
    });
  } catch (err) {
    console.error("Error fetching admin metrics:", err.message);
    return res.status(500).json({ message: "Failed to fetch analytics metrics." });
  }
});

app.get("/api/admin/applications", async (req, res) => {
  try {
    await pool.query(`
      ALTER TABLE applications
      ADD COLUMN IF NOT EXISTS interview_date VARCHAR(50),
      ADD COLUMN IF NOT EXISTS interview_time VARCHAR(50),
      ADD COLUMN IF NOT EXISTS interview_mode VARCHAR(50) DEFAULT 'Online (Google Meet / Zoom)',
      ADD COLUMN IF NOT EXISTS meeting_link TEXT
    `);

    const query = `
      SELECT a.id, a.applied_date, a.status, a.stage,
             a.interview_date, a.interview_time, a.interview_mode, a.meeting_link,
             u.id AS student_id, u.full_name, u.email, u.department, u.phone, u.resume_url, COALESCE(u.cgpa, 7.50) AS cgpa,
             d.id AS drive_id, d.company, d.role, d.package
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN drives d ON a.drive_id = d.id
      ORDER BY a.id DESC
    `;
    const result = await pool.query(query);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching admin applicants:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.put("/api/admin/applications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, stage, interviewDate, interviewTime, interviewMode, meetingLink } = req.body;

    await pool.query(`
      ALTER TABLE applications
      ADD COLUMN IF NOT EXISTS interview_date VARCHAR(50),
      ADD COLUMN IF NOT EXISTS interview_time VARCHAR(50),
      ADD COLUMN IF NOT EXISTS interview_mode VARCHAR(50) DEFAULT 'Online (Google Meet / Zoom)',
      ADD COLUMN IF NOT EXISTS meeting_link TEXT
    `);

    const updated = await pool.query(
      `UPDATE applications
       SET status = COALESCE($1, status),
           stage = COALESCE($2, stage),
           interview_date = COALESCE($3, interview_date),
           interview_time = COALESCE($4, interview_time),
           interview_mode = COALESCE($5, interview_mode),
           meeting_link = COALESCE($6, meeting_link)
       WHERE id = $7
       RETURNING *`,
      [status, stage, interviewDate || null, interviewTime || null, interviewMode || null, meetingLink || null, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Application record not found." });
    }

    return res.status(200).json({
      message: "Application and interview schedule updated successfully!",
      application: updated.rows[0],
    });
  } catch (err) {
    console.error("Error updating application status:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/api/interviews/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    await pool.query(`
      ALTER TABLE applications
      ADD COLUMN IF NOT EXISTS interview_date VARCHAR(50),
      ADD COLUMN IF NOT EXISTS interview_time VARCHAR(50),
      ADD COLUMN IF NOT EXISTS interview_mode VARCHAR(50) DEFAULT 'Online (Google Meet / Zoom)',
      ADD COLUMN IF NOT EXISTS meeting_link TEXT
    `);

    const query = `
      SELECT a.id, a.applied_date, a.status, a.stage,
             a.interview_date, a.interview_time, a.interview_mode, a.meeting_link,
             d.id AS drive_id, d.company, d.role, d.package, d.location
      FROM applications a
      JOIN drives d ON a.drive_id = d.id
      WHERE a.user_id = $1 
        AND (
          a.status ILIKE '%shortlist%' 
          OR a.status ILIKE '%interview%' 
          OR a.stage ILIKE '%interview%'
          OR a.status ILIKE '%select%'
        )
      ORDER BY a.id DESC
    `;

    const result = await pool.query(query, [studentId]);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching interviews:", err.message);
    return res.status(500).json({ message: "Failed to fetch interview schedule." });
  }
});

// ==========================================
// 6. AI Resume Compatibility & Eligibility Endpoints
// ==========================================

app.post("/api/ai/match-resume", async (req, res) => {
  try {
    const { studentId, driveId } = req.body;

    if (!studentId || !driveId) {
      return res.status(400).json({ message: "Student ID and Drive ID are required." });
    }

    const studentRes = await pool.query(
      "SELECT full_name, resume_url FROM users WHERE id = $1",
      [studentId]
    );
    if (studentRes.rows.length === 0 || !studentRes.rows[0].resume_url) {
      return res.status(400).json({
        message: "Please upload your PDF resume in 'My Profile' before running the AI Matcher.",
      });
    }

    const driveRes = await pool.query("SELECT * FROM drives WHERE id = $1", [driveId]);
    if (driveRes.rows.length === 0) {
      return res.status(404).json({ message: "Placement drive not found." });
    }
    const drive = driveRes.rows[0];

    const resumeUrl = studentRes.rows[0].resume_url;
    const filename = resumeUrl.split("/uploads/")[1];
    const filePath = path.join(__dirname, "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Uploaded resume file not found on server. Please re-upload." });
    }

    const dataBuffer = fs.readFileSync(filePath);
    const rawText = await extractTextFromPdf(dataBuffer);

    const validation = validateIsResumeDocument(rawText);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.reason });
    }

    const resumeText = rawText.toLowerCase();
    const roleText = `${drive.role} ${drive.company} ${drive.eligibility || ""}`.toLowerCase();

    const coreTechKeywords = [
      "javascript", "react", "node", "express", "postgresql", "sql", "mongodb",
      "python", "c++", "java", "data structures", "algorithms", "dsa",
      "git", "github", "rest api", "html", "css", "machine learning", "nlp",
      "docker", "aws", "linux", "oop", "dbms", "operating systems", "networking"
    ];

    let targetKeywords = coreTechKeywords.filter((kw) => roleText.includes(kw));

    if (targetKeywords.length < 5) {
      targetKeywords = [
        "data structures", "algorithms", "c++", "python", "java",
        "javascript", "react", "node", "sql", "git", "rest api", "dbms", "oop"
      ];
    }

    const matchedSkills = [];
    const missingSkills = [];

    targetKeywords.forEach((skill) => {
      if (resumeText.includes(skill)) {
        matchedSkills.push(skill.toUpperCase());
      } else {
        missingSkills.push(skill.toUpperCase());
      }
    });

    const rawRatio = matchedSkills.length / targetKeywords.length;
    const matchScore = Math.min(98, Math.max(35, Math.round(rawRatio * 85 + 15)));

    return res.status(200).json({
      company: drive.company,
      role: drive.role,
      matchScore,
      matchedSkills,
      missingSkills: missingSkills.slice(0, 6),
      recommendation:
        matchScore >= 75
          ? "Strong profile match! Your technical keywords align well with this role."
          : "Moderate match. Consider adding the missing keywords to your resume projects before applying.",
    });
  } catch (err) {
    console.error("Error in AI Resume Matcher:", err.message);
    return res.status(500).json({ message: "Failed to analyze resume PDF." });
  }
});

app.post("/api/ai/analyze-profile-resume", async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required." });
    }

    const studentRes = await pool.query(
      "SELECT full_name, resume_url, COALESCE(cgpa, 7.50) AS cgpa FROM users WHERE id = $1",
      [studentId]
    );

    if (studentRes.rows.length === 0) {
      return res.status(404).json({ message: "Student account not found. Please sign in again." });
    }

    const student = studentRes.rows[0];
    if (!student.resume_url) {
      return res.status(400).json({
        message: "No resume uploaded yet. Please upload your PDF resume first.",
      });
    }

    const filename = student.resume_url.split("/uploads/")[1];
    const filePath = path.join(__dirname, "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Resume file missing on server. Please re-upload your PDF." });
    }

    const dataBuffer = fs.readFileSync(filePath);
    const rawText = await extractTextFromPdf(dataBuffer);

    const validation = validateIsResumeDocument(rawText);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.reason });
    }

    const resumeText = rawText.toLowerCase();

    const skillDictionary = [
      "javascript", "react", "node", "express", "postgresql", "sql", "mongodb",
      "python", "c++", "java", "data structures", "algorithms", "dsa",
      "git", "github", "rest api", "html", "css", "machine learning", "nlp",
      "docker", "aws", "linux", "oop", "dbms", "operating systems", "networking"
    ];

    const detectedSkills = skillDictionary
      .filter((skill) => resumeText.includes(skill))
      .map((s) => s.toUpperCase());

    const overallAtsScore = Math.min(98, Math.max(40, detectedSkills.length * 6 + 30));

    const drivesRes = await pool.query("SELECT * FROM drives ORDER BY id DESC");
    const studentCgpa = parseFloat(student.cgpa || 0);

    const driveMatches = drivesRes.rows.map((drive) => {
      const requiredCgpa = parseFloat(drive.min_cgpa || 0);
      const cgpaPassed = studentCgpa >= requiredCgpa;

      const roleText = `${drive.role} ${drive.company} ${drive.eligibility || ""}`.toLowerCase();
      let targetKeywords = skillDictionary.filter((kw) => roleText.includes(kw));
      if (targetKeywords.length < 4) {
        targetKeywords = ["data structures", "algorithms", "c++", "python", "java", "javascript", "sql", "git", "oop"];
      }

      const matchedCount = targetKeywords.filter((kw) => resumeText.includes(kw)).length;
      const skillMatchPct = Math.min(98, Math.max(35, Math.round((matchedCount / targetKeywords.length) * 85 + 15)));

      let verdict = "Eligible & Recommended";
      let isApplicable = true;

      if (!cgpaPassed) {
        verdict = `Not Applicable (Requires ${requiredCgpa} CGPA, yours is ${studentCgpa})`;
        isApplicable = false;
      } else if (skillMatchPct < 55) {
        verdict = "CGPA Eligible — Add More Technical Keywords for Interview";
      }

      return {
        driveId: drive.id,
        company: drive.company,
        role: drive.role,
        package: drive.package,
        requiredCgpa,
        skillMatchPct,
        isApplicable,
        verdict,
      };
    });

    return res.status(200).json({
      overallAtsScore,
      detectedSkills,
      studentCgpa,
      driveMatches,
    });
  } catch (err) {
    console.error("Full resume audit error:", err.message);
    return res.status(500).json({ message: "Error analyzing resume PDF." });
  }
});

// ==========================================
// 7. Announcements Endpoints
// ==========================================

app.get("/api/announcements", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(50) DEFAULT 'Drive',
        date VARCHAR(50),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query("SELECT * FROM announcements ORDER BY id DESC");
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching announcements:", err.message);
    return res.status(500).json({ message: "Failed to load announcements." });
  }
});

app.post("/api/announcements", async (req, res) => {
  try {
    const { title, category, date, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required." });
    }

    const formattedDate =
      date ||
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    const newNotice = await pool.query(
      `INSERT INTO announcements (title, category, date, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, category || "General", formattedDate, message]
    );

    return res.status(201).json({
      message: "Announcement published!",
      announcement: newNotice.rows[0],
    });
  } catch (err) {
    console.error("Error creating announcement:", err.message);
    return res.status(500).json({ message: "Failed to publish announcement." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`PlaceMate backend running on port ${PORT}`);
});