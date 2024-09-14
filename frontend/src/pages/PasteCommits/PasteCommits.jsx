import React, { useState, useEffect } from 'react';
import '../Commits/Commits.css';
import './PasteCommits.css'
import { useLocation } from 'react-router-dom';

import Header from '../../components/Header/Header';
import Commit from '../../components/Commit/Commit';
import Icon from '../../components/Icon/Icon';
import Loader from '../../components/Loader/Loader';
import { set } from 'rsuite/esm/utils/dateUtils';
import DiffViewer from '../../components/DiffViewer/DiffViewer';
import Popup from '../../components/Popup/Popup';

import { validateGithubCommitLinks } from './PasteCommitsHelpers';

// example url:
//http://localhost:3000/commits?data=%7B%22username%22%3A%22AZ0228%22%2C%22minChanges%22%3A%220%22%2C%22startDate%22%3A%222024-05-31T21%3A30%3A19.566Z%22%2C%22endDate%22%3A%222024-06-07T21%3A30%3A19.566Z%22%2C%22repos%22%3A%5B%7B%22path%22%3A%22Study-Compass%2FStudy-Compass%22%2C%22branches%22%3A%5B%22main%22%5D%2C%22ignoreMerge%22%3Afalse%7D%2C%7B%22path%22%3A%22Study-Compass%2FReact-Tutorial%22%2C%22branches%22%3A%5B%22main%22%5D%2C%22ignoreMerge%22%3Afalse%7D%2C%7B%22path%22%3A%22AZ0228%2FCommit-Getter%22%2C%22branches%22%3A%5B%22main%22%5D%2C%22ignoreMerge%22%3Afalse%7D%5D%7D#/commits?data=%7B%22username%22%3A%22AZ0228%22%2C%22minChanges%22%3A%225%22%2C%22startDate%22%3A%222024-05-31T21%3A36%3A26.240Z%22%2C%22endDate%22%3A%222024-06-07T21%3A36%3A26.240Z%22%2C%22repos%22%3A%5B%7B%22path%22%3A%22AZ0228%2FCommit-Getter%22%2C%22branches%22%3A%5B%22main%22%5D%2C%22ignoreMerge%22%3Afalse%7D%5D%7D
function PasteCommits(){
    const [jwt, setJwt] = useState('');
    const [selected, setSelected] = useState(0);
    const [repoData, setRepoData] = useState([[]]);
    const [fetchedData, setFetchedData] = useState(false);
    const [showDiff, setShowDiff] = useState([]);

    const [allCommits, setAllCommits] = useState([]);

    const [started, setStarted] = useState(false);
    const [parsed, setParsed] = useState(false);

    const [rawCommits, setRawCommits] = useState("");
    const [parsedCommits, setParsedCommits] = useState([]);
    const [invalidCommits, setInvalidCommits] = useState([]);

    // const location = useLocation();
    // const queryParams = new URLSearchParams(location.search);
    // const commitData = queryParams.get('data');

    // let parsedData = {};
    // try {
    //     parsedData = JSON.parse(commitData);
    //     console.log(parsedData);
    // } catch (error) {
    //     console.log(error);
    // }

    const [username, setUsername] = useState("");
    const [minChanges, setMinChanges] = useState(0);
    const [repos, setRepos] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [fetching, setFetching] = useState(true);
    const [copy, setCopy] = useState(false);

    const [insertionsAverage, setInsertionsAverage] = useState(0);
    const [deletionsAverage, setDeletionsAverage] = useState(0);
    const [commitCount, setCommitCount] = useState(0);

    const [showDiffPopup, setShowDiffPopup] = useState(false);
    const [currentDiffCommit, setCurrentDiffCommit] = useState(null);

    // useEffect(() => {
    //     //populating repoData with empty arrays
    //     setRepoData(new Array(repos.length).fill([]));
    // },[repos]);

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

    useEffect(() => {
        console.log(repoData);
    }, [repoData]);


    async function getCommits(urls){
        const commits = [];
        //set of repos
        const reposSet = new Set();
        for (const url of urls) {
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
            commits.push(data);
            const repo = url.split('/repos/')[1].split('/commits')[0];
            reposSet.add(repo);
            //add to allCommits
            setAllCommits(prev => [...prev, data]);
        }

        //sort into repos, add repos and data to repodata
        let newRepoData = [];
        let newRepos =[];
        for (const repo of reposSet){
            //add to newRepos
            newRepos.push({path: repo});
            //add to newRepoData
            newRepoData.push([]);
        }

        commits.forEach(commit => {
            const repo = commit.url.split('/repos/')[1].split('/commits')[0];
            const index = newRepos.findIndex(r => r.path === repo);
            if(index !== -1){
                newRepoData[index].push(commit);
            }
        });
        console.log(newRepoData);

        setRepos(newRepos);
        setRepoData(newRepoData);
    }

    // useEffect(() => {
    //     // let url = 'https://api.github.com/repos/{repo}/commits?sha={branch}&since={start_date}T00:00:00Z&until={end_date}T23:59:59Z&author={username}'
    //     if(jwt){
            
    //     }

    //     // console.log(repos);

    // }, [jwt]);

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

    const onParseCommits = (e) => {
        const input = rawCommits;
        const { validLinks, nonValidLinks } = validateGithubCommitLinks(input);
        console.log(validLinks, nonValidLinks);
        setFetching(true);
        // setRepoData([]);
        setParsed(true);
        setParsedCommits(validLinks);
        setInvalidCommits(nonValidLinks);
    }

    const onGetCommits = async () => {
        setStarted(true);
        let urls = [];
        //pull from parsedCommits
        //example of a parsed-commit https://github.com/Study-Compass/Study-Compass/commit/c39c0613db17862137089a4a2e7706c31c243820
        parsedCommits.forEach(commit => {
            let newLink = commit.replace('github.com', 'api.github.com/repos').replace('commit', 'commits');
            urls.push(newLink);
            // urls.push(`${newLink}?author=${username}`);
        });
        console.log(urls);
        await getCommits(urls);
        setFetching(false);
    }


    return(
        <div className="commits paste-commits">
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
                        <h1>{selected === 0 ? "Paste Commits" : repos[selected-1].path}</h1>
                    </div>
                    <div className="commit-right-subheader">
                        {startDate && endDate ?<h2>{selected === 0 ? "showing all commits" : "showing select commits"} from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString() } </h2>
                         : 
                         <h2>{selected === 0 ? "showing all commits" : "showing select commits"}</h2>
                        } 
                        <h2>{selected !== 0 ? repos[selected-1].ignoreMerge ? ", ignoring merges": null : null}</h2>
                    </div>
                    {started ? 
                        <div className="commits-list">
                            <div className="commits-list-header">
                                <div className="flex">
                                    {fetching ?  <Loader /> : <Icon dimension={20} type={"Check"}/>}
                                    <h2>{selected === 0 ? allCommits.length : repoData[selected-1].length} commits</h2>
                                    <p>average deletions and insertions: </p>
                                    <div className="diff">
                                        <div className="deletion"></div>
                                        <p>{commitCount !== 0 ? (deletionsAverage/commitCount).toFixed(0) : 0}</p>
                                        <div className="insertion"></div>
                                        <p>{commitCount !== 0 ? (insertionsAverage/commitCount).toFixed(0) : 0}</p>
                                    </div>  
                                </div>

                            </div>
                            <div className="commits-content">
                                { selected === 0 ?
                                    allCommits.map((commit, index) => (
                                        <Commit index={index} commit={commit} key={`${commit.sha}${index}`} showDiff={()=>handleShowDiff(commit)}/>
                                    ))
                                    :
                                    repoData[selected-1].map((commit, index) => (
                                        <Commit index={index} commit={commit} key={`${commit.sha}${index}`} showDiff={()=>handleShowDiff(commit)}/>
                                    ))
                                }
                            </div>
                        </div>

                    :
                        parsed ? 
                            <div className="input">
                                <div className="parsed-commits">
                                    {parsedCommits.map((commit, index) => (
                                        <p className="parsed-commit">
                                            {commit}
                                        </p>
                                    ))}
                                </div>
                                {invalidCommits.length > 0 && 
                                    <div className="invalid-commits">
                                        <p>Caution: Filtered out invalid links</p>
                                        {invalidCommits.map((commit, index) => (
                                            <p className="parsed-commit invalid">
                                                {commit}
                                            </p>
                                        ))}
                                    </div>
                                }
                                <button className="button go" onClick={onGetCommits}>Get Commits</button>
                            </div>
                            
                            :
                            <div className="input">
                                <textarea name="s" id="" value={rawCommits} onChange={(e)=>setRawCommits(e.target.value)} ></textarea>
                                <button className="button go" onClick={onParseCommits}>Parse Commits</button>
                            </div>
                        
                    }

                </div>
            </div>
        </div>
    )
}

export default PasteCommits;