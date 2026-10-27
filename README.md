# NoteNest — Smart Study Material Sharing Platform
> **College FLEXI Project (Capstone Evaluation)**  
> A production-minded full-stack web application designed for engineering scholars to discover, upload, preview, bookmark, rate, and manage syllabus-aligned study materials.

---

## 📌 1. Project Overview & Objectives

In college academic environments, valuable study resources (handwritten notes, verified lab records, previous year university question papers, and formula cheatsheets) are scattered across fragmented messaging groups and drives.

**NoteNest** solves this by offering a centralized, verified, academic repository tailored to semester structures and engineering departments:
- **Role-Based Access Control (RBAC):** Distinct roles for **Students** and **Faculty Administrators**.
- **Multi-Format Academic Resources:** Lecture Notes, Handwritten Notes, Practical Files, Lab Manuals, PYQs, Syllabi, and Reference Books.
- **Granular Academic Hierarchy:** Categorization by Engineering Branch, Semester (1–8), and Subject Name.
- **Zero-Friction In-App Document Previews:** Built-in PDF reader viewer directly in the browser modal before downloading.
- **Validated Download Tracking:** Secure backend endpoint that increments verified download statistics.
- **Fair Peer Reviews & Rating Integrity:** 1–5 star ratings with unique compound database indexes preventing duplicate ratings.
- **Integrated Admin Moderation & Reporting:** Active flag/report mechanisms for corrupted files or inaccurate subject tags.

---

## 🛠️ 2. Technology Stack & System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer (SPA)                     │
│  React 18  •  Vite  •  React Router v6  •  Lucide Icons     │
│  Context API (Auth & Toast)  •  Custom SaaS CSS Tokens      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                HTTP REST API  │ (JSON / Multipart)
                Proxy (:5173)  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application API Layer                    │
│  Node.js  •  Express.js  •  JWT Auth  •  Bcrypt Password    │
│  Helmet Security  •  Rate Limiting  •  Multer Uploads       │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼ Mongoose ODM                 ▼ Dual Storage
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Database Layer          │ │       Storage Layer        │
│  MongoDB Server (:27017)     │ │  Local Disk / Cloudinary   │
│  Inspectable via Compass     │ │  PDFs, DOCX, PPTX, Images  │
└──────────────────────────────┘ └────────────────────────────┘
```

- **Frontend:** React 18, Vite 5, React Router v6, Lucide React icons, Custom CSS Design System (Calm off-white background `#F8FAFC`, Deep Navy `#1E1B4B`, Brand Indigo `#4338CA`, Lavender accents `#EDE9FE`).
- **Backend:** Node.js, Express.js REST API with centralized error handling and request sanitization.
- **Database:** MongoDB Community Server (v7.0) connected via Mongoose ODM.
- **Security:** Bcrypt password hashing (10 salt rounds), JSON Web Tokens (JWT) with 7-day expiry, role authorization middleware, rate limiters on auth routes, and Helmet HTTP headers.
- **Storage:** Configured dual-provider storage (`local` file storage out-of-the-box or `cloudinary` cloud delivery when configured via `.env`).

---

## 🗄️ 3. MongoDB Data Models & Database Design

All application records are persisted directly in MongoDB (no memory arrays). MongoDB Compass can be attached directly to view all collections.

### 1. `User` Collection
- `name`: String (2–60 chars, trimmed)
- `email`: String (normalized lowercase, unique index)
- `passwordHash`: String (bcrypt hashed, `select: false`)
- `branch`: Enum (`Computer Science`, `Information Technology`, `Electronics & Communication`, `Mechanical Engineering`, `Civil Engineering`, etc.)
- `semester`: Number (1–8)
- `role`: Enum (`student`, `admin`, default: `student`)
- `avatar`, `bio`, `isActive`: Boolean

### 2. `Resource` Collection
- `title`, `description`, `subject`: Indexed text fields
- `branch`, `semester`, `resourceType`: Multi-attribute compound indexes
- `fileUrl`: Storage access path
- `storageIdentifier`: Unique filename or Cloudinary `public_id`
- `storageProvider`: Enum (`local`, `cloudinary`)
- `originalFilename`, `fileSize`, `mimeType`: Server-validated file metadata
- `uploader`: Reference to `User._id`
- `moderationStatus`: Enum (`approved`, `pending`, `rejected`)
- `downloadCount`, `viewCount`, `averageRating`, `ratingCount`
- **Text Search Index:** `{ title: 'text', subject: 'text', description: 'text' }`

