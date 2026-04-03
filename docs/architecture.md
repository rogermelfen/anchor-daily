# Architecture and Technology Stack: Practical Christian Daily App

## 1. Technology Stack Selection

Based on the requirements for simplicity, stability, exportability, commercial viability, and a good mobile experience, the following technology stack is selected:

### Mobile App (Frontend)
*   **Framework:** React Native with Expo (Managed Workflow)
    *   *Why:* Allows building for both iOS and Android from a single codebase. Expo simplifies development, building, and deployment significantly. It's standard, modern, and highly exportable.
*   **Language:** TypeScript
    *   *Why:* Provides type safety, reducing bugs and improving maintainability.
*   **State Management:** Zustand or React Context
    *   *Why:* Simple, lightweight, and sufficient for the app's complexity (no need for heavy Redux).
*   **Navigation:** React Navigation
    *   *Why:* The industry standard for React Native routing.
*   **In-App Purchases (Subscriptions):** RevenueCat
    *   *Why:* The most robust and standard way to handle App Store and Google Play subscriptions, trial logic, and paywalls without building complex backend receipt validation.
*   **Push Notifications:** Expo Push Notifications
    *   *Why:* Built into Expo, easy to set up, and reliable.

### Backend & Database
*   **Backend-as-a-Service (BaaS):** Supabase
    *   *Why:* Supabase provides a complete, open-source backend (PostgreSQL database, Authentication, Storage, and Edge Functions). It is highly exportable (you can self-host it if you leave their cloud), extremely stable, and drastically reduces backend development time compared to building a custom Node.js/Express server from scratch. It perfectly fits the "simple, stable, exportable" mandate.
*   **Database:** PostgreSQL (via Supabase)
    *   *Why:* Robust, relational database perfect for structured data like users, reflections, and journal entries.
*   **Authentication:** Supabase Auth
    *   *Why:* Handles email/password and social logins securely out of the box.

### Admin Panel
*   **Framework:** React (Web) or a low-code tool like Retool/Refine connected to Supabase.
    *   *Decision:* For MVP simplicity and exportability, a simple React web app (Vite + React + Tailwind CSS) interacting directly with the Supabase database is best.

## 2. Database Schema (PostgreSQL)

### Table: `users`
(Managed primarily by Supabase Auth, but extended with a public profile table)
*   `id` (UUID, Primary Key, references auth.users)
*   `email` (String)
*   `created_at` (Timestamp)
*   `selected_focus` (String) - e.g., 'stress', 'decisions', 'relationships'
*   `is_premium` (Boolean) - Default false. Updated via RevenueCat webhooks.
*   `trial_start_date` (Timestamp) - Nullable.
*   `push_enabled` (Boolean) - Default false.
*   `push_token` (String) - Nullable.

### Table: `reflections`
*   `id` (UUID, Primary Key)
*   `title` (String)
*   `theme` (String) - e.g., 'stress', 'decisions', 'relationships'
*   `short_reflection` (Text) - For free users.
*   `practical_application` (Text)
*   `question` (Text)
*   `premium_extended_version` (Text) - For premium users.
*   `tags` (Array of Strings)
*   `status` (String) - 'draft', 'published'
*   `publish_date` (Date) - The date this reflection is meant to be shown.
*   `is_premium_only` (Boolean) - Default false. If true, only premium users see it.
*   `created_at` (Timestamp)
*   `updated_at` (Timestamp)

### Table: `journal_entries`
*   `id` (UUID, Primary Key)
*   `user_id` (UUID, Foreign Key to users.id)
*   `reflection_id` (UUID, Foreign Key to reflections.id) - Nullable, if it's a general note.
*   `content` (Text)
*   `created_at` (Timestamp)
*   `updated_at` (Timestamp)

## 3. System Architecture Flow

1.  **App Launch:** App checks local storage for authentication state and selected focus.
2.  **Onboarding (First Launch):** User sees value prop, selects focus. App fetches today's free reflection for that focus anonymously.
3.  **Authentication:** User signs up/logs in via Supabase Auth.
4.  **Subscription Status:** App checks RevenueCat SDK for active subscription or trial status. RevenueCat syncs with Supabase via webhooks to update `is_premium` in the `users` table.
5.  **Daily Content:** App fetches the `reflection` for the current date and user's `selected_focus` from Supabase.
6.  **Journaling:** User saves a note. App writes to `journal_entries` table in Supabase.
7.  **Admin:** Admin logs into the React web admin panel, performs CRUD operations on the `reflections` table in Supabase.

## 4. MVP Scope Definition

**Included in MVP:**
*   iOS and Android app via Expo.
*   Onboarding flow (Value prop -> Select Focus).
*   Anonymous access to the first daily reflection.
*   User Authentication (Email/Password).
*   Daily Reflection View (Short reflection, application, question).
*   Simple Journaling (Text input saved to database).
*   Paywall UI.
*   RevenueCat integration for 14-day trial and monthly/yearly subscriptions.
*   Premium features unlock: Extended reflection text, History view of past journal entries.
*   Settings (Profile, Push notification toggle).
*   Basic Admin Panel (Web) to add/edit reflections.

**Excluded from MVP (As requested):**
*   Audio/Video.
*   Social/Community features.
*   Full Bible text integration.
*   AI Chatbots.
*   Gamification.
*   Multiple languages.
*   Complex animations.
