import React, { useState, useEffect } from 'react';
import './Commits.css';
import { useLocation } from 'react-router-dom';

import Header from '../../components/Header/Header';
import Commit from '../../components/Commit/Commit';
import Icon from '../../components/Icon/Icon';
import Loader from '../../components/Loader/Loader';
import { set } from 'rsuite/esm/utils/dateUtils';
import DiffViewer from '../../components/DiffViewer/DiffViewer';
import Popup from '../../components/Popup/Popup';


// example url:
//http://localhost:3000/commits?data=%7B%22username%22%3A%22AZ0228%22%2C%22minChanges%22%3A%220%22%2C%22startDate%22%3A%222024-05-31T21%3A30%3A19.566Z%22%2C%22endDate%22%3A%222024-06-07T21%3A30%3A19.566Z%22%2C%22repos%22%3A%5B%7B%22path%22%3A%22Study-Compass%2FStudy-Compass%22%2C%22branches%22%3A%5B%22main%22%5D%2C%22ignoreMerge%22%3Afalse%7D%2C%7B%22path%22%3A%22Study-Compass%2FReact-Tutorial%22%2C%22branches%22%3A%5B%22main%22%5D%2C%22ignoreMerge%22%3Afalse%7D%2C%7B%22path%22%3A%22AZ0228%2FCommit-Getter%22%2C%22branches%22%3A%5B%22main%22%5D%2C%22ignoreMerge%22%3Afalse%7D%5D%7D#/commits?data=%7B%22username%22%3A%22AZ0228%22%2C%22minChanges%22%3A%225%22%2C%22startDate%22%3A%222024-05-31T21%3A36%3A26.240Z%22%2C%22endDate%22%3A%222024-06-07T21%3A36%3A26.240Z%22%2C%22repos%22%3A%5B%7B%22path%22%3A%22AZ0228%2FCommit-Getter%22%2C%22branches%22%3A%5B%22main%22%5D%2C%22ignoreMerge%22%3Afalse%7D%5D%7D
function Commits(){
    const [jwt, setJwt] = useState('');
    const [selected, setSelected] = useState(0);
    const [repoData, setRepoData] = useState([[]]);
    const [fetchedData, setFetchedData] = useState(false);
    const [showDiff, setShowDiff] = useState([]);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const commitData = queryParams.get('data');

    let parsedData = {};
    try {
        parsedData = JSON.parse(commitData);
        console.log(parsedData);
    } catch (error) {
        console.log(error);
    }

    const [username, setUsername] = useState(parsedData.username);
    const [minChanges, setMinChanges] = useState(parsedData.minChanges);
    const [repos, setRepos] = useState(parsedData.repos);
    const [startDate, setStartDate] = useState(parsedData.startDate);
    const [endDate, setEndDate] = useState(parsedData.endDate);

    const [fetching, setFetching] = useState(true);
    const [copy, setCopy] = useState(false);

    const [insertionsAverage, setInsertionsAverage] = useState(0);
    const [deletionsAverage, setDeletionsAverage] = useState(0);
    const [commitCount, setCommitCount] = useState(0);

    const [showDiffPopup, setShowDiffPopup] = useState(false);
    const [currentDiffCommit, setCurrentDiffCommit] = useState(null);

    useEffect(() => {
        //populating repoData with empty arrays
        setRepoData(new Array(repos.length).fill([]));
    },[repos]);

    async function getRateLimitStatus(jwt) {
        try {
            console.log('Fetching rate limit status...');
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

    useEffect(() => {
        if (jwt) {
            getRateLimitStatus(jwt);
        }
    }, [jwt]);

    const handleCopyAllLinks = async () => {
        const links = repoData.flat().map(commit => commit.html_url).join('\n');
        await navigator.clipboard.writeText(links);
        setCopy(true);
        setTimeout(() => {
            setCopy(false);
        }, 3000);
    }

    // const handleShowDiff = (index) => {
    //     setShowDiff(prev => {
    //         const newShowDiff = [...prev];
    //         newShowDiff[index] = !newShowDiff[index];
    //         return newShowDiff;
    //     });
    // }

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
            console.log(`Rate limit: ${remaining}/${limit}`);

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
        // console.log(results);
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
            let commitResponses = [];
            for(let branch of repo.branches){
                let url = `https://api.github.com/repos/${repo.path}/commits?sha=${branch}&since=${startDate}&until=${endDate}&author=${username}&per_page=100`;
                if(!startDate || !endDate){
                    url = `https://api.github.com/repos/${repo.path}/commits?sha=${branch}&author=${username}&per_page=100`;
                }
                let commitResponse = await fetchAllCommits(url);
                let difference = commitResponse.filter(value => !commitResponses.includes(value));
                commitResponses = commitResponses.concat(difference);
            }
            // let commitResponse = await fetchAllCommits(url);
            //determining if the commit meets the minChanges requirement
            // if (minChanges) {
                // const filteredCommits = [];
                for (let commit of commitResponses) {
                    if(repo.ignoreMerge && commit.parents.length > 1){
                        continue;
                    }
                    setCommitCount(prev => prev + 1);
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
                    console.log(commitData);
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
                    setInsertionsAverage(prev => (prev + commitData.stats.additions));
                    setDeletionsAverage(prev => (prev + commitData.stats.deletions));
                }
                // commitResponse = filteredCommits; // Replace the original commits array with filtered commits
                // } else {
                    //     setRepoData(prev => [...prev, commitResponse]);
                    // }
                    // console.log(commitData);
            }
        setFetching(false);
    //https://api.github.com/repos/AZ0228/Study-Compass/commits/9257742d295631a365cdf8b42b1197b5aaf09f4e
    }

    useEffect(() => {
        // let url = 'https://api.github.com/repos/{repo}/commits?sha={branch}&since={start_date}T00:00:00Z&until={end_date}T23:59:59Z&author={username}'
        fetchCommits();
        // console.log(repos);

    }, [jwt]);

    useEffect(() => {
        if(fetching) return;
        //populate showDiff with false
        setShowDiff(new Array(repoData.flat().length).fill(false));
    }, [fetching]);

    // useEffect(() => {console.log(repoData)}, [repoData]);

    const handleRepoClick = (index) => {
        if(index === 0){
            setSelected(0);
        } else {
            setSelected(index);
        }
    }

    const handleShowDiff = (commit) => {
        setCurrentDiffCommit(commit);
        setShowDiffPopup(true);
    }

    const onDiffClose = () => {
        setShowDiffPopup(false);
    }

    return(
        <div className="commits">
            <Popup isOpen={showDiffPopup} onClose={onDiffClose}>
                {currentDiffCommit && <DiffViewer show={true} files={currentDiffCommit.files}/>}
            </Popup>
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
                        {startDate && endDate ?<h2>{selected === 0 ? "showing all commits" : "showing select commits"} from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString() } </h2>
                         : 
                         <h2>{selected === 0 ? "showing all commits" : "showing select commits"}</h2>
                        } 
                        <h2>{selected !== 0 ? repos[selected-1].ignoreMerge ? ", ignoring merges": null : null}</h2>
                    </div>
                    <div className="commits-list">
                        <div className="commits-list-header">
                            <div className="flex">
                                {fetching ?  <Loader /> : <Icon dimension={20} type={"Check"}/>}
                                <h2>{selected === 0 ? repoData.reduce((acc, curr) => acc + curr.length, 0) : repoData[selected-1].length} commits</h2>
                                <p>average deletions and insertions: </p>
                                <div className="diff">
                                    <div className="deletion"></div>
                                    <p>{commitCount !== 0 ? (deletionsAverage/commitCount).toFixed(0) : 0}</p>
                                    <div className="insertion"></div>
                                    <p>{commitCount !== 0 ? (insertionsAverage/commitCount).toFixed(0) : 0}</p>
                                </div>  
                            </div>
                            <button onClick={handleCopyAllLinks}>
                                <p>copy all links</p>
                                <Icon dimension={16} type={copy ? "Check1" : "Copy"} />
                            </button>
                        </div>
                        <div className="commits-content">
                            { selected === 0 ?
                                repoData.map((repo, index) => (
                                    repo.map((commit, index) => (
                                        <Commit index={index} commit={commit} key={`${commit.sha}${index}`} showDiff={()=>handleShowDiff(commit)} error={false}/>

                                    ))
                                ))
                                :
                                repoData[selected-1].map((commit, index) => (
                                    <Commit index={index} commit={commit} key={`${commit.sha}${index}`} showDiff={()=>handleShowDiff(commit)} error={false}/>
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