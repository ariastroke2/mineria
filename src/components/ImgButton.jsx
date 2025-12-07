import iconReturn from "../resources/images/return-icon.svg";
import iconError from "../resources/images/error-icon.svg";

export default function ImageButton({ icon, callback }){

    if(icon == null)
        icon = iconError

    return <div className='imgbutton-container' onClick={() => callback()}>
        <div className='imgbutton-overlay'/>
        <img className='imgbutton-icon' src={icon}/> 
    </div>
}