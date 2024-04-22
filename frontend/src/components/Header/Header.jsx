import React from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

function Header(){
    const navigate = useNavigate();
    return (
        <div className="header">
            <div className="header-content">
                <h1 onClick={()=>{navigate('/')}}>Commit Getter</h1>
            </div>
        </div>
    )
}

export default Header;