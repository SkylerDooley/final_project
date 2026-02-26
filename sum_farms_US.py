import csv
from collections import defaultdict

input_file = "state_farm_counts.csv"
output_file = "year_totals.csv"

totals = defaultdict(int)

with open(input_file, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)

    for row in reader:
        year = row["year"]
        farms = int(row["num_farms"])
        totals[year] += farms

# write results
with open(output_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["year", "total_farms"])

    for year in sorted(totals):
        writer.writerow([year, totals[year]])

print("Saved yearly totals to", output_file)