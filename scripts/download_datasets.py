import os
import urllib.request
import tarfile
import zipfile

def download_and_extract(url, target_dir, filename):
    os.makedirs(target_dir, exist_ok=True)
    filepath = os.path.join(target_dir, filename)
    print(f"Downloading {filename} from {url}...")
    try:
        urllib.request.urlretrieve(url, filepath)
        print(f"Successfully downloaded {filename}.")
        
        if filepath.endswith(".tgz") or filepath.endswith(".tar.gz"):
            print(f"Extracting {filename}...")
            with tarfile.open(filepath, "r:gz") as tar:
                tar.extractall(path=target_dir)
            print(f"Extracted {filename}.")
        elif filepath.endswith(".zip"):
            print(f"Extracting {filename}...")
            with zipfile.ZipFile(filepath, 'r') as zip_ref:
                zip_ref.extractall(target_dir)
            print(f"Extracted {filename}.")
    except Exception as e:
        print(f"Failed to download/extract {filename}: {e}")

if __name__ == "__main__":
    print("Initializing dataset downloads for DocuGuard...")
    
    # 1. Face Match Dataset: Labeled Faces in the Wild (LFW) - Sample subset (only names starting with 'a')
    # This is standard for facial recognition models.
    download_and_extract("http://vis-www.cs.umass.edu/lfw/lfw-a.tgz", "datasets/faces", "lfw-a.tgz")
    
    # 2. Note on Signature and Document Forgery Datasets:
    # High-quality datasets like CEDAR (Signatures) or CASIA (Document Tampering) 
    # require Kaggle authentication or academic request forms to download.
    print("\n" + "="*60)
    print("IMPORTANT: FULL DATASETS REQUIRE AUTHENTICATION")
    print("="*60)
    print("For full Signature Verification and Document Tampering training data,")
    print("you will need to download them manually from Kaggle (free account required):")
    print("\n1. Signature Forgery (CEDAR & BHSig260):")
    print("   https://www.kaggle.com/datasets/divyanshrai/handwritten-signatures")
    print("\n2. Document Tampering / Forgery:")
    print("   https://www.kaggle.com/datasets/sophatvathana/casia-dataset")
    print("="*60 + "\n")
    
    # Create empty directories for them
    os.makedirs("datasets/signatures/real", exist_ok=True)
    os.makedirs("datasets/signatures/forged", exist_ok=True)
    os.makedirs("datasets/documents/tampered", exist_ok=True)
    os.makedirs("datasets/documents/authentic", exist_ok=True)
    
    with open("datasets/README.md", "w") as f:
        f.write("# DocuGuard Datasets\n\n")
        f.write("Place your downloaded Kaggle datasets here.\n")
        f.write("- `/faces`: Contains LFW (Labeled Faces in the Wild) sample for Photo Match.\n")
        f.write("- `/signatures`: Place CEDAR signature dataset here (real vs forged).\n")
        f.write("- `/documents`: Place CASIA document tampering dataset here.\n")
    
    print("Created directory structure and README in /datasets/")
