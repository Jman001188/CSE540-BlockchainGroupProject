# 🛠️ Database Setup & Test Data Guide

This guide walks you through accessing the PostgreSQL database and inserting initial test data.

---

## 📌 Open SQL Terminal in VSCode

Run the following command in your terminal:

```bash
docker exec -it cse540project-db-1 psql -U user -d honest_harvest
```

---

## 🏢 Create a Test Company

```sql
INSERT INTO companies (
    company_id, 
    name
)
VALUES (
    gen_random_uuid(),
    '<Company Name>'
);
```

---

## 🔍 Retrieve Company ID

To associate users with a company, you’ll need the `company_id`.

```sql
SELECT * FROM companies;
```

Copy the desired `company_id` from the results.

---

## 🔑 Create an Admin Registration Token

Use the retrieved `company_id` to create a manager-level registration token:

```sql
INSERT INTO registration_tokens (
    registration_token_id,
    company_id,
    email,
    token,
    role,
    status
)
VALUES (
    gen_random_uuid(),
    '<desired company_id>',
    'admin_1@acme.com',
    'token',
    'manager',
    'pending'
);
```

---

## 🧪 Complete Registration

1. Navigate to the registration page in your application
2. Use the following token:

```text
token
```

3. Complete the registration process

---

## ✅ Notes

- Ensure the `pgcrypto` extension is enabled for UUID generation:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
  ```

- Replace placeholders:
  - `<Company Name>`
  - `<desired company_id>`

---
