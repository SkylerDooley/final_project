import csv

INPUT_FILE = "farm_master.csv"     # change if needed
OUTPUT_FILE = "land_in_farms.csv"

with open(INPUT_FILE, newline="", encoding="utf-8") as infile, \
     open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as outfile:

    reader = csv.DictReader(infile)
    fieldnames = ["state", "land_in_farms", "year"]
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)

    writer.writeheader()

    for row in reader:
        if row["metric"] == "land_in_farms":
            writer.writerow({
                "state": row["state"],
                "land_in_farms": row["value"],
                "year": row["year"]
            })

print("CSV created:", OUTPUT_FILE)