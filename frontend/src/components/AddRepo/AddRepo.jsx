import React, {useState}from "react";
import "./AddRepo.css";

import Icon from "../Icon/Icon";

function AddRepo({handleSubmitPath, handleSubmitLink}) {    
    const [path, setPath] = useState('');
    const [link, setLink] = useState('');

    const onLinkChange = (e) => {
        setLink(e.target.value);
    }

    const onPathChange = (e) => {
        setPath(e.target.value);
    }

    const onSubmit = (e) => {
        e.preventDefault();
        //clear inputs
        setPath('');
        setLink('');

        if(path === ''){
            handleSubmitLink(link);
        } else {
            handleSubmitPath(path);
        }
    }


    return (
        <div className="add-repo">
            <div className="add-repo-header">
                <Icon dimension={16} type={"Plus"} />
                <h2>Add Repository</h2>
            </div>
            <form className="add-repo-form" onSubmit={onSubmit}>
                <input
                    type="text"
                    placeholder="Repository Path"
                    className="add-repo-input"
                    onChange={onPathChange}
                    value={path}
                />
                <p>or</p>
                <input
                    type="text"
                    placeholder="Repository Link"
                    className="add-repo-input"
                    onChange={onLinkChange}
                    value={link}
                />
                <button type="submit" className="button">Add</button>
            </form>
        </div>
    );
}

export default AddRepo;