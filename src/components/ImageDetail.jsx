import "../styles/imagedetail.css";

/* 
data object format

{
    id: "value",    // The id of the image
    title: "title", // Title of the post
    img: imgObj,   // The displaying image
}
*/

export default function ImagePreview({ data }) {

    return (
            <div className = "detailcard">
                <div className="detailcard-actions">
                        <div className="paddedbox">
                            <div className="toprightcorner"/>
                        <button onClick={(e) => {console.log("CLACK"); e.stopPropagation()}}>Clicky</button>
                        <button onClick={(e) => {console.log("CLACK2"); e.stopPropagation()}}>Clicky2</button>
                        </div>
                    </div>
                <div className="detailcard-container">
                    <img className="detailcard-img" src = {data.img}/>
                </div>
                <p className="detailcard-name"> {data.title}</p>


            </div>
    );
}