import { Batch, CreateBatchRequest, CreateBatchResponse, CreateRegistrationTokenRequest, CreateRegistrationTokenResponse, CreateTransferRequest, CreateTransferResponse, LoginRequest, LoginResponse, RegisterUserRequest, RegistrationToken, Transfer } from "./types";

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

        return response.json();
    },

    revokeToken: async (sessionToken: string, tokenId: number): Promise<{ registrationTokenId: number, status: string }> => {
        const response = await fetch(`${API}/auth/registration-tokens/${tokenId}/revoke`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionToken}`
            },
        });

        if (!response.ok) throw new Error("Failed to revoke registration token");
        
        return response.json();
    },


    getTokenById: async (token: string): Promise<RegistrationToken> => {
        const response = await fetch(`${API}/auth/registration-tokens/token`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ registrationToken: token }),
        });

        if (!response.ok) throw new Error("Failed to fetch registration token");

        return response.json();
    },

    getTokenList: async (sessionToken: string): Promise<RegistrationToken[]> => {
        // This uses the companyID from the session token to fetch all registration tokens for that company
        const response = await fetch(`${API}/auth/registration-tokens/token-list`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${sessionToken}`
            },
        });

        if (!response.ok) throw new Error("Failed to fetch registration token list");

        return response.json();
    },

    consumeToken: async (request: RegisterUserRequest): Promise<{ message: string }> => {
        const response = await fetch(`${API}/auth/registration-tokens/consume`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) throw new Error("Failed to consume registration token");

        return response.json();
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

    getBatchList: async (sessionToken: string): Promise<Batch[]> => {
    
        const response = await fetch(`${API}/batches/list`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${sessionToken}`
            },
        });

        if (!response.ok) throw new Error("Failed to fetch batch list");

        return response.json();

    },

    getBatchById: async (id: number): Promise<Batch> => {
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

    getTransferList: async (sessionToken: string): Promise<Transfer[]> => {
        const response = await fetch(`${API}/transfers/list`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${sessionToken}`
            },
        }); 

        if (!response.ok) throw new Error("Failed to fetch transfer list");

        return response.json();
    },

    acceptTransfer: async (sessionToken: string, transferId: number): Promise<{ message: string }> => {
        const response = await fetch(`${API}/transfers/${transferId}/accept`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${sessionToken}`
            },
        });

        if (!response.ok) throw new Error("Failed to accept transfer");
        
        return response.json();
    },

    rejectTransfer: async (sessionToken: string, transferId: number): Promise<{ message: string }> => {
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