import { apiFetch } from './apiClient';
const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/employers/verifications/email';

export const sendOtp = async (email: string) => {
    const response = await apiFetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Lỗi khi gửi mã OTP.');
    }
    
    return response.json();
};

export const verifyOtp = async (email: string, otpCode: string) => {
    const response = await apiFetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, otpCode })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Mã OTP không hợp lệ.');
    }
    
    return response.json();
};


