import { useNavigate } from "react-router-dom";

import "../styles/imagepreview.css";

/* 
data object format

{
    id: "value",    // The id of the image
    title: "title", // Title of the post
    img: imgObj,   // The displaying image
}
*/

export default function ImagePreview({ data }) {
    const navigate = useNavigate();

    function HandleClick(e) {
        navigate(`/win/${data.id}`);
        window.scroll({ top: 0 });
    }

    return (
        <div className="previewcard" onClick={HandleClick}>
            <div className="previewcard-imgcontainer">
                <div className="previewcard-actions">
                    <div className="paddedbox">
                        <button
                            className="toprightcorner"
                            onClick={(e) => {
                                console.log("CLACK");
                                e.stopPropagation();
                            }}
                        >
                            Clicky
                        </button>
                        <button
                            className="topleftcorner"
                            onClick={(e) => {
                                console.log("CLACK2");
                                e.stopPropagation();
                            }}
                        >
                            Clicky2
                        </button>
                    </div>
                </div>
                <img className="previewcard-img" src={data.img} />
            </div>
            <p className="previewcard-name"> {data.title}</p>
        </div>
    );
}