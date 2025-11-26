import d1 from "../debug/d1.png";
import d2 from "../debug/d2.png";
import d3 from "../debug/d3.png";
import d4 from "../debug/d4.png";
import d5 from "../debug/d5.png";
import d6 from "../debug/d6.png";
import d7 from "../debug/d7.png";
import d8 from "../debug/d8.png";
import d9 from "../debug/d9.png";
import d10 from "../debug/d10.png";
import d11 from "../debug/d11.png";
import d12 from "../debug/d12.png";
import d13 from "../debug/d13.png";
import d14 from "../debug/d14.png";
import d15 from "../debug/d15.png";

import { useState, useEffect } from "react";

import "../styles/imagepreview.css";

export default function ImagePreview() {

    const images = [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15];

    const randVal = Math.round(Math.random() * (images.length - 1));

    return (
        <div className = "previewcard" onClick={() => {console.log("clickety")}}>
            <div className="previewcard-imgcontainer">
                <div className="previewcard-actions">
                    <div className="paddedbox">
                    <button className="toprightcorner" onClick={(e) => {console.log("CLACK"); e.stopPropagation()}}>Clicky</button>
                    <button className="topleftcorner" onClick={(e) => {console.log("CLACK2"); e.stopPropagation()}}>Clicky2</button>
                    </div>
                </div>
                <img className="previewcard-img" src = {images[randVal]}/>
            </div>
            <p className="previewcard-name"> {randVal} Lorem Ipsum dolorem istane</p>


        </div>
    );
}

class base {
    static test = 1;
}

class test extends base{
    static test = 1;
}