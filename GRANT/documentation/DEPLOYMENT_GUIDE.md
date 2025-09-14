# Eventara - Iraq Events Platform Deployment Guide

This document provides a comprehensive guide to setting up, configuring, and deploying the Eventara application.

## Tech Stack

-   **Frontend**: React, TypeScript, Vite, Tailwind CSS
-   **Backend**: Supabase (PostgreSQL, Auth, Storage)
-   **AI Features**: Google Gemini API

## Prerequisites

Before you begin, ensure you have the following installed and configured:

1.  **Node.js**: Version 18.x or later.
2.  **npm** (or yarn/pnpm).
3.  **Supabase Account**: A free account at [supabase.com](https://supabase.com).
4.  **Supabase CLI**: Required for local development and database migrations. Installation instructions can be found [here](https://supabase.com/docs/guides/cli).
5.  **Google AI Studio Account**: To get a Gemini API Key for AI features. Get one at [aistudio.google.com](https://aistudio.google.com).

---

## 1. Local Setup

### 1.1. Install Dependencies

Navigate to the project's root directory (`GRANT/`) and install the required npm packages:

```bash
npm install
```

### 1.2. Configure Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and fill in the values:

-   `VITE_SUPABASE_URL`: Found in your Supabase project's "Settings" > "API".
-   `VITE_SUPABASE_ANON_KEY`: Found in your Supabase project's "Settings" > "API". This is the public, anonymous key.
-   `VITE_GEMINI_API_KEY`: Your API key from Google AI Studio.

**Note**: Vite requires the `VITE_` prefix for environment variables to be exposed to the frontend client.

---

## 2. Supabase Backend Setup

### 2.1. Create a Supabase Project

1.  Go to [supabase.com](https://supabase.com) and create a new project.
2.  Save the Project URL and `anon` key, as you will need them for the `.env` file.

### 2.2. Apply the Database Schema

This project includes a complete initial database schema. You can apply it to your new Supabase project using the Supabase CLI.

First, link your local project to your remote Supabase project (replace `[PROJECT_ID]` with your actual project ID from the Supabase dashboard URL):

```bash
npx supabase link --project-ref [PROJECT_ID]
```

Next, push the schema from the `database/migrations` directory to your remote database. This will create all the necessary tables, policies, and functions.

```bash
npx supabase db push
```

This command will execute the SQL script located at `database/migrations/0000_initial_schema.sql`, setting up your database correctly.

---

## 3. Running the Application

### 3.1. Development Server

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` by default.

### 3.2. Production Build

To build the application for production, run:

```bash
npm run build
```

This command creates a `dist` directory at the project root with optimized, static assets ready for deployment.

---

## 4. Deployment

You can deploy the contents of the `dist` folder to any static hosting provider like Vercel, Netlify, or AWS S3.

1.  **Build the project**: `npm run build`.
2.  **Deploy**: Upload the contents of the `dist` directory to your chosen hosting service.
3.  **Environment Variables**: Ensure you configure the same environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`) in your hosting provider's project settings.

---

## 5. Configuring OAuth Providers (Required for Social Login)

To enable Google and Facebook login, you must configure them in your Supabase project dashboard.

### 5.1. General Steps

1.  Navigate to your Supabase Project.
2.  Go to "Authentication" -> "Providers".
3.  You will see a list of available providers.

For both Google and Facebook, you will need to get a **Client ID** and a **Client Secret** from their respective developer consoles. You will also need the **Redirect URI** provided by Supabase for your project.

### 5.2. Google Login

1.  Enable the **Google** provider in Supabase.
2.  Copy the **Redirect URI** shown in the configuration panel.
3.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
4.  Create a new project or select an existing one.
5.  Go to "APIs & Services" > "Credentials".
6.  Click "Create Credentials" > "OAuth client ID".
7.  Select "Web application".
8.  Add the Supabase **Redirect URI** to the "Authorized redirect URIs".
9.  Click "Create". You will get a **Client ID** and **Client Secret**.
10. Copy these back into the Google provider settings in Supabase and save.

### 5.3. Facebook Login

1.  Enable the **Facebook** provider in Supabase.
2.  Copy the **Redirect URI** shown in the configuration panel.
3.  Go to the [Meta for Developers](https://developers.facebook.com/) portal.
4.  Create a new App (or use an existing one) of type "Consumer".
5.  In your app dashboard, find "Facebook Login" and click "Set up".
6.  Go to "Facebook Login" > "Settings" from the side menu.
7.  Add the Supabase **Redirect URI** to the "Valid OAuth Redirect URIs".
8.  Go to "App Settings" > "Basic".
9.  You will find your **App ID** (Client ID) and **App Secret** (Client Secret).
10. Copy these back into the Facebook provider settings in Supabase and save.
