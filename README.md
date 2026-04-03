# Anchor Daily - Praktisk Kristen Daglig App

Anchor Daily er en produksjonsklar, freemium mobilapplikasjon bygget for iOS og Android. Den tilbyr praktiske, korte kristne refleksjoner skreddersydd for tre kjerneområder i livet: Stress & Angst, Vanskelige Beslutninger, og Relasjoner & Konflikt.

Dette prosjektet er fullstendig uavhengig og eksporterbart. Det bruker standard, moderne, åpen kildekode-teknologier og har ingen skjulte avhengigheter.

## Prosjektstruktur

Kildekoden er delt inn i tre hoveddeler:

1.  **`/mobile`**: Expo / React Native frontend-applikasjonen.
2.  **`/backend`**: Supabase databaseskjema, seed-data og Edge Functions.
3.  **`/admin`**: En frittstående React web-applikasjon for innholdshåndtering.

## Teknologistakk

*   **Mobilapp:** React Native, Expo (Managed Workflow), TypeScript, Zustand (State Management), React Navigation.
*   **Backend & Database:** Supabase (PostgreSQL, Auth, Edge Functions).
*   **In-App Kjøp:** RevenueCat.
*   **Admin-panel:** React, Vite, Tailwind CSS.

---

## 1. Backend-oppsett (Supabase)

Backend-en drives av Supabase. Du kan bruke den hostede Supabase Cloud (anbefalt for produksjon) eller kjøre den lokalt via Docker.

### Alternativ A: Supabase Cloud (Anbefalt)

