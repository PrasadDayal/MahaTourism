import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;
        
        // Detailed logging for debugging
        console.error('API Error:', {
            url: originalRequest?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });

        // ONLY logout if it's a 401 and the user is NOT trying to log in or access public data
        if (error.response && error.response.status === 401) {

    const isAuthRequest =
        originalRequest.url.includes('/auth/');

    const isPublicRequest =
        originalRequest.url.includes('/public/');

    const isWeatherRequest =
        originalRequest.url.includes('/weather/');

    const isCrowdRequest =
        originalRequest.url.includes('/crowd/');

    const isReviewsRequest =
        originalRequest.url.includes('/reviews/');

    // Ignore public/weather/crowd/reviews APIs

    if (
        !isAuthRequest &&
        !isPublicRequest &&
        !isWeatherRequest &&
        !isCrowdRequest &&
        !isReviewsRequest
    ) {
                // Check if we already have an admin session. If so, don't auto-logout immediately
                // just because one background request failed. This prevents the "1 second logout".
                const user = JSON.parse(sessionStorage.getItem('user') || '{}');
                const isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';

                if (!isAdmin) {
                    console.warn('Unauthorized access for non-admin - clearing session');
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('user');
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                } else {
                    console.error('Admin request failed with 401. Keeping session alive for now.');
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
