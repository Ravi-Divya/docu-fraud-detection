import os
import sys
import subprocess

# Ensure Pillow is installed
try:
    from PIL import Image, ImageDraw
except ImportError:
    print("Installing Pillow for local image generation...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw


def create_face():
    path = "datasets/faces/sample_face.jpg"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    # 300x300 blue face mockup
    img = Image.new("RGB", (300, 300), color=(240, 244, 255))
    draw = ImageDraw.Draw(img)
    # Draw head
    draw.ellipse([80, 60, 220, 200], fill=(59, 130, 246), outline=(29, 78, 216), width=3)
    # Draw eyes
    draw.ellipse([110, 100, 130, 120], fill=(255, 255, 255))
    draw.ellipse([170, 100, 190, 120], fill=(255, 255, 255))
    draw.ellipse([117, 107, 123, 113], fill=(0, 0, 0))
    draw.ellipse([177, 107, 183, 113], fill=(0, 0, 0))
    # Draw smile
    draw.arc([120, 130, 180, 170], start=0, end=180, fill=(255, 255, 255), width=3)
    # Draw label
    draw.rectangle([10, 250, 290, 285], fill=(29, 78, 216))
    draw.text((80, 260), "SAMPLE ID PHOTO", fill=(255, 255, 255))
    img.save(path)
    print(f"Generated {path}")

def create_signatures():
    real_path = "datasets/signatures/real/john_hancock.png"
    forged_path = "datasets/signatures/forged/barack_obama.png"
    os.makedirs(os.path.dirname(real_path), exist_ok=True)
    os.makedirs(os.path.dirname(forged_path), exist_ok=True)

    # 1. Genuine Signature (Clean, smooth blue lines)
    img_real = Image.new("RGBA", (400, 150), (255, 255, 255, 255))
    draw_real = ImageDraw.Draw(img_real)
    draw_real.line([(50, 80), (120, 40), (180, 110), (250, 60), (350, 90)], fill=(0, 50, 200), width=4)
    draw_real.line([(80, 110), (150, 120), (290, 100)], fill=(0, 50, 200), width=3)
    # Label
    draw_real.text((10, 10), "Genuine Reference Signature", fill=(100, 100, 100))
    img_real.save(real_path)
    print(f"Generated {real_path}")

    # 2. Forged Signature (Shaky, slightly different path)
    img_forged = Image.new("RGBA", (400, 150), (255, 255, 255, 255))
    draw_forged = ImageDraw.Draw(img_forged)
    draw_forged.line([(50, 85), (115, 55), (170, 115), (255, 50), (345, 95)], fill=(0, 0, 0), width=4)
    draw_forged.line([(90, 115), (160, 115), (280, 105)], fill=(0, 0, 0), width=3)
    # Label
    draw_forged.text((10, 10), "Forged Signature Attempt", fill=(100, 100, 100))
    img_forged.save(forged_path)
    print(f"Generated {forged_path}")

def create_documents():
    auth_path = "datasets/documents/authentic/us_constitution.jpg"
    tamp_path = "datasets/documents/tampered/declaration.jpg"
    os.makedirs(os.path.dirname(auth_path), exist_ok=True)
    os.makedirs(os.path.dirname(tamp_path), exist_ok=True)

    # 1. Authentic Document (Well-spaced, clean lines)
    img_auth = Image.new("RGB", (600, 800), color=(255, 255, 255))
    draw_auth = ImageDraw.Draw(img_auth)
    # Header
    draw_auth.rectangle([40, 40, 560, 100], fill=(240, 240, 240))
    draw_auth.text((180, 60), "MUTUAL NON-DISCLOSURE AGREEMENT", fill=(0, 0, 0))
    # Body text lines
    for idx, text in enumerate([
        "This Agreement is entered into on July 15, 2026.",
        "Between the Disclosing Party and the Receiving Party.",
        "1. Purpose: The parties wish to evaluate a business relationship.",
        "2. Confidential Info: Any info disclosed under this agreement.",
        "3. Standard of Care: The receiving party will use high security.",
        "4. Term: This agreement shall remain in effect for 3 years.",
        "Signed by: John Doe, Chief Executive Officer"
    ]):
        y = 150 + idx * 60
        draw_auth.text((60, y), text, fill=(50, 50, 50))
    img_auth.save(auth_path)
    print(f"Generated {auth_path}")

    # 2. Tampered Document (Anomalies in spacing and font colors to trigger alerts)
    img_tamp = Image.new("RGB", (600, 800), color=(255, 255, 255))
    draw_tamp = ImageDraw.Draw(img_tamp)
    # Header
    draw_tamp.rectangle([40, 40, 560, 100], fill=(240, 240, 240))
    draw_tamp.text((180, 60), "MUTUAL NON-DISCLOSURE AGREEMENT", fill=(0, 0, 0))
    # Body text lines with a distinct mismatch in line 4
    for idx, text in enumerate([
        "This Agreement is entered into on July 15, 2026.",
        "Between the Disclosing Party and the Receiving Party.",
        "1. Purpose: The parties wish to evaluate a business relationship.",
        "2. Confidential Info: PAYOUT AMOUNT IS $5,000,000 USD.",  # Tampered line
        "3. Standard of Care: The receiving party will use high security.",
        "4. Term: This agreement shall remain in effect for 3 years.",
        "Signed by: John Doe, Chief Executive Officer"
    ]):
        y = 150 + idx * 60
        if idx == 3:
            # Different offset (spacing anomaly) and visual style
            draw_tamp.text((95, y + 15), text, fill=(0, 0, 0))
        else:
            draw_tamp.text((60, y), text, fill=(50, 50, 50))
            
    # Add a visual "photoshop clone/blur" artifact box to trigger cloning checks
    draw_tamp.rectangle([300, 400, 450, 440], fill=(230, 230, 230), outline=(200, 200, 200))
    draw_tamp.rectangle([100, 400, 250, 440], fill=(230, 230, 230), outline=(200, 200, 200))
    
    img_tamp.save(tamp_path)
    print(f"Generated {tamp_path}")

if __name__ == "__main__":
    create_face()
    create_signatures()
    create_documents()
    print("\nLocal synthetic datasets successfully generated in /datasets/!")
