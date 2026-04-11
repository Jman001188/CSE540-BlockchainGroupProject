"use client";

import { CompanyData, UserData } from "@/app/utils/types";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useState, ReactNode, useEffect } from "react";

// Global Varilable Type Definition for Context
type ContextType = {
    sessionToken: string;
    userData: UserData | null;
    companyData: CompanyData | null;
    setSessionToken: (token: string) => void;
    setUserData: (user: UserData | null) => void;
    setCompanyData: (company: CompanyData | null) => void;
};

// Create the actual context object with default values
export const Context = createContext<ContextType>({
    sessionToken: "",
    userData: null,
    companyData: null,
    setSessionToken: () => {},
    setUserData: () => {},
    setCompanyData: () => {},
});

export const Provider = ({ children }: { children: ReactNode }) => {
    // Local state for the context values, they live in this component and are passed down via the context provider
    const [userData, setUserData] = useState<UserData | null>(null);
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [sessionToken, setSessionToken] = useState<string>("");
    
    const router = useRouter();

    // Pathname is used to detect route changes. Everytime you navigate, useEffect triggers to check session Token. 
    // This acts as middleware to prevent access to protected routes if the session token is invalid
    const pathname = usePathname();
    useEffect(() => {
        if (sessionToken === "") {
            console.log(`Session token invalid! Token:${sessionToken}`);
            router.replace("/login");
        }
        else console.log(`Session token valid! Token:${sessionToken}`);
    }, [pathname]);

    return (
        <Context.Provider value={{ sessionToken, userData, companyData, setSessionToken, setUserData, setCompanyData }}>
            {children}
        </Context.Provider>
    );
};