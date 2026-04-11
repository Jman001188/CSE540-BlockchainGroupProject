

export interface LoginData {
    email: string;
    password: string;
};

export interface UserData {
    userId: number;
    //email: string;
    firstName: string;
    lastName: string;
    role: string;
};

export interface CompanyData {
    companyId: number;
    companyName: string;
    permission: string; //Don't know what this field represents user role should account for any needed company permissions
    //publicKey: string;
};

export interface ProfileData {
    sessionToken: string;
    user: UserData;
    company: CompanyData;
};