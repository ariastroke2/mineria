import { useState } from "react";

import ImageColumn from "../components/ImageColumns.jsx";

import { GetItems } from "../debug/debugItems.jsx";
import profilePic from "../debug/p1.png";

import "../styles/profileview.css";
import BlaxLoad from "../components/BlaxThink.jsx";

const mockUser = {
    username: "@xime_macias",
    profileImage: profilePic
};

const mockSavedPins = GetItems(24);
const mockLikedPins = GetItems(18);

export default function ProfileView() {
    const columnCount = 6;

    const [user] = useState(mockUser);
    const [savedPins] = useState(mockSavedPins);
    const [likedPins] = useState(mockLikedPins);
    const [activeTab, setActiveTab] = useState('saved');

    const currentPins = activeTab === 'saved' ? savedPins : likedPins;
    const columnData = DistributeItems(currentPins, columnCount);

    return (
        <div>
            {/*!loaded && <BlaxLoad />*/}     
            
        <div className="profile-container">
            <div className="profile-header">
                {user && (
                    <>
                        <img 
                            className="profile-image" 
                            src={user.profileImage} 
                            alt={user.username} 
                        />
                        <h1 className="profile-username">{user.username}</h1>
                    </>
                )}
            </div>

            <div className="profile-tabs">
                <button 
                    className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('saved')}
                >
                    Guardados
                </button>
                <button 
                    className={`profile-tab ${activeTab === 'liked' ? 'active' : ''}`}
                    onClick={() => setActiveTab('liked')}
                >
                    Likes
                </button>
            </div>

            <div className="profile-content">
                {currentPins.length > 0 ? (
                    <div className="columns">
                        {columnData.map((item, index) => (
                            <ImageColumn key={index} data={item} />
                        ))}
                    </div>
                ) : (
                    <p className="profile-empty">
                        {activeTab === 'saved' 
                            ? 'No tienes pines guardados aún' 
                            : 'No has dado like a ningún pin aún'}
                    </p>
                )}
            </div>
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

