import ImageColumn from "../components/ImageColumns.jsx";

import { useState, useEffect } from "react";

import BlaxLoad from "../components/BlaxThink.jsx";

import { GET_Request } from "../connect/requests.js";

const url = "http://localhost:3001/api/pins?userId=USER-001";

export default function Homepage() {
    const columnCount = 6;
    const [columnData, setColumnData] = useState([]);

    const [searchValue, setSearchValue] = useState("");

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(false);
        GetData();
    }, []);

    const handleBlur = () => {
        setSearchValue("");
    };

    const handleChange = (event) => {
        setSearchValue(event.target.value);
    };

    async function GetData() {
        try {
            const data = await GET_Request({
                url: url,
            });

            setColumnData(DistributeItems(data, columnCount));

            setLoaded(true);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            {!loaded && <BlaxLoad />}

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
