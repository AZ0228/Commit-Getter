import React, { useEffect, useState } from "react";
import "./Commit.css";
import Icon from "../Icon/Icon";
import { set } from "rsuite/esm/utils/dateUtils";

function Commit({ commit }) {
    const [loading, setLoading] = useState(true);
    const [isValid, setIsValid] = useState(true);
    const [path, setPath] = useState(commit.html_url.split('github.com/')[1].split('/commit')[0]);
    const [message, setMessage] = useState(commit.commit.message);
    const [copyIcon, setCopyIcon] = useState("Copy");
    //checking if commit link is valid

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
            setIsValid(true);
        }, 100);

    }, [commit]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(commit.html_url);
        setCopyIcon("Check1");
        setTimeout(() => {
            setCopyIcon("Copy");
        }, 1000);
    }

    return (
        <div className="commit">
            <div className="commit-left">
                <div className="commit-header">
                    <a href={commit.html_url} target="none"><h3 onClick={()=>{console.log('hi')}}>{message.length > 100 ? `${message.slice(0,100)} ...` : `${message}` }</h3></a>
                    <div className="subheading">
                        <p className="commit-path">{path}</p>

                        {commit.stats ? 
                            <div className="diff">
                                <div className="deletion"></div>
                                <p>{commit.stats.deletions}</p>
                                <div className="insertion"></div>
                                <p>{commit.stats.additions}</p>
                            </div>  
                            :
                            null  
                        }
                    </div>
                </div>
            </div>
            <div className="commit-right">
                <Icon dimension={16} type={"Calendar"} />
                <h3>{new Date(commit.commit.author.date).toLocaleDateString().slice(0, -5)}</h3>
                <hr />
                <a href={commit.html_url} target="none">                
                    <h3>{commit.sha.slice(0,6)}</h3>
                    <Icon dimension={16} type={"Open"} />
                </a>
                <a onClick={handleCopy}>
                    <Icon dimension={16} type={copyIcon} />
                </a>
            </div>
        </div>
    );
}

export default Commit;

