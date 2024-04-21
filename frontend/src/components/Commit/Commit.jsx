import React, { useEffect, useState } from "react";
import "./Commit.css";
import Icon from "../Icon/Icon";

function Commit({ commit }) {
    return (
        <div className="commit">
            <div className="commit-header">
                <h3>{commit.commit.message}</h3>
                <p>{commit.date}</p>
            </div>
            <p>{commit.message}</p>
        </div>
    );
}

export default Commit;

