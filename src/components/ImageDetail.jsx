import { useEffect, useState } from "react";
import "../styles/imagedetail.css";
import ImageButton from "./ImgButton";
import { POST_Request } from "../connect/requests";

/* 
data object format

{
    id: "value",    // The id of the image
    title: "title", // Title of the post
    img: imgObj,   // The displaying image
}
*/

export default function ImagePreview({ data }) {

    useEffect(()=>{
        setDisplay(data)
        setComments(data.comments)
        setWritingComment("");
    }, [data])

    const [display, setDisplay] = useState(data);
    const [comments, setComments] = useState([]);

    const [writingComment, setWritingComment] = useState("");

    console.log(data)

    const areCommentsNull = () => {
        return comments === null || comments === undefined
    }

    function captureComment(e){
        setWritingComment(e.target.value)
    }

    async function postComment(){
        try{
            const url = `http://localhost:3001/api/pins/${data.id_pin}/comment`;
            console.log(url)
            await POST_Request({url: url, data: {userId:"USER-001",text:writingComment}});

            setComments(prev => [...prev, {author: "USER-001",
                authorPic: null,
                text:writingComment,
            }]);
        }catch (error){
            console.log(error);
        }
    }

    return (
            <div className = "detailcard">
                <div className="detailcard-actions">
                    <div className="paddedbox">
                        <button onClick={(e) => {console.log("CLACK"); e.stopPropagation()}}>Guardar</button>
                    </div>
                </div>
                <div className="detailcard-container">
                    <img className="detailcard-img" src = {display.url_image}/>
                </div>
                <h4 className="detailcard-name"> {display.title}</h4>
                <p className="detailcard-name"> {display.description}</p>

                {!areCommentsNull() && comments.map((item, index)=>{
                    return(
                        <div className="detailcard-commentcard"> 
                            <div className="columns">
                                <div className="floatingimgbuttoncontainer">
                                    <img src={item.authorPic} />
                                    </div>
                                    <div className="rows">
                                <h5>{item.author}</h5>
                                <p>{item.text}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}

                <div className="paddedbox">
                    <div className="columns">
                        <input placeholder="Escribir un comentario..." className="aligncenter" value={writingComment} onChange={captureComment}/>
                        <div className="aligncenter">
                        <div className="floatingimgbuttoncontainer">
                            <ImageButton callback = {postComment}/>
                        </div>
                        </div>
                    </div>
                </div>
                


            </div>
    );
}