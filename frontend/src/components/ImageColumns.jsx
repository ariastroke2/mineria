import ImagePreview from "./ImagePreview";


/* 
data object format
[
    {
        id: "value",    // The id of the image
        title: "title", // Title of the post
        img: imgObj,   // The displaying image
    } ,
    {
        id: "value",    // The id of the image
        title: "title", // Title of the post
        img: imgObj,   // The displaying image
    }
]
*/

export default function ImageColumn({ data }) {

    return (
        <div className = "image-column">
            {data.map((item, index)=><ImagePreview key={index} data={item}/>)}
        </div>
    );
}