import React from 'react';
import './Repo.css';

import Icon from '../Icon/Icon';

function Repo({}){

    const repo = {
        "path": "AZ0228/Study-Compass",
        "branches": ["main", "dev"],
        "commits": 5,
        "lastCommit": "2 days ago"  

    }
    return(
        <div className="repo">
            <div className="repo-header-left">
                <Icon dimension={20} type={"Repo"} />
                <a className="repo-path" href={`https://github.com/${repo.path}`}>
                    <h2>{repo["path"].split('/')[0]}/</h2>
                    <h3>{repo["path"].split('/')[1]}</h3>
                </a>
            </div>
            <div className="repo-header-right">
                <button className="secondary">
                    <Icon dimension={16} type={"Branch"} />
                    <p>main</p>
                    <Icon dimension={15} type={"DownArrow"}/>
                </button>
            </div>
        </div>
    )
}

export default Repo;