import { Link } from 'react-router-dom';

import Logo from "../resources/images/logo.png";

import IconHome from "../resources/images/home-icon.svg";
import IconSettings from "../resources/images/settings-icon.svg";


import "../styles/homebar.css";

export default function Homebar(){
    return (
        <nav className="homebar">
                <Link to="/" className='homebar-item'> 
                    <div className='homebar-overlay'/>
                    <img className='homebar-icon' src={Logo}/> 
                </Link>
                <div className='spacer'/>
                <Link to="/about" className='homebar-item'>
                    <div className='homebar-overlay'/>
                    <img className='homebar-icon' src={IconHome}/> 
                </Link>
                <div className='bigspacer'/>
                <Link to="/contact" className='homebar-item'>
                    <div className='homebar-overlay'/>
                    <img className='homebar-icon' src={IconSettings}/> 
                </Link>
        </nav>
    )
}