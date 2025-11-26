import iconReturn from "../resources/images/return-icon.svg";
import iconError from "../resources/images/error-icon.svg";

import { useNavigate, useLocation } from 'react-router-dom';

export default function ImageButton({ icon, target }){

    if(target == null){
        target = "/"
        icon = iconReturn
    }

    if(icon == null)
        icon = iconError

    const navigate = useNavigate();

    function HandleClick(e){
        navigate(target);
        window.scroll({top: 0});
    }

    return <div className='imgbutton-container' onClick={HandleClick}>
        <div className='imgbutton-overlay'/>
        <img className='imgbutton-icon' src={icon}/> 
    </div>
}