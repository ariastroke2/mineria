import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import "./styles/generic.css"

import Homebar from './views/homebar';

import Homepage from './views/homepage';

function App() {
  return (
    <div>
        <header>
        
        </header>

        <BrowserRouter>
            <Homebar />
            
            <div className="pagecontent">
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/about" element={<Homepage />} />
                <Route path="/contact" element={<Homepage />} />
            </Routes>
            </div>
        </BrowserRouter>
    </div>
  );
}

export default App;