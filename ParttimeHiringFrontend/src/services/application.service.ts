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
    jobStatus: string;
    appliedAt: string;
}

export interface EmployerApplicationResponse {
    applicationId: number;
    applicantId: number;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    applicantAvatar: string;
    jobTitle: string;
    jobPostId: number;
    storeName: string;
    storeAddress: string;
    appliedDate: string;
    appliedTime: string;
    status: string;
    note: string;
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

export const getEmployerApplications = async (storeId?: number, status?: string): Promise<EmployerApplicationResponse[]> => {
    let url = `http://localhost:8088/parttime_hiring_platform/api/v1/employer/applications`;
    const params = new URLSearchParams();
    if (storeId && storeId !== 0) params.append('storeId', storeId.toString());
    if (status && status !== 'all' && status !== '') params.append('status', status);
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Lỗi khi tải danh sách đơn ứng tuyển.');
    }
    
    const data = await response.json();
    return data.result;
};

export const updateApplicationStatus = async (applicationId: number, status: string): Promise<void> => {
    const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/v1/employer/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Lỗi khi cập nhật trạng thái đơn ứng tuyển.');
    }
};
