import React, { useState, useEffect } from 'react';
import './Commits.css';
import { useLocation } from 'react-router-dom';

import Header from '../../components/Header/Header';
import Commit from '../../components/Commit/Commit';


// example url:
//http://localhost:3000/commits?data=%7B%22username%22%3A%22AZ0228%22%2C%22minChanges%22%3A%2210%22%2C%22startDate%22%3A%222024-04-12T16%3A31%3A54.420Z%22%2C%22endDate%22%3A%222024-04-19T16%3A31%3A54.420Z%22%2C%22repos%22%3A%5B%7B%22path%22%3A%22AZ0228%2FStudy-Compass%22%2C%22branches%22%3A%5B%22main%22%2C%22backend-user%22%2C%22error-handling%22%2C%22frontend-mobile%22%2C%22new%22%2C%22save-room-functionality%22%2C%22sort%22%5D%2C%22link%22%3A%22https%3A%2F%2Fgithub.com%2FAZ0228%2FStudy-Compass%22%2C%22chosenBranchIndex%22%3A0%7D%2C%7B%22path%22%3A%22hack-rpi%2FHackRPI-Mobile%22%2C%22branches%22%3A%5B%22main%22%2C%22Build-FAQ-Page%22%2C%22Hacker-Queue-Development%22%2C%22LoginoauthTests%22%2C%22Main_button%22%2C%22MentorQ%22%2C%22RavenLLevitt-patch-1%22%2C%22backend2024%22%2C%22backend-login-refactor%22%2C%22bug-fixing%22%2C%22calander-updates%22%2C%22calander-widget-v2%22%2C%22calendar-v3-2024%22%2C%22circle-border-fix%22%2C%22clock%22%2C%22clock-cleanup%22%2C%22clock-organization%22%2C%22dev%22%2C%22firestore%22%2C%22info%22%2C%22mentor-frontend%22%2C%22pdf-viewer%22%2C%22prize%22%2C%22prizes%22%2C%22push_notif_V2%22%2C%22push_notifications%22%2C%22revert-12-clock%22%2C%22revert-15-revert-12-clock%22%2C%22revert-18-Hacker-Que-UI%22%2C%22settings%22%5D%2C%22link%22%3A%22https%3A%2F%2Fgithub.com%2Fhack-rpi%2FHackRPI-Mobile%22%2C%22chosenBranchIndex%22%3A0%7D%5D%7D

