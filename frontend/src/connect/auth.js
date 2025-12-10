const DEFAULT_USER = "USER-001";

export function GetUserID() {
    return localStorage.getItem('currentUserId') || DEFAULT_USER;
}

export function SetUserID(userId) {
    localStorage.setItem('currentUserId', userId);
}
