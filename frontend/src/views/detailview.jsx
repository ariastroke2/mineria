import ImgNavigationButton from "../components/ImgNavigationButton.jsx";

import ImageColumn from "../components/ImageColumns.jsx";
import ImageDetail from "../components/ImageDetail.jsx";

import { useParams } from "react-router-dom";

import { useState, useEffect } from "react";

import { GET_Request } from "../connect/requests.js";

import BlaxLoad from "../components/BlaxThink.jsx";

const url = "http://localhost:3001/api/pin/";

export default function Detailview() {

    const { id } = useParams();

    const columnCount = 5;
    const [columnData, setColumnData] = useState([]);
    const [detailData, setDetailData] = useState({});

    const [loaded, setLoaded] = useState(false);

    const firstThreeColumns = columnData.slice(0, 3);
    const nextTwoColumns = columnData.slice(3, 5);

    useEffect(() => {
        setLoaded(false);
        GetData();
    }, [id])

    async function GetData(){
            try{
                const data = await GET_Request({
                    url: (url+id)
                });
                
                setColumnData(DistributeItems(data.suggestedSimilarPins, columnCount));
                setDetailData(data.mainPin);

                setLoaded(true);

            }catch (error) {
    
                console.log(error);
            }
        }

    const [searchValue, setSearchValue] = useState("");

    const handleBlur = () => {
        setSearchValue("");
    };

    const handleChange = (event) => {
        setSearchValue(event.target.value);
    };

    //if(!loaded) 
    return (
        <div>
            {!loaded && <BlaxLoad />}     

            <div className="spacer" />

            <div className="columns">
                <div className="width60">
                    <div className="columns">
                    <div className="floatingimgbuttoncontainer">
                        <ImgNavigationButton />
                    </div>
                    <ImageDetail data={detailData} />
                    </div>
                    <div className="columns">
                        {columnData.slice(2, 5).map((item, index) => (
                            <ImageColumn key={index} data={item} />
                        ))}
                    </div>
                </div>
                {columnData.slice(0, 2).map((item, index) => (
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
