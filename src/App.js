import './App.css';
import Canvas from "./Canvas";
import {add} from "date-fns"
import { useState } from 'react';

const TODAY = new Date()
const END = add(TODAY, {days: 30});

function App() {
  const [state, setState] = useState({
    numOfRows: 3,
    startDate: TODAY,
    endDate: END
  });

  const addRow = (e) => {
    setState((prev) => {
      return {
        ...prev,
        numOfRows: prev.numOfRows + 1
      }
    })
  }

  /**
   * 
   * @param {number} val 
   */
  const increaseCanvasSizeBy = (val) => {
    setState((prev) => {
      return {
        ...prev,
        endDate: add(prev.endDate, {days: val})
      }
    })
  }

  return (
    <div className="App">
      <div className="toolbar">
        <button onClick={addRow}>
          Add row
        </button>
      </div>
      <Canvas rows={state.numOfRows} startDate={state.startDate} endDate={state.endDate} increaseCanvasSizeBy={increaseCanvasSizeBy} />
    </div>
  );
}

export default App;
