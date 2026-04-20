# 🌾 Honest Harvest API Documentation

**Base URL:** `http://localhost:8080`

All endpoints accept and return JSON. If an endpoint requires authentication, you must include the JWT Session Token in the headers as: `Authorization: Bearer <your_token>`.

---

## 🔑 Session Token

All authenticated endpoints require a session token passed explicitly in the request body.

### Internal Behavior
- JWT is validated on every request (signature + expiration)
- Payload is decoded and injected into request context
- Used for:
  - Authorization (role checks)
  - Data scoping (company isolation)
- Optional: token blacklist validation (if logout invalidation is implemented)

### Structure
```json
{
  "sessionToken": "<JWT Token>"
}
```

**Internal Contents**
```json
{
  "userId": "123",
  "companyId": "456",
  "role": "manager",
  "iat": 1710000000,
  "exp": 1710003600
}
```

---

## 🔐 1. Users & Authentication

---

### Create Registration Token
Creates a registration token that allows a new user to join a company. Only managers can generate tokens.

* **Endpoint:** `POST /auth/registration-tokens`
* **Auth Required:** Yes (Manager)

#### Internal Behavior
- Validates caller role is `manager`
- Verifies `companyId` matches caller
- Validates email format
- Generates secure random token
- Stores token in registration_tokens table with:
  - email
  - role
  - companyId
  - status = `pending`
- Optional: sends invitation email

**Request**
```json
{
  "sessionToken": "<JWT Token>",
  "userEmail": "",
  "companyId": "",
  "role": "user | manager"
}
```

**Response (201)**
```json
{
  "registrationTokenId": "",
  "registrationToken": ""
}
```

---

### Revoke Registration Token
Invalidates a registration token so it can no longer be used.

* **Endpoint:** `POST /auth/registration-tokens/:id/revoke`
* **Auth Required:** Yes (Manager)

#### Internal Behavior
- Validates manager role
- Ensures token exists and is not already used
- Updates status → revoked

**Request**
```json
{
  "sessionToken": "<JWT Token>",
}
```

**Response (200)**
```json
{
  "registrationTokenId": "",
  "status": "revoked"
}
```

---

### Get Registration Token List
Retrieves all registration tokens for a company.

* **Endpoint:** `GET /auth/registration-tokens`
* **Auth Required:** Yes (Manager)

#### Internal Behavior
- Returns all token data by companyId

**Request**
```json
{
  "sessionToken": "<JWT Token>"
}
```

**Response (200)**
```json
[
  {
    "userId": "",
    "email": "",
    "companyId": "",
    "companyName": "",
    "role": "",
    "registrationToken": "",
    "status": "pending | used | revoked",
	"createdby" : ""
  }
]
```

---

### Get Registration Token
Returns information tied to a registration token for pre-filling user registration.

* **Endpoint:** `GET /auth/registration-tokens/:token`
* **Auth Required:** No

#### Internal Behavior
- Validates token exists and is pending
- Ensures token not expired
- Returns data to user 

**Response (200)**
```json
{
  "email": "",
  "companyId": "",
  "companyName": "",
  "role": ""
}
```

---

### Register User
Consumes a registration token and creates a new user account.

* **Endpoint:** `POST /auth/register`
* **Auth Required:** No

#### Internal Behavior
- Validates registration token
- Hashes password securely (bcrypt or similar)
- Creates user linked to company
- Assigns role from token
- Marks token as used

**Request**
```json
{
  "registrationToken": "",
  "password": "",
  "firstName": "",
  "lastName": ""
}
```

**Response (201)**
```json
{
  "message": "Registration successful."
}
```

---

### User Login
Authenticates user credentials and returns a session token.

* **Endpoint:** `POST /auth/login`

#### Internal Behavior
- Verifies credentials
- Generates JWT with:
  - userId
  - companyId
  - role
- Responds with JWT and user details

**Request**
```json
{
  "email": "",
  "password": ""
}
```

**Response (200)**
```json
{
  "sessionToken": "<JWT Token>",
  "user": {
    "userId": "",
    "firstName": "",
    "lastName": "",
	email: "",
    "role": ""
  },
  "company": {
    "companyId": "",
    "companyName": ""
  }
}
```

---

### User Logout
Ends a user session (client discards token or backend invalidates it if implemented).

* **Endpoint:** `POST /auth/logout`
* **Auth Required:** Yes

#### Internal Behavior
- Token is revoked


**Request**
```json
{
  "sessionToken": "<JWT Token>"
}
```

**Response**
```json
{
  "message": "Logged out successfully"
}
```

---

### Update User Profile
Updates a user's basic profile information.

* **Endpoint:** `PATCH /users/:userId`
* **Auth Required:** Yes

#### Internal Behavior
- Validates ownership or permissions
- Sanitizes inputs
- Updates DB record
- Returns updated user

**Request**
```json
{
  "sessionToken": "<JWT Token>",
  "firstName": "",
  "lastName": ""
}
```

**Response (200)**
```json
{
  "user": {
    "userId": "",
    "firstName": "",
    "lastName": "",
    "role": ""
  }
}
```

---

## 📦 3. Core Supply Chain & Transfers

