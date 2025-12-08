import { useState } from "react";
import "../styles/creationpopup.css";
import ImgNavigationButton from "../components/ImgNavigationButton";
import { POST_Request } from "../connect/requests";
import { GetUserID } from "../connect/auth";
import { useNavigate } from "react-router-dom";

export default function CreateBoard() {

    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");

    const navigate = useNavigate();

    async function PostBoard() {
        try {
            const url = `http://localhost:3001/api/boards`;

            const data = await POST_Request({
                url: url,
                data: {
                    userId: GetUserID(),
                    title: title,
                    description: desc
                }
            });

            navigate(`/boards/${data.id}`);
        } catch (error) {
            console.log(error);
        }
    }

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
                            <h1 className="aligncenter">Crear board</h1>
                        </div>

                        <label>Título</label>
                        <input 
                            placeholder="Título"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <label>Descripción</label>
                        <input 
                            placeholder="Descripción"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>
                </div>

                <button className="alignleft alignbottom" onClick={PostBoard}>
                    Crear
                </button>
            </div>
        </div>
    );
}
