# ⚡ YANTROTSAV 2026 — Comprehensive Features & Architecture Guide

Welcome to the official feature documentation for **YANTROTSAV 2026** — the annual flagship technical festival platform of the **Department of Computer Science & Engineering, Central University of Jammu**.

---

## 📑 Table of Contents
1. [Platform Overview & Architecture](#1-platform-overview--architecture)
2. [Authentication & Student Identity](#2-authentication--student-identity)
3. [Event Discovery & Enrollment Engine](#3-event-discovery--enrollment-engine)
4. [Multi-Player Team & Squad Collaboration](#4-multi-player-team--squad-collaboration)
5. [Admin Command Center & Telemetry](#5-admin-command-center--telemetry)
6. [Attendance, Check-in & Gate Operations](#6-attendance-check-in--gate-operations)
7. [Privacy & User Experience Design](#7-privacy--user-experience-design)
8. [Automations & Serverless Communication](#8-automations--serverless-communication)
9. [Database & Collection Schema Reference](#9-database--collection-schema-reference)

---

## 1. Platform Overview & Architecture

YANTROTSAV 2026 is built on a modern high-performance Jamstack architecture:

* **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, Redux Toolkit, and Framer Motion for smooth cybernetic animations.
* **Backend as a Service (BaaS)**: Appwrite Cloud (Singapore `sgp.cloud.appwrite.io`):
  * **Authentication**: Email/Password sessions, user preferences, and role-based permissions.
  * **Databases (`TablesDB`)**: Schema-enforced document collections with indexing.
  * **Storage (`event_banners`)**: High-speed CDN bucket for event visual banners and student documents.
* **Serverless Edge Microservices**: Vercel Serverless Functions (`api/contact.ts`, `api/send-invite.ts`) powered by Nodemailer and Gmail SMTP.

---

## 2. Authentication & Student Identity

### A. Atomic Registration Flow
* **Comprehensive Academic Profile**: Students sign up with:
  * Full Name
  * Unique `@username` (stored in Appwrite `userId` & user preferences)
  * College Roll Number (indexed with duplicate-detection mapping)
  * Department (Dropdown with `OTHER` custom department specification)
  * Semester (Sem 1 to Sem 8 / PG)
  * Contact Phone Number
  * Email Address & Secure Password (min 8 characters)
* **Atomic Provisioning**: Guarantees that the Appwrite Auth user and the `users` database record are created together.
* **Smart Error Mapping**: If an email or roll number is already registered, user-friendly notices explain the issue clearly.

### B. Unified Multi-Identifier Sign-In
* Students can log into their account using any of three identifiers:
  1. **`@username`**
  2. **College Roll Number**
  3. **Email Address**
  plus their password. The system resolves the identifier and establishes a secure session cookie.

### C. Personal Student Dashboard (`/dashboard`)
* Displays student greeting with `@username`, Roll Number, Department, and University.
* **Fest Engagement Metrics**:
  * Number of events enrolled.
  * Number of teams joined / led.
  * Number of pending invitations waiting for response.
* **Profile Management**: Students can update their profile information, phone number, department, and semester at any time.

---

## 3. Event Discovery & Enrollment Engine

### A. Events Catalog (`/events`)
* **Real-time Filter & Search**: Search by event title, category (Coding, Robotics, Gaming, Design, Workshop, Other), and venue.
* **Live Status Flags**: Clearly demarcates events that are `LIVE` vs `CLOSED / DRAFT`.
* **Format Visibility**: Displays team formats (`Solo`, `Team (2-4)`), timing, venue, and live registration progress.

### B. Solo & Team Registration
* **Solo Entry**: Instant 1-click registration generating a unique Clearance Pass ID.
* **Team Entry**: Team leader defines team name, specifies squad size, and initiates member invitations.

### C. Duplicate Registration Prevention
* **Real-time State Guard**: Evaluates whether a student is already enrolled (as a solo participant, a team leader, or an accepted team member).
* **UI Protection**: Enrolled events display an **`Already Enrolled ✓`** badge linking directly to the student's dashboard pass, disabling duplicate submissions.

---

## 4. Multi-Player Team & Squad Collaboration

### A. Universal Member Invitations
* When forming a team, the leader can invite teammates using:
  * Teammate's `@username`
  * College Roll Number
  * Email Address
* The system automatically searches the student registry to resolve the correct student.

### B. Instant In-App & Email Notifications
* **Dashboard Alerts**: Teammates receive an instant invitation card on their dashboard displaying Event Title, Team Name, and Inviting Leader.
* **1-Click Response**: Teammates can click **`Accept`** or **`Decline`**.
* **Automated Email Transmission**: Dispatches an email notification with direct portal action links.

### C. Dual-Role Squad Panel
* On `/dashboard`, the **"MY TEAMS"** widget dynamically categorizes:
  * **Teams Led by User**: Gold **`[LEADER]`** badge with invitation controls and squad roster.
  * **Teams Joined by User**: Cyan **`[MEMBER]`** badge with confirmed leader and teammate cards.
* **Self-Healing Passes**: As soon as an invitation is accepted, the member's event pass is automatically activated under **"My Enrolled Events"**.
* **Auto-Confirmation**: When the minimum team size is met, the team status automatically shifts from `Waiting for Members` to `Confirmed`.

---

## 5. Admin Command Center & Telemetry (`/admin`)

Reserved strictly for event administrators and coordinators with verified role access.

### A. KPI Telemetry Row
* **Total Event Registrations**: Total event entry passes booked.
* **Registered Students**: Total unique student user accounts.
* **Teams Formed**: Active student teams created.
* **Active Events**: Published festival events currently open.

### B. Tab 1: Manage Events (`activeTab === 'events'`)
* Full lifecycle event management:
  * **Deploy Event**: Title, description, rules, team constraints, timing, venue, registration deadlines.
  * **Banner Uploads**: Upload banner image files directly to the Appwrite CDN storage bucket (`event_banners`).
  * **1-Click Clone**: Duplicate any event with 1 click to save time.
  * **Live Toggle**: Switch events between `Live` and `Closed` instantly.
  * **Edit / Delete**: Modify event details or purge test events.

### C. Tab 2: Registrations & Attendance (`activeTab === 'roster'`)
* Live relational attendance table joining `event_registrations`, `users`, `teams`, and `events`.
* Displays real student profiles (Student Name, `@username`, Roll Number, Department, Semester, Phone, Event, Team, Attendance Status).
* **Filter Options**: Filter by Event (or view Global list) and Attendance status (`All Students`, `Present (Attended)`, `Not Yet Arrived`).
* **Attendance Progress Bar**: Live calculation of total registered, present count, and attendance percentage.
* **1-Click Attendance**: Toggle attendance between `Mark Present ✓` and `Present ✓`.
* **Export Attendee List**: Download UTF-8 formatted CSV for gate desk coordinators.

### D. Tab 3: Registered Students (`activeTab === 'users'`)
* Complete directory of all registered participants.
* Search by name, username, roll number, or phone.
* Department filtering.
* **Inspect Profile Modal**: Deep view of student credentials, contact info, and timestamp.
* **Export Users CSV**: 1-click download of the student registry.

### E. Tab 4: Teams & Members (`activeTab === 'teams'`)
* Overview of all team squads across all events.
* Status tracking (`CONFIRMED`, `WAITING`, `DISBANDED`).
* **Squad Inspector Modal**:
  * Visual capacity bar (`Accepted / Required`).
  * Leader academic profile and clearance pass.
  * Live member invitation states (`Accepted`, `Pending`, `Declined`).
  * **Force Accept**: Coordinators can manually confirm an offline student's invitation with 1 click.
  * **Copy Squad Dossier**: Copies a clean text roster to the clipboard for judges.

---

## 6. Attendance, Check-in & Gate Operations

* **Fast Gate Verification**: Coordinators can search an arriving student by Name, Roll Number, or `@username`.
* **Instant Attendance Toggle**: Clicking `Mark Present ✓` updates the document live in Appwrite with `checkedIn: true` and an ISO timestamp.
* **Undo Protection**: Accidental check-ins can be reversed by clicking the green `Present ✓` button.
* **Audit-Proof**: Registrations cannot be forged; each registration document has a unique ID linked to an event and student profile.

---

## 7. Privacy & User Experience Design

* **Human-Friendly Language**: All developer jargon (`Rosters`, `Gate Check-In`, `Team Squads`, `Student Directory`) replaced with intuitive terms (`Registrations & Attendance`, `Registered Students`, `Teams & Members`).
* **`@username` First**: Public cards, headers, navigation, and rosters prioritize `@username` and hide raw emails. Emails are restricted to private profiles.
* **Cyber Aesthetic**: Dark futuristic theme (`#050816` background, `#00E5FF` cyan, `#FF6B00` neon orange) optimized for readability with responsive mobile navigation.

---

## 8. Automations & Serverless Communication

* **Nodemailer SMTP Integration**: Integrated with Gmail SMTP using App Passwords.
* **`api/send-invite.ts`**: Dispatches cyber-themed invitations to teammates.
* **`api/contact.ts`**: Processes contact inquiries from `/contact` and notifies administrators.

---

## 9. Database & Collection Schema Reference

| Collection | Key Attributes | Purpose |
|---|---|---|
| **`users`** | `userId`, `fullName`, `email`, `phone`, `rollNumber`, `department`, `customDepartment`, `semester`, `collegeName` | Student academic profile registry |
| **`events`** | `title`, `description`, `category`, `eventType`, `minTeamSize`, `maxTeamSize`, `maxTeamsAllowed`, `venue`, `eventTiming`, `registrationDeadline`, `bannerUrl`, `status` | Events catalog and requirements |
| **`teams`** | `name`, `eventId`, `leaderId`, `leaderName`, `leaderEmail`, `status` | Team groups formed for events |
| **`team_invitations`** | `teamId`, `eventId`, `eventTitle`, `inviterId`, `inviterName`, `inviteeEmail`, `status` | Teammate invites and response states |
| **`event_registrations`** | `eventId`, `teamId`, `userId`, `userName`, `userEmail`, `checkedIn`, `checkedInAt`, `registeredAt` | Event passes and attendance records |
