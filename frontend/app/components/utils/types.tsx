

export interface LoginData {
    email: string;
    password: string;
};

export interface UserData {
    userId: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
};

export interface CompanyData {
    companyId: number | null;
    companyName: string | null;
    permission: string | null; //Don't know what this field represents user role should account for any needed company permissions
    publicKey: string | null;
};

export interface ProfileData {
    sessionToken: string | null;
    user: UserData | null;
    company: CompanyData | null;
};

export interface TransferData {
    id: number;
    batchId: number;
    fromCompany: string;
    toCompany: string;
    status: "pending" | "accepted" | "rejected";
};

export interface BatchData {
    batchId: number;
    batchName: string | null;
    batchDescription: string | null;
    createdAt: string;
    registeringCompanyId: number | null;
    registeringCompanyName: string | null;
    registeringUserId: number | null;
    registeringUserName: string | null;
    blockchain: {
        transactionId: string | null;
        status: string;
        dataHash: string;
    };
};
export interface RecipientData {
    name: string;
    email: string;
    companyPublicKey: string;
};

export interface PendingTransferData {
    transferId: number;
    batchId: number;
    batchName: string;
    fromCompanyName: string;
    toCompanyName: string;
    senderUserId: number;
    senderUserName: string;
    receivingUserId: number;
    receivingUserName: string;
    status: "pending" | "accepted" | "rejected" | "completed";
    createdAt: string;
}