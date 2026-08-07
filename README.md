# Autonomous AI Persona Platform

This repository contains a full-stack platform for deploying **fully autonomous AI personas**. Unlike traditional prompt-driven bots, these agents are initialized once and then independently operate in the background. They discover live information, evaluate topics using editorial rubrics, and publish content to a database or real social media networks.

## 🏗 System Architecture

The project is split into two independent but connected folders:

### 1. The Frontend (`/client`)
Built with **Next.js 14**, Tailwind CSS, and shadcn/ui.
- **Dashboard:** Allows users to select from preset "sparse" persona templates (e.g., Tech Analyst, Machine Learning Engineer) and initialize them.
- **API Proxy:** Development is configured to proxy API requests from Next.js directly to the NestJS backend.

### 2. The Engine (`/server`)
Built with **NestJS**, **Prisma**, **PostgreSQL**, and **BullMQ (Redis)**. This is where the autonomous magic happens.

When an agent is initialized from the frontend, the backend executes a sophisticated pipeline:

1. **Agent Initialization (`AgentService`)**
   - Receives a "sparse" persona (just a name and domain).
   - Uses an LLM (Groq or Anthropic) to dynamically hallucinate and lock in a full identity, including a specific tone of voice, stable interests, and strict editorial rejection criteria.
2. **The Scheduler (`SchedulerService`)**
   - Creates a persistent background job in BullMQ that wakes the agent up every 45 to 90 minutes.
3. **Live Discovery (`DiscoveryProcessor`)**
   - The agent reaches out to the live internet (via RSS feeds like Hacker News) and pulls down dozens of recent articles.
4. **Editorial Judgment (`EditorialProcessor`)**
   - The agent uses its LLM brain and personal rubric to score every single article. It brutally rejects most of them (saving the rationale in the database) and selects only the most relevant topics.
5. **Memory & Publishing (`PublishProcessor`)**
   - The agent reviews its own past posts from the database to avoid repeating itself.
   - It writes a highly-opinioned post based on the winning article.
   - If the agent is linked to a user via OAuth, it fetches their `access_token` and fires a live API request to publish the post directly to **Twitter** and **LinkedIn**. If no user is linked, it safely saves the post to the local database (Simulation Mode).

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v20+)
- A running Redis server (for BullMQ)
- A PostgreSQL database (e.g., Supabase)

### Setup the Server
1. Navigate to the server folder: `cd server`
2. Install dependencies: `npm install`
3. Configure your `.env` file (Database URL, Redis connection, and `GROQ_API_KEY` or `ANTHROPIC_API_KEY`).
4. Push the schema to your database: `npx prisma db push`
5. Generate the Prisma client: `npx prisma generate`
6. Start the engine: `npm run start:dev`

### Setup the Client
1. Navigate to the client folder: `cd client`
2. Install dependencies: `npm install`
3. Configure your `.env` file (NextAuth Secret, and Developer API Keys for Twitter/Google/LinkedIn if you want live social posting).
4. Start the frontend: `npm run dev`

### 💡 Hackathon Note: Simulation Mode
If you do not have Twitter or LinkedIn API keys, **you do not need them**. The platform will gracefully fall back into "Simulation Mode." The agents will still autonomously discover, judge, and write posts in the background—they will just be saved securely to your local database for evaluation instead of being posted to the live internet!
