import { IBackendRes, ICompany, IAccount, IUser, IModelPaginate, IGetAccount, IJob, IResume, IPermission, IRole, ISubscriber, IApproveEmailResponse, IApprovedNote, IApproveEmailPayload, IRejectEmailPayload, IRejectEmailResponse, IChangePasswordResponse, IChangePasswordPayload } from '@/types/backend';
import axios from 'config/axios-customize';
import queryString from 'query-string';

/**
 * 
Module Auth
 */
export const callRegister = (name: string, email: string, password: string, age: number, gender: string, address: string) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/auth/register', { name, email, password, age, gender, address })
}

export const callLogin = (username: string, password: string) => {
    return axios.post<IBackendRes<IAccount>>('/api/v1/auth/login', { username, password })
}

export const callFetchAccount = () => {
    return axios.get<IBackendRes<IGetAccount>>('/api/v1/auth/account')
}

export const callRefreshToken = () => {
    return axios.get<IBackendRes<IAccount>>('/api/v1/auth/refresh')
}

export const callLogout = () => {
    return axios.post<IBackendRes<string>>('/api/v1/auth/logout')
}


export const callChangePassword = (payload: IChangePasswordPayload) => {
    return axios.post<IBackendRes<IChangePasswordResponse>>('/api/v1/auth/change-password', payload)
}

/**
 * Upload single file
 */
export const callUploadSingleFile = (file: any, folderType: string) => {
    const bodyFormData = new FormData();
    bodyFormData.append('fileUpload', file);
    return axios<IBackendRes<{ fileName: string }>>({
        method: 'post',
        url: '/api/v1/files/upload',
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
            "folder_type": folderType
        },
    });
}




/**
 * 
Module Company
 */
export const callCreateCompany = (name: string, address: string, description: string, logo: string) => {
    return axios.post<IBackendRes<ICompany>>('/api/v1/companies', { name, address, description, logo })
}

export const callUpdateCompany = (id: string, name: string, address: string, description: string, logo: string) => {
    return axios.patch<IBackendRes<ICompany>>(`/api/v1/companies/${id}`, { name, address, description, logo })
}

export const callDeleteCompany = (id: string) => {
    return axios.delete<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
}

export const callFetchCompany = (query: string, isAdminPage: boolean = false) => {
  if (isAdminPage) {
    const url = `/api/v1/companies/hr?${query}`;
    const queryObject = queryString.parse(query);
    return axios.post<IBackendRes<IModelPaginate<ICompany>>>(url, queryObject);
  } else {
    const url = `/api/v1/companies?${query}`;
    return axios.get<IBackendRes<IModelPaginate<ICompany>>>(url);
  }
};

export const callFetchCompanyById = (id: string) => {
    return axios.get<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
}


/**
 * 
Module User
 */
export const callCreateUser = (user: IUser) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/users', { ...user })
}

export const callUpdateUser = (user: IUser, id: string) => {
    return axios.patch<IBackendRes<IUser>>(`/api/v1/users/${id}`, { ...user })
}

export const callDeleteUser = (id: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
}

