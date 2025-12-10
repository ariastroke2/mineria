import ImgNavigationButton from "../components/ImgNavigationButton";
import { GET_Request, POST_Request } from "../connect/requests";
import "../styles/creationpopup.css";

import iconError from "../resources/images/error-icon.svg"

import { GetUserID } from "../connect/auth";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreationPopup(){
    const [mode, setMode] = useState()

    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [img_url, setImg_url] = useState("");
    const [selectedBoard, setSelectedBoard] = useState("");

    const [boards, setBoards] = useState([]);

    const navigate = useNavigate();

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

                } catch (error) {
                console.log(error);
            }
        }

    async function PostPin(){
        try{
            const url = `http://localhost:3001/api/pins`;
            console.log(url)
            console.log({
                userId: GetUserID(),
                title: title,
                description: desc,
                url_image: url,
                boardId: selectedBoard
            })
            const data = await POST_Request({url: url, data: {
                userId: GetUserID(),
                title: title,
                description: desc,
                url_image: img_url,
                boardId: selectedBoard
            }});

            console.log(data)

            navigate(`/win/${data.id}`)
        }catch (error){
            console.log(error);
        }
    }

    useEffect(() => {
            GetSelectableBoards();
        }, [/* mode */]);

    useEffect(() => {
        if (!img_url) return;

        validateImage(img_url).then(isValid => {
            setImg_url(isValid ? img_url : "");
        });
    }, [img_url]);

    return (
        <div className="popup">
            <div className="popup-background"/>
            <div className="popup-content rows paddedbox alignbottom">
            <div className="paddedbox columns fillbox">
                <div className="paddedbox rows width60">
                    <div className="columns">
                        <div className="floatingimgbuttoncontainer nomargin">
                            <ImgNavigationButton/>
                        </div>
                        <h1 className="aligncenter">Crear pin</h1>
                    </div>
                    <label>Título</label>
                    <input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)}/>

                    <label>Descripción</label>
                    <input placeholder="Descripción" value={desc} onChange={(e) => setDesc(e.target.value)}/>

                    <label>Board</label>
                    <select value={selectedBoard} onChange={(e) => setSelectedBoard(e.target.value)}>
                        {boards.map((item, index)=>{
                            return <option value={item.id} key={index}>{item.title}</option>
                        })}
                    </select>

                    <div className="bigspacer" />

                    <label>URL</label>
                    <input placeholder="URL" value={img_url} onChange={(e) => setImg_url(e.target.value)}/>
                </div>
                <img className="popup-preview aligncenter" src={img_url && img_url.length > 0 ? img_url : iconError}/>
            </div>
            <button className="alignleft alignbottom" onClick={PostPin}>Publicar</button>
            </div>
        </div>
    )

    function validateImage(url) {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => resolve(true);   // La imagen cargó bien
        img.onerror = () => resolve(false); // Error cargando
        img.src = url;
    });
}
}