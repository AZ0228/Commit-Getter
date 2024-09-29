import React, { useEffect, useState } from "react";
import "./Commit.css";
import Icon from "../Icon/Icon";
import { set } from "rsuite/esm/utils/dateUtils";

function Commit({ index, commit, showDiff, showAuthor, error }) {
    const [path, setPath] = useState(error? null : commit.html_url.split('github.com/')[1].split('/commit')[0]);
    const [message, setMessage] = useState(error? null : commit.commit.message);
    const [copyIcon, setCopyIcon] = useState("Copy");
    const [animation, setAnimation] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setAnimation(false);
        }, 100);

    }, [commit]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(commit.html_url);
        setCopyIcon("Check1");
        setTimeout(() => {
            setCopyIcon("Copy");
        }, 1000);
    }

    if(error){
        return (
            <div className={`commit ${animation ? "before" : ""}`}>
                <div className="commit-left">
                    <div className="commit-header">
                        <h3>{error}</h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`commit ${animation ? "before" : ""}`}>
            <div className="commit-left">
                <div className="commit-header">
                    <a href={commit.html_url} target="none"><h3 onClick={()=>{console.log('hi')}}>{message.length > 100 ? `${message.slice(0,100)} ...` : `${message}` }</h3></a>
                    <div className="subheading">
                        <p className="commit-path">{path}</p>

                        {commit.stats &&
                            <div className="diff">
                                <div className="deletion"></div>
                                <p>{commit.stats.deletions}</p>
                                <div className="insertion"></div>
                                <p>{commit.stats.additions}</p>
                            </div>  
                        }
                        {
                            showAuthor && 
                            <div className="author">
                                <img src={commit.author.avatar_url} alt="" />
                                <p>{commit.author ? commit.author.login : commit.commit.author.name}</p>
                            </div>

                        }
                    </div>
                </div>
            </div>
            <div className="commit-right">
                <Icon dimension={16} type={"Calendar"} />
                <h3>{new Date(commit.commit.author.date).toLocaleDateString().slice(0, -5)}</h3>
                <hr />
                <a onClick={()=>showDiff(index)}>                
                    <h3>show diff</h3>
                </a>
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

