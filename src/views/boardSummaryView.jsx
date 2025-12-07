import "../styles/boardview.css";

import errorIcon from "../resources/images/error-icon.svg";

import ImgNavigationButton from "../components/ImgNavigationButton";

import { GET_Request, POST_Request } from "../connect/requests";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import BlaxLoad from "../components/BlaxThink";
import TitleBar from "../components/TitleBar";

const target_url = "http://localhost:3000/boards/"

export default function BoardSummaryView() {
    const { user } = useParams();

    const [boards, setBoards] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(false);
        GetData();
    }, [user]);

    async function GetData() {
        try {
            const data = await GET_Request({
                url: "http://localhost:3001/api/USER-001/boards",
            });

            console.log(data);

            setBoards(data);

            setLoaded(true);
        } catch (error) {
            console.log(error);
        }
    }

    const navigate = useNavigate();

    function BoardDetailClick(value){
        navigate(target_url + value);
        window.scroll({top: 0});
    }

    return (
        <div>
            {!loaded && <BlaxLoad />}

            <TitleBar />

            <div className="columns">
                <div className="floatingimgbuttoncontainer">
                    <ImgNavigationButton />
                </div>

                <div className="aligncenter">
                    <img className="floatingimgbuttoncontainer" src={null} />
                    <h1>Tableros de {" data"}</h1>
                </div>
            </div>

            <div className="boardview-columns">
                <div className="boardcard boardcard-create">
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
