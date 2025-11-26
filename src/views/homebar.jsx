import { Link } from 'react-router-dom';

import Logo from "../resources/images/logo.png";

import IconHome from "../resources/images/home-icon.svg";
import IconSettings from "../resources/images/settings-icon.svg";

import ImageButton from '../components/ImgButton';

import "../styles/homebar.css";

export default function Homebar(){
    return (
        <nav className="homebar">
                <Link to="/"> 
                    <ImageButton icon={Logo} target={"/"}/>
                </Link>
                <div className='spacer'/>
                <Link to="/">
                    <ImageButton icon={IconHome} target={"/"}/>
                </Link>
                <div className='bigspacer'/>
                <Link to="/settings">
                    <ImageButton icon={IconSettings} target={"/settings"}/>
                </Link>
        </nav>
    )
}