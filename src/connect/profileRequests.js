import { GET_Request } from './requests';

const API_BASE = '/api';

export const getProfile = async () => {
    return GET_Request({ url: `${API_BASE}/profile` });
};

export const getSavedPins = async () => {
    return GET_Request({ url: `${API_BASE}/profile/saved` });
};

export const getLikedPins = async () => {
    return GET_Request({ url: `${API_BASE}/profile/liked` });
};

