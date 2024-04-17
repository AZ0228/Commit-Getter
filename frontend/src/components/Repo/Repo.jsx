import React from 'react';
import './Repo.css';

import Icon from '../Icon/Icon';

function Repo({repo}){
    return(
        <div className="repo">
            <div className="repo-header">
                <div className="left">
                    <Icon dimension={16} type={"Repo"} />
                    <h3>Study-Compass</h3>
                </div>
                <div className="right">
                    <button className="secondary">
                        <Icon dimension={16} type={"Branch"} />
                    </button>
                </div>
            </div>
            <div className="repo-info">
                <div className="left">
                    </div>
                <div className="right">
                    {/* <Icon dimension={20} type={"Check"} />
                    <Icon dimension={20} type={"Calendar"} /> */}
                </div>
            </div>
        </div>
    )
}

export default Repo;