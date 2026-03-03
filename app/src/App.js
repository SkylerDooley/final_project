import './App.css';
import FarmLineChart from "./components/US_total_farms.js";
import USFarmMap from "./components/US_farm_map.js";

function App() {
  return (
    <div style={{ padding: 20 }} className="app">
      <h1 className="title">The Decline in US Farming in the Last Five Years</h1>
      <p className ="subtitle"><i>Written by Daniel Mastrobuono and Skyler Dooley</i></p>
      <p>For the last few decades, farming has been at a steady decline. In recent history, this has not changed. <br></br>
        Let's take a look at the numbers over the last 5 years and see which states are most or least impacted.</p>
      <p>First however, let's take a look at the big picture; the total number of farms in the US.</p>
      <h2>US Total Farms</h2>
      <FarmLineChart />
      <p> The national trend shows a steady, uninterrupted decline in the total number of farms over the last five years. <br></br>
        Even after the initial post‑COVID economic adjustments, the total farm count continues to fall year after year, <br></br>
        indicating that consolidation pressures, rising operating costs, and land‑use changes are still reshaping the agricultural landscape. <br></br><br></br>
        The line chart makes this pattern clear: there are no years of recovery or plateau—just a gradual but persistent downward slope. </p>
      <h2>Farm Count By State Per Year</h2>
      <USFarmMap />
      <p>
        The state‑level map reveals that this decline is not evenly distributed.<br/>
        Some states experience sharper year‑to‑year drops in farm numbers, while others remain relatively stable or even show brief increases.<br/>
        The color‑coded change indicator highlights these differences:<br/><br/>

        <b>Green</b> states show growth from the previous year, though these increases are typically small.<br/>
        <b>Yellow</b> states remain stable with little to no change.<br/>
        <b>Red</b> states show declines, often aligning with broader regional patterns such as the Midwest’s consolidation <br></br>of large operations or the Southeast’s gradual reduction in small and mid‑sized farms.<br/><br/>

        Switching between “Number of Farms” and “Land in Farms” also shows that land area does not always move in sync with farm counts<br></br>some states lose farms but maintain or even increase total acreage, suggesting consolidation into fewer, larger operations.
      </p>
      
      <p><br></br><hr/> <br></br>Taken together, the national totals and the state‑by‑state patterns point to a consistent story: <br></br>The United States is experiencing a long‑term 
        contraction in the number of individual farms, even as agricultural production remains high. <br></br>Many states show evidence of consolidation, 
        where fewer farms manage similar or larger land areas. <br></br>This shift reflects economic pressures, demographic changes in the farming population, 
        and the increasing capital requirements of modern agriculture. <br></br>While the pace of decline varies by region, the overall direction is clear—American 
        farming is becoming more concentrated, <br></br>with fewer operations managing more of the nation’s agricultural land. 
      </p>
    </div>
  );
}

export default App;
