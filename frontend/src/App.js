import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './assets/Fonts/fonts.css'


// pages
import Home from './pages/Home/Home';

function App() {
    return (
    <Router>
        <Routes>
            <Route path="/" element={<Home/>}/>
        </Routes>
    </Router>
    );
}

export default App;
