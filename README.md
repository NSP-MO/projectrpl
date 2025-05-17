# BenihKu 🌱


Benihku merupakan website yang diperuntukan untuk membantu para penjual dan pembeli tanaman atau benih dalam mendapatkan informasi yang terkait mengenai tanaman, baik dapat membantu dalam penjualan produk sampai membantu pembeli dalam memilih dan mencari informasi tanaman yang mereka harapkan.

Website BenihKu ini merupakan website yang berbasis next-typescript dengan Supabase database yang bersifat serverless.

## Features

* Authentication (sign-up, sign-in)
* CRUD operations on tasks or items
* Real-time updates via Supabase Realtime
* Server-side rendering and API routes
* Easy local development with remote Supabase
 

## Go to the page!
Project dapat diakses pada link berikut: **[https://www.projectrpl.site/](https://www.projectrpl.site/)**


# How to run locally

1. Clone this repository

   ```bash
   git clone https://github.com/NSP-MO/projectrpl.git
   cd projectrpl
   ```

2. Create a `.env.local` file in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   # Optional (server-side only):
   SUPABASE_SERVICE_KEY=<your-service-role-key>
   ```

3. Install dependencies

   ```bash
   pnpm install
   ```

4. Run the development server

   ```bash
   pnpm dev
   ```

5. Open the website in your browser at [http://localhost:3000](http://localhost:3000)


## Prerequisites

* Node.js v14+ or later
* pnpm, npm, or yarn
* A Supabase project with:

  * Anonymouse public API key
  * Service role key (for server-side operations)


## Environment Variables

| Key                               | Description                                         |
| --------------------------------- | --------------------------------------------------- |
| NEXT\_PUBLIC\_SUPABASE\_URL       | Your Supabase project URL                           |
| NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY | Your Supabase anonymous public API key              |
| SUPABASE\_SERVICE\_KEY            | (Optional) Supabase service role key for server use |

## Scripts

* `pnpm dev` — Run in development mode
* `pnpm build` — Build for production
* `pnpm start` — Start the production server


## Build your app

Continue building the app on:

**[https://v0.dev/chat/fork-of-e-commerce-tanaman-website-syeAQk0zVQk](https://v0.dev/chat/fork-of-e-commerce-tanaman-website-syeAQk0zVQk)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
