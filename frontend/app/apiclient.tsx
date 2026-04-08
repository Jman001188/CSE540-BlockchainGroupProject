const API = "http://localhost:8080";


export const api = {
  
    RegisterUser: async (data: any) => {
        /*
            data: {
                public_key: 
                username:
                role:
            }
        */
        const res = await fetch(`${API}/api/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Registration failed");
        return res.json();
    },

    RegisterUserFullAuth : async (data: any) => {
        /*
            data: {
                email: 
                password:
                companyId:
                firstName:
                lastName:
                role:
            }
        */
        const res = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Registration failed");
        return res.json();
    },

    getCompany: async (id: number) => {
        /*
            GET - No Data Passed
        */
        
        const res = await fetch(`${API}/company/${id}`);
       
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
    },

    UpdateUserProfile: async (id: number, data: any) => {
        /*
            data: {
                firstName: 
                lastName:
                userId:
            }
        */
        
        const res = await fetch(`${API}/user/${id}`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
    },


    InitiateTransferItem: async (data: any) => {
        /*
            data: {
                batchId: 
                fromCompany:
                toCompany:
                senderId:
            }
        */
        const res = await fetch(`${API}/transfers/pending`, {
            method: "POST",
            headers: {"Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
    },

    AcceptTransferItem: async (id: number, data: any) => {
        /*
            data: {
                No Data Needed
            }
        */
        const res = await fetch(`${API}/transfers/${id}/accept`, {
            method: "POST"
        });

        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
    },


};