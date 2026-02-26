import csv

input_file = "farm_master.csv"
output_file = "state_farm_counts.csv"

with open(input_file, newline="", encoding="utf-8") as infile, \
     open(output_file, "w", newline="", encoding="utf-8") as outfile:

    reader = csv.DictReader(infile)
    writer = csv.writer(outfile)

    # write header
    writer.writerow(["state", "num_farms", "year"])

    for row in reader:
        if row["metric"] == "num_farms":
            writer.writerow([
                row["state"],
                row["value"],
                row["year"]
            ])

print("Done. Saved as", output_file)