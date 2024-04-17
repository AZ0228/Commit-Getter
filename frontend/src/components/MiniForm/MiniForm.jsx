import React from 'react';
import './MiniForm.css';

function MiniForm({placeholderText, buttonText, onSubmit}){
    return(
        <div className="mini-form">
            <input type="text" placeholder={placeholderText}/>
            <button>{buttonText}</button>
        </div>
    )
}

export default MiniForm;