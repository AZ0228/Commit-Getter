import logo from './logo.svg';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './App.css';
import './assets/Fonts/fonts.css'
import { gtagInit, pageview } from 'react-ga4';

// pages
import Home from './pages/Home/Home';
import Commits from './pages/Commits/Commits';

gtagInit({
    measurementId: 'G-DEGDVYGCP0'
});

const useTrackPageViews = () => {
    const location = useLocation();

    useEffect(() => {
        //tracks page view on path change
        pageview(location.pathname + location.search);
    }, [location]);
};


function App() {
    useTrackPageViews();
    return (
        <Router>
            <Routes>
                <Route path="/" exact element={<Home />} />
                <Route path="/commits" element={<Commits />} />
            </Routes>
        </Router>
    );
}

export default App;
