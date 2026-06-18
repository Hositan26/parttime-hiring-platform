const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/users/applications';

export interface JobApplicationRequest {
    jobPostId: number;
    contactPhone: string;
    note: string;
}

export interface JobApplicationResponse {
    applicationId: number;
    jobPostId: number;
    jobTitle: string;
    companyName: string;
    storeFrontImageUrl: string | null;
    contactPhone: string;
    note: string;
    status: string;
    appliedAt: string;
}

export const applyForJob = async (request: JobApplicationRequest) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(request)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Đã có lỗi xảy ra khi nộp đơn ứng tuyển.');
    }
    
    return response.json();
};

export const getMyApplications = async (): Promise<JobApplicationResponse[]> => {
    const response = await fetch(`${API_URL}/my-applications`, {
        method: 'GET',
        credentials: 'include'
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Lỗi khi tải danh sách ứng tuyển.');
    }
    
    return response.json();
};
