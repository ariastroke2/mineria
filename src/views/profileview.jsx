import { useState, useEffect } from "react";

import ImageColumn from "../components/ImageColumns.jsx";

import { GET_Request } from "../connect/requests.js";
import { GetUserID } from "../connect/auth.js";

import "../styles/profileview.css";
import BlaxLoad from "../components/BlaxThink.jsx";

export default function ProfileView() {
    const columnCount = 6;

    const [user, setUser] = useState(null);
    const [savedPins, setSavedPins] = useState([]);
    const [likedPins, setLikedPins] = useState([]);
    const [activeTab, setActiveTab] = useState('saved');
    const [loaded, setLoaded] = useState(false);
    
    // Estados para followers y following
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);

    useEffect(() => {
        fetchProfileData();
    }, []);

    async function fetchProfileData() {
        const userId = GetUserID();
        try {
            // Obtener datos del usuario, pins guardados, pins likeados, followers y following
            const [userData, savedData, likedData, followersData, followingData] = await Promise.all([
                GET_Request({ url: `http://localhost:3001/api/user/${userId}` }),
                GET_Request({ url: `http://localhost:3001/api/user/${userId}/saved-pins` }),
                GET_Request({ url: `http://localhost:3001/api/user/${userId}/liked-pins` }),
                GET_Request({ url: `http://localhost:3001/api/users/${userId}/followers` }),
                GET_Request({ url: `http://localhost:3001/api/users/${userId}/following` })
            ]);

            setUser({
                username: userData.name || userData.username || "Usuario",
                profileImage: userData.profile_picture
            });
            setSavedPins(savedData);
            setLikedPins(likedData);
            setFollowers(followersData);
            setFollowing(followingData);
            setLoaded(true);
        } catch (error) {
            console.error("Error cargando perfil:", error);
            setLoaded(true);
        }
    }

    const currentPins = activeTab === 'saved' ? savedPins : likedPins;
    const columnData = DistributeItems(currentPins, columnCount);

    return (
        <div>
            {!loaded && <BlaxLoad />}     
            
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
                        
                        {/* Followers y Following */}
                        <div className="profile-stats">
                            <button 
                                className="profile-stat"
                                onClick={() => setShowFollowersModal(true)}
                            >
                                <span className="stat-count">{followers.length}</span>
                                <span className="stat-label">Followers</span>
                            </button>
                            <button 
                                className="profile-stat"
                                onClick={() => setShowFollowingModal(true)}
                            >
                                <span className="stat-count">{following.length}</span>
                                <span className="stat-label">Following</span>
                            </button>
                        </div>
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

        {/* Modal de Followers */}
        {showFollowersModal && (
            <div className="modal-overlay" onClick={() => setShowFollowersModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Followers</h2>
                        <button className="modal-close" onClick={() => setShowFollowersModal(false)}>×</button>
                    </div>
                    <div className="modal-body">
                        {followers.length > 0 ? (
                            followers.map((user, index) => (
                                <div key={index} className="user-item">
                                    <img 
                                        className="user-avatar" 
                                        src={user.profile_picture || "https://via.placeholder.com/40"} 
                                        alt={user.name}
                                    />
                                    <span className="user-name">{user.name}</span>
                                </div>
                            ))
                        ) : (
                            <p className="modal-empty">No tienes followers aún</p>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Modal de Following */}
        {showFollowingModal && (
            <div className="modal-overlay" onClick={() => setShowFollowingModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Following</h2>
                        <button className="modal-close" onClick={() => setShowFollowingModal(false)}>×</button>
                    </div>
                    <div className="modal-body">
                        {following.length > 0 ? (
                            following.map((user, index) => (
                                <div key={index} className="user-item">
                                    <img 
                                        className="user-avatar" 
                                        src={user.profile_picture || "https://via.placeholder.com/40"} 
                                        alt={user.name}
                                    />
                                    <span className="user-name">{user.name}</span>
                                </div>
                            ))
                        ) : (
                            <p className="modal-empty">No sigues a nadie aún</p>
                        )}
                    </div>
                </div>
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

    let itemIndex = 0;

    for (let i = 0; i < numColumns; i++) {
        const count = base + (i < remainder ? 1 : 0);

        const columnItems = items.slice(itemIndex, itemIndex + count);
        columns[i].push(...columnItems);

        itemIndex += count;
    }

    return columns;
};

