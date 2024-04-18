import React from 'react';
import './Commits.css';
import { useLocation } from 'react-router-dom';

import Header from '../../components/Header/Header';

function Commits(){
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const commitData = queryParams.get('data');

    let parsedData = {};
    try {
        parsedData = JSON.parse(commitData);
    } catch (error) {
        console.log(error);
    }

    const username = parsedData.username; 
    const minChanges = parsedData.minChanges;
    const repos = parsedData.repos;



    return(
        <div className="commits">
            <Header />
            <div className="container">
                <div className="left"></div>
                <div className="right"></div>
            </div>
            <div className="commits-list">
                {/* {commits.map((commit, index) => (
                    <div className="commit" key={`${index}${commit}`}>
                        <div className="commit-header">
                            <h3>{commit.author}</h3>
                            <p>{commit.date}</p>
                        </div>
                        <p>{commit.message}</p>
                    </div>
                ))} */}
            </div>
        </div>
    )
}

export default Commits;