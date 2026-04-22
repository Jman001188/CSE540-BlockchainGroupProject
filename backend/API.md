# 🌾 Honest Harvest API Documentation

**Base URL:** `http://localhost:8080`

All endpoints accept and return JSON. For authenticated routes, pass the JWT as `"sessionToken"` in the body or `Authorization: Bearer <token>` in the headers. Identity is strictly derived from the validated token.

---

## 🏢 0. Utility & Company Management

### Create a Company
Creates a new organization in the supply chain network.
* **Endpoint:** `POST /company`
* **Auth Required:** No
* **Request:** `{"name": "Origin Farm"}`
* **Response (201):** `{"company_id": "uuid", "name": "Origin Farm", "created_at": "..."}`

### Get Company Details
Fetches public details for a specific company.
* **Endpoint:** `GET /company/:companyId`
* **Auth Required:** No
* **Response (200):** `{"company_id": "uuid", "name": "Origin Farm", "created_at": "..."}`

### System Health Check
* **Endpoint:** `GET /`
* **Auth Required:** No
* **Response (200):** `"The Honest Harvest API is running!"`

---

## 🔐 1. Users & Authentication

### Create Registration Token
Creates a secure token allowing a new user to join the manager's company.
* **Endpoint:** `POST /auth/registration-tokens`
* **Auth Required:** Yes (Manager)
* **Request:** `{"userEmail": "new@example.com", "role": "user"}`
* **Response (201):** `{"registrationTokenId": "uuid", "registrationToken": "hex..."}`

### Revoke Registration Token
Invalidates a pending token.
* **Endpoint:** `POST /auth/registration-tokens/:id/revoke`
* **Auth Required:** Yes (Manager)
* **Response (200):** `{"registrationTokenId": "uuid", "status": "revoked"}`

### Get Registration Token List
Retrieves all registration tokens for the manager's company.
* **Endpoint:** `GET /auth/registration-tokens`
* **Auth Required:** Yes (Manager)
* **Response (200):** Array of token objects (pending, used, revoked).

### Get Registration Token Details
Public lookup to pre-fill registration forms.
* **Endpoint:** `GET /auth/registration-tokens/:token`
* **Auth Required:** No
* **Response (200):** `{"email": "...", "company_id": "...", "company_name": "...", "role": "..."}`

### Register User
Consumes a pending token to create a user account.
* **Endpoint:** `POST /auth/register`
* **Auth Required:** No
* **Request:** `{"registrationToken": "hex...", "password": "...", "firstName": "...", "lastName": "..."}`
* **Response (201):** `"message": "Registration successful."`

### User Login
Authenticates credentials and returns the JWT.
* **Endpoint:** `POST /auth/login`
* **Auth Required:** No
* **Request:** `{"email": "user@example.com", "password": "..."}`
* **Response (200):** Returns `sessionToken`, `user` object, and `company` object.

### User Logout
Ends a user session (client-side token deletion).
* **Endpoint:** `POST /auth/logout`
* **Auth Required:** Yes
* **Response (200):** `"message": "Logged out successfully"`

### Update User Profile
Updates basic profile information (self-edit only).
* **Endpoint:** `PATCH /users/:userId`
* **Auth Required:** Yes
* **Request:** `{"firstName": "Jonathan", "lastName": "Doe"}`
* **Response (200):** Returns updated `user` object.

---

## 📦 2. Core Supply Chain (Batches)

### Register a New Batch
Introduces a product lot and prepares blockchain interaction.
* **Endpoint:** `POST /batches`
* **Auth Required:** Yes
* **Request:** `{"batchName": "Coffee Beans", "batchDescription": "100kg Grade A"}`
* **Response (201):** Returns `batchId` and blockchain status (`pending`).

### Get Batch List
Retrieves all batches owned by the authenticated user's company.
* **Endpoint:** `GET /batches`
* **Auth Required:** Yes
* **Response (200):** Array of batch objects with blockchain sync status.

### Get Batch Details
Public lookup for a specific batch.
* **Endpoint:** `GET /batches/:batchId`
* **Auth Required:** No
* **Response (200):** Detailed batch metadata.

---

## 🚚 3. Transfers

### Initiate Transfer
Creates a pending request to move a batch. Locks the batch.
* **Endpoint:** `POST /transfers`
* **Auth Required:** Yes (Sender)
* **Request:** `{"batchId": "uuid", "toCompanyId": "uuid", "receivingUserID": "uuid"}`
* **Response (201):** Returns new `transferId` with status `pending`.

### Get Transfer List
Fetches transfers involving the authenticated user's company.
* **Endpoint:** `GET /transfers`
* **Auth Required:** Yes
* **Response (200):** Array of transfer objects.

### Complete Transfer
Finalizes transfer, shifts ownership, triggers smart contract.
* **Endpoint:** `POST /transfers/:transferId/complete`
* **Auth Required:** Yes (Receiver)
* **Response (200):** `"message": "Accepted Transfer."`

### Reject Transfer
Declines transfer, unlocking the batch for the sender.
* **Endpoint:** `POST /transfers/:transferId/reject`
* **Auth Required:** Yes (Receiver)
* **Response (200):** `"message": "Rejected Transfer."`

---

## 🗺️ API Architecture Flow

```mermaid
graph LR
    classDef endpoint fill:#2b3a42,stroke:#5c8397,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    classDef input fill:#eef2f5,stroke:#b0c4de,stroke-width:1px,color:#333;
    classDef output fill:#d4edda,stroke:#28a745,stroke-width:1px,color:#155724;
    classDef db fill:#fdfd96,stroke:#ffb347,stroke-width:2px,color:#333,shape:cylinder;

    DB_COMP[(Companies DB)]:::db
    DB_USER[(Users DB)]:::db
    DB_CHAIN[(Supply Chain DB)]:::db

    subgraph Token_Gen [Manager Token Generation]
        direction LR
        M_IN["Auth: Manager JWT<br>Input: {email, role}"]:::input --> POST_TOK["POST /auth/registration-tokens"]:::endpoint
        POST_TOK --> DB_USER
        DB_USER --> M_OUT["Output: {Token Hex}"]:::output
    end

    subgraph Auth [User Authentication]
        direction LR
        R_IN["Input: {Token Hex, pass...}"]:::input --> POST_REG["POST /auth/register"]:::endpoint
        POST_REG --> DB_USER
        DB_USER --> R_OUT["Output: Success"]:::output

        L_IN["Input: {email, pass}"]:::input --> POST_LOG["POST /auth/login"]:::endpoint
        POST_LOG --> DB_USER
        DB_USER --> L_OUT["Output: {Session JWT}"]:::output
    end

    subgraph Supply_Chain [Supply Chain & Transfers]
        direction LR
        B_IN["Auth: JWT<br>Input: {batchName}"]:::input --> POST_BATCH["POST /batches"]:::endpoint
        POST_BATCH --> DB_CHAIN
        DB_CHAIN --> B_OUT["Output: {Batch Details}"]:::output

        T_IN["Auth: JWT<br>Input: {batchId, toCompanyId}"]:::input --> POST_TRANS["POST /transfers"]:::endpoint
        POST_TRANS --> DB_CHAIN
        DB_CHAIN --> T_OUT["Output: {Pending Transfer}"]:::output

        A_IN["Auth: Receiver JWT<br>URL: :transferId"]:::input --> POST_ACC["POST /transfers/:id/complete"]:::endpoint
        POST_ACC --> DB_CHAIN
        DB_CHAIN --> A_OUT["Output: {Accepted}"]:::output
    end