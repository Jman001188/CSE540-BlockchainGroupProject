<pre>
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
        C_IN[&quot;Input: {name, permission}&quot;]:::input --&gt; POST_COMP[&quot;POST /company&quot;]:::endpoint
        POST_COMP --&gt; DB_COMP
        DB_COMP --&gt; C_OUT[&quot;Output: {company_id, ...}&quot;]:::output

        G_IN[&quot;Input: URL param :companyId&quot;]:::input --&gt; GET_COMP[&quot;GET /company/:companyId&quot;]:::endpoint
        GET_COMP --&gt; DB_COMP
        DB_COMP --&gt; G_OUT[&quot;Output: {Company Details}&quot;]:::output
    end

    subgraph 🔐 Users &amp; Authentication
        direction LR
        R_IN[&quot;Input: {email, password, companyId...}&quot;]:::input --&gt; POST_REG[&quot;POST /auth/register&quot;]:::endpoint
        POST_REG --&gt; DB_USER
        DB_USER --&gt; R_OUT[&quot;Output: {userId, token}&quot;]:::output

        L_IN[&quot;Input: {email, password}&quot;]:::input --&gt; POST_LOG[&quot;POST /auth/login&quot;]:::endpoint
        POST_LOG --&gt; DB_USER
        DB_USER --&gt; L_OUT[&quot;Output: {sessionToken, User Profile}&quot;]:::output
    end

    subgraph 📦 Supply Chain &amp; Transfers
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
</pre>