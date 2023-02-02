import './App.css';
import UnityScene from './UnityScene';
import { Routes, Route} from "react-router-dom";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<UnityScene />} />
      </Routes>
    </div>
  );
}

export default App;
