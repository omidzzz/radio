# Radiotherapy Clinic Website

A complete business website foundation for a radiotherapist, built with Next.js 15, React 19, TypeScript, Tailwind CSS, and SQLite.

## Features

### 📄 Standard Business Pages
- **Home** — Hero section, highlights, and calls to action
- **About** — Clinic mission, values, and team
- **Services** — Comprehensive radiotherapy services overview
- **Contact** — Contact form and clinic information

### 💬 Community Forum (No Login Required)
- Users can post questions with just a name — **no account needed**
- Categories: General, Treatment, Support, Other
- Threaded discussions with replies
- Reply count and timestamps on each post

### 📅 Session Booking
- Booking request form with:
  - Patient name, email, phone
  - Session type selection (Consultation, Treatment Planning, Therapy, Follow-up, Second Opinion)
  - Preferred date and time slots
  - Additional notes
- Bookings stored with a reference number sent back to the user

### 🔐 Admin Panel (Password Protected)
- **Login** at `/admin/login` (default password: `admin123`)
- **Dashboard** at `/admin` with:
  - Overview stats (bookings, forum posts, messages)
  - Booking management — confirm, cancel, complete, or delete requests
  - Forum moderation — delete inappropriate posts
  - Contact message inbox — view and delete messages
- Session-based auth with signed, expiring cookies (8 hours)
- Change the password via the `ADMIN_PASSWORD` environment variable

### 🌐 Bilingual (Farsi Default + English)
- **Language toggle** in the navbar — switch between فارسی and English
- **Farsi is the default language** (RTL), with full RTL layout support
- **English** switches to LTR, and all components flip horizontally
- Translation keys in `lib/i18n/dictionaries/fa.ts` and `en.ts`
- Language preference persisted in a cookie (1 year)
- Server and client components both read the locale via `lib/i18n/server.ts` and `lib/i18n/client.ts`
| Database | SQLite (better-sqlite3) |
| Styling | Tailwind CSS |

## Project Structure

```
radiotherapist-website/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── login/route.ts       # POST - admin login
│   │   │   ├── logout/route.ts      # POST - admin logout
│   │   │   ├── stats/route.ts       # GET - dashboard stats
│   │   │   ├── bookings/route.ts    # GET/PATCH/DELETE - manage bookings
│   │   │   ├── forum/route.ts       # GET/DELETE - moderate forum
│   │   │   └── messages/route.ts    # GET/DELETE - manage messages
│   │   ├── bookings/route.ts        # POST - create booking
│   │   ├── contact/route.ts         # POST - submit contact message
│   │   └── forum/
│   │       └── posts/
│   │           ├── route.ts         # GET/POST - list/create posts
│   │           └── [id]/
│   │               ├── route.ts     # GET - single post
│   │               └── replies/route.ts  # GET/POST - replies
│   ├── admin/
│   │   ├── page.tsx                 # Admin dashboard
│   │   └── login/
│   │       ├── page.tsx             # Admin login page
│   │       └── AdminLoginForm.tsx   # Login form component
│   ├── about/page.tsx               # About page
│   ├── booking/page.tsx             # Booking page
│   ├── contact/page.tsx             # Contact page
│   ├── forum/
│   │   ├── page.tsx                 # Forum list + new post
│   │   └── [id]/page.tsx            # Post thread with replies
│   ├── services/page.tsx            # Services page
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   └── globals.css                  # Tailwind styles
├── components/
│   ├── Navbar.tsx                   # Navigation bar (responsive)
│   ├── Footer.tsx                   # Footer
│   ├── NewPostForm.tsx              # Forum post form
│   ├── ReplyForm.tsx                # Reply form
│   ├── BookingForm.tsx              # Booking form
│   └── ContactForm.tsx              # Contact form
├── lib/
│   ├── auth.ts                      # Admin auth (sessions, cookies)
│   ├── db.ts                        # SQLite database setup + schema
│   └── types.ts                     # TypeScript interfaces
├── data/                            # SQLite database stored here (auto-created)
├── .env.example                     # Environment variables template
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── .gitignore
```

## Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm, yarn, or pnpm

### Installation

```bash
# 1. Navigate to the project
cd radiotherapist-website

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Database

The app uses SQLite with an auto-created `data/site.db` file. The schema includes:

- **forum_posts** — id, author_name, title, content, category, created_at
- **forum_replies** — id, post_id (FK), author_name, content, created_at
- **bookings** — id, full_name, email, phone, session_type, preferred_date, preferred_time, notes, status, created_at
- **contact_messages** — id, name, email, subject, message, created_at

Tables are created automatically on first startup. No configuration needed.

## Customization

### Clinic Information
- Update the placeholder contact info (address, phone, email) in:
  - `components/Footer.tsx`
  - `app/booking/page.tsx`
  - `app/contact/page.tsx`

### Colors & Branding
- The site uses a teal primary color (`teal-600`). Replace `teal-*` classes throughout or add a custom theme in `app/globals.css`.

### Team Members
- Update team members in `app/about/page.tsx`.

### Services
- Add/remove services in the `services` array in `app/services/page.tsx`.

### Booking Time Slots
- Modify the `timeSlots` array in `components/BookingForm.tsx`.

### Forum Categories
- Modify the `categories` array in:
  - `components/NewPostForm.tsx`
  - `app/forum/page.tsx` (labels)
  - `app/forum/[id]/page.tsx` (labels)

## Deployment

### ParsWebServer Linux Hosting (Recommended for Iran)

This app is optimized for deployment on ParsWebServer Linux hosting (میزبانی وب لینوکس ایران).

**Quick Deploy:**
1. Upload project files to your server
2. Run `chmod +x deploy.sh && ./deploy.sh`
3. Configure `.env` with your admin password
4. Set up Apache reverse proxy (see `README-PARSWEBSERVER.md`)

**Features:**
- ✅ SQLite database (persists on filesystem)
- ✅ Local file uploads (public/uploads/)
- ✅ PM2 process management
- ✅ Apache/Nginx reverse proxy
- ✅ Auto-restart on crashes

**Full Guide:** See [README-PARSWEBSERVER.md](README-PARSWEBSERVER.md) for detailed instructions.

### Other Hosting Options

- **Liara:** Requires PostgreSQL migration and cloud storage (see compatibility notes above)
- **Vercel:** Requires database and file storage migration
- **Docker:** Can be containerized with SQLite persistence

## Future Enhancements (Roadmap)

- [x] Admin panel to manage bookings (approve/reject)
- [x] Admin panel to moderate forum posts
- [ ] Email notifications for bookings and contact messages
- [ ] User accounts (optional, forum currently name-only)
- [x] File uploads for blog images
- [x] Multi-language support (i18n)
- [x] Deployment guide for ParsWebServer

## License

Private project — all rights reserved.
