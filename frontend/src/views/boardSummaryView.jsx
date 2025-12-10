import "../styles/boardview.css";

import errorIcon from "../resources/images/error-icon.svg";

import ImgNavigationButton from "../components/ImgNavigationButton";

import { GET_Request, POST_Request } from "../connect/requests";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import BlaxLoad from "../components/BlaxThink";
import { GetUserID } from "../connect/auth";

const target_url = "http://localhost:3000/boards/"

export default function BoardSummaryView() {
    const { user } = useParams();
    const navigate = useNavigate();
    const currentUserId = GetUserID();

    const [boards, setBoards] = useState([]);
    const [userName, setUserName] = useState("");
    const [loaded, setLoaded] = useState(false);

    // Redirigir si el user de la URL no coincide con el usuario actual
    useEffect(() => {
        if (user !== currentUserId) {
            navigate(`/${currentUserId}/boards`, { replace: true });
        }
    }, [user, currentUserId, navigate]);

    useEffect(() => {
        setLoaded(false);
        GetData();
    }, [currentUserId]);

    async function GetData() {
        try {
            // Obtener boards del usuario actual
            const boardsData = await GET_Request({
                url: `http://localhost:3001/api/${currentUserId}/boards`,
            });
            setBoards(boardsData);

            // Obtener nombre del usuario
            const userData = await GET_Request({
                url: `http://localhost:3001/api/user/${currentUserId}`,
            });
            setUserName(userData?.name || currentUserId);

            setLoaded(true);
        } catch (error) {
            console.log(error);
            setUserName(currentUserId);
        }
    }

    function BoardDetailClick(value){
        navigate(target_url + value);
        window.scroll({top: 0});
    }

    return (
        <div>
            {!loaded && <BlaxLoad />}

            <div className="columns">
                <div className="floatingimgbuttoncontainer">
                    <ImgNavigationButton />
                </div>

                <div className="aligncenter">
                    <h1>Tableros de {userName}</h1>
                </div>
            </div>

            <div className="boardview-columns">
                <div className="boardcard boardcard-create" onClick={()=>navigate("/createboard")}>
                    <div className="boardcard-create-label">Crear</div>
                </div>
                {boards.map((item, index) => (
                    <CreateBoardCard key={index} boardData={item} />
                ))}
            </div>
        </div>
    );

    function CreateBoardCard({ boardData }) {
        return (
            <div className="boardcard" onClick={()=>BoardDetailClick(boardData.id)}>
                <div className="boardcard-images">
                    <img
                        className="boardcard-primary"
                        src={boardData?.images?.[0] ?? errorIcon}
                    />
                    <img
                        className="boardcard-complimentary"
                        src={boardData?.images?.[1] ?? errorIcon}
                    />
                    <img
                        className="boardcard-complimentary"
                        src={boardData?.images?.[2] ?? errorIcon}
                    />
                </div>

                <div className="boardcard-title">{boardData?.title}</div>
            </div>
        );
    }
}
