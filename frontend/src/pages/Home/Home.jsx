import React, { useState, useEffect, useRef } from 'react'
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


function Home() {
    const [username, setUsername] = useState(localStorage.getItem('username') ? localStorage.getItem('username') : '');
    const [minChanges, setMinChanges] = useState(localStorage.getItem('minChanges') ? localStorage.getItem('minChanges') : '0');
    const [ready, setReady] = useState(false);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [repos, setRepos] = useState(localStorage.getItem('repos') ? JSON.parse(localStorage.getItem('repos')) : []);
    const [jwt, setJwt] = useState('');
    const [showPopup, setShowPopup] = useState(null);

    const [addRepoError, setAddRepoError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        getToken().then(setJwt);
    }, []);

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
        if(newRepos[repoIndex].chosenBranchIndexes.includes(branchIndex)){
            newRepos[repoIndex].chosenBranchIndexes = newRepos[repoIndex].chosenBranchIndexes.filter(index => index !== branchIndex);
            if(newRepos[repoIndex].chosenBranchIndexes.length === 0){
                newRepos[repoIndex].chosenBranchIndexes.push(0);
            }
        } else {
            //limit to 3 branches
            if(newRepos[repoIndex].chosenBranchIndexes.length >= 3){
                newRepos[repoIndex].chosenBranchIndexes.shift();
            }
            newRepos[repoIndex].chosenBranchIndexes.push(branchIndex);
        }
        // newRepos[repoIndex].chosenBranchIndex = branchIndex;
        setRepos(newRepos);
    }

    const ignoreMerge = (repoIndex) => {
        let newRepos = [...repos];
        newRepos[repoIndex].ignoreMerge = !newRepos[repoIndex].ignoreMerge;
        setRepos(newRepos);
    }

    const removeRepo = (repoIndex) => {
        let newRepos = [...repos];
        newRepos.splice(repoIndex, 1);
        setRepos(newRepos);
    }

    //check for stored info on mount
    useEffect(() => {
        localStorage.setItem('repos', JSON.stringify(repos));
        localStorage.setItem('username', username);
        localStorage.setItem('minChanges', minChanges);
        localStorage.setItem('startDate', startDate);
        localStorage.setItem('endDate', endDate);
        console.log(localStorage.getItem('repos'));
    }, [repos, username, minChanges, startDate, endDate]);



    const condenseRepos = () => {
        let condensedRepos = [];
        for (let i = 0; i < repos.length; i++) {
            let repo = repos[i];
            let condensedRepo = {
                path: repo.path,
                branches: repo.chosenBranchIndexes.map(index => repo.branches[index]),
                ignoreMerge: repo.ignoreMerge
            }
            condensedRepos.push(condensedRepo);
        }
        return condensedRepos;
    }

    const getCommits = () => {
        const info = {
            username: username,
            minChanges: minChanges,
            startDate: startDate,
            endDate: endDate,
            repos: condenseRepos()
        }
        navigate(`/commits?data=${encodeURIComponent(JSON.stringify(info))}`);
    };

    const goToPasteCommits = () => {
        navigate('/paste-commits');
    }

    useEffect(() => {console.log(repos)}, [repos]);

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
            let repo = {
                path: repoData.full_name,
                branches: [],
                link: repoData.html_url,
                chosenBranchIndexes: [0],
                ignoreMerge: false
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
            setAddRepoError('Error fetching repository');
            console.error('Error:', error);
        }
    }

    const handleSubmitLink = (link) => {
        //checking to see if already fetched
        for(let i = 0; i < repos.length; i++){
            if(repos[i].link === link){
                setAddRepoError('Repository already added');
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
                setAddRepoError('Repository already added');
                return;
            }
        }
        const link = `https://api.github.com/repos/${path}`;
        getRepo(link);
    }

    const handleDate = (date) =>{
        if(!date){
            return;
        }
        if(date.length === 2){
            setStartDate(date[0].toISOString());
            setEndDate(date[1].toISOString());
            console.log(date[0].toISOString());
            console.log(date[1].toISOString());
        }
        console.log(date);
    } 

    // save repos and other attributes to local storage


    return (
        <div className="home">
            <div className="content-container">
                <div className="title">
                    <h1>Commit Getter</h1>
                    <button onClick={goToPasteCommits}>mentor view</button>
                    </div>
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
                                onChange={handleDate}
                            />
                            <button onClick={getCommits} className={`button go ${ready ? "active": ""}`}>Get Commits</button>
                        </div>
                    </div>
                    <div className="repos">
                        {repos.length > 0 ?
                            repos.map((repo, index) => (
                                <Repo 
                                    key={index} 
                                    num={index} 
                                    repo={repo} 
                                    showPopup={showPopup} 
                                    setShowPopup={setShowPopup} 
                                    handleBranchChange={changeBranch}
                                    removeRepo={removeRepo}
                                    setIgnoreMerge={ignoreMerge}
                                />
                            ))
                            :
                            <div className="empty-repo">
                                <h2>Add Repositories below with either repository link or path (ex: "username/repo")</h2>
                            </div>

                        }
                    </div>
                    <AddRepo handleSubmitLink={handleSubmitLink} handleSubmitPath={handleSubmitPath} error={addRepoError} setError={setAddRepoError} />
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Home