function Commits(){
    const [jwt, setJwt] = useState('');

    const [selected, setSelected] = useState(0);


    const [repoData, setRepoData] = useState([[]]);

    const [fetchedData, setFetchedData] = useState(false);


    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const commitData = queryParams.get('data');
    let parsedData = {};
    try {
        parsedData = JSON.parse(commitData);
    } catch (error) {
        console.log(error);
    }

    const [username, setUsername] = useState(parsedData.username);
    const [minChanges, setMinChanges] = useState(parsedData.minChanges);
    const [repos, setRepos] = useState(parsedData.repos);
    const [startDate, setStartDate] = useState(parsedData.startDate);
    const [endDate, setEndDate] = useState(parsedData.endDate);

    useEffect(() => {
        //populating repoData with empty arrays
        setRepoData(new Array(repos.length).fill([]));
    },[repos]);

    async function getRateLimitStatus(jwt) {
        try {
            const url = 'https://api.github.com/rate_limit';
            const headers = {
                'Authorization': `Bearer ${jwt}`,
                'Accept': 'application/vnd.github.v3+json'
            };
            const response = await fetch(url, { headers });
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching rate limit status:', error.message);
        }
    }

    // useEffect(() => {
    //     if (jwt) {
    //         getRateLimitStatus(jwt);
    //     }
    // }, [jwt]);


    async function getToken() {
        // Check if a token is stored and valid
        let token = sessionStorage.getItem('jwtToken');
        let expiry = sessionStorage.getItem('jwtExpiry');

        // if (!token || !expiry || Date.now() >= expiry) {
            const response = await fetch('https://ig9px9v0hk.execute-api.us-east-1.amazonaws.com/CreateJWT');
            const data = await response.json();
            token = data.access_token;
            const now = Date.now();
            const exp = now + (10 * 60 * 1000) - (30 * 1000); // Set expiry 30 seconds before actual expiry

            sessionStorage.setItem('jwtToken', token);
            sessionStorage.setItem('jwtExpiry', exp);
        // }
        return token;
    }

    useEffect(() => {
        getToken().then(setJwt);
    }, []);

    async function fetchAllCommits(url) {
        if(jwt === ''){
            return;
        }
        setFetchedData(true);
        let results = [];
        while(url){
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            results = results.concat(data);  // Add new commits to the results array

            const limit = response.headers.get('X-RateLimit-Limit');
            const remaining = response.headers.get('X-RateLimit-Remaining');
            // console.log(`Rate limit: ${remaining}/${limit}`);

            const links = response.headers.get('Link');
            if (links) {
                const nextLink = links.split(',').find(s => s.includes('rel="next"'));
                url = nextLink ? nextLink.split(';')[0].trim().slice(1, -1) : null;
                // console.log('Next URL:', url);  // Log the next URL
            } else {
                url = null;  // Ensure URL is null if no links header is present
            }        
            if(data.length < 100){
                break;
            }
        }
        console.log(results);
        return results;
    }

    async function fetchCommits() {
        if(jwt === ''){
            return;
        }
        if(fetchedData){
            return;
        } else {
            setFetchedData(true);
        }
        console.log("fetching");
        for (let i = 0; i < repos.length; i++) {
            const repo = repos[i];
            const url = `https://api.github.com/repos/${repo.path}/commits?sha=${repo.branches[repo.chosenBranchIndex]}&since=${startDate}&until=${endDate}&author=${username}&per_page=100`;
            let commitResponse = await fetchAllCommits(url);
            //determining if the commit meets the minChanges requirement
            if (minChanges) {
                // const filteredCommits = [];
                for (let commit of commitResponse) {
                    const commitUrl = `https://api.github.com/repos/${repo.path}/commits/${commit.sha}`;
                    const detailResponse = await fetch(commitUrl, {
                        headers: {
                            'Authorization': `Bearer ${jwt}`,
                            'Accept': 'application/vnd.github+json'
                        }
                    });
                    if (!detailResponse.ok) {
                        throw new Error(`HTTP error! Status: ${detailResponse.status}`);
                    }
                    const commitData = await detailResponse.json();
                    if (commitData.stats.total >= minChanges) {
                        setRepoData(prev => {
                            if (i < 0 || i >= prev.length) {
                                console.error("List index out of bounds");
                                return prev;
                            }
                            return prev.map((list, index) => {
                                if (index === i) {
                                    return [...list, commitData];
                                }
                                return list;
                            });
                        });
                    }
                }
                // commitResponse = filteredCommits; // Replace the original commits array with filtered commits
            } else {
                setRepoData(prev => [...prev, commitResponse]);
            }
            // console.log(commitData);
        }
    //https://api.github.com/repos/AZ0228/Study-Compass/commits/9257742d295631a365cdf8b42b1197b5aaf09f4e
    }

    useEffect(() => {
        // let url = 'https://api.github.com/repos/{repo}/commits?sha={branch}&since={start_date}T00:00:00Z&until={end_date}T23:59:59Z&author={username}'
        fetchCommits();
        // console.log(repos);

    }, [jwt]);

    useEffect(() => {console.log(repoData)}, [repoData]);

    const handleRepoClick = (index) => {
        if(index === 0){
            setSelected(0);
        } else {
            setSelected(index);
        }
    }

    return(
        <div className="commits">
            <Header />
            <div className="container">
                <div className="left">
                    <div className={`option ${selected === 0 ? "selected": ""}`} onClick={()=>{handleRepoClick(0)}} >
                        <h3>All Commits</h3>
                    </div>
                    <hr />
                    <p className="separator">repositories</p>
                    {repos.map((repo, index) => (
                        <div 
                            className={`option ${selected === index+1 ? "selected": ""}`} key={`${index}${repo}`}
                            onClick={()=>{handleRepoClick(index+1)}}
                        >
                            <h3>{repo.path}</h3>
                        </div>
                    ))}
                </div>
                <div className="right">
                    <div className="commit-right-header">
                        <h1>{selected === 0 ? "Commits" : repos[selected-1].path}</h1>
                    </div>
                    <div className="commit-right-subheader">
                        <h2>{selected === 0 ? "showing all commits" : "showing select commits"}</h2>
                    </div>
                    <div className="commits-list">
                        <div className="commits-list-header">
                            <h2>{selected === 0 ? repoData.reduce((acc, curr) => acc + curr.length, 0) : repoData[selected-1].length} commits</h2>
                        </div>
                        <div className="commits-content">
                            { selected === 0 ?
                                repoData.map((repo, index) => (
                                    repo.map((commit, index) => (
                                        <Commit commit={commit} key={`${commit.sha}`}/>
                                    ))
                                ))
                                :
                                repoData[selected-1].map((commit, index) => (
                                    <Commit commit={commit} key={`${commit.sha}`}/>
                                ))
                            }
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Commits;