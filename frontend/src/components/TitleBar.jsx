import { useState } from "react";
import blax from "../resources/blax/Blax_Happy.svg";

export default function(){

    const [field, setField] = useState("")

    return (
        <div className="title">
            <input placeholder="Buscar..." value={field} onChange={(e) => setField(e.target.value)} onBlur={(e) => setField("")}/>
                        
                    </div>
    )
}