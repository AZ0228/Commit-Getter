import React from "react";
import "./AddRepo.css";

import Icon from "../Icon/Icon";

function AddRepo({handleSubmit}) {    

    return (
        <div className="add-repo">
            <div className="add-repo-header">
                <Icon dimension={16} type={"Plus"} />
                <h2>Add Repository</h2>
            </div>
            <div className="add-repo-form">
                <input
                    type="text"
                    placeholder="Repository Path"
                    className="add-repo-input"
                />
                <p>or</p>
                <input
                    type="text"
                    placeholder="Repository Link"
                    className="add-repo-input"
                />
                <button type="submit" className="button">Add</button>
            </div>
        </div>
    );
}

export default AddRepo;