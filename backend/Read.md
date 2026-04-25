# Complaint Setu — Backend Documentation

> A full-stack civic grievance management system built for citizens to file, track, and resolve complaints with government departments.

---

## Tech Stack Overview

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js | JavaScript server-side runtime |
| Framework | Express.js | REST API routing and middleware |
| Database | MongoDB | NoSQL document storage |
| ODM | Mongoose | MongoDB object modeling |
| Auth | JSON Web Token (JWT) | Stateless user authentication |
| Password | bcryptjs | Password hashing |
| Email | Nodemailer + Gmail SMTP | Transactional email notifications |
| File Upload | Multer | Multipart file handling |
| ML Service | Axios → FastAPI (Python) | Priority prediction + duplicate detection |
| Environment | dotenv | Secret/config management |

---

## Project Structure

```
backend/
├── models/
│   ├── Complaint.js       # Complaint schema + SLA methods
│   └── User.js            # User schema + auth methods
├── routes/
│   ├── complaints.js      # All complaint endpoints
│   └── auth.js            # Register, login, password reset
├── middleware/
│   └── auth.js            # JWT verification middleware
├── utils/
│   └── mailer.js          # Nodemailer transporter setup
├── uploads/               # Multer file storage (images)
├── .env                   # Environment secrets
└── server.js              # App entry point
```

---

## Models

### User Model (`models/User.js`)

| Field | Type | Description |
|---|---|---|
| `name` | String | Full name, required |
| `email` | String | Unique, lowercase, required |
| `password` | String | bcrypt hashed, min 6 chars |
| `role` | String | `"user"` or `"admin"`, default `"user"` |
| `passwordResetToken` | String | Crypto random token for password reset |
| `passwordResetExpire` | Date | Expiry time for reset token |
| `createdAt` | Date | Account creation timestamp |

**Methods on User:**

- `generateAuthToken()` — signs a JWT with `{ _id, email, role }`, expires in 7 days
- `comparePassword(candidate)` — bcrypt compares plain password against stored hash
- `generatePasswordResetToken(seconds)` — generates a `crypto.randomBytes` token, stores hash + expiry

---

### Complaint Model (`models/Complaint.js`)

| Field | Type | Description |
|---|---|---|
| `category` | String | e.g. Water Issues, Roads, Electricity |
| `location` | String | Human-readable location text |
| `coordinates` | `{ lat, lng }` | GPS coordinates (optional) |
| `details` | String | Full complaint description |
| `image` | String | Uploaded filename (served from /uploads) |
| `status` | String | Pending / In Progress / Resolved / Rejected |
| `priority` | String | High / Medium / Low (set by ML model) |
| `userId` | ObjectId | Reference to the User who filed it |
| `slaDeadline` | Date | Computed deadline based on priority |
| `isEscalated` | Boolean | Whether complaint has been escalated |
| `resolvedAt` | Date | Timestamp when marked Resolved |
| `upvotes` | Number | Count of citizen upvotes |
| `upvotedBy` | [ObjectId] | Prevents duplicate upvotes per user |
| `feedback` | `{ rating, comment, submittedAt }` | Post-resolution citizen feedback |

**SLA Hours by Priority:**

| Priority | SLA Deadline |
|---|---|
| High | 24 hours |
| Medium | 72 hours |
| Low | 168 hours (7 days) |

**Methods on Complaint:**

- `setSLA()` — sets `slaDeadline` based on priority at time of creation
- `slaRemainingSeconds()` — returns seconds left until deadline (0 if resolved/breached)
- `slaStatus()` — returns `"ok"` / `"urgent"` / `"breached"` / `"resolved"`
- `slaTotalHours` (virtual) — returns total SLA hours for the complaint's priority

---

## API Endpoints

### Auth Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register new citizen account |
| POST | `/login` | No | Login and receive JWT token |
| POST | `/forgot-password` | No | Generate password reset token |
| POST | `/reset-password` | No | Reset password using token |
| POST | `/setup-admin` | No | Create or promote admin user |

---

### Complaint Routes (`/api/complaints`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Get all complaints (admin view) |
| POST | `/` | ✅ Yes | Submit new complaint (with file upload) |
| GET | `/duplicates` | No | Check for similar complaints (ML-powered) |
| GET | `/user/my-complaints` | ✅ Yes | Get logged-in user's complaints |
| GET | `/:id` | No | Get single complaint by ID |
| GET | `/:id/sla` | No | Get live SLA data for a complaint |
| POST | `/:id/upvote` | ✅ Yes | Upvote a complaint (idempotent) |
| POST | `/:id/feedback` | No | Submit post-resolution feedback |
| PATCH | `/:id` | No | Update status + send citizen email |
| PUT | `/:id` | No | Update status (admin dashboard) + send citizen email |

---

## Authentication & Security

### JWT Flow

```
1. User registers/logs in
2. Server signs JWT:  { _id, email, role }  →  expires 7d
3. Client stores token in localStorage
4. Every protected request sends:  Authorization: Bearer <token>
5. auth middleware verifies token → attaches decoded user to req.user
6. Route handler reads req.user._id to identify the user
```

