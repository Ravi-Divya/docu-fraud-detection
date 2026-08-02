import os
import urllib.request

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

def download_file(url, target_path):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    print(f"Downloading {url}")
    print(f"       -> {target_path}")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=60) as response:
            with open(target_path, "wb") as out_file:
                out_file.write(response.read())
        print(f"  OK ({os.path.getsize(target_path)} bytes)")
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False

def download_with_fallbacks(urls, target_path):
    for url in urls:
        if download_file(url, target_path):
            return True
    return False

if __name__ == "__main__":
    print("Downloading sample files for testing DocuGuard...\n")

    results = []

    # 1. Sample face (multiple mirrors)
    results.append((
        "faces/sample_face.jpg",
        download_with_fallbacks([
            "https://raw.githubusercontent.com/opencv/opencv/master/samples/data/lena.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/8/85/John_Lasseter_by_Gage_Skidmore.jpg",
        ], "datasets/faces/sample_face.jpg"),
    ))

    # 2. Sample signatures (genuine & forged)
    results.append((
        "signatures/real/john_hancock.png",
        download_with_fallbacks([
            "https://upload.wikimedia.org/wikipedia/commons/3/3a/John_Hancock_signature.png",
        ], "datasets/signatures/real/john_hancock.png"),
    ))
    results.append((
        "signatures/forged/barack_obama.png",
        download_with_fallbacks([
            "https://upload.wikimedia.org/wikipedia/commons/d/dd/Signature_of_Barack_Obama.png",
        ], "datasets/signatures/forged/barack_obama.png"),
    ))

    # 3. Sample documents (authentic & tampered mockup)
    results.append((
        "documents/authentic/us_constitution.jpg",
        download_with_fallbacks([
            "https://upload.wikimedia.org/wikipedia/commons/a/a9/US_Constitution_Pg1of4_ACLU.jpg",
        ], "datasets/documents/authentic/us_constitution.jpg"),
    ))
    results.append((
        "documents/tampered/declaration.jpg",
        download_with_fallbacks([
            "https://upload.wikimedia.org/wikipedia/commons/b/b5/Declaration_of_Independence_Pg1of1_ACLU.jpg",
        ], "datasets/documents/tampered/declaration.jpg"),
    ))

    print("\n" + "=" * 60)
    ok = sum(1 for _, success in results if success)
    print(f"Downloaded {ok}/{len(results)} sample files.")
    for name, success in results:
        print(f"  [{'OK' if success else 'MISSING'}] {name}")
    print("=" * 60)
    if ok < len(results):
        print("\nSome downloads failed (many image hosts rate-limit bots).")
        print("Run  python scripts/create_samples.py  to generate local synthetic samples instead.")
