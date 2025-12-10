import { useState, useEffect } from "react";
import ImageColumn from "../components/ImageColumns.jsx";
import BlaxLoad from "../components/BlaxThink.jsx";
import { GET_Request } from "../connect/requests.js";
import { useParams } from "react-router-dom";

export default function SearchPinsView({ query }) {

    const {searchValue} = useParams();

    console.log(searchValue)

    const columnCount = 6;
    const [columnData, setColumnData] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!searchValue || searchValue.trim() === "") {
            setColumnData([]);
            return;
        }

        setLoaded(false);
        fetchPins();
    }, [searchValue]);

    async function fetchPins() {
        try {
            const data = await GET_Request({
                url: `http://localhost:3001/api/search?q=${searchValue}&type=pins`,
            });

            console.log(data);

            const pins = data.pins || [];
            setColumnData(DistributeItems(pins, columnCount));
            setLoaded(true);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div>
            {!loaded && <BlaxLoad />}

            {loaded && (
                <div className="columns">
                    {columnData.map((col, idx) => (
                        <ImageColumn key={idx} data={col} />
                    ))}
                </div>
            )}
        </div>
    );
}

const DistributeItems = (items, numColumns) => {
    const columns = Array.from({ length: numColumns }, () => []);
    const N = items.length;
    const base = Math.floor(N / numColumns);
    const remainder = N % numColumns;
    let index = 0;

    for (let i = 0; i < numColumns; i++) {
        const count = base + (i < remainder ? 1 : 0);
        const subset = items.slice(index, index + count);
        columns[i].push(...subset);
        index += count;
    }
    return columns;
};
