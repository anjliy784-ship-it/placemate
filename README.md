# PlaceMate — Campus Placement & Recruitment Portal

A full-stack campus placement management platform built with **React (Vite)**, **Node.js (Express)**, and **PostgreSQL**, featuring automated PDF resume validation, AI ATS keyword matching, CGPA eligibility guards, and real-time TPO interview scheduling.

## Key Features
- **Role-Based Portals:** Separate access for Students (`@vitbhopal.ac.in` domain validation) and Training & Placement Cell (TPO) Admins.
- **AI Resume Compatibility & ATS Audit:** Parses uploaded PDF resumes, verifies document structure, calculates ATS scores, and checks eligibility across active drives.
- **Automated CGPA Eligibility Guard:** Blocks applications automatically if a student's CGPA is below the company's cutoff.
- **Real-Time TPO Interview Scheduler:** Allows placement officers to shortlist candidates, assign exact interview dates, time slots, and meeting links, and export CSV reports.

## Tech Stack
- **Frontend:** React, Vite, React Router, CSS3
- **Backend:** Node.js, Express.js, JWT, bcryptjs, Multer, `pdf-parse`
- **Database:** PostgreSQL
