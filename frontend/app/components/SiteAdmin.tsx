"use client";

import { useEffect, useState } from "react";
import { RegistrationTokenAPI } from "./utils/apiclient";
import type { CreateCompanyAdminTokenRequest } from "./utils/types/api-contract";
import type { CompanyModel } from "./utils/types/models";

export default function SiteAdmin() {
    const [ newCompanyName, setNewCompanyName ] = useState<string>("");
    const [ viewSelect , setViewSelect ] = useState<"CompanyManager" | "AddUserToCompany">("CompanyManager");
    const [ allCompaniesList, setAllCompaniesList ] = useState<CompanyModel[]>([])
    const [ selectedCompany, setSelectedCompany ] = useState<CompanyModel | null>(null);
    const [ newUserEmail, setNewUserEmail ] = useState<string>("");
    
    useEffect(() => {
        updateCompanyList();
    }, []);
    
    const showCompaniesView = () => {
        setViewSelect("CompanyManager");
        updateCompanyList();
    };

    const handleInitiateCreateUserButton = (company: CompanyModel) => {
        setSelectedCompany(company);
        setViewSelect("AddUserToCompany");
    };

    const updateCompanyList = () => {
        RegistrationTokenAPI.getAllCompanies()
            .then( response => {
                setAllCompaniesList(response);
                console.log(response)
            })
            .catch( error => {
                console.error("Error:", error)
                alert("Failed to fetch company list")
            })
    };

    const addNewCompanyButton = () => {
        RegistrationTokenAPI.createCompany(newCompanyName)
            .then( response => {
                updateCompanyList();
                alert("New Company Created!")

            })
            .catch( error => {
                console.error("Error:", error)
                alert("Failed to create company")               
            })
    };

    const createNewManagerButton = () => {
        if (!selectedCompany?.companyId) {
            alert("Choose a company first (Companies tab → Generate Manager Token on a row).");
            return;
        }
        const email = newUserEmail.trim();
        if (!email) return;

        const apiPayload: CreateCompanyAdminTokenRequest = {
            companyId: selectedCompany.companyId,
            userEmail: email,
        };
        
        RegistrationTokenAPI.createCompanyAdminToken(apiPayload)
            .then((response) => {
                updateCompanyList();
                alert("Token: " + response.registrationToken);
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("Failed to create manager token");
            });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex justify-center pb-40">
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-row gap-2">
                        <button 
                        className={`btn btn-sm ${viewSelect === "CompanyManager" ? 'selected-styles' : 'default-styles'}`}
                        onClick={showCompaniesView}
                        >
                            Companies
                        </button>
                        <button
                        className={`btn btn-sm ${viewSelect === "AddUserToCompany" ? 'selected-styles' : 'default-styles'}`}
                        onClick={() => {
                            setViewSelect("AddUserToCompany");
                        }}
                        >
                            Manager token
                        </button>
                    </div>
                    { viewSelect === "CompanyManager" &&
                    <>
                        <div className="max-w-md mx-auto p-4 border rounded-lg shadow">
                            <h2 className="text-2xl font-bold mb-4">Add New Company</h2>

                            <div className="mb-4">
                                <label className="text-sm text-gray-500">Company Name</label>
                                <input
                                    className="input input-bordered w-full"
                                    value={newCompanyName}
                                    onChange={(e) => setNewCompanyName(e.target.value)}
                                />
                            </div>

                            <button className="btn w-full" onClick={addNewCompanyButton} disabled={ newCompanyName.trim() === "" ? true : false}>
                                Create Company
                            </button>
                        </div>

                        <hr/>

                        <h2 className="text-lg font-bold">Companies</h2>
                        <div className="flex flex-col gap-3">
                            {allCompaniesList?.map((company) => 
                            <div
                                key={company.companyId}
                                className="p-4 border rounded-lg shadow flex justify-between items-center"
                            >
                                <div className="flex flex-col">
                                    <div className="font-bold">
                                        {company.companyName}
                                    </div>
                                    <div className="mt-1 text-sm">
                                        ID: {company.companyId}
                                    </div>
                                    <div className="mt-1 text-sm">
                                        Address: {company.walletAddress || "No Wallet Address"}
                                    </div>
      
                                </div>

                                <div className="flex justify-end mt-2">
                                    <button 
                                        className="btn btn-sm btn-cancel transition-all duration-200 hover:brightness-95 hover:shadow-sm" 
                                        onClick={() => handleInitiateCreateUserButton(company) }
                                        title={company.walletAddress === null ? "Company has no wallet address" : ""}
                                    >
                                        Generate Manager Token
                                    </button>
                                </div>
                            </div>
                            )}
                        </div>
                    </>
                    }


                    { viewSelect === "AddUserToCompany" &&
                    <>
                        <div className="max-w-md mx-auto p-4 border rounded-lg shadow">
                            <h2 className="text-2xl font-bold mb-4">Manager registration token</h2>
                            <p className="text-sm text-gray-500 mb-4">Invite link is always for a manager role.</p>

                            {!selectedCompany ? (
                                <p className="text-amber-700 text-sm mb-4">
                                    No company selected. Open the Companies tab and click &quot;Generate Manager Token&quot; on a row.
                                </p>
                            ) : (
                                <>
                                    <div className="mb-2">
                                        <p className="text-sm text-gray-500">Company ID</p>
                                        <p className="font-mono">{selectedCompany.companyId}</p>
                                    </div>

                                    <div className="mb-2">
                                        <p className="text-sm text-gray-500">Company Name</p>
                                        <p className="font-mono">{selectedCompany.companyName}</p>
                                    </div>
                                </>
                            )}

                            <div className="mb-4">
                                <label className="text-sm text-gray-500">New user email</label>
                                <input
                                    className="input input-bordered w-full"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                />
                            </div>

                            <button
                                className="btn w-full"
                                onClick={createNewManagerButton}
                                disabled={!selectedCompany || newUserEmail.trim() === ""}
                            >
                                Request token
                            </button>
                        </div>
                    </>
                    }
                </div>
            </div>
        </div>  
    );
}
