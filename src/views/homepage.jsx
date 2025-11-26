
import ImageColumn from "../components/ImageColumns.jsx"

import { useState, useEffect } from "react";

export default function Homepage(){

const [searchValue, setSearchValue] = useState('');

const handleBlur = () => {
    setSearchValue('');
  };

  const handleChange = (event) => {
    setSearchValue(event.target.value);
  };

    return (
<div>
    <input placeholder="Buscar..." 
    value={searchValue} // El valor del input es controlado por el estado
      onChange={handleChange} // Actualiza el estado al escribir
      onBlur={handleBlur}
    
    />

    <div className="spacer"/>

    <div className='columns'>
        < ImageColumn />
        < ImageColumn />
        < ImageColumn />
        < ImageColumn />
        < ImageColumn />
        < ImageColumn />


        </div>

</div>        
    )
}