import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import "./styles/generic.css"

import Homebar from './views/homebar';

import Homepage from './views/homepage';
import Detailview from './views/detailview';
import DebugView from './views/debugview';
import ProfileView from './views/profileview';
import BoardSummaryView from './views/boardSummaryView';
import BoardView from './views/boardView.jsx';
import TrendingView from './views/trendingview.jsx';

import CreationPopup from './views/createPopup';
import CreateBoard from './views/createBoardView.jsx';
import TitleBar from './components/TitleBar.jsx';
import UserSelector from './components/UserSelector.jsx';
import SearchPinsView from './views/searchView.jsx';

function App() {
  return (
    <div>
        <header>
        
        </header>

        <BrowserRouter>
            <Homebar />
            <UserSelector />
            
            <div className="pagecontent">
                <TitleBar />
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/trending" element={<TrendingView />} />
                <Route path="/win/:id" element={<Detailview />} />
                <Route path="/debug" element={<DebugView />} />
                <Route path="/contact" element={<Homepage />} />
                <Route path="/:user/boards" element={<BoardSummaryView />} />
                <Route path="/create" element={<CreationPopup />} />
                <Route path="/createboard" element={<CreateBoard />} />
                <Route path="/boards/:id" element={<BoardView />} />
                <Route path="/:userParam/profile" element={<ProfileView />} />
                <Route path="/search/:searchValue" element={<SearchPinsView />} />
            </Routes>
            </div>
        </BrowserRouter>
    </div>
  );
}

export default App;