export const callFetchUser = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users?${query}`);
}

export const callFetchUserById = (id: string) => {
    return axios.get<IBackendRes<IUser>>(`/api/v1/users/${id}`);
}

export const callUpdateUserForNormal = (id: string, user: Partial<IUser>) => {
    return axios.post<IBackendRes<IUser>>(`/api/v1/users/${id}`, { ...user });
}
/**
 * 
Module Job
 */
export const callCreateJob = (job: IJob) => {
    return axios.post<IBackendRes<IJob>>('/api/v1/jobs', { ...job })
}

export const callUpdateJob = (job: IJob, id: string) => {
    return axios.patch<IBackendRes<IJob>>(`/api/v1/jobs/${id}`, { ...job })
}

export const callDeleteJob = (id: string) => {
    return axios.delete<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
}

export const callFetchJob = (query: string, isAdminPage: boolean = false) => {
  if (isAdminPage) {
    const url = `/api/v1/jobs/hr?${query}`;
    const queryObject = queryString.parse(query);
    return axios.post<IBackendRes<IModelPaginate<IJob>>>(url, queryObject);
  } else {
    const url = `/api/v1/jobs?${query}`;
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(url);
  }
};

export const callFetchJobById = (id: string) => {
    return axios.get<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
}

/**
 * 
Module Resume
 */
export const callCreateResume = (url: string, companyId: any, jobId: any) => {
    return axios.post<IBackendRes<IResume>>('/api/v1/resumes', { url, companyId, jobId })
}

export const callUpdateResumeStatus = (id: any, status: string) => {
    return axios.patch<IBackendRes<IResume>>(`/api/v1/resumes/${id}`, { status })
}

export const callSendApproveEmail = (payload: IApproveEmailPayload) => {
    // console.log("Note nè", payload)
    return axios.post<IBackendRes<IApproveEmailResponse>>(`/api/v1/mail/approve-email`, payload)
}

export const callSendRejectEmail = (payload: IRejectEmailPayload) => {
    // console.log("Note nè", payload)
    return axios.post<IBackendRes<IRejectEmailResponse>>(`/api/v1/mail/reject-email`, payload)
}

export const callDeleteResume = (id: string) => {
    return axios.delete<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
}

export const callFetchResume = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IResume>>>(`/api/v1/resumes?${query}`);
}

export const callFetchResumeById = (id: string) => {
    return axios.get<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
}

export const callFetchResumeByUser = () => {
    return axios.post<IBackendRes<IResume[]>>(`/api/v1/resumes/by-user`);
}

export const callDeleteResumeForUser = (id: string) => {
    return axios.post<IBackendRes<IResume>>(`/api/v1/resumes/withdraw-my-CV/${id}`);
}

/**
 * 
Module Permission
 */
export const callCreatePermission = (permission: IPermission) => {
    return axios.post<IBackendRes<IPermission>>('/api/v1/permissions', { ...permission })
}

export const callUpdatePermission = (permission: IPermission, id: string) => {
    return axios.patch<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`, { ...permission })
}

export const callDeletePermission = (id: string) => {
    return axios.delete<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}

export const callFetchPermission = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IPermission>>>(`/api/v1/permissions?${query}`);
}

export const callFetchPermissionById = (id: string) => {
    return axios.get<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}

/**
 * 
Module Role
 */
export const callCreateRole = (role: IRole) => {
    return axios.post<IBackendRes<IRole>>('/api/v1/roles', { ...role })
}

export const callUpdateRole = (role: IRole, id: string) => {
    return axios.patch<IBackendRes<IRole>>(`/api/v1/roles/${id}`, { ...role })
}

export const callDeleteRole = (id: string) => {
    return axios.delete<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}

export const callFetchRole = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IRole>>>(`/api/v1/roles?${query}`);
}

export const callFetchRoleById = (id: string) => {
    return axios.get<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}

/**
 * 
Module Subscribers
 */
export const callCreateSubscriber = (subs: ISubscriber) => {
    return axios.post<IBackendRes<ISubscriber>>('/api/v1/subscribers', { ...subs })
}

export const callGetSubscriberSkills = () => {
    return axios.post<IBackendRes<ISubscriber>>('/api/v1/subscribers/skills')
}

export const callUpdateSubscriber = (subs: ISubscriber) => {
    return axios.patch<IBackendRes<ISubscriber>>(`/api/v1/subscribers`, { ...subs })
}

export const callDeleteSubscriber = (id: string) => {
    return axios.delete<IBackendRes<ISubscriber>>(`/api/v1/subscribers/${id}`);
}

export const callFetchSubscriber = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ISubscriber>>>(`/api/v1/subscribers?${query}`);
}

export const callFetchSubscriberById = (id: string) => {
    return axios.get<IBackendRes<ISubscriber>>(`/api/v1/subscribers/${id}`);
}

/**
 * 
Module Dashboard
 */

export const callFetchTotalUsers = () => {
  return axios.get<IBackendRes<{ total: number }>>('/api/v1/users/total');
};

export const callFetchTotalCompanies = () => {
  return axios.post<IBackendRes<{ total: number }>>('/api/v1/companies/total');
};

export const callFetchTotalJobs = () => {
  return axios.post<IBackendRes<{ total: number }>>('/api/v1/jobs/total');
};


/**
 * 
Module FavoriteJobs
 */

export const callFetchFavoriteJobs = () => {
  return axios.post('/api/v1/favorite-jobs/me');
};

export const callRemoveJobFromFavorites = (jobId: string) => {
  return axios.delete(`/api/v1/favorite-jobs/remove-job/${jobId}`);
};

export const callCheckJobInFavorite = async (jobId: string) => {
  return axios.get(`/api/v1/favorite-jobs/check-job/${jobId}`);
};

export const callAddJobToFavorite = async (payload: {
  jobId: string;
  companyId?: string;
  jobName: string;
  companyName?: string;
}) => {
  return axios.post(`/api/v1/favorite-jobs/add-job`, payload);
};