Final Project - Interactive Data Visualization  
===
Written by Daniel Mastrobuono and Skyler Dooley

* Link to get GeoJSON file used for map https://eric.clst.org/tech/usgeojson/
* Link to GitHub Pages: 
* Link to Screencast Video: 

To open the project website from the terminal into a localhost page, just run `npm run` in the terminal

origFiles folder: 
This folder contains all original USDA reports where we collected the data from. The folder also contains the csv files that contain the values from the data tables in the reports.

python files: 
* dataCollection scrapes the data from the pdfs in origFiles and converts the table on page 6 of the respective pdf to a csv.
* combineCSVs takes the files computed from dataCollection and combines them into one farm_faster csv file that is used for all subsequent csv files.
* Acres_by_state outputs land_in_farms csv that has the rows state, land_in_farms and year
* sum_farms_US outputs year_totals that has the 6 rows of the years and the summation of total_farms 
* total_farms_by_state outputs state_farm_counts and has the rows state, num_farms, and year

component .js files:
* US_total_farms
* US_farm_map






------------------------
The README file must give an overview of what you are handing in: which parts are your code, which parts are libraries, and so on. The README must contain URLs to your project websites and screencast videos. The README must also explain any non-obvious features of your interface.