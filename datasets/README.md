# DocuGuard Sample Datasets

This folder contains the sample datasets used by DocuGuard for testing and demoing the
forensic modules. It is intentionally kept **separate** from the app source code
(`src/`), and sample files are mirrored into `public/samples/` so the web app can load
them with the "Try a Sample Document" buttons in the Document Scanner.

## Layout

```
datasets/
├── faces/            # ID photo samples for the Photo Match module
│   └── sample_face.jpg
├── signatures/       # Signature samples for Signature Verification
│   ├── real/         #   genuine reference signatures
│   │   └── john_hancock.png
│   └── forged/       #   forged / mismatched samples
│       └── barack_obama.png
└── documents/        # Full-page document samples for OCR forensics
    ├── authentic/    #   clean, untouched scans
    │   └── us_constitution.jpg
    └── tampered/     #   tampered/edited mockups
        └── declaration.jpg
```

## Downloading / regenerating the samples

```bash
# Regenerate synthetic sample images locally (no internet required)
python scripts/create_samples.py

# Download real-world sample images (Wikimedia Commons, etc.)
python scripts/download_samples.py

# (Optional) Download the full public research datasets
python scripts/download_datasets.py
```

## Production / training datasets (require manual download)

For training or deeper evaluation, the standard public research datasets need manual
downloads (most require a free Kaggle account):

| Purpose | Dataset | URL |
|---------|---------|-----|
| Signature forgery | CEDAR & BHSig260 (handwritten signatures) | https://www.kaggle.com/datasets/divyanshrai/handwritten-signatures |
| Document tampering | CASIA (spliced/copy-move tampering) | https://www.kaggle.com/datasets/sophatvathana/casia-dataset |
| Face matching | LFW (Labeled Faces in the Wild) | https://vis-www.cs.umass.edu/lfw/ |

Place the extracted archives into the matching subfolder above, e.g.
`datasets/signatures/real/` and `datasets/signatures/forged/`.

> Note: the application itself does **not** read from `datasets/` at runtime —
> the scanner works on whatever file you upload. This folder is for research,
> offline testing, and the in-app sample buttons (which read from
> `public/samples/`).
