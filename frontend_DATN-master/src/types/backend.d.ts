export interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
}

export interface IModelPaginate<T> {
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: T[]
}

export interface IAccount {
    access_token: string;
    user: {
        _id: string;
        email: string;
        name: string;
        role: {
            _id: string;
            name: string;
        };
        permissions: {
            _id: string;
            name: string;
            apiPath: string;
            method: string;
            module: string;
        }[];
        company: {
            _id: string;
            name: string;
        };
    }
}

export interface IGetAccount extends Omit<IAccount, "access_token"> { }

export interface ICompany {
    _id?: string;
    name?: string;
    address?: string;
    logo: string;
    description?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}



export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password?: string;
    age: number;
    gender: string;
    address: string;
    role?: {
        _id: string;
        name: string;
    }

    company?: {
        _id: string;
        name: string;
    }
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IJob {
    _id?: string;
    name: string;
    skills: string[];
    company?: {
        _id: string;
        name: string;
        logo?: string;
    }
    location: string;
    salary: number;
    quantity: number;
    level: string;
    description: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IResume {
    _id?: string;
    email: string;
    userId: string | {
        _id: string;
        name: string;
    };
    url: string;
    status: string;
    companyId: string | {
        _id: string;
        name: string;
        logo: string;
    };
    jobId: string | {
        _id: string;
        name: string;
    };
    history?: {
        status: string;
        updatedAt: Date;
        updatedBy: { _id: string; email: string }
    }[]
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
    nameLogin?: string;
    userLogin?: string;
}

export interface IFavoriteJobItem {
    _id?: string;
    jobId: string;
    companyId: string;
    jobName: string;
    companyName: string;
}

export interface IPermission {
    _id?: string;
    name?: string;
    apiPath?: string;
    method?: string;
    module?: string;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;

}

export interface IRole {
    _id?: string;
    name: string;
    description: string;
    isActive: boolean;
    permissions: IPermission[] | string[];

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISubscriber {
    _id?: string;
    name?: string;
    email?: string;
    skills: string[];
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IApprovedNote {
  companyName: string;
  name: string;
  jobTitle: string;
  interviewTime: string;
  interviewType: string;
  interviewLocation: string;
  jobLink: string;
  senderName: string;
  senderTitle: string;
  senderPhone: string;
  senderEmail: string;
}

export interface IApproveEmailResponse {
  message: string;
}

export interface IApproveEmailPayload {
  to: string;
  from: string;
  companyName: string;
  name: string;
  jobTitle: string;
  interviewTime: string;
  interviewType: string;
  interviewLocation: string;
  jobLink: string;
  senderName: string;
  senderTitle: string;
  senderPhone: string;
  senderEmail: string;
}

export interface IRejectEmailResponse {
  message: string;
}

export interface IRejectEmailPayload {
  to: string;
  from: string;
  companyName: string;
  name: string;
  jobTitle: string;
  senderName: string;
  senderTitle: string;
  senderPhone: string;
  senderEmail: string;
  customMessage?: string;
}

export interface IRejectNote {

}

export interface IChangePasswordResponse {
  message: string;
}

export interface IChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}