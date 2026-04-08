# 🌾 Honest Harvest API Documentation

**Base URL:** `http://localhost:8080`

All endpoints accept and return JSON. If an endpoint requires authentication, you must include the JWT Session Token in the headers as: `Authorization: Bearer <your_token>`.

---

## 🗺️ API Architecture Flow

This flowchart shows how data moves through the Honest Harvest system. 
*(If you are viewing this in VS Code, open the Markdown Preview to see the interactive diagram!)*

```mermaid
graph LR
    %% Styling
    classDef endpoint fill:#2b3a42,stroke:#5c8397,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    classDef input fill:#eef2f5,stroke:#b0c4de,stroke-width:1px,color:#333;
    classDef output fill:#d4edda,stroke:#28a745,stroke-width:1px,color:#155724;
    classDef db fill:#fdfd96,stroke:#ffb347,stroke-width:2px,color:#333,shape:cylinder;

    %% Databases
    DB_COMP[(Companies DB)]:::db
    DB_USER[(Users DB)]:::db
    DB_CHAIN[(Supply Chain DB)]:::db

    subgraph 🏢 Company Management
        direction LR
        C_IN["Input: {name, permission}"]:::input --> POST_COMP["POST /company"]:::endpoint
        POST_COMP --> DB_COMP
        DB_COMP --> C_OUT["Output: {company_id, ...}"]:::output

        G_IN["Input: URL param :companyId"]:::input --> GET_COMP["GET /company/:companyId"]:::endpoint
        GET_COMP --> DB_COMP
        DB_COMP --> G_OUT["Output: {Company Details}"]:::output
    end

    subgraph 🔐 Users & Authentication
        direction LR
        R_IN["Input: {email, password, companyId...}"]:::input --> POST_REG["POST /auth/register"]:::endpoint
        POST_REG --> DB_USER
        DB_USER --> R_OUT["Output: {userId, token}"]:::output

        L_IN["Input: {email, password}"]:::input --> POST_LOG["POST /auth/login"]:::endpoint
        POST_LOG --> DB_USER
        DB_USER --> L_OUT["Output: {sessionToken, User Profile}"]:::output
    end

    subgraph 📦 Supply Chain & Transfers
        direction LR
        B_IN["Auth: Bearer Token<br>Input: {batchId, productName}"]:::input --> POST_BATCH["POST /api/batches"]:::endpoint
        POST_BATCH --> DB_CHAIN
        DB_CHAIN --> B_OUT["Output: {Batch Details}"]:::output

        T_IN["Input: {batchId, from, to, sender}"]:::input --> POST_TRANS["POST /transfers/pending"]:::endpoint
        POST_TRANS --> DB_CHAIN
        DB_CHAIN --> T_OUT["Output: {Pending Transfer}"]:::output

        A_IN["Input: URL param :transferId"]:::input --> POST_ACC["POST /transfers/:id/accept"]:::endpoint
        POST_ACC --> DB_CHAIN
        DB_CHAIN --> A_OUT["Output: {Accepted Status}"]:::output
    end
```

---

## 🏢 1. Company Management

### Create a Company
Creates a new organization in the supply chain network.
* **Endpoint:** `POST /company`
* **Auth Required:** No
* **Request Input (Body):**
  ```json
  {
    "name": "Green Valley Farms",
    "permission_level": "Basic"
  }
  ```
* **Response Output (201 Created):**
  ```json
  {
    "company_id": "3f4b...uuid",
    "name": "Green Valley Farms",
    "permission_level": "Basic",
    "created_at": "2026-04-08T12:00:00.000Z"
  }
  ```

### Get Company Details
Fetches public details for a specific company.
* **Endpoint:** `GET /company/:companyId`
* **Auth Required:** No
* **Request Input:** `companyId` (URL Parameter)
* **Response Output (200 OK):**
  ```json
  {
    "company_id": "3f4b...uuid",
    "name": "Green Valley Farms",
    "permission_level": "Basic",
    "created_at": "2026-04-08T12:00:00.000Z"
  }
  ```

---

## 🔐 2. Users & Authentication

