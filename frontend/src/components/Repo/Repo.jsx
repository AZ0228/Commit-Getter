import React from 'react';
import './Repo.css';

import Icon from '../Icon/Icon';

function Repo({repo, num, showPopup, setShowPopup, handleBranchChange}){
    return(
        <div className="repo">
            <div className="repo-header-left">
                <Icon dimension={20} type={"Repo"} />
                <a className="repo-path" href={repo.link}>
                    <h2>{repo["path"].split('/')[0]}/</h2>
                    <h3>{repo["path"].split('/')[1]}</h3>
                </a>
            </div>
            <div className="repo-header-right">
                <button 
                    className="secondary" 
                    onClick={()=>{setShowPopup(num === showPopup ? null : num)}}
                    style={num === showPopup ? {backgroundColor: "#31363E"}: null}
                >
                    <Icon dimension={16} type={"Branch"} />
                    <p>{repo.branches[repo.chosenBranchIndex]}</p>
                    <Icon dimension={15} type={"DownArrow"}/>
                </button>
            </div>
            {num === showPopup && <div className="branches-popup">
                <div className="branches-header">
                    <h3>Switch branches</h3>
                    <button onClick={()=>{setShowPopup(null)}}>
                        <Icon dimension={13} type={"X"}/>
                    </button>
                </div>
                <div className="branches">
                    {repo.branches.map((branch, index) => (
                        <div className="branch-container" key={`${index}${branch}`} onClick={()=>{handleBranchChange(num,index); setShowPopup(null)}}>
                            {branch === repo.branches[repo.chosenBranchIndex] && 
                                <div className="check">
                                    <Icon dimension={14} type={"Check1"} />
                                </div>
                            }
                            <div className="branch" >
                                <p>{branch}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="branches-footer"></div>
            </div>}
        </div>
    )
}

export default Repo;