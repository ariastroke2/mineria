import { Link } from 'react-router-dom';

import { useState, useEffect } from "react";

import Logo from "../resources/images/logo.png";

import IconDebug from "../resources/images/debug-icon.svg"

import ImageButton from '../components/ImgButton';

import IconCheck from "../resources/images/check-icon.svg"
import IconX from "../resources/images/x-icon.svg"

import { GET_Request } from '../connect/requests';

import "../styles/homebar.css";

export default function DebugView(){

    const [command, setCommand] = useState("https://jsonplaceholder.typicode.com/todos/41");
    const [output, setOutput] = useState("");

    async function testEndpoint(){
        try{
            const data = await GET_Request({
                url: command
            });
            
            setOutput(JSON.stringify(data));
        }catch (error) {

            setOutput(error);
        }
        
    }

    return (
        <div className='paddedbox'>
            <div className='rows'>
                <div className='columns'>
                    <div className='floatingimgbuttoncontainer'>
                        <ImageButton />
                    </div>

                    <div className='aligncenter'>
                        <img className='floatingimgbuttoncontainer' src = {IconDebug} />
                        <h1>Debug</h1>
                    </div>

                </div>

                <input
                    placeholder="Dirección del endpoint"
                    value={command} // El valor del input es controlado por el estado
                    onChange={(e) => setCommand(e.target.value)} // Actualiza el estado al escribir
                />

                <div className='spacer' />

                <div className='columns'>
                    <div className='bigspacer' />
                    <button onClick={()=>testEndpoint()}>Ejecutar</button>
                </div>

                <div className='spacer' />

                <textarea 
                    placeholder="Resultado"
                    value={output} // El valor del input es controlado por el estado
                    onChange={(e) => setOutput(e.target.value)} // Actualiza el estado al escribir
                />               

            </div>

        </div>
    )
}