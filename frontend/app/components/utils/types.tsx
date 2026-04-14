

export interface LoginData {
    email: string;
    password: string;
};

export interface UserData {
    userId: number;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    role: string | null;
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
    registeringUser: string | null;
    status: "pending" | "registered" | "transferred";
    itemName: string | null;
    itemDescription: string | null;
    itemCount: string | null;
    itemWeight: string | null;
    itemFileHash: File | null;
    itemAdditionalInformation: string | null;
};
export interface RecipientData {
    name: string;
    email: string;
    companyPublicKey: string;
};