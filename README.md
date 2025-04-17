# 💸 Full Stack AI Finance Platform

A modern full-stack finance management platform built with **Next.js**, **Supabase**, **Tailwind CSS**, **Prisma**, **Inngest**, **ArcJet**, and **Shadcn UI**.  
Manage your finances, track transactions, and stay on top of your budget — all in one place.

---

## ✨ Features

- 🔐 **User Authentication** via Supabase
- 🧾 **Transaction Tracking** with a clean, AI-enhanced UI
- 🧮 **Multiple Account Support** — Users can create and manage several accounts
- 📊 **Budget Management**
  - Each account can have **one personal budget**
  - Users can create a **global budget** that overrides individual budgets
  - When a global budget is enabled, all account-specific budgets are disabled
  - Disabling the global budget restores previously linked account budgets
- 📧 **Budget Alert Emails** — Stay informed with smart budget notifications
- 🧠 **AI-Assisted Insights** (planned)
- 🛠️ **More powerful features coming soon...**

---

## 🖼️ UI Preview

> Built with **Tailwind CSS** + **Shadcn UI** for a modern, responsive experience.

*(Screenshots or GIFs here — if available)*

---

## 🏗️ Tech Stack

| Layer         | Tech                                    |
|--------------|------------------------------------------|
| Frontend     | [Next.js](https://nextjs.org), [Shadcn UI](https://ui.shadcn.com), [Tailwind CSS](https://tailwindcss.com) |
| Backend      | [Supabase](https://supabase.io), [Prisma](https://www.prisma.io), [Inngest](https://www.inngest.com), [ArcJet](https://arcjet.com) |
| Database     | Supabase (PostgreSQL)                    |
| Email Alerts | Supabase + Inngest workflows             |

---

## ENV Setup
- DATABASE_URL=
- DIRECT_URL=

- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
- CLERK_SECRET_KEY=
- NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
- NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
- NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
- NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

- GEMINI_API_KEY=

- RESEND_API_KEY=

- ARCJET_KEY=

## 🧪 Running Locally

1. **Clone the repository**

```bash
git clone https://github.com/Irshad-Ahmaed/WELTH
cd welth 
```

2. **Install & Run**

```bash
npm install
npm run dev
```

### After completing all the step successfully your app is running on http://localhost:3000 in your browser.