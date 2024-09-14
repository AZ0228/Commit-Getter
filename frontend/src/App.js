import logo from './logo.svg';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './App.css';
import './assets/Fonts/fonts.css'
import ReactGA from "react-ga4";

// pages
import Home from './pages/Home/Home';
import Commits from './pages/Commits/Commits';
import PasteCommits from './pages/PasteCommits/PasteCommits';

ReactGA.initialize("'G-DEGDVYGCP0'");
ReactGA.send({ hitType: "pageview", page: window.location.pathname });

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" exact element={<Home />} />
                <Route path="/commits" element={<Commits />} />
                <Route path="/paste-commits" element={<PasteCommits />} />
            </Routes>
        </Router>
    );
}

export default App;
