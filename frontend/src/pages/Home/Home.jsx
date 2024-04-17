import React, { useState, useEffect } from 'react'
import './Home.css'
import '../../assets/Fonts/fonts.css'

import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import Icon from '../../components/Icon/Icon'
import MiniForm from '../../components/MiniForm/MiniForm'
import Repo from '../../components/Repo/Repo'
import AddRepo from '../../components/AddRepo/AddRepo'

function Home() {
    const [numRepos, setNumRepos] = useState(0);
    const [repos, setRepos] = useState([]);
    const [jwt, setJwt] = useState('');

    async function getToken() {
        // Check if a token is stored and valid
        let token = sessionStorage.getItem('jwtToken');
        let expiry = sessionStorage.getItem('jwtExpiry');

        if (!token || !expiry || Date.now() >= expiry) {
            const response = await fetch('https://ig9px9v0hk.execute-api.us-east-1.amazonaws.com/CreateJWT');
            const data = await response.json();
            token = data.token;
            const now = Date.now();
            const exp = now + (10 * 60 * 1000) - (30 * 1000); // Set expiry 30 seconds before actual expiry

            sessionStorage.setItem('jwtToken', token);
            sessionStorage.setItem('jwtExpiry', exp);
        }
        return token;
    }

    useEffect(() => {
        getToken().then(setJwt);
    }, []);

    async function getRepo(apiUrl) {
        // const apiUrl = `https://api.github.com/repos/${path}}`;
        try{
            const repoResponse = await fetch(apiUrl, {
                headers: {
                    'Authorization': `${jwt}`,
                    'Accept': 'application/vnd.github.v3+json'
                    }
            });
            if (!repoResponse.ok) {
                throw new Error(`HTTP error! Status: ${repoResponse.status}`);  // Throws an error on non-200 responses
            }
            const repoData = await repoResponse.json();
            console.log(repoData);
        } catch(error){
            console.error('Error:', error);
        }
    }

    const handleSubmitLink = (link) => {
        getRepo(link);
    };

    const handleSubmitPath = (path) => {
        const link = `https://api.github.com/repos/${path}`;
        getRepo(link);
    }

    return (
        <div className="home">
            <Header />
            <div className="content-container">
                <div className="content">
                    <div className="content-header">
                        <div className="left">
                            <Icon dimension={30} type={"Github"} />
                            <MiniForm placeholderText={"Username"} buttonText={"Set"} />
                            <MiniForm placeholderText={"Min Changes"} buttonText={"Set"} />
                        </div>
                        <div className="right">
                            <button className="button">Add Repo</button>
                        </div>
                    </div>
                    <div className="repos">
                        <Repo />
                        <AddRepo handleSubmitLink={handleSubmitLink} handleSubmitPath={handleSubmitPath} />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Home