import { useState, useEffect, useRef } from 'react';
import { GET_Request } from '../connect/requests.js';
import { GetUserID, SetUserID } from '../connect/auth.js';
import '../styles/userselector.css';

export default function UserSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchUsers();
        
        // Cerrar dropdown al hacer clic fuera
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function fetchUsers() {
        try {
            const data = await GET_Request({ url: 'http://localhost:3001/api/users' });
            setUsers(data);
            
            // Encontrar usuario actual
            const currentId = GetUserID();
            const current = data.find(u => u.id === currentId);
            setCurrentUser(current || data[0]);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    const handleSelectUser = (user) => {
        SetUserID(user.id);
        setCurrentUser(user);
        setIsOpen(false);
        // Recargar la página para actualizar todos los datos
        window.location.reload();
    };

    const defaultAvatar = "https://i.pinimg.com/75x75_RS/04/95/7d/04957d63e23a50eee3c2ae447a74c650.jpg";

    if (!currentUser) return null;

    return (
        <div className="user-selector" ref={dropdownRef}>
            <button 
                className="user-selector-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <img 
                    src={currentUser.profile_picture || defaultAvatar} 
                    alt={currentUser.name}
                    className="user-avatar"
                />
                <span className="user-name">{currentUser.name}</span>
                <span className={`arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
            </button>

            {isOpen && (
                <div className="user-dropdown">
                    <div className="dropdown-header">
                        Cambiar usuario
                        <span className="user-count">{users.length} usuarios</span>
                    </div>
                    <div className="user-list">
                        {users.map(user => (
                            <button
                                key={user.id}
                                className={`user-option ${user.id === currentUser.id ? 'active' : ''}`}
                                onClick={() => handleSelectUser(user)}
                            >
                                <img 
                                    src={user.profile_picture || defaultAvatar} 
                                    alt={user.name}
                                    className="option-avatar"
                                />
                                <span className="option-name">{user.name}</span>
                                {user.id === currentUser.id && <span className="check">✓</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

