// This file contains temporary data and functions for testing purposes. It should be removed once the application is fully functional and connected to the backend APIs.

import { Batch, BatchData, PendingTransferData, ProfileData, RegistrationToken, TransferData } from "./components/utils/types";

export const testProfileData: ProfileData =  {
    sessionToken: "dummy-token",
    sessionExpiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    user: {
        userId: 1,
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "manager"
    },
    company: {
        companyId: 1,
        companyName: "Test Company",
        permission: "user",
        walletAddress: "dummy-public-key"
    }
}

export const testTransferListData: PendingTransferData[] = [
  {
    transferId: 1,
    batchId: 1,
    batchName: "Test Batch 1",
    fromCompanyName: "Test Company",
    toCompanyName: "Warehouse B",
    senderUserId: 1,
    senderUserName: "Test User",
    receivingUserId: 2,
    receivingUserName: "Warehouse User",
    status: "pending",
    createdAt: "2024-01-01T12:00:00Z"
  },
  {
    transferId: 2,
    batchId: 2,
    batchName: "Test Batch 2",
    fromCompanyName: "Test Company",
    toCompanyName: "Warehouse C",
    senderUserId: 1,
    senderUserName: "Test User",
    receivingUserId: 3,
    receivingUserName: "Warehouse User",
    status: "accepted",
    createdAt: "2024-01-01T12:00:00Z"
  }
];

export const testBatchListData: BatchData[] = [
  { 
    batchId: 1,
    batchName: "Test Batch 1",
    batchDescription: "This is a test batch for demonstration purposes.",
    createdAt: "2024-01-01T12:00:00Z",
    registeringCompanyId: 1,
    registeringCompanyName: "Test Company",
    registeringUserId: 1,
    registeringUserName: "Test User",
    blockchain: {
      transactionId: "0x123456789abcdef",
      status: "registered",
      dataHash: "0xabcdef123456789"
    }
  },
  {
    batchId: 2,
    batchName: "Test Batch 2",
    batchDescription: "This is another test batch for demonstration purposes.",
    createdAt: "2024-01-02T12:00:00Z",
    registeringCompanyId: 1,
    registeringCompanyName: "Test Company",
    registeringUserId: 1,
    registeringUserName: "Test User",
    blockchain: {
      transactionId: "0x987654321fedcba",
      status: "pending",
      dataHash: "0xfedcba987654321"
    }
  }
];

export let tempTestbatchDataIndex = 3;

export const tempAddNewBatch = (batch: BatchData) => {
    testBatchListData.push(batch);
};
export const tempIncreaseBatchIndex = () => {
    tempTestbatchDataIndex++;
};

export const tempTokenListData: RegistrationToken[] = [
  {
    tokenId: 1,
    registrationToken: "abc123",
    userId: 1,
    email: "test@example.com",
    companyId: 1,
    companyName: "Test Company",
    role: "user",
    status: "pending",
    createdAt: "2024-01-01T12:00:00Z",
    createdById: 1,
    createdByName: "Test User"
  },
  {
    tokenId: 2,
    registrationToken: "def456",
    userId: 2,
    email: "test2@example.com",
    companyId: 1,
    companyName: "Test Company",
    role: "user",
    status: "used",
    createdAt: "2024-01-02T12:00:00Z",
    createdById: 1,
    createdByName: "Test User",
  },
  {
    tokenId: 3,
    registrationToken: "ghi789",
    userId: 3,
    email: "test3@example.com",
    companyId: 1,
    companyName: "Test Company",
    role: "manager",
    status: "revoked",
    createdAt: "2024-01-03T12:00:00Z",
    createdById: 1,
    createdByName: "Test User",
  }
];