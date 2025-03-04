# OVHL - Online Virtual Hockey League

## Redis Setup for Bidding System

The bidding system uses Redis for real-time bidding data. You have two options for setting up Redis:

### Option 1: Local Redis Installation

1. **Install Redis** on your local machine:

   - Mac: `brew install redis` and start with `brew services start redis`
   - Windows: Use [Windows Subsystem for Linux](https://redis.io/docs/getting-started/installation/install-redis-on-windows/) or [Memurai](https://www.memurai.com/)
   - Linux: `sudo apt-get install redis-server` and start with `sudo service redis-server start`

2. **Verify Installation**: Run `redis-cli ping` and you should receive `PONG`

3. **Update Environment**: Make sure `.env.local` contains:
   ```
   REDIS_URL="redis://localhost:6379"
   ```

### Option 2: Cloud Redis (Upstash)

1. Create a free Redis database at [Upstash](https://upstash.com/)
2. After creating the database, copy the REDIS_URL from your dashboard
3. Update `.env.local` with your Upstash URL:
   ```
   REDIS_URL="your-upstash-redis-url"
   ```

## Bidding System Features

- Sequential league bidding (NHL → AHL → ECHL → CHL)
- Each bidding period lasts 2 days
- Bid timers reset to 6 hours when below 6 hours remaining
- Team manager restrictions for placing bids
- Automatic progression between leagues

## Running the Scheduler

For automatic bid expiration and league transitions, set up a cron job to call:

```bash
curl -X GET "https://your-domain.com/api/bidding/scheduler?key=your-scheduler-api-key"
```

Use a service like [Upstash QStash](https://upstash.com/docs/qstash) or [GitHub Actions](https://docs.github.com/en/actions) to run this every few minutes.

## Development

```bash
npm run dev
# or
yarn dev
```

# Default Next.js README

Full README coming later.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
