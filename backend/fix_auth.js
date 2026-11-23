import pool from "./src/config/db.js";
import bcrypt from "bcryptjs";

async function fix() {
  try {
    const email = "anjali.25bec10114@vitbhopal.ac.in";
    const plainPass = "123456";

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainPass, salt);

    await pool.query(
      "UPDATE users SET password = $1 WHERE LOWER(TRIM(email)) = $2",
      [hash, email.toLowerCase()]
    );

    const check = await pool.query("SELECT email, password FROM users WHERE LOWER(TRIM(email)) = $1", [email.toLowerCase()]);
    const isValid = await bcrypt.compare(plainPass, check.rows[0].password);

    console.log("--------------------------------------------------");
    console.log("Updated User Email :", check.rows[0].email);
    console.log("New Password Set   :", plainPass);
    console.log("Password Validated :", isValid ? "PASSED (Ready to log in!)" : "FAILED");
    console.log("--------------------------------------------------");
  } catch (err) {
    console.error("Database error:", err.message);
  } finally {
    process.exit(0);
  }
}

fix();
