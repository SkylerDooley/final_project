import './App.css';
import FarmLineChart from "./components/US_total_farms.js";

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Total Farms (Last 5 Years)</h2>
      <FarmLineChart />
    </div>
  );
}

export default App;
