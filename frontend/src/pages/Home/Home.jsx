import React, { useState, useEffect } from 'react'
import './Home.css'
import '../../assets/Fonts/fonts.css'
import { useNavigate } from 'react-router-dom';
import { DateRangePicker } from 'rsuite';
import { FaCalendar } from 'react-icons/fa';

import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import Icon from '../../components/Icon/Icon'
import MiniForm from '../../components/MiniForm/MiniForm'
import Repo from '../../components/Repo/Repo'
import AddRepo from '../../components/AddRepo/AddRepo'

import Calendar from '../../assets/Icons/Calendar.svg';


function Home() {
    const [username, setUsername] = useState('');
    const [minChanges, setMinChanges] = useState('');
    const [ready, setReady] = useState(false);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [repos, setRepos] = useState([]);
    const [jwt, setJwt] = useState('');
    const [showPopup, setShowPopup] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (username !== '' && jwt !== '' && repos.length > 0) {
            setReady(true);
        } else {
            setReady(false);
        }
    }, [username, minChanges, ready, repos, jwt, showPopup]);

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

    const changeBranch = (repoIndex, branchIndex) => {
        let newRepos = [...repos];
        newRepos[repoIndex].chosenBranchIndex = branchIndex;
        setRepos(newRepos);
    }

    const removeRepo = (repoIndex) => {
        let newRepos = [...repos];
        newRepos.splice(repoIndex, 1);
        setRepos(newRepos);
    }

    useEffect(() => {
        getToken().then(setJwt);
    }, []);

    const getCommits = () => {
        const info = {
            username: username,
            minChanges: minChanges,
            startDate: startDate,
            endDate: endDate,
            repos: repos
        }
        navigate(`/commits?data=${encodeURIComponent(JSON.stringify(info))}`);
    };

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
            let repo = {
                path: repoData.full_name,
                branches: [],
                link: repoData.html_url,
                chosenBranchIndex: 0
            };
            const branchResponse = await fetch(repoData.branches_url.replace('{/branch}', ''), {
                headers: {
                    'Authorization': `${jwt}`,
                    'Accept': 'application/vnd.github.v3+json'
                    }
            });
            if (!branchResponse.ok) {
                throw new Error(`HTTP error! Status: ${branchResponse.status}`);  // Throws an error on non-200 responses
            }
            const branchData = await branchResponse.json();
            console.log(branchData);
            for (let i = 0; i < branchData.length; i++) {
                if(branchData[i].name === "main"){
                    repo.branches.unshift(branchData[i].name);
                } else {
                    repo.branches.push(branchData[i].name);
                }
            }
            setRepos([...repos, repo]);
        } catch(error){
            console.error('Error:', error);
        }
    }

    const handleSubmitLink = (link) => {
        //checking to see if already fetched
        for(let i = 0; i < repos.length; i++){
            if(repos[i].link === link){
                return;
            }
        }
        const path = link.split('github.com/')[1];
        const url = `https://api.github.com/repos/${path}`;
        getRepo(url);
        
    };


    const handleSubmitPath = (path) => {
        //checking to see if already fetched
        for(let i = 0; i < repos.length; i++){
            if(repos[i].path === path){
                return;
            }
        }
        const link = `https://api.github.com/repos/${path}`;
        getRepo(link);
    }

    const handleDate = (date) =>{
        if(date.length === 2){
            setStartDate(date[0].toISOString());
            setEndDate(date[1].toISOString());
            console.log(date[0].toISOString());
            console.log(date[1].toISOString());
        }
    } 

    return (
        <div className="home">
            <div className="content-container">
                <div className="title"><h1>Commit Getter</h1></div>
                <div className="content">
                    <div className="content-header">
                        <div className="left">
                            <Icon dimension={30} type={"Github"} />
                            <MiniForm placeholderText={"Username"} buttonText={"Set"} value={username} onSubmit={setUsername}/>
                            <MiniForm placeholderText={"Min Changes"} buttonText={"Set"} value={minChanges} onSubmit={setMinChanges}/>
                        </div>
                        <div className="right">
                            <DateRangePicker 
                                format="MM/dd/yyyy" 
                                character=" - " 
                                caretAs={FaCalendar} 
                                showOneCalendar  
                                placeholder="Select Date Range"
                                onOk={handleDate}
                            />
                            <button onClick={getCommits} className={`button go ${ready ? "active": ""}`}>Get Commits</button>
                        </div>
                    </div>
                    <div className="repos">
                        {repos.map((repo, index) => (
                            <Repo 
                                key={index} 
                                num={index} 
                                repo={repo} 
                                showPopup={showPopup} 
                                setShowPopup={setShowPopup} 
                                handleBranchChange={changeBranch}
                                removeRepo={removeRepo}
                            />
                        ))}
                    </div>
                    <AddRepo handleSubmitLink={handleSubmitLink} handleSubmitPath={handleSubmitPath} />
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Home