# AI-Automation-Builder 🚀

A production-ready, full-stack ai-workflow automation platform inspired by Zapier and n8n.

---

## One-line description
An open-source, drag-and-drop workflow automation SaaS featuring real-time background execution, complex variable mapping, multi-integration pipelines, and full monetization layers.

---

## Problem
Modern businesses require complex automation pipelines, but utilizing established enterprise choices like Zapier or n8n can lead to exploding costs due to rigid usage-based tiers, lack of native customization, or complex visual setups. Developers need a scalable, self-hostable, or highly transparent alternative that offers true drag-and-drop workflow builders, deep visual tracking, granular execution history, and seamless AI agent orchestrations without vendor lock-in.

---

## Features
* **Interactive Visual Canvas:** Highly responsive drag-and-drop builder powered by `React Flow` supporting grid snapping, visual status nodes, and dynamic canvas scaling.
* **Robust Background Orchestration:** Highly resilient background job queuing, retries, and step execution pipelines powered by `Inngest`.
* **Advanced Data Flow & Templating:** Native variable isolation context passing data seamlessly downstream between execution nodes (`node_data.variable_name`).
* **Multi-Integration Triggers:** Built-in webhooks, Google Form submissions, Stripe event listeners, and manual test triggers.
* **AI Integration Layer:** Native nodes for deep interactions with advanced LLMs including OpenAI, Anthropic (Claude), and Google Gemini with token-tracking cost monitors.
* **Messaging Extensions:** Instant operational dispatch setups for Discord and Slack notifications.
* **Security-First Credentials:** Fully encrypted credential management patterns to protect external user API tokens securely in transit and rest.
* **Complete SaaS Boilerplate:** Robust authentication setup via `Better Auth` and billing/subscription handling with `Polar` (free tiers, paywalls, and tiered metrics).
* **Full Observability:** Live workflow monitoring over websockets alongside integrated error tracking and session replays utilizing `Sentry`.

---

## Tech Stack
* **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide React, Shadcn/ui.
* **Canvas Mapping:** React Flow.
* **Backend & Server Actions:** Next.js Server Actions, tRPC, React Query (TanStack).
* **Database & ORM:** PostgreSQL (Neon Serverless), Prisma ORM.
* **Asynchronous Queuing Engine:** Inngest.
* **Authentication:** Better Auth (Credential, Google, & GitHub Providers).
* **Payments & Subscriptions:** Polar.
* **Error Monitoring:** Sentry (including LLM/AI Agent Cost Tracking).

---

## Architecture
ai-automation-builder is decoupled into three central logical layers: The UI Configuration Canvas, the Async Execution Engine, and the Real-time Event Monitor.
+------------------------------------------------------------+
|                  1. UI Configuration Layer                 |
|      (Next.js App / React Flow Canvas / tRPC Procedures)    |
+------------------------------------------------------------+
|
[Save / Manual Run]
|
v
+------------------------------------------------------------+
|                 2. Async Execution Layer                   |
|       (Inngest Background Workers / Topological Sorting)   |
+------------------------------------------------------------+
|
[Websocket Live Data]
|
v
+------------------------------------------------------------+
|                 3. Real-time Monitoring Layer              |
|        (Sentry / Event Listeners / Node Execution UI)       |
+------------------------------------------------------------+

1.  **Topological Node Execution:** When a workflow is kicked off, the backend runs a **topological sort** (`toposort`) over the defined canvas nodes to build a linear DAG (Directed Acyclic Graph) pipeline, ensuring sequential child-node steps execute only when dependent parents complete.
2.  **Context-State Passing:** Execution payloads are wrapped dynamically in isolation. If step 1 returns a nested object, step 2 parses it via string interpolation variables (`{{step1.output_key}}`) resolved before processing handlers trigger.

---

## Database Design
Below is the generalized ER structural model utilized by Prisma to map out workflow states, tracking runs, and multi-user access permissions.


* **User:** Manages core profiles, credentials, and OAuth tracking tokens.
* **Workflow:** Holds visual configurations (`nodes` JSON structures, canvas `edges`). Tied to single triggers.
* **Node:** Individual database records representing single building blocks inside a workflow graph. Contains target properties, authentication constraints, and configuration payloads.
* **Connection:** Maps parent-to-child boundaries (`source` to `target` mapping metrics).
* **Execution:** Captures unique run profiles, immutable snapshots, overall duration tracking, log variables, and output payload status strings.

---

## Screen Shots 
![Nodebase Canvas Builder UI](./screenshots/canvas.png)

---


## Installation

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


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

## Environement Setup

### App Environment
NEXT_PUBLIC_APP_URL="http://localhost:3000"

### Database Connections (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@neon-host/nodebase?sslmode=require"

### Better Auth Configuration
BETTER_AUTH_SECRET="your_better_auth_secret_here"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

### Encryption Keys (For user integration API credentials)
ENCRYPTION_KEY="your_secure_32_byte_hex_encryption_key"

### Background Job Queue Engine (Inngest)
INNGEST_EVENT_KEY="your_inngest_event_key"
INNGEST_SIGNING_KEY="your_inngest_signing_key"

### Subscription & Payments (Polar)
POLAR_ACCESS_TOKEN="your_polar_token"
NEXT_PUBLIC_POLAR_SUCCESS_URL="http://localhost:3000/billing/success"

### Observability & Monitoring
SENTRY_DSN="your_sentry_dsn_url"

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