1.  Opprett et nytt prosjekt hos [Supabase](https://supabase.com).
2.  Gå til **SQL Editor** i Supabase-dashbordet ditt.
3.  Kopier innholdet fra `/backend/supabase/migrations/001_initial_schema.sql` og kjør det for å opprette tabellene og sikkerhetspolicyene (RLS).
4.  Kopier innholdet fra `/backend/supabase/seed.sql` og kjør det for å fylle databasen med de første 21 dagene med innhold.
5.  Gå til **Project Settings -> API** og kopier din `Project URL` og `anon public` nøkkel. Du trenger disse for mobilappen.
6.  Kopier `service_role` nøkkelen. Du trenger denne for Admin-panelet og Edge Functions.

### Alternativ B: Lokal Utvikling

Hvis du har Supabase CLI installert:
```bash
cd backend/supabase
supabase start
supabase db reset
```

### Deployering av Edge Functions

Prosjektet inkluderer to Edge Functions: én for RevenueCat webhooks og én for daglige push-varsler.

1.  Installer Supabase CLI.
2.  Logg inn: `supabase login`
3.  Koble til prosjektet ditt: `supabase link --project-ref DIN_PROSJEKT_ID`
4.  Deploy funksjonene:
    ```bash
    supabase functions deploy revenuecat-webhook
    supabase functions deploy send-daily-push
    ```
5.  Sett hemmeligheter (secrets) for funksjonene:
    ```bash
    supabase secrets set REVENUECAT_WEBHOOK_SECRET=din_hemmelighet_fra_revenuecat
    ```

---

## 2. Mobilapp-oppsett

Mobilappen er bygget med Expo.

### Forutsetninger
*   Node.js (v18+)
*   npm eller yarn
*   Expo Go-appen på din fysiske enhet (eller iOS Simulator / Android Emulator)

### Installasjon

1.  Naviger til mobil-mappen:
    ```bash
    cd mobile
    ```
2.  Installer avhengigheter:
    ```bash
    npm install
    ```
3.  Konfigurer miljøvariabler:
    *   Kopier `.env.example` til `.env`.
    *   Oppdater `SUPABASE_URL` og `SUPABASE_ANON_KEY` med dine opplysninger fra trinn 1.
    *   Oppdater RevenueCat API-nøklene (se seksjon 4).
    *   *Merk: For Expo kan det hende du også må hardkode disse i `src/services/supabase.ts` og `src/services/purchases.ts` under lokal utvikling hvis du ikke bruker `expo-env`.*

### Kjøre appen

Start Expo utviklingsserveren:
```bash
npm start
```
Skann QR-koden med telefonens kamera (iOS) eller Expo Go-appen (Android).

### Bygge for App Store / Google Play

Prosjektet er konfigurert for EAS (Expo Application Services) Build.

1.  Installer EAS CLI: `npm install -g eas-cli`
2.  Logg inn: `eas login`
3.  Konfigurer prosjektet ditt: `eas build:configure`
4.  Oppdater `eas.json` med din Apple Team ID og Android package-detaljer.
5.  Bygg for iOS: `eas build --platform ios`
6.  Bygg for Android: `eas build --platform android`

---

## 3. Admin-panel Oppsett

Admin-panelet er en frittstående React-applikasjon som brukes til å legge til, redigere og publisere daglige refleksjoner, samt se brukeroversikt.

### Installasjon

1.  Naviger til admin-mappen:
    ```bash
    cd admin
    ```
2.  Installer avhengigheter:
    ```bash
    npm install
    ```
3.  Konfigurer miljøvariabler:
    *   Kopier `.env.example` til `.env`.
    *   Sett `VITE_SUPABASE_URL` til din Supabase prosjekt-URL.
    *   Sett `VITE_SUPABASE_SERVICE_KEY` til din Supabase **service_role** nøkkel. *(Advarsel: Eksponer aldri denne nøkkelen i en offentlig app. Admin-panelet bør hostes sikkert).*
    *   Sett `VITE_ADMIN_PASSWORD` til et sikkert passord.

### Kjøre Admin-panelet

Start Vite utviklingsserveren:
```bash
npm run dev
```
Admin-panelet vil være tilgjengelig på `http://localhost:3001`.

### Deployering av Admin-panelet

Du kan deployere admin-panelet til Vercel, Netlify, eller en hvilken som helst statisk hosting-leverandør.
```bash
npm run build
```
Deployer `dist`-mappen. Sørg for at miljøvariablene dine er satt i hosting-leverandørens dashbord.

---

## 4. RevenueCat Oppsett (Abonnementer)

For å håndtere den 14-dagers gratis prøveperioden og premium-abonnementer, må du konfigurere RevenueCat.

1.  Opprett en konto hos [RevenueCat](https://www.revenuecat.com/).
2.  Opprett et nytt prosjekt (Project).
3.  Legg til en iOS App og en Android App i prosjektet.
4.  Opprett en **Entitlement** kalt `premium`.
5.  Opprett en **Offering** (f.eks. `default`).
6.  Opprett to **Packages** innenfor den offeringen: `Monthly` og `Annual`.
7.  Koble disse pakkene til de faktiske abonnementsproduktene du oppretter i App Store Connect og Google Play Console. Sørg for at produktene i butikkene er konfigurert med en 14-dagers gratis prøveperiode.
8.  Kopier Public API Keys for iOS og Android inn i mobilappens miljøvariabler.
9.  **Webhook:** I RevenueCat, gå til Project Settings -> Webhooks. Legg til en ny webhook som peker til din Supabase Edge Function URL: `https://DIN_PROSJEKT_URL.supabase.co/functions/v1/revenuecat-webhook`.

---

## 5. Push-varsler

Push-varsler håndteres via Expos Push API og en Supabase Edge Function.

1.  Mobilappen ber automatisk om tillatelse og lagrer brukerens Expo Push Token i `users`-tabellen i Supabase.
2.  `send-daily-push` Edge Function spør databasen etter alle brukere med `push_enabled = true` og sender dem et varsel.
3.  For å automatisere dette, må du sette opp en Cron Job. Hvis du er på en betalt Supabase-plan, kan du bruke `pg_cron` (se `backend/supabase/migrations/002_cron_setup.sql`). Alternativt kan du bruke en ekstern tjeneste som GitHub Actions eller cron-job.org for å gjøre en daglig HTTP POST-forespørsel til Edge Function URL-en.

---

## Inkluderte Leveranser

*   Komplett React Native (Expo) mobilapp kildekode.
*   Komplett React (Vite) admin-panel kildekode.
*   PostgreSQL databaseskjema og RLS-policyer.
*   21 dager med initiell kuratert innhold (seed data).
*   Supabase Edge Functions for webhooks og varsler.
*   App Store / Google Play beskrivelser og navneforslag (se `copy_and_content.md`).
*   Arkitekturdokumentasjon (se `architecture.md`).
