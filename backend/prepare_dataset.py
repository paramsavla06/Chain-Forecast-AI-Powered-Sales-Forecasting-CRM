import pandas as pd
from cleaning import clean_record
import os

# === 1. path to your BIG RAW FILE ===
# change this to wherever your raw file is
RAW_FILE = r"C:\Users\Aayush Chaudhari\Desktop\CRM\my_raw_sales_file.csv"
# or: RAW_FILE = r"C:\...\my_raw_sales_file.xlsx"

# === 2. where to save the cleaned file ===
backend_dir = os.path.dirname(os.path.abspath(__file__))
dataset_dir = os.path.join(backend_dir, "dataset")
os.makedirs(dataset_dir, exist_ok=True)

CLEAN_FILE = os.path.join(dataset_dir, "online_retail_cleaned.csv")

def main():
    # 1. load raw
    ext = os.path.splitext(RAW_FILE)[1].lower()
    if ext == ".csv":
        raw = pd.read_csv(RAW_FILE, encoding="latin1", low_memory=False)
    elif ext in [".xlsx", ".xls"]:
        raw = pd.read_excel(RAW_FILE)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    print("Raw shape:", raw.shape)

    # 2. clean with YOUR existing function
    cleaned = clean_record(raw)
    print("Cleaned shape:", cleaned.shape)

    # 3. save cleaned dataset
    cleaned.to_csv(CLEAN_FILE, index=False)
    print("Saved cleaned dataset to:", CLEAN_FILE)

if __name__ == "__main__":
    main()
