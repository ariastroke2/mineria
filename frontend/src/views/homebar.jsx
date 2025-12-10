import { Link } from 'react-router-dom';

import Logo from "../resources/images/logo.png";

import IconHome from "../resources/images/home-icon.svg";
import IconSettings from "../resources/images/settings-icon.svg";
import IconCreate from "../resources/images/create-icon.svg"
import IconDebug from "../resources/images/debug-icon.svg"
import IconProfile from "../resources/images/profile-icon.svg"
import IconBoard from "../resources/images/board-icon.svg"

import ImgNavigationButton from '../components/ImgNavigationButton';

import "../styles/homebar.css";

export default function Homebar(){
    return (
        <nav className="homebar">
                <Link to="/"> 
                    <ImgNavigationButton icon={Logo} target={"/"}/>
                </Link>
                <div className='spacer'/>
                <Link to="/">
                    <ImgNavigationButton icon={IconHome} target={"/"}/>
                </Link>
                <Link to="/create">
                    <ImgNavigationButton icon={IconCreate} target={"/create"}/>
                </Link>
                <Link to="/USER-001/boards">
                    <ImgNavigationButton icon={IconBoard} target={"/USER-001/boards"}/>
                </Link>
                <Link to="/debug">
                    <ImgNavigationButton icon={IconDebug} target={"/debug"}/>
                </Link>
                <div className='bigspacer'/>
                <Link to="/profile">
                    <ImgNavigationButton icon={IconProfile} target={"/profile"}/>
                </Link>
                <Link to="/settings">
                    <ImgNavigationButton icon={IconSettings} target={"/settings"}/>
                </Link>
        </nav>
    )
}