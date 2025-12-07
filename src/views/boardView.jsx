import ImageColumn from "../components/ImageColumns.jsx";

import { useState, useEffect } from "react";

import BlaxLoad from "../components/BlaxThink.jsx";

import { GET_Request } from "../connect/requests.js";
import { useParams } from "react-router-dom";
import TitleBar from "../components/TitleBar.jsx";

const url = "http://localhost:3001/api/boards/";

export default function BoardView() {

    const { id } = useParams();

    const columnCount = 6;
    const [columnData, setColumnData] = useState([]);

    const [rawData, setRawData] = useState({});

    const [searchValue, setSearchValue] = useState("");

        const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(false);
        GetData();
    }, [])

    const handleBlur = () => {
        setSearchValue("");
    };

    const handleChange = (event) => {
        setSearchValue(event.target.value);
    };

    async function GetData(){
        try{
            const data = await GET_Request({
                url: `http://localhost:3001/api/boards/${id}`
            });

            console.log(data);

            setColumnData(DistributeItems(data?.pins, columnCount));

            setRawData(data);

            setLoaded(true);
        }catch (error) {

            console.log(error);
        }
    }

    return (
        <div className="paddedbox">
            {!loaded && <BlaxLoad />}      

            <TitleBar />

            <h1>{rawData?.title}</h1>
            <h2>{rawData?.description}</h2>

            <div className="spacer" />

            <div className="columns">
                {columnData.map((item, index) => (
                    <ImageColumn key={index} data={item} />
                ))}
            </div>
        </div>
    );
}

const DistributeItems = (items, numColumns) => {
    const columns = Array.from({ length: numColumns }, () => []);

    const N = items.length;
    const base = Math.floor(N / numColumns);
    const remainder = N % numColumns;

    let itemIndex = 0;

    for (let i = 0; i < numColumns; i++) {
        const count = base + (i < remainder ? 1 : 0);

        const columnItems = items.slice(itemIndex, itemIndex + count);
        columns[i].push(...columnItems);

        itemIndex += count;
    }

    return columns;
};
