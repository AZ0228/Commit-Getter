import React, { useState, useEffect } from 'react'
import './Home.css'
import '../../assets/Fonts/fonts.css'

import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import Icon from '../../components/Icon/Icon'
import MiniForm from '../../components/MiniForm/MiniForm'
import Repo from '../../components/Repo/Repo'

function Home(){
    const [numRepos, setNumRepos] = useState(0)
    const [repos, setRepos] = useState([])

    const addRepo = () => {
        console.log("Add Repo")
    }


    return (
        <div className="home">
            <Header/> 
            <div className="content-container">
                <div className="content">
                    <div className="content-header">
                        <div className="left">
                            <Icon dimension={30} type={"Github"} />
                            <MiniForm placeholderText={"Username"} buttonText={"Set"}/>
                            <MiniForm placeholderText={"Min Changes"} buttonText={"Set"}/>
                        </div>
                        <div className="right">
                            <button onClick={addRepo} className="button">Add Repo</button>
                        </div>
                    </div>
                    <div className="repos">
                        <Repo/>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}

export default Home