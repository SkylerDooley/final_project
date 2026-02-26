"""
Extract USDA Farms and Land in Farms 2025 Summary
Convert page 6 into tidy CSV for D3

Requires:
    pip install tabula-py pandas
    Java installed

If getting error "Failed to import jpype dependencies. Fallback to subprocess.
No module named 'jpype'"
    can just ignore

Rename PDF_PATH and OUTPUT_CSV to read different pdfs
"""
import tabula
import pandas as pd

PDF_PATH = "farm_21-20.pdf"
OUTPUT_CSV = "farm_21-20.csv"
lYear="2020" #lower year
uYear="2021" #upper year

print("Extracting table using Tabula...")

tables = tabula.read_pdf(
    PDF_PATH,
    pages=6,
    stream=True,
    guess=True
)

df = tables[0]

# ---------------------------------------------------
# 1. CLEAN RAW EXTRACTION
# ---------------------------------------------------

# Drop completely empty rows
df = df.dropna(how="all").reset_index(drop=True)

# Remove header rows (State, 2024 2025, units)
header_mask = df["Unnamed: 0"].astype(str).str.contains("State|"+lYear+"|"+uYear+"|number|acres", case=False, na=False)
df = df[~header_mask].reset_index(drop=True)

# Remove blank separator rows
df = df[df["Unnamed: 0"].notna()].reset_index(drop=True)

# Clean state names (remove dots)
df["state"] = df["Unnamed: 0"].str.replace(r"\.+", "", regex=True).str.strip()

# ---------------------------------------------------
# 2. SPLIT MULTI-YEAR COLUMNS
# ---------------------------------------------------

def split_two_years(col):
    """Split '37,100 37,000' → ['37,100','37,000']"""
    return col.astype(str).str.split(expand=True)

df[["farms_"+lYear, "farms_"+uYear]] = split_two_years(df["Number of farms"])
df[["land_"+lYear, "land_"+uYear]] = split_two_years(df["Land in farms"])
df[["avg_"+lYear, "avg_"+uYear]] = split_two_years(df["Average farm size"])

# ---------------------------------------------------
# 3. CLEAN NUMERIC VALUES
# ---------------------------------------------------

num_cols = [
    "farms_"+lYear,"farms_"+uYear,
    "land_"+lYear,"land_"+uYear,
    "avg_"+lYear,"avg_"+uYear
]

for col in num_cols:
    df[col] = (
        df[col]
        .astype(str)
        .str.replace(",", "", regex=False)
        .str.replace("(D)", "", regex=False)
        .str.replace("(X)", "", regex=False)
    )
    df[col] = pd.to_numeric(df[col], errors="coerce")

# ---------------------------------------------------
# 4. BUILD TIDY FORMAT
# ---------------------------------------------------

tidy_rows = []

for _, row in df.iterrows():
    state = row["state"]

    tidy_rows += [
        {"state": state, "metric": "num_farms", "units": "number", "year": lYear, "value": row["farms_"+lYear]},
        {"state": state, "metric": "num_farms", "units": "number", "year": uYear, "value": row["farms_"+uYear]},

        {"state": state, "metric": "land_in_farms", "units": "1,000 acres", "year": lYear, "value": row["land_"+lYear]},
        {"state": state, "metric": "land_in_farms", "units": "1,000 acres", "year": uYear, "value": row["land_"+uYear]},

        {"state": state, "metric": "avg_farm_size", "units": "acres", "year": lYear, "value": row["avg_"+lYear]},
        {"state": state, "metric": "avg_farm_size", "units": "acres", "year": uYear, "value": row["avg_"+uYear]},
    ]

tidy = pd.DataFrame(tidy_rows)

# Remove rows with missing values
tidy = tidy.dropna(subset=["value"]).reset_index(drop=True)

# ---------------------------------------------------
# 5. EXPORT
# ---------------------------------------------------

tidy.to_csv(OUTPUT_CSV, index=False)
print(f"Done! CSV saved as: {OUTPUT_CSV}")