### 3. `Bookmark` Collection
- `user`: Reference to `User._id`
- `resource`: Reference to `Resource._id`
- `createdAt`: Date
- **Unique Compound Index:** `{ user: 1, resource: 1 }` (guarantees a user cannot duplicate bookmarks)

### 4. `Review` Collection
- `user`: Reference to `User._id`
- `resource`: Reference to `Resource._id`
- `rating`: Number (1 to 5)
- `comment`: String (optional)
- **Unique Compound Index:** `{ user: 1, resource: 1 }` (guarantees one review per user per resource)

### 5. `Report` Collection
- `reporter`: Reference to `User._id`
- `resource`: Reference to `Resource._id`
- `reason`: Enum (`Inappropriate Content`, `Copyright Infringement`, `Incorrect/Misleading Subject`, `Corrupted File`, `Spam`, `Other`)
- `status`: Enum (`pending`, `resolved`, `dismissed`)
- `reviewedBy`: Reference to `User._id` (Admin)

### 6. `DownloadHistory` Collection
- `user`: Reference to `User._id`
- `resource`: Reference to `Resource._id`
- `downloadedAt`: Date (Indexed for rapid chronological queries)

---

## 🔍 4. MongoDB Compass Inspection Guide

You can inspect the live database using MongoDB Compass during your viva:

1. Open **MongoDB Compass**.
2. Paste the connection string:
   ```text
   mongodb://127.0.0.1:27017/notenest
   ```
3. Click **Connect**.
4. You will see the `notenest` database containing the 6 collections:
   - `users`
   - `resources`
   - `bookmarks`
   - `reviews`
   - `reports`
   - `downloadhistories`
5. Click into `resources` or `users` to inspect documents, indexes, and relations in real time!

---

## 🔑 5. Pre-Seeded Accounts for College Demo / Viva

The database comes pre-seeded with realistic academic data so you can demonstrate the platform immediately:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Faculty Admin** | `admin@notenest.edu` | `Admin@123` | Full moderation, report resolution, user management, metrics |
| **Student 1** | `rohit@notenest.edu` | `Student@123` | CS 5th Sem student, uploaded DSA & Networks notes |
| **Student 2** | `priya@notenest.edu` | `Student@123` | IT 4th Sem student, uploaded OS & DBMS notes |

> 💡 **Viva Tip:** On the Login page (`/login`), click the **"Quick Demo Login"** buttons to auto-fill credentials for Rohit or the Faculty Admin with a single click!

---

## 🚀 6. Installation & Execution Guide

### Prerequisites
- Node.js (v18+ or v20 LTS)
- MongoDB Community Server (running on port `27017`)

### 1. Backend Setup
```bash
cd backend
npm install

# (Optional) Run the database seed script to load demo users & notes
npm run seed

# Start the Express REST API
npm run dev
# -> Runs on http://localhost:5001
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start the Vite development server with proxy
npm run dev
# -> Runs on http://localhost:5173
```

---

## ⚙️ 7. Environment Variables Reference

### Backend (`backend/.env`)
```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/notenest
JWT_SECRET=notenest_production_ready_jwt_super_secret_key_2026_flexi
JWT_EXPIRES_IN=7d
STORAGE_PROVIDER=local
ADMIN_REGISTRATION_KEY=NoteNest@Admin2026!

# Optional: Cloudinary Storage Credentials
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=notenest_uploads
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=/api
```

---

## 📡 8. REST API Documentation

### Authentication & Profiles (`/api/auth`)
- `POST /api/auth/register` — Register student or admin with validation & admin key check.
- `POST /api/auth/login` — Authenticate user and issue JWT.
- `GET /api/auth/me` — Fetch authenticated profile and upload/bookmark count.
- `PUT /api/auth/me` — Update name, branch, semester, or bio.
- `PUT /api/auth/change-password` — Change password after verifying current hash.

### Study Resources (`/api/resources`)
- `GET /api/resources` — Paginated search with branch, semester, subject, and type filters.
- `GET /api/resources/highlights` — Landing page highlights (trending, recent, total counts).
- `GET /api/resources/:id` — Resource details, populated uploader, reviews, and bookmark state.
- `POST /api/resources` — Upload new document with server-side validation & size checks.
- `PUT /api/resources/:id` — Update resource metadata (Owner or Admin only).
- `DELETE /api/resources/:id` — Remove resource and associated bookmarks, reviews, and files.
- `POST /api/resources/:id/download` — Record download history & increment validated download count.
- `POST /api/resources/:id/reviews` — Rate 1–5 stars and submit feedback (one review per user).
- `POST /api/resources/:id/reports` — Flag inappropriate content for admin review.

