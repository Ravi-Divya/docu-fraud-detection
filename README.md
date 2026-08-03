# DocuGuard – AI Forensic Document Fraud Detection

AI-powered document authentication platform. Upload a document, photo, or
signature — DocuGuard runs OCR forensics, pixel analysis, and AI review to
detect forged documents, tampered signatures, and manipulated photos.

## How It Works (Current Flow)

```
Upload / Capture → OCR Extraction → Forensics Analysis → AI Review (Groq) → Report + PDF Download
```

1. **Choose a module** in the Scanner (login required):
   - **Document Scanner** – upload an image (PNG/JPG/WebP), PDF, or DOCX — or
     scan live with your webcam, or try a bundled sample document.
   - **Photo Match** – upload an ID photo and take a live webcam capture to
     verify the identity matches.
   - **Signature Check** – upload a signature image to detect forgeries.
   - **Hardware Stream** – live simulated feed of printers/scanners with
     per-device reports.

2. **OCR Extraction** – Tesseract.js runs in the browser. Images are
   preprocessed first (upscaled, grayscale, contrast-boosted) to suppress
   watermarks and background noise for cleaner text.

3. **Forensics Analysis** – text characteristics (font/spacing anomalies),
   plus **real pixel-level forensics** on the decoded image:
   - **Sharpness** (Laplacian variance) – detects blur/smoothing from retouching
   - **JPEG blocking artifacts** – detects double re-compression on the 8×8 grid
   - **Copy-move clone detection** – identical structured block runs and diagonal
     duplicates reveal pasted content
   - **Region energy inconsistency** – detects spliced/composited areas
   These produce an **Authenticity Score (0–100)** and risk level.

4. **Photo Match (real face recognition)** – `face-api.js` (TensorFlow.js) runs
   entirely in the browser: SSD MobileNet face detection + 128-d face embedding.
   A match requires descriptor distance < 0.6, and the live capture is checked
   for sharpness before comparison.

5. **Signature Check (real stroke analysis)** – the signature is binarized
   (Otsu threshold) and analyzed for ink coverage, stroke-width consistency,
   pen-pressure variance, smoothness, and connected components — hesitation
   and irregular pressure are classic forgery indicators.

6. **AI Review (optional)** – extracted text (max 8,000 chars) is sent to
   `/api/analyze`, which calls Groq (llama-3.3-70b) for an AI verdict. Without
   a key, local heuristics still work.

7. **Forensic Report** – on-screen report shows:
   - **Basic Information** – real file name, type, size, upload date, page count
   - **AI Detection Results** – 8 checks with status and confidence derived
     from the measured authenticity score
   - **AI Prediction** – verdict explanation
   - **AI Recommendation** – risk-graded action items
   - **Download PDF Report** – a client-generated PDF containing the full report
     (available in all four modules).

## Pages

| Route      | Purpose |
|------------|---------|
| `/`        | Landing page (hero + stats) |
| `/signup`, `/login` | Demo auth (SHA-256 hashed, stored in localStorage) |
| `/scanner` | The four verification modules (login required) |
| `/about`, `/pricing`, `/contact` | Static info pages |

## Project Structure (single root for Render)

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   └── api/analyze/     # Server-side Groq AI analysis (rate-limited)
│   ├── components/          # navbar, ocr-upload, ocr-result, forensics-display,
│   │                        # photo-match, signature-check, live-stream, ...
│   └── lib/
│       ├── ocr-processor.ts      # Tesseract/PDF.js/Mammoth extraction + preprocessing
│       ├── forensics-analyzer.ts # pixel forensics (sharpness, JPEG, clone, splicing)
│       ├── face-verify.ts        # face-api.js detection + embedding comparison
│       ├── signature-verify.ts   # stroke-level signature analysis (Otsu, width, pressure)
│       ├── forensics-report-content.ts # shared report rows/prediction/recommendation
│       ├── pdf-report.ts         # client-side PDF report generator
│       └── auth.ts               # demo auth helpers
├── public/
│   ├── models/              # face-api.js TFJS models (detector, landmark, recognition)
│   ├── samples/             # in-app demo files (contracts, signatures)
│   └── icon.svg             # favicon + navbar logo
├── datasets/                # sample datasets (separate folder, not app code)
├── scripts/                 # dataset download/generation scripts
├── render.yaml              # Render Blueprint (deployment config)
└── package.json             # single package at the repo root
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

In **Scanner → Document Scanner → Try a Sample Document**, run the pipeline
against pre-bundled authentic/tampered samples — no upload needed.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | No* | Enables live AI forensic analysis |
| `GROQ_MODEL` | No | Defaults to `llama-3.3-70b-versatile` |

\* Without a key the app still works: OCR + local forensics run fully, and the
report shows a note that AI review is unavailable.

## Fraud Score Interpretation

The platform reports an **Authenticity Score (0–100)** — higher is more genuine:

| Score | Status | Meaning |
|-------|--------|---------|
| 70–100 | 🟢 GENUINE | Passed all forensic checks |
| 45–69 | 🟡 SUSPICIOUS | Manipulation signs found — manual review recommended |
| 0–44 | 🔴 FAKE | Multiple tampering indicators detected |

> The score is **measured, not simulated**: it is computed from the actual OCR
> confidence, pixel forensics metrics, face-embedding distance, and stroke
> analysis results for each upload. Sample verification (bundled samples):
> `authentic_contract.jpg` → 78 Genuine, `tampered_contract.jpg` → 46 Suspicious
> (copy-move cloning detected), `signature_real.png` → Genuine,
> `signature_forged.png` → Suspicious.

## Security Notes

- Documents are processed **locally in the browser** — raw files are never
  uploaded to a server.
- Only extracted text (max 8,000 chars) is sent to the AI provider, with
  prompt-injection hardening and per-IP rate limiting on the API route.
- Camera streams stop automatically when you leave a module.
- Passwords are SHA-256 hashed before being stored in `localStorage` (demo
  auth; not a production-grade identity system).
- Security headers (X-Frame-Options, nosniff, Referrer-Policy) are set globally.

## Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Tesseract.js · PDF.js ·
Mammoth (DOCX) · face-api.js (TensorFlow.js) · Groq (AI analysis)


