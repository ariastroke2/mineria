const DEFAULT_USER = "USER-1";

export function GetUserID() {
    return localStorage.getItem('currentUserId') || DEFAULT_USER;
}

export function SetUserID(userId) {
    localStorage.setItem('currentUserId', userId);
}
