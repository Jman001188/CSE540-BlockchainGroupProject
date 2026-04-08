# 🌾 Honest Harvest API Documentation

**Base URL:** `http://localhost:8080`

All endpoints accept and return JSON. If an endpoint requires authentication, you must include the JWT Session Token in the headers as: `Authorization: Bearer <your_token>`.

---

## 🏢 1. Company Management

### Create a Company
Creates a new organization in the supply chain network.
* **Endpoint:** `POST /company`
* **Auth Required:** No
* **Request Input (Body):**
  ```json
  {
    "name": "",
    "permission_level": ""
  }
  ```
* **Response Output (201 Created):**
  ```json
  {
    "company_id": "",
    "name": "",
    "permission_level": "",
    "created_at": ""
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
    "company_id": "",
    "name": "",
    "permission_level": "",
    "created_at": ""
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
    "email": "",
    "password": "",
    "companyId": "",
    "firstName": "",
    "lastName": "",
    "role": ""
  }
  ```
* **Response Output (201 Created):**
  ```json
  {
    "userId": "",
    "registrationToken": ""
  }
  ```

### User Login
Authenticates a user and generates a JWT session token.
* **Endpoint:** `POST /auth/login`
* **Auth Required:** No
* **Request Input (Body):**
  ```json
  {
    "email": "",
    "password": ""
  }
  ```
* **Response Output (200 OK):**
  ```json
  {
    "sessionToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "userID": "",
      "firstName": "",
      "lastName": "",
      "role": ""
    },
    "company": {
      "companyID": "",
      "companyName": "",
      "permission": ""
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
    "firstName": "",
    "lastName": ""
  }
  ```
* **Response Output (200 OK):**
  ```json
  {
    "user_id": "",
    "public_key": null,
    "username": null,
    "email": "",
    "password_hash": "",
    "first_name": "",
    "last_name": "",
    "role": "",
    "company_id": "",
    "created_at": ""
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
    "batchId": "",
    "productName": "",
    "originLocation": ""
  }
  ```
* **Response Output (201 Created):**
  ```json
  {
    "batch_id": "",
    "product_name": "",
    "origin_location": "",
    "ipfs_hash": null,
    "created_at": ""
  }
  ```

### Initiate a Pending Transfer
Requests to hand off a batch from one company to another.
* **Endpoint:** `POST /transfers/pending`
* **Auth Required:** No *(Should be added later)*
* **Request Input (Body):**
  ```json
  {
    "batchId": "",
    "fromCompany": "",
    "toCompany": "",
    "senderId": ""
  }
  ```
* **Response Output (200 OK):**
  ```json
  {
    "id": "",
    "batch_id": "",
    "from_company": "",
    "to_company": "",
    "sender_id": "",
    "status": "",
    "completed_at": null,
    "created_at": ""
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
    "message": "",
    "data": {
      "id": "",
      "batch_id": "",
      "from_company": "",
      "to_company": "",
      "sender_id": "",
      "status": "accepted",
      "completed_at": "",
      "created_at": ""
    }
  }
  ```

---

## 🗺️ API Architecture Flow

This flowchart shows how data moves through the Honest Harvest system. 

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

    subgraph Group1 [Company Management]
        direction LR
        C_IN["Input: {name, permission}"]:::input --> POST_COMP["POST /company"]:::endpoint
        POST_COMP --> DB_COMP
        DB_COMP --> C_OUT["Output: {company_id, ...}"]:::output

        G_IN["Input: URL param :companyId"]:::input --> GET_COMP["GET /company/:companyId"]:::endpoint
        GET_COMP --> DB_COMP
        DB_COMP --> G_OUT["Output: {Company Details}"]:::output
    end

    subgraph Group2 [Users and Authentication]
        direction LR
        R_IN["Input: {email, password, companyId...}"]:::input --> POST_REG["POST /auth/register"]:::endpoint
        POST_REG --> DB_USER
        DB_USER --> R_OUT["Output: {userId, token}"]:::output

        L_IN["Input: {email, password}"]:::input --> POST_LOG["POST /auth/login"]:::endpoint
        POST_LOG --> DB_USER
        DB_USER --> L_OUT["Output: {sessionToken, User Profile}"]:::output

        U_IN["Input: URL :userId<br>Body: {firstName, lastName}"]:::input --> PATCH_USR["PATCH /user/:userId"]:::endpoint
        PATCH_USR --> DB_USER
        DB_USER --> U_OUT["Output: {Updated User Profile}"]:::output

        LEG_IN["Input: {public_key, username...}"]:::input --> POST_LEG["POST /api/users/register<br>(Legacy Basic)"]:::endpoint
        POST_LEG --> DB_USER
        DB_USER --> LEG_OUT["Output: {Basic User}"]:::output
    end

    subgraph Group3 [Supply Chain and Transfers]
        direction LR
        B_IN["Auth: Bearer Token<br>Input: {batchId...}"]:::input --> POST_BATCH["POST /api/batches"]:::endpoint
        POST_BATCH --> DB_CHAIN
        DB_CHAIN --> B_OUT["Output: {Batch Details}"]:::output

        T_IN["Input: {batchId, from, to, sender}"]:::input --> POST_TRANS["POST /transfers/pending"]:::endpoint
        POST_TRANS --> DB_CHAIN
        DB_CHAIN --> T_OUT["Output: {Pending Transfer}"]:::output

        A_IN["Input: URL param :transferId"]:::input --> POST_ACC["POST /transfers/:id/accept"]:::endpoint
        POST_ACC --> DB_CHAIN
        DB_CHAIN --> A_OUT["Output: {Accepted Status}"]:::output
    end

    subgraph Group4 [System]
        direction LR
        H_IN["Input: None"]:::input --> GET_HLTH["GET /"]:::endpoint
        GET_HLTH --> H_OUT["Output: 'Honest Harvest API is running!'"]:::output
    end
```