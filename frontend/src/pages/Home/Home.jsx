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
        console.log(token);
        return token;
    }

    useEffect(() => {
        getToken().then(setJwt);
    }, []);

    async function getRepos() {
        const apiUrl = `https://api.github.com/repos/AZ0228/Study-Compass`;

        fetch("https://api.github.com/app", {
            method: "GET",
            headers: {
                "Accept": "application/vnd.github+json",
                "Authorization": `Bearer ${jwt}`,
                "X-GitHub-Api-Version": "2022-11-28"
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data from GitHub API. Status: ' + response.status);
                }
                return response.json();
            })
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));

        const repoResponse = await fetch(apiUrl, {
            headers: {
                'Authorization': `${jwt}`,
                'Accept': 'application/vnd.github.v3+json'
                }
        });
        const repoData = await repoResponse.json();
        console.log(repoData);
        // setRepos([repos, ...repoData]);
    }

    const addRepo = () => {
        console.log("Add Repo");
        getRepos();
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
                            <button onClick={addRepo} className="button">Add Repo</button>
                        </div>
                    </div>
                    <div className="repos">
                        <Repo />
                        <AddRepo />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Home