import ImgButton from "../components/ImgButton.jsx";

import ImageColumn from "../components/ImageColumns.jsx";
import ImageDetail from "../components/ImageDetail.jsx";

import { useParams } from "react-router-dom";

import { useState, useEffect } from "react";

import { GetItem, GetItems } from "../debug/debugItems.jsx";

export default function Detailview() {
    const { id } = useParams();

    const columnCount = 5;
    const columnData = DistributeItems(GetItems(100), columnCount);

    const firstThreeColumns = columnData.slice(0, 3);
    const nextTwoColumns = columnData.slice(3, 5);

    console.log(columnData);

    const [searchValue, setSearchValue] = useState("");

    const handleBlur = () => {
        setSearchValue("");
    };

    const handleChange = (event) => {
        setSearchValue(event.target.value);
    };

    return (
        <div>
            <input
                placeholder="Buscar..."
                value={searchValue} // El valor del input es controlado por el estado
                onChange={handleChange} // Actualiza el estado al escribir
                onBlur={handleBlur}
            />

            <div className="spacer" />

            <div className="columns">
                <div className="width60">
                    <div className="columns">
                    <div className="floatingimgbuttoncontainer">
                        <ImgButton />
                    </div>
                    <ImageDetail data={GetItem(id)} />
                    </div>
                    <div className="columns">
                        {firstThreeColumns.map((item, index) => (
                            <ImageColumn key={index} data={item} />
                        ))}
                    </div>
                </div>
                {nextTwoColumns.map((item, index) => (
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
