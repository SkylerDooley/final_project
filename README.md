Final Project - Interactive Data Visualization  
===
Written by Daniel Mastrobuono and Skyler Dooley

* Link to get GeoJSON file used for map https://eric.clst.org/tech/usgeojson/
* Link to gh-pages: https://skylerdooley.github.io/final_project/
* Link to Screencast Video: https://www.loom.com/share/331e1a9f6230451094d2e884fd28d8e2
* The Process Book can be found in the directory folder at /ProcessBook.pdf


origFiles folder: 
This folder contains all original USDA reports where we collected the data from. The folder also contains the csv files that contain the values from the data tables in the reports.

python files: 
* dataCollection scrapes the data from the pdfs in origFiles and converts the table on page 6 of the respective pdf to a csv.
* combineCSVs takes the files computed from dataCollection and combines them into one farm_faster csv file that is used for all subsequent csv files.
* Acres_by_state outputs land_in_farms csv that has the rows state, land_in_farms and year
* sum_farms_US outputs year_totals that has the 6 rows of the years and the summation of total_farms 
* total_farms_by_state outputs state_farm_counts and has the rows state, num_farms, and year

component .js files:
* US_total_farms is where the first line graph on the webpage is created. The visual was created using d3 and html formatting.
* US_farm_map is where the map chart and bar graph on the webpage were created. Again, the visual was created using d3 and html formatting.


