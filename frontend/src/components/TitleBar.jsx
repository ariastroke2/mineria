import { useState } from "react";
import blax from "../resources/blax/Blax_Happy.svg";
import { useNavigate } from "react-router-dom";

export default function({ updateCallback, exitCallback }){

    const [field, setField] = useState("")

    const navigate = useNavigate();

    function FieldUpdate(event){
        setField((prevState) => {
            const val = event.target.value;

            navigate("/search/"+val)

            return val;
        });
    }

    function FieldBlur(event){
        setField("")
        
        // navigate("/");
    }

    return (
        <div className="title">
            <input placeholder="Buscar..." value={field} onChange={FieldUpdate} onBlur={FieldBlur}/>
                        
        </div>
    )
}