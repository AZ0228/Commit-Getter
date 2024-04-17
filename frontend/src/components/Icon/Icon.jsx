import React from 'react';

import Branch from '../../assets/Icons/Branch.svg';
import Calendar from '../../assets/Icons/Calendar.svg';
import Check from '../../assets/Icons/Check.svg';
import Copy from '../../assets/Icons/Copy.svg';
import DownArrow from '../../assets/Icons/DownArrow.svg';
import Github from '../../assets/Icons/Github.svg';
import Open from '../../assets/Icons/Open.svg';
import Repo from '../../assets/Icons/Repo.svg';



function Icon({dimension, type}){
    const icon = {
        "Branch": Branch,
        "Calendar": Calendar,
        "Check": Check,
        "Copy": Copy,
        "DownArrow": DownArrow,
        "Github": Github,
        "Open": Open,
        "Repo": Repo
    } 
    
    if(!icon[type]){
        return null;
    }

    if(!dimension){
        return(
            <img style={{width:`100%`, height:`100%`}} src={icon[type]} alt="" />
        )
    }

    return(
        <img style={{width:`${dimension}px`, height:`${dimension}px`}} src={icon[type]} alt="" />
    )
}

export default Icon;