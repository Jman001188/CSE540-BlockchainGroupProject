import type {
    BatchListResponse,
    CompanyRowSnake,
    CreateBatchRequest,
    CreateBatchResponse,
    CreateCompanyAdminTokenRequest,
    CreateRegistrationTokenRequest,
    CreateRegistrationTokenResponse,
    CreateTransferRequest,
    CreateTransferResponse,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    RegisterUserRequest,
    RevokeRegistrationTokenResponse,
    UpdateCompanyRequest,
    UpdateUserProfileRequest,
    UpdateUserProfileResponse,
} from "./types/api-contract";
import type { Uuid } from "./types/primitives";
import {
    normalizeCreateRegistrationTokenResponse,
    normalizeRevokeTokenResponse,
    normalizeCompany,
    normalizeTransferList,
    normalizeUpdateUserProfileResponse,
} from "./types/mappers";
import type { BatchModel, CompanyModel, RegistrationTokenModel, TransferModel } from "./types/models";

const API = "http://localhost:8080";

export const RegistrationTokenAPI = {
    generateToken: async (sessionToken: string, request: CreateRegistrationTokenRequest): Promise<CreateRegistrationTokenResponse> => {
        const response = await fetch(`${API}/auth/registration-tokens`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionToken}`
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) throw new Error("Failed to generate registration token");

        return normalizeCreateRegistrationTokenResponse(await response.json());
    },

    revokeToken: async (sessionToken: string, tokenId: Uuid): Promise<RevokeRegistrationTokenResponse> => {
        const response = await fetch(`${API}/auth/registration-tokens/${tokenId}/revoke`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionToken}`
            },
        });

        if (!response.ok) throw new Error("Failed to revoke registration token");

        return normalizeRevokeTokenResponse(await response.json());
    },


    getTokenValues: async (token: string): Promise<RegistrationTokenModel> => {
        const response = await fetch(`${API}/auth/registration-tokens/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registrationToken: token }),
        });

        if (!response.ok) throw new Error("Could not verify registration code.");
        
        return response.json();
    },

    getTokenList: async (sessionToken: string): Promise<RegistrationTokenModel[]> => {
        const response = await fetch(`${API}/auth/registration-tokens/token-list`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${sessionToken}`
            },
        });

        if (!response.ok) throw new Error("Failed to fetch registration token list");

        return (await response.json()) as RegistrationTokenModel[];
    },

    consumeToken: async (request: RegisterUserRequest): Promise<MessageResponse> => {
        const response = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) throw new Error("Registration failed.");
        return response.json();
    },

    createCompany: async (companyName: string): Promise<CompanyModel> => {
        const response = await fetch(`${API}/company`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({name: companyName}),
        });

        if (!response.ok) throw new Error("Could not create a new company");

        const row = await response.json();
        return normalizeCompany(row as CompanyRowSnake);
    },

    getAllCompanies: async (): Promise<CompanyModel[]> => {
        const response = await fetch(`${API}/companies`, {
            method: "GET",
        });

        if (!response.ok) throw new Error("Could not retreive company list");
        
        const rows = (await response.json()) as CompanyRowSnake[];
        return rows.map((row) => normalizeCompany(row));
    },
    
    createCompanyAdminToken: async (request: CreateCompanyAdminTokenRequest): Promise<CreateRegistrationTokenResponse> => {
        const response = await fetch(`${API}/auth/admin/manager-token`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) throw new Error("Could not create a new company");

        return normalizeCreateRegistrationTokenResponse(await response.json());
    },
    
};

export const AuthAPI = {
    login: async (request: LoginRequest): Promise<LoginResponse> => {
        const response = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) throw new Error("Login failed");

        return response.json();
    },
};

export const UserAPI = {
    updateProfile: async (sessionToken: string, userId: Uuid, body: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> => {
        const response = await fetch(`${API}/users/${userId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionToken}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error("Profile update failed");
        return normalizeUpdateUserProfileResponse(await response.json());
    },
};

export const CompanyAPI = {
    updateCompany: async (
        sessionToken: string,
        companyId: Uuid,
        body: UpdateCompanyRequest
    ): Promise<CompanyModel> => {
        const response = await fetch(`${API}/companies/${companyId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionToken}`,
            },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) throw new Error("Company update failed");

        return response.json();
    },
};

export const BatchAPI = {
    registerBatch: async (sessionToken: string, request: CreateBatchRequest): Promise<CreateBatchResponse> => {
        const response = await fetch(`${API}/batches`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${sessionToken}`
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) throw new Error("Failed to register batch");

        return response.json();
    },

    getBatchList: async (sessionToken: string): Promise<BatchListResponse> => {
        const response = await fetch(`${API}/batches`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${sessionToken}`
            },
        });

        if (!response.ok) throw new Error("Failed to fetch batch list");

        return response.json();

    },

    getBatchById: async (id: Uuid): Promise<BatchModel> => {
        const response = await fetch(`${API}/batches/${id}`, {
            method: "GET"
        });

        if (!response.ok) throw new Error("Failed to fetch batch list");

        return response.json();

    },
};

export const TransferBatchAPI = {
    initiateTransfer: async (sessionToken: string, request: CreateTransferRequest): Promise<CreateTransferResponse> => {
        const response = await fetch(`${API}/transfers`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${sessionToken}`
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) throw new Error("Failed to initiate transfer");

        return response.json();
    },

    getTransferList: async (sessionToken: string): Promise<TransferModel[]> => {
        const response = await fetch(`${API}/transfers`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${sessionToken}`
            },
        }); 

        if (!response.ok) throw new Error("Failed to fetch transfer list");

        return normalizeTransferList(await response.json());
    },

    acceptTransfer: async (sessionToken: string, transferId: Uuid): Promise<MessageResponse> => {
        const response = await fetch(`${API}/transfers/${transferId}/complete`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${sessionToken}`
            },
        });

        if (!response.ok) throw new Error("Failed to accept transfer");
        
        return response.json();
    },

    rejectTransfer: async (sessionToken: string, transferId: Uuid): Promise<MessageResponse> => {
        const response = await fetch(`${API}/transfers/${transferId}/reject`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${sessionToken}`
            },
        });

        if (!response.ok) throw new Error("Failed to reject transfer");
        
        return response.json();
    },
};