### Password Security

- Passwords are **never stored in plain text**
- `bcryptjs` hashes with salt rounds = 10 before saving
- `pre("save")` hook only re-hashes if password field is modified
- `comparePassword()` uses `bcrypt.compare()` — timing-safe comparison

### Key Security Points

| Concern | How it's handled |
|---|---|
| Password storage | bcrypt hash (salt rounds: 10) |
| Authentication | JWT — stateless, no server-side session |
| Token expiry | 7 days — short enough to limit exposure |
| Password reset | Crypto random token, stored with expiry, single-use |
| Role-based access | `role` field in JWT payload (`user` / `admin`) |
| Upvote abuse | `upvotedBy` array prevents one user voting twice |
| File uploads | Multer stores to local `/uploads` folder with timestamp prefix |
| Secrets | All secrets in `.env` — never committed to source control |

### ⚠️ Security Issues to Fix Before Production

| Issue | Risk | Fix |
|---|---|---|
| No rate limiting | Brute force login attacks | Add `express-rate-limit` on `/login` and `/register` |
| Debug routes exposed | `/auth/debug/users` leaks all user data | Remove before deploying |
| `resetToken` returned in response | Token should only be sent via email | Remove `resetToken` from forgot-password response |
| No HTTPS enforcement | Data exposed in transit | Use HTTPS + set `secure: true` on cookies |
| `JWT_SECRET` fallback hardcoded | Weak secret if `.env` missing | Remove `|| "your_jwt_secret_key"` fallback |
| No input sanitization | NoSQL injection possible | Add `express-mongo-sanitize` |
| CORS too open | Any origin can call your API | Restrict `ALLOWED_ORIGINS` to production domain only |
| Uploads served publicly | Anyone can access uploaded files by filename | Add auth check on `/uploads` route |

---

## Email Notification System

Nodemailer is configured with Gmail SMTP using an **App Password** (not your real Gmail password).

### When emails are sent:

| Trigger | Recipient | Content |
|---|---|---|
| New complaint filed | Department (`DEPARTMENT_EMAIL`) | Complaint details + priority + SLA deadline |
| Status updated (PATCH or PUT) | Citizen (looked up via `userId → User.email`) | New status + complaint details + tracking link |

### Email flow for status update:
```
Admin changes status
  → complaints.js looks up complaint.userId
  → finds User by that _id
  → reads user.email
  → Nodemailer sends styled HTML email to citizen
```

---

## ML Service Integration

Two calls are made to a local **FastAPI** Python service at `http://127.0.0.1:8000`:

### Priority Prediction (`POST /predict`)
- Called when a new complaint is submitted
- Sends complaint `details` text
- Returns `priority`: High / Medium / Low
- If ML service is down → defaults to `"Low"` (fail-safe, never blocks submission)

### Duplicate Detection (`GET /duplicates`)
- Called client-side (debounced) before submission
- Sends new complaint text + location + up to 200 recent open complaints
- ML service computes cosine similarity with threshold `0.55`
- Returns list of similar existing complaints so citizen can upvote instead of re-filing
- If ML service is down → returns empty array (fail-safe, never blocks submission)

---

## SLA (Service Level Agreement) System

SLA tracks how long the department has to resolve each complaint.

```
Complaint filed
  → ML assigns priority (High/Medium/Low)
  → setSLA() sets slaDeadline = now + SLA_HOURS[priority]
  → Every GET response includes live slaRemainingSeconds + slaStatus
  → Frontend SLATimer component counts down in real time
  → Admin dashboard shows ⚠️ breach badge when slaStatus = "breached"
```

SLA status transitions:
```
ok  →  urgent (< 20% time left)  →  breached (deadline passed)  →  resolved
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Server port (default 5000) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `JWT_SECRET` | Secret key for signing JWTs |
| `EMAIL_USER` | Gmail address used to send emails |
| `EMAIL_PASS` | Gmail App Password (16-char) |
| `DEPARTMENT_EMAIL` | Receives new complaint notifications |
| `FRONTEND_URL` | Used in email tracking links |
| `ML_API_URL` | FastAPI ML service URL |

---

## Data Flow — Complaint Submission

```
Citizen fills form (React)
  → POST /api/complaints  [Authorization: Bearer <token>]
  → auth middleware verifies JWT → req.user._id available
  → Multer saves image to /uploads/
  → Axios calls ML service → gets priority
  → new Complaint({ ...fields, userId: req.user._id })
  → complaint.setSLA()  → sets slaDeadline
  → complaint.save()  → stored in MongoDB
  → Nodemailer sends email to DEPARTMENT_EMAIL
  → Response: { complaintId, priority, slaDeadline }
```

## Data Flow — Status Update (Admin)

```
Admin clicks "Update Status" in dashboard
  → PUT /api/complaints/:id  { status: "Resolved" }
  → Complaint.findByIdAndUpdate → sets status + resolvedAt
  → User.findById(complaint.userId) → gets citizen email
  → Nodemailer sends styled HTML email to citizen
  → Response: updated complaint with live SLA fields
```