### Bookmarks & User Dashboard (`/api/bookmarks` & `/api/users`)
- `POST /api/bookmarks/:resourceId` — Save resource to user bookmarks.
- `DELETE /api/bookmarks/:resourceId` — Remove resource from bookmarks.
- `GET /api/users/me/resources` — Get current user's uploads with moderation stats.
- `GET /api/users/me/bookmarks` — Get populated list of saved bookmarks.
- `GET /api/users/me/download-history` — Get log of downloaded materials.

### Admin Moderation (`/api/admin`)
- `GET /api/admin/stats` — Overall KPI metrics, download totals, and branch distribution charts.
- `GET /api/admin/moderation` — Queue of pending, approved, or rejected uploads.
- `PUT /api/admin/moderation/:id` — Approve or reject resource.
- `GET /api/admin/reports` — List of flagged materials.
- `PUT /api/admin/reports/:id` — Resolve/dismiss reports with option to delete offending resource.
- `GET /api/admin/users` — User management with search and role filters.
- `PUT /api/admin/users/:id` — Promote/demote user or deactivate account.

---

## 🎓 9. Viva / Presentation Talking Points

When presenting NoteNest for your FLEXI evaluation, highlight the following:

1. **Clean Separation of Concerns:**
   - React SPA manages state with clean hooks and context providers.
   - Vite proxy routes `/api` requests to Express, preventing CORS complications.
   - Node.js backend handles business logic, security checks, and database indexing.

2. **Database Integrity & Constraints:**
   - Compound indexes (`{ user: 1, resource: 1 }` on Bookmarks & Reviews) enforce data integrity at the database engine level, preventing race conditions or duplicate entries.
   - Full-text compound search index (`title`, `subject`, `description`) enables fast fuzzy search across hundreds of resources.

3. **Production File Handling:**
   - Server-side Multer validation ensures malicious or oversized files (>25MB) are rejected before saving.
   - Dual-storage architecture: seamless local file streaming for zero-config demos, plus full plug-and-play Cloudinary support for production cloud deployment.

4. **Role-Based Security:**
   - Ordinary students cannot elevate themselves to administrators without the protected `ADMIN_REGISTRATION_KEY`.
   - Admin routes are protected by chained middleware (`requireAuth` + `adminOnly`).



---

## ☁️ 10. Deploying to Vercel (Production Cloud Guide)

NoteNest is configured for unified monorepo deployment on **Vercel** with:
- **Frontend SPA:** Built with Vite into `client/dist`, with catch-all routing rewrites for React Router.
- **Backend API:** Executed as a serverless function via `api/index.js`, routing `/api/*` requests to the Express application with connection pooling.

### Step 1: Set Up Cloud Database (MongoDB Atlas)
Since local MongoDB (`127.0.0.1:27017`) is not reachable from Vercel's serverless cloud:
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a user (e.g. `notenest_admin`).
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere (`0.0.0.0/0`)** so Vercel lambdas can connect.
5. Click **Connect ➔ Drivers** and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/notenest?retryWrites=true&w=majority
   ```

### Step 2: (Optional) Set Up Cloudinary File Storage
For persistent file uploads in serverless production:
1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the Cloudinary dashboard.

### Step 3: Deploy to Vercel

#### Method A: Using Vercel CLI (Fastest)
From the project root directory, run:
```bash
npm run deploy
```
1. Follow the terminal prompts to log in (via browser).
2. Set up and deploy: Press **Enter** to accept the default settings (`notenest-workspace`).
3. Add the production environment variables in your Vercel Dashboard or CLI:
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A secure secret string
   - `STORAGE_PROVIDER`: `cloudinary` (or `local`)
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary Cloud Name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API Key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API Secret
   - `ADMIN_REGISTRATION_KEY`: `NoteNest@Admin2026!`
   - `NODE_ENV`: `production`
4. Deploy to production:
   ```bash
   npm run deploy:prod
   ```

#### Method B: Deploying via GitHub & Vercel Dashboard
1. Push this project repository to **GitHub**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select and import your GitHub repository.
4. In the **Environment Variables** section, add the required keys listed above.
5. Click **Deploy**.
6. Vercel will build the frontend into `client/dist`, bind the `/api` serverless handler, and provide a live URL (e.g., `https://notenest-xxx.vercel.app`).
