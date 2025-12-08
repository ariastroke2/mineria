import { useEffect, useState } from "react";
import "../styles/imagedetail.css";
import ImageButton from "./ImgButton";
import { GET_Request, POST_Request } from "../connect/requests";
import { GetUserID } from "../connect/auth";

/* 
data object format

{
    id: "value",    // The id of the image
    title: "title", // Title of the post
    img: imgObj,   // The displaying image
}
*/

export default function ImagePreview({ data }) {
    useEffect(() => {
        setDisplay(data);
        setComments(data.comments);
        setWritingComment("");
        GetSelectableBoards();
    }, [data]);

    const [display, setDisplay] = useState(data);
    const [comments, setComments] = useState([]);

    const [alreadySaved, setAlreadySaved] = useState(false);

    const [selectedBoard, setSelectedBoard] = useState("");

    const [boards, setBoards] = useState([]);

    const [writingComment, setWritingComment] = useState("");

    async function GetSelectableBoards() {
        try {
            const data = await GET_Request({
                url: `http://localhost:3001/api/${GetUserID()}/boards`,
            });

            console.log(data);

            setBoards(data);
            if (data.length > 0) {
                setSelectedBoard(data[0].id);
            }

            setAlreadySaved(
                boards.some(
                    (b) =>
                        b.id === selectedBoard &&
                        b.images &&
                        b.images.includes(display.url_image)
                )
            );
        } catch (error) {
            console.log(error);
        }
    }

    const areCommentsNull = () => {
        return comments === null || comments === undefined;
    };

    function captureComment(e) {
        setWritingComment(e.target.value);
    }

    async function postComment() {
        try {
            const url = `http://localhost:3001/api/pins/${data.id_pin}/comment`;
            console.log(url);
            await POST_Request({
                url: url,
                data: { userId: "USER-001", text: writingComment },
            });

            setComments((prev) => [
                ...prev,
                { author: "USER-001", authorPic: null, text: writingComment },
            ]);
        } catch (error) {
            console.log(error);
        }
    }

    async function savePinToBoard() {
        try {
            const url = `http://localhost:3001/api/boards/${selectedBoard}/add-pin`;
            await POST_Request({
                url: url,
                data: {
                    pinId: data.id_pin,
                },
            });
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="detailcard">
            <div className="detailcard-actions">
                <div className="columns paddedbox">
                    <select
                        value={selectedBoard}
                        onChange={(e) => setSelectedBoard(e.target.value)}
                    >
                        {boards.map((item, index) => {
                            return (
                                <option value={item.id} key={index}>
                                    {item.title}
                                </option>
                            );
                        })}
                    </select>
                    <div className="spacer" />
                    <button
                        disabled={alreadySaved}
                        onClick={(e) => {
                            e.stopPropagation();
                            savePinToBoard();
                        }}
                    >
                        Guardar
                    </button>
                </div>
            </div>
            <div className="detailcard-container">
                <img className="detailcard-img" src={display.url_image} />
            </div>
            <h4 className="detailcard-name"> {display.title}</h4>
            <p className="detailcard-name"> {display.description}</p>

            {!areCommentsNull() &&
                comments.map((item, index) => {
                    return (
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
                    );
                })}

            <div className="paddedbox">
                <div className="columns">
                    <input
                        placeholder="Escribir un comentario..."
                        className="aligncenter"
                        value={writingComment}
                        onChange={captureComment}
                    />
                    <div className="aligncenter">
                        <div className="floatingimgbuttoncontainer">
                            <ImageButton callback={postComment} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
