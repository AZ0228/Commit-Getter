import React, {useState, useEffect} from 'react';
import './MiniForm.css';

function MiniForm({placeholderText, buttonText, value, onSubmit}){
    const [inputValue, setInputValue] = useState(value);
    const [editing, setEditing] = useState(value === '');

    const handleChange = (e) => {
        setInputValue(e.target.value);
    }

    useEffect(() => {
        if(value === ''){
            setEditing(true);
        } else {
            setEditing(false);
        }
    },[value])

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(inputValue);
        setEditing(false);
    };

    return(
        <div className="mini-form">
            {editing && value === '' ? 
                <form className="mini-form" onSubmit={handleSubmit}>
                    <input type="text" placeholder={placeholderText} value={inputValue} onChange={handleChange}/>
                    <button type="submit">{buttonText}</button>
                </form>
                : 
                <div className="set" onClick={()=>{setEditing(true)}}>
                    <p>{placeholderText}: <b>{value}</b></p> 
                </div>
            }
        </div>
    )
}

export default MiniForm;