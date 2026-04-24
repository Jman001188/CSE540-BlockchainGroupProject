"use client";

import { useContext, useEffect, useState } from "react";
import { RegistrationToken } from "../utils/types";
import { tempTokenListData, testTransferListData } from "@/app/tempData";
import { Context } from "../global/Context";
import { RegistrationTokenAPI } from "../utils/apiclient";



export default function CompanyProfile() {
  const [ viewSelect, setViewSelect ] = useState<string>("companyProfile");
  const [ registrationTokenData, setRegistrationTokenData ] = useState<RegistrationToken[] | null>([]);
  const [ companyName, setCompanyName ] = useState<string>("");
  const [ isEditingCompanyName, setIsEditingCompanyName ] = useState<boolean>(false);
  const [ newUserEmail, setNewUserEmail ] = useState<string>("")
  const [ newUserRole, setNewUserRole ] = useState<"user" | "manager">("user")

  const { companyData, sessionToken } = useContext(Context);

  useEffect(() => {
    // Get registration token data
    setCompanyName(companyData?.companyName || "")
  }, []);

  const saveCompanyProfile = () => {

  };
  
  const clearRegistrationData = () => {
    setNewUserRole("user");
    setNewUserEmail("");
  };

  const handleNewUserViewButton = () => {
    getUpdatedTokenList();
    setViewSelect("userRegistration");
  };

  const getUpdatedTokenList = () => {
    RegistrationTokenAPI.getTokenList(sessionToken!)
      .then( response => {
        setRegistrationTokenData(response);
        console.log("Got Token Data.")
      })
      .catch( error => {
        console.error("Error:", error);
      });
  };

  const requestNewUserTokenButton = () => {
    const apiPayload = {
      userEmail: newUserEmail,
      role: newUserRole,
    };

    RegistrationTokenAPI.generateToken( sessionToken!, apiPayload )
      .then( response => {
        console.log("Token Created Successfully!");
        getUpdatedTokenList()
        clearRegistrationData();
      })
      .catch( error => {
        console.error("Error:", error);
      })
  };

  const revokeToken = (token: RegistrationToken) => {
    RegistrationTokenAPI.revokeToken( sessionToken!, token.registration_token_id)
      .then( response => {
        getUpdatedTokenList();
        console.log("Token Revoked Successfully!");
      })
      .catch( error => {
        console.error("Error:", error);
      })
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex justify-center pb-40">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-row gap-2">
            <button 
              className={`btn btn-sm ${viewSelect === "companyProfile" ? 'selected-styles' : 'default-styles'}`}
              onClick={() => {setViewSelect("companyProfile");}}
            >
              Manage the Company Profile
            </button>
            <button 
              className={`btn btn-sm ${viewSelect === "userRegistration" ? 'selected-styles' : 'default-styles'}`}
              onClick={handleNewUserViewButton}
            >
              Register New users
            </button>
          </div>
          { viewSelect === "companyProfile" &&
            <div className="max-w-md mx-auto p-4 border rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Company Profile</h2>

              <div className="mb-2">
                <p className="text-sm text-gray-500">Company ID</p>
                <p className="font-mono">{companyData?.companyId}</p>
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-500">Company Name</label>
                <input
                  className={`input input-bordered w-full ${ companyData?.companyName  === companyName.trim() ? "" : "border-green-400 focus:border-green-500 focus:ring-green-200" }`}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  readOnly={!isEditingCompanyName}
                />
                {isEditingCompanyName ?
                  <>
                    <label
                      onClick={() => { setCompanyName(companyData?.companyName ?? ""); setIsEditingCompanyName(false); }}
                      className="cursor-pointer text-red-500 hover:text-red-700 transition-colors"
                    >
                      ⤺ Revert 
                    </label>
                  </> :
                  <>
                    <label
                      onClick={() => setIsEditingCompanyName(true)}
                      className="cursor-pointer text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      ✎ Edit
                    </label>
                  </>
                }
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Wallet Address</p>
                <p className="font-mono break-all">
                  {companyData?.walletAddress || "Not assigned"}
                </p>
              </div>

              <button className="btn w-full" onClick={saveCompanyProfile} disabled={companyData?.companyName === companyName.trim() ? true : false}>
                Save Changes
              </button>
            </div>
          }
          { viewSelect === "userRegistration" &&
            <>
              <div className="max-w-md mx-auto p-4 border rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Create a New-User Token</h2>

                <div className="mb-2">
                  <p className="text-sm text-gray-500">Company ID</p>
                  <p className="font-mono">{companyData?.companyId}</p>
                </div>

                <div className="mb-2">
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="font-mono">{companyData?.companyName}</p>
                </div>

                <div className="mb-4">
                  <label className="text-sm text-gray-500">New User's Email</label>
                  <input
                    className={`input input-bordered w-full`}
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="text-sm text-gray-500">User Role</label>

                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="user"
                        className="radio"
                        checked={newUserRole === "user"}
                        onChange={() => setNewUserRole("user")}
                      />
                      <span>User</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="manager"
                        className="radio"
                        checked={newUserRole === "manager"}
                        onChange={() => setNewUserRole("manager")}
                      />
                      <span>Manager</span>
                    </label>
                  </div>
                </div>
                <button className="btn w-full" onClick={requestNewUserTokenButton} disabled={newUserEmail.trim() === "" ? true : false}>
                  Request Token
                </button>
              </div>

              <h2 className="text-lg font-bold">Registration Token List</h2>
              <div className="flex flex-col gap-3">
                {registrationTokenData?.map((token) => 
                  <div
                    key={token.registration_token_id}
                    className="p-4 border rounded-lg shadow flex justify-between items-center"
                  >
                    <div className="flex flex-col">
                      <div className="font-bold">
                        {token.email}
                      </div>
                      <div className="mt-1 text-sm">
                        Token: {token.registrationToken}
                      </div>
                      <div className="mt-1 text-sm">
                        Role: {token.role}
                      </div>
                      <div className="mt-1 text-sm">
                        ID: {token.registration_token_id}
                      </div>
                      <div
                        className={`mt-1 text-sm ${
                          token.status === "used"
                            ? "text-green-600"
                            : token.status === "revoked"
                            ? "text-red-600"
                            : token.status === "pending"
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      >
                        Status: {token.status}
                      </div>
                    </div>
                    {token.status === "pending" &&
                      <div className="flex justify-end mt-2">
                        <button className="btn btn-sm btn-cancel transition-all duration-200 hover:brightness-95 hover:shadow-sm" onClick={() => revokeToken(token)}>
                          Revoke Token
                        </button>
                      </div>
                    }
                  </div>
                )}
              </div>
            </>
          }

          
        </div>
      </div>
    </div>  
  );
}
