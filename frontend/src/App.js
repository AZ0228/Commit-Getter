import logo from './logo.svg';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './assets/Fonts/fonts.css'

// pages
import Home from './pages/Home/Home';
import Commits from './pages/Commits/Commits';

function App() {
    return (
    <Router>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/commits" element={<Commits/>}/>
        </Routes>
    </Router>
    );
}

export default App;
