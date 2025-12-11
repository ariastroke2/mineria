import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Logo from "../resources/images/Logo.svg";

import IconHome from "../resources/images/home-icon.svg";
import IconSettings from "../resources/images/settings-icon.svg";
import IconCreate from "../resources/images/create-icon.svg"
import IconDebug from "../resources/images/debug-icon.svg"
import IconProfile from "../resources/images/profile-icon.svg"
import IconBoard from "../resources/images/board-icon.svg"
import IconFire from "../resources/images/fire-icon.svg"

import ImgNavigationButton from '../components/ImgNavigationButton';

import "../styles/homebar.css";
import { GetUserID } from '../connect/auth';

export default function Homebar(){
    const [userId, setUserId] = useState(GetUserID());
    
    useEffect(() => {
        setUserId(GetUserID());
    }, []);

    const boardsPath = `/${userId}/boards`;
    const profilePath = `/${userId}/profile`;

    return (
        <nav className="homebar">
                <Link to="/"> 
                    <ImgNavigationButton icon={Logo} target={"/"}/>
                </Link>
                <div className='spacer'/>
                <Link to="/">
                    <ImgNavigationButton icon={IconHome} target={"/"}/>
                </Link>
                <Link to="/trending">
                    <ImgNavigationButton icon={IconFire} target={"/trending"}/>
                </Link>
                <Link to="/create">
                    <ImgNavigationButton icon={IconCreate} target={"/create"}/>
                </Link>
                <Link to={boardsPath}>
                    <ImgNavigationButton icon={IconBoard} target={boardsPath}/>
                </Link>
                
                <div className='bigspacer'/>
                <Link to={profilePath}>
                    <ImgNavigationButton icon={IconProfile} target={profilePath}/>
                </Link>
                
        </nav>
    )
}

/*
<Link to="/settings">
                    <ImgNavigationButton icon={IconSettings} target={"/settings"}/>
                </Link>

<Link to="/debug">
                    <ImgNavigationButton icon={IconDebug} target={"/debug"}/>
                </Link>
*/