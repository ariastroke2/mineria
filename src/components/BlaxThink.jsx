import Blax_Think from "../resources/blax/Blax_Think.svg";

import "../styles/blax.css";

export default function BlaxLoad(){
    return <div className="blaxcard">
        <div className="aligncenter">
            <div className="rows">
                <img src = {Blax_Think} className="blaxcard-img"/>
                <p>Blax está pensando...</p>
            </div>
        </div>
    </div>
}