---

### Register a New Batch
Creates a new product batch, records ownership under the authenticated company, and initiates a corresponding blockchain transaction via a smart contract.

* **Endpoint:** `POST /batches`
* **Auth Required:** Yes

#### Internal Behavior
- Validates session token
- Validates input fields
- Generates unique batchId
- Stores batch with ownership tied to company
- Computes dataHash from metadata
- Calls smart contract: registerItem(dataHash)
- Async worker:
  - monitors confirmation
  - gets blockchain itemID
  - gets transactionID
  - updates status (confirmed or failed)

**Request**
```json
{
  "sessionToken": "<JWT Token>",
  "batchName": "",
  "batchDescription": ""
}
```

**Response (201)**
```json
{
  "batchId": "",
  "batchName": "",
  "batchDescription": "",
  "blockchain": {
    "transactionId": "",
    "status": "pending | confirmed"
  }
}
```

---

### Get Batch List
Retrieves all batches owned by the authenticated company.

* **Endpoint:** `GET /batches`
* **Auth Required:** Yes

#### Internal Behavior
- Queries batches by companyId
- Includes blockchain metadata

**Request**
```json
{
  "sessionToken": "<JWT Token>"
}
```

**Response (200)**
```json
[
	{
	  "batchId": "",
	  "batchName": "",
	  "batchDescription": "",
	  "createdAt": "",
	  "registeringCompanyId": "",
	  "registeringCompanyName": "",
	  "registeringUserId": "",
	  "registeringUserName": "",
	  "blockchain": {
		"transactionId": "",
		"status": "pending | confirmed | failed",
		"dataHash": ""
	  }
	}
]
```

---

### Get Batch Details
Retrieves detailed information for a specific batch.

* **Endpoint:** `GET /batches/:batchId`
* **Auth Required:** No

#### Internal Behavior
- Validates access permissions
- Fetches batch + blockchain info

**Response (200)**
```json
{
  "batchId": "",
  "batchName": "",
  "batchDescription": "",
  "createdAt": "",
  "registeringCompanyId": "",
  "registeringUserId": "",
  "blockchain": {
    "transactionId": "",
    "status": "pending",
    "dataHash": ""
  }
}
```

---

### Initiate Transfer
Creates a pending transfer request to move a batch to another company.
The receiving user provides their companyID and their userID. 
the userID is used for destination filtering, but anyone in the company can accept/reject.

* **Endpoint:** `POST /transfers`
* **Auth Required:** Yes

#### Internal Behavior
- Validates ownership of batch
- Ensures batch not already in transfer
- Validates destination company and user
- Creates transfer record:
  - status = pending

**Request**
```json
{
  "sessionToken": "<JWT Token>",
  "batchId": "",
  "toCompanyId": "",
  "receivingUserID": ""
}
```

**Response (201)**
```json
{
  "transferId": "",
  "batchId": "",
  "fromCompanyId": "",
  "toCompanyId": "",
  "senderUserID": "",
  "receivingUserID": "",
  "createdAt": "",
  "status": "pending"
}
```

---

### Get Transfer List
Creates a pending transfer request to move a batch to another company.
The receiving user provides their companyID and their userID. 
the userID is used for destination filtering, but anyone in the company can accept/reject.

* **Endpoint:** `POST /transfers`
* **Auth Required:** Yes

#### Internal Behavior
- Fetches transfers where either the sender or receiver match the user's company.
- Returns transfer list

**Request**
```json
{
  "sessionToken": "<JWT Token>"
}
```

**Response (201)**
```json
[
  {
    "transferId": "",
    "batchId": "",
	"batchName": "",
    "fromCompanyName": "",
    "toCompanyName": "",
    "senderUserId": "",
	"senderUserName: "",
    "receivingUserId": "",
	"receivingUserName": "",
    "status": "pending | accepted | rejected | completed",
    "createdAt": ""
  }
]
```

---

### Complete Transfer
Finalizes a transfer and updates ownership. This initiates a Smart Contract Call to start a transfer of ownership.

* **Endpoint:** `POST /transfers/:transferId/complete`
* **Auth Required:** Yes

#### Internal Behavior
- Validates transfer exists and is pending
- Verifies receiving company authorization
- Calls smart contract:
  - transferOwnership(itemID, newOwner)
- Updates batch owner in DB
- Updates transfer status → pending_blockchain
- Async confirmation of blockchain success

**Request**
```json
{
  "sessionToken": "<JWT Token>"
}
```

**Response (200)**
```json
{
  "message": "Accepted Transfer."
}
```

---

### Reject Transfer
Rejects a transfer.

* **Endpoint:** `POST /transfers/:transferId/reject`
* **Auth Required:** Yes

#### Internal Behavior
- Validates transfer belongs to receiving company
- Updates status → rejected
- Unlocks batch for future transfers

**Request**
```json
{
  "sessionToken": "<JWT Token>"
}
```

**Response (200)**
```json
{
  "message": "Rejected Transfer."
}
```

---

## Notes

- All identity is derived strictly from the sessionToken
- Never trust userId or companyId from client input
- Always enforce role-based access from token
- Token must be validated on every required request