### Register a User
Creates a secure user profile and links it to a company.
* **Endpoint:** `POST /auth/register`
* **Auth Required:** No
* **Request Input (Body):**
  ```json
  {
    "email": "farmer@greenvalley.com",
    "password": "securepassword123",
    "companyId": "3f4b...uuid",
    "firstName": "John",
    "lastName": "Doe",
    "role": "farmer"
  }
  ```
* **Response Output (201 Created):**
  ```json
  {
    "userId": "a1b2...uuid",
    "registrationToken": "temp-reg-token-xyz"
  }
  ```

### User Login
Authenticates a user and generates a JWT session token.
* **Endpoint:** `POST /auth/login`
* **Auth Required:** No
* **Request Input (Body):**
  ```json
  {
    "email": "farmer@greenvalley.com",
    "password": "securepassword123"
  }
  ```
* **Response Output (200 OK):**
  ```json
  {
    "sessionToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "userID": "a1b2...uuid",
      "firstName": "John",
      "lastName": "Doe",
      "role": "farmer"
    },
    "company": {
      "companyID": "3f4b...uuid",
      "companyName": "Green Valley Farms",
      "permission": "Basic"
    }
  }
  ```

### Update User Profile
Updates basic profile information.
* **Endpoint:** `PATCH /user/:userId`
* **Auth Required:** No *(Should be added later)*
* **Request Input (URL Parameter + Body):**
  ```json
  {
    "firstName": "Johnny",
    "lastName": "Appleseed"
  }
  ```
* **Response Output (200 OK):**
  ```json
  {
    "user_id": "a1b2...uuid",
    "public_key": null,
    "username": null,
    "email": "farmer@greenvalley.com",
    "password_hash": "$2a$10$...",
    "first_name": "Johnny",
    "last_name": "Appleseed",
    "role": "farmer",
    "company_id": "3f4b...uuid",
    "created_at": "2026-04-08T12:00:00.000Z"
  }
  ```

---

## 📦 3. Core Supply Chain & Transfers

### Register a New Batch
Logs a new physical product onto the network.
* **Endpoint:** `POST /api/batches`
* **Auth Required:** **Yes (Bearer Token)**
* **Request Input (Body):**
  ```json
  {
    "batchId": "BATCH-001",
    "productName": "Organic Arabica Coffee",
    "originLocation": "Farm Plot 4A"
  }
  ```
* **Response Output (201 Created):**
  ```json
  {
    "batch_id": "BATCH-001",
    "product_name": "Organic Arabica Coffee",
    "origin_location": "Farm Plot 4A",
    "ipfs_hash": null,
    "created_at": "2026-04-08T12:00:00.000Z"
  }
  ```

### Initiate a Pending Transfer
Requests to hand off a batch from one company to another.
* **Endpoint:** `POST /transfers/pending`
* **Auth Required:** No *(Should be added later)*
* **Request Input (Body):**
  ```json
  {
    "batchId": "BATCH-001",
    "fromCompany": "COMPANY_UUID_1",
    "toCompany": "COMPANY_UUID_2",
    "senderId": "USER_UUID"
  }
  ```
* **Response Output (200 OK):**
  ```json
  {
    "id": "c7d8...uuid",
    "batch_id": "BATCH-001",
    "from_company": "COMPANY_UUID_1",
    "to_company": "COMPANY_UUID_2",
    "sender_id": "USER_UUID",
    "status": "pending",
    "completed_at": null,
    "created_at": "2026-04-08T12:05:00.000Z"
  }
  ```

### Accept a Transfer
Completes the hand-off (triggers the blockchain transaction).
* **Endpoint:** `POST /transfers/:transferId/accept`
* **Auth Required:** No *(Should be added later)*
* **Request Input:** `transferId` (URL Parameter)
* **Response Output (200 OK):**
  ```json
  {
    "message": "Transfer accepted in DB. Please sign blockchain transaction.",
    "data": {
      "id": "c7d8...uuid",
      "batch_id": "BATCH-001",
      "from_company": "COMPANY_UUID_1",
      "to_company": "COMPANY_UUID_2",
      "sender_id": "USER_UUID",
      "status": "accepted",
      "completed_at": "2026-04-08T12:10:00.000Z",
      "created_at": "2026-04-08T12:05:00.000Z"
    }
  }
  ```