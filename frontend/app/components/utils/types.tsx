

export type Role = "user" | "manager";

export type RegistrationTokenStatus = "pending" | "used" | "revoked";

export type BlockchainStatus = "pending" | "confirmed" | "failed";

export type TransferStatus =
  | "pending approval"
  | "approved"
  | "rejected"
  | "transfer complete"
  | "transfer failed";

export type ISODateString = string;

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

export type BatchQrData = BatchData;
    

export interface RecipientQrData {
    userId: number;
    firstName: string | null;
    lastName: string | null;
    companyId: number;
    companyName: string;
    walletAddress: string;
};

export interface CompanyData {
    companyId: number | null;
    companyName: string | null;
    walletAddress: string | null;
};

export interface ProfileData {
    sessionToken: string | null;
    sessionExpiry: string | null;
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
    status: "pending approval" | "approved" | "rejected" | "transfer complete" | "transfer failed";
    createdAt: string;
}

export interface JwtPayload {
  userId: number;
  companyId: number;
  role: Role;
  iat: number;
  exp: number;
}



export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  sessionToken: string;
  expiresIn: number; // in seconds

  user: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
  };

  company: {
    companyId: number;
    companyName: string;
  };
}


export interface CreateRegistrationTokenRequest {
  userEmail: string;
  role: Role;
}

export interface CreateRegistrationTokenResponse {
  registrationTokenId: number;
  registrationToken: string;
}

export interface RegistrationToken {
  registration_token_id: number;
  registrationToken: string;
  userId: number;
  email: string;
  companyId: number;
  companyName: string;
  role: Role;
  
  status: RegistrationTokenStatus;

  createdAt: ISODateString;
  createdById: number;
  createdByName: string;
}

export interface GetRegistrationTokenResponse {
  email: string;
  companyId: number;
  companyName: string;
  role: Role;
}


export interface RegisterUserRequest {
  registrationToken: string;
  password: string;
  firstName: string;
  lastName: string;
}


export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
}

export interface UpdateUserProfileResponse {
  user: {
    userId: number;
    firstName: string;
    lastName: string;
    role: Role;
  };
}

export interface CreateBatchRequest {
  batchName: string;
  batchDescription: string;
}

export interface BlockchainInfo {
  transactionId: number;
  status: BlockchainStatus;
  dataHash?: string;
}

export interface CreateBatchResponse {
  batchId: number;
  batchName: string;
  batchDescription: string;
  createdAt: ISODateString;

  blockchain: {
    transactionId: number;
    status: BlockchainStatus;
  };
}

export interface Batch {
  batchId: number;
  batchName: string;
  batchDescription: string;
  createdAt: ISODateString;

  registeringCompanyId: number;
  registeringCompanyName: string;

  registeringUserId: number;
  registeringUserName: string;

  blockchain: BlockchainInfo;
}

export interface CreateTransferRequest {
  batchId: number;
  toCompanyId: number;
  receivingUserID: number;
}

export interface Transfer {
  transferId: number;
  batchId: number;

  fromCompanyId: number;
  toCompanyId: number;

  senderUserID: number;
  receivingUserID: number;

  createdAt: ISODateString;
  status: TransferStatus;
}

export type CreateTransferResponse = Transfer;

export interface TransferListItem {
  transferId: number;
  batchId: number;
  batchName: string;

  fromCompanyName: string;
  toCompanyName: string;

  senderUserId: number;
  senderUserName: string;

  receivingUserId: number;
  receivingUserName: string;

  status: TransferStatus;
  createdAt: ISODateString;
}