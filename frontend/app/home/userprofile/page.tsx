"use client";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";



export default function LoginPage() {
  const [ firstName, setFirstName ] = useState<string>("");
  const [ newFirstName, setNewFirstName ] = useState<string>("");
  const [ isEditingFirstName, setIsEditingFirstName ] = useState<boolean>(false);

  const [ lastName, setLastName ] = useState<string>("");
  const [ newLastName, setNewLastName ] = useState<string>("");
  const [ isEditingLastName, setIsEditingLastName ] = useState<boolean>(false);

  const [ companyName, setCompanyName ] = useState<string>("");


  // This is a work in progress. Lots will change here
  useEffect(() => {
    // Fetch User Details from Backend
    fetch("/api/user/profile")
      .then(res => res.json())
      .then(data => {
        localStorage.setItem("userProfile", JSON.stringify(data));
      })
      .catch(err => console.error("Failed to fetch user profile:", err));


    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");

    setFirstName(userProfile.firstName || "");
    setNewFirstName(userProfile.firstName || "");
    setLastName(userProfile.lastName || "");
    setNewLastName(userProfile.lastName || "");
    setCompanyName(userProfile.companyName || "");  
  }, []);

  // I want the user to be able to click on their first or last name to edit it inline and then save the changes
  // It's currently broken right now
  // I also need to list the rest of the company data associated with the user.
  return (
    <div className="min-h-screen flex flex-col w-[500px] mx-auto items-center">
        <h1>User Profile</h1>
        {isEditingFirstName ?
          <div className="flex flex-row w-full border-green-500" >
            <label>First Name:</label>
            <input 
              className="input" 
              onChange={(e) => setNewFirstName(e.currentTarget.textContent)}
            >
              {newFirstName}
            </input>
            <p className="cursor-pointer text-red-500 hover:text-red-700 transition-colors" onClick={() => {setNewFirstName(firstName); setIsEditingFirstName(false)}}>X</p>
          </div>
          :
          <div className="flex flex-col w-full" >
            <label >First Name</label>
            <p
              className="cursor-pointer border-b border-dashed border-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors" 
              onClick={() => setIsEditingFirstName(true)}
            >
              {firstName || "Click to enter your first name"}
            </p>
          </div>
        }

        {isEditingLastName ?
          <div className="flex flex-row w-full border-green-500" >
            <label>Last Name:</label>
            <input 
              className="input" 
              onChange={(e) => setNewLastName(e.currentTarget.textContent)}
            >
              {newLastName}
            </input>
            <p className="cursor-pointer text-red-500 hover:text-red-700 transition-colors" onClick={() => {setNewLastName(lastName); setIsEditingLastName(false)}}>X</p>
          </div>
          :
          <div className="flex flex-col w-full" >
            <label >Last Name</label>
            <p
              className="cursor-pointer border-b border-dashed border-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors" 
              onClick={() => setIsEditingLastName(true)}
            >
              {lastName || "Click to enter your last name"}
            </p>
          </div>
        }

        <div className="flex flex-row w-full mt-4">
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={!isEditingFirstName && !isEditingLastName}
            onClick={() => {
              setFirstName(newFirstName);
              setIsEditingFirstName(false);
              setLastName(newLastName);
              setIsEditingLastName(false);
            }}
          >
            Save Changes
          </button>
        </div>

        <div className="flex items-center text-gray-500 my-4">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-3 text-sm">Company Information</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <div className="flex flex-col w-full" > 

          <label>Company Name: {}</label>


        </div>
        

    </div>
  );
}