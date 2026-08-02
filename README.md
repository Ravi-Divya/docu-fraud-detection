# DocuGuard – AI Forensic Document Fraud Detection

Advanced AI-powered document authentication platform. Detect forged documents,
tampered signatures, and manipulated photos with OCR forensics, biometric photo
matching, and hardware stream monitoring.

![Stack](https://img.shields.io/badge/Next.js%2016-React%2019-TypeScript-blue)
![Deploy](https://img.shields.io/badge/Deploy-Render%20Ready-green)

## Features

- **Document Fraud Scanner** — OCR extraction (Tesseract.js), pixel forensics,
  metadata checks, and AI review for tampering, font inconsistencies, cloning,
  and compression artifacts.
- **Photo Match** — live webcam capture vs. uploaded ID photo with biometric
  similarity and deepfake indicators.
- **Signature Verification** — stroke consistency, pen pressure, writing speed,
  and shape-similarity checks for bank employee workflows.
- **Hardware Stream Monitor** — live printer/scanner endpoint monitoring for
  malware and firmware compromise.
- **AI Forensic Reports** — 0–100 authenticity score with risk level and
  recommendations (powered by Groq when an API key is configured).

## Project Structure (single root for Render)

```
├── src/                  # All application source
│   ├── app/              # Next.js App Router (pages + /api/analyze route)
│   ├── components/       # UI components (navbar, scanner, reports...)
│   └── lib/              # OCR processor, forensics engine, auth helpers
├── datasets/             # Sample datasets (separate folder, not app code)
├── public/               # Static assets + /samples for in-app demo files
├── scripts/              # Dataset download/generation scripts
├── render.yaml           # Render Blueprint (deployment config)
└── package.json          # Single package at the repo root
```

## Local Development

```bash
# 1. Install dependencies (Node 22+ required)
npm install

# 2. Configure environment
cp .env.example .env.local
#    -> add your GROQ_API_KEY (optional, enables live AI analysis)

# 3. Start the dev server
npm run dev
# -> http://localhost:3000
```

### Test with sample documents

Open **Scanner → Document Scanner → Try a Sample Document** to run the pipeline
against pre-bundled authentic/tampered samples — no upload needed.

## Deploying to Render

### Option A — Render Blueprint (recommended)

1. Push this repository to GitHub.
2. In Render: **New → Blueprint**, and select the repo.
3. Render reads `render.yaml` and creates the web service automatically.
4. In the service **Environment** tab, set `GROQ_API_KEY` (get one free at
   https://console.groq.com/keys).
5. Deploy and open the live URL.

### Option B — Manual web service

| Setting | Value |
|---------|-------|
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Node version | **22** (required by Next.js 16 / pdfjs-dist) |
| Health check | `/` |

Add `GROQ_API_KEY` as an environment variable. Render's free tier works fine —
all heavy processing (OCR, forensics) runs in the browser; the server only
handles AI text review.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | No* | Enables live AI forensic analysis (https://console.groq.com/keys) |
| `GROQ_MODEL` | No | Defaults to `llama-3.3-70b-versatile` |

\* Without a key the app still works: OCR + local forensics run fully, and the
report shows a note that AI review is unavailable.

## Fraud Score Interpretation

The platform reports an **Authenticity Score (0–100)** — higher is more genuine:

| Score | Status | Meaning |
|-------|--------|---------|
| 70–100 | 🟢 GENUINE | Passed all forensic checks |
| 30–70 | 🟡 SUSPICIOUS | Manipulation signs found — manual review recommended |
| 0–30 | 🔴 FAKE | Multiple tampering indicators detected |

## Security Notes

- Documents are processed **locally in the browser** — raw files are never
  uploaded to a server.
- Only extracted text (max 8,000 chars) is sent to the AI provider, with
  prompt-injection hardening and per-IP rate limiting on the API route.
- Passwords are SHA-256 hashed before being stored in `localStorage` (demo
  auth; not a production-grade identity system).
- Security headers (X-Frame-Options, nosniff, Referrer-Policy) are set globally.

## Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Tesseract.js · PDF.js ·
Mammoth (DOCX) · Groq (AI analysis) · shadcn/ui

## License

© 2026 DocuGuard. Developed by Ravi Divya. For demonstration and evaluation purposes.
