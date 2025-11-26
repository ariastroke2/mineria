import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import "./styles/generic.css"

import Homebar from './views/homebar';

import Homepage from './views/homepage';
import Detailview from './views/detailview';

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
                <Route path="/win/:id" element={<Detailview />} />
                <Route path="/contact" element={<Homepage />} />
            </Routes>
            </div>
        </BrowserRouter>
    </div>
  );
}

export default App;