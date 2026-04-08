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
*(If you are viewing this in VS Code, open the Markdown Preview to see the interactive diagram!)*

```
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

    subgraph Group1 [&quot;🏢 Company Management&quot;]
        direction LR
        C_IN[&quot;Input: {name, permission}&quot;]:::input --&gt; POST_COMP[&quot;POST /company&quot;]:::endpoint
        POST_COMP --&gt; DB_COMP
        DB_COMP --&gt; C_OUT[&quot;Output: {company_id, ...}&quot;]:::output

        G_IN[&quot;Input: URL param :companyId&quot;]:::input --&gt; GET_COMP[&quot;GET /company/:companyId&quot;]:::endpoint
        GET_COMP --&gt; DB_COMP
        DB_COMP --&gt; G_OUT[&quot;Output: {Company Details}&quot;]:::output
    end

    subgraph Group2 [&quot;🔐 Users &amp; Authentication&quot;]
        direction LR
        R_IN[&quot;Input: {email, password, companyId...}&quot;]:::input --&gt; POST_REG[&quot;POST /auth/register&quot;]:::endpoint
        POST_REG --&gt; DB_USER
        DB_USER --&gt; R_OUT[&quot;Output: {userId, token}&quot;]:::output

        L_IN[&quot;Input: {email, password}&quot;]:::input --&gt; POST_LOG[&quot;POST /auth/login&quot;]:::endpoint
        POST_LOG --&gt; DB_USER
        DB_USER --&gt; L_OUT[&quot;Output: {sessionToken, User Profile}&quot;]:::output
    end

    subgraph Group3 [&quot;📦 Supply Chain &amp; Transfers&quot;]
        direction LR
        B_IN[&quot;Auth: Bearer Token<br>Input: {batchId, productName}&quot;]:::input --&gt; POST_BATCH[&quot;POST /api/batches&quot;]:::endpoint
        POST_BATCH --&gt; DB_CHAIN
        DB_CHAIN --&gt; B_OUT[&quot;Output: {Batch Details}&quot;]:::output

        T_IN[&quot;Input: {batchId, from, to, sender}&quot;]:::input --&gt; POST_TRANS[&quot;POST /transfers/pending&quot;]:::endpoint
        POST_TRANS --&gt; DB_CHAIN
        DB_CHAIN --&gt; T_OUT[&quot;Output: {Pending Transfer}&quot;]:::output

        A_IN[&quot;Input: URL param :transferId&quot;]:::input --&gt; POST_ACC[&quot;POST /transfers/:id/accept&quot;]:::endpoint
        POST_ACC --&gt; DB_CHAIN
        DB_CHAIN --&gt; A_OUT[&quot;Output: {Accepted Status}&quot;]:::output
    end
```