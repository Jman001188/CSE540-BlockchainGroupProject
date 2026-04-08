<pre>
    erDiagram
        COMPANIES {
            uuid company_id PK
            text name
            text permission_level
            timestamp created_at
        }
        USERS {
            uuid user_id PK
            text public_key
            text username
            text email UK
            text password_hash
            text first_name
            text last_name
            text role
            uuid company_id FK &quot;References companies&quot;
            timestamp created_at
        }
        BATCHES {
            text batch_id PK
            text product_name
            text origin_location
            text ipfs_hash
            timestamp created_at
        }
        TRANSFERS {
            uuid id PK
            text batch_id FK &quot;References batches&quot;
            uuid from_company FK &quot;References companies&quot;
            uuid to_company FK &quot;References companies&quot;
            uuid sender_id FK &quot;References users&quot;
            text status
            timestamp completed_at
            timestamp created_at
        }

        COMPANIES ||--o{ USERS : &quot;employs&quot;
        COMPANIES ||--o{ TRANSFERS : &quot;sends/receives&quot;
        BATCHES ||--o{ TRANSFERS : &quot;is tracked in&quot;
        USERS ||--o{ TRANSFERS : &quot;initiates&quot;
</pre>