import './App.css';
import FarmLineChart from "./components/US_total_farms.js";
import USFarmMap from "./components/US_farm_map.js";

function App() {
  return (
    <div style={{ padding: 20 }} className="app">
      <h1 className="title">The Decline in US Farming in the Last Five Years</h1>
      <p className ="subtitle">Written by Daniel Mastrobuono and Skyler Dooley</p>
      <p>For the last few decades, farming has been at a steady decline. In recent history, this has not changed. <br></br>
        Let's take a look at the numbers over the last 5 years and see which states are most or least impacted.</p>
      <p>First however, let's take a look at the big picture; the total number of farms in the US.</p>
      <h2>US Total Farms</h2>
      <FarmLineChart />
      <h2>Farm Count By State Per Year</h2>
      <USFarmMap />
    </div>
  );
}

export default App;
