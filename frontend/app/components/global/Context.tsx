"use client";

import { CompanyData, UserData } from "@/app/components/utils/types";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useState, ReactNode, useEffect } from "react";

// Global Varilable Type Definition for Context
type ContextType = {
    sessionToken: string | null;
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
    const [sessionToken, setSessionToken] = useState<string | null>(null);

    return (
        <Context.Provider value={{ sessionToken, userData, companyData, setSessionToken, setUserData, setCompanyData }}>
            {children}
        </Context.Provider>
    );
};