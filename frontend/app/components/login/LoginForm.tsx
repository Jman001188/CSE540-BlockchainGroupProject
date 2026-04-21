"use client";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { Context } from "../global/Context";
import { ProfileData, UserData } from "../utils/types";
import { testProfileData } from "@/app/tempData";



export default function LoginForm() {
    const router = useRouter();
    
    const [ email, setEmail ] = useState<string>("");
    const [ password, setPassword ] = useState<string>("");

    const {setSessionToken, setUserData, setCompanyData } = useContext(Context);

    const loginButtonHandler = () => {
        /*
        api.UserLogin({ email, password })
            .then(response => {
                // store session token or user info from response
                console.log("Login successful:", response);
                setSessionToken(response.sessionToken);
                setUserData(response.user);
                setCompanyData(response.company);
                
                setEmail("");
                setPassword("");
                router.push("/home");
            })
            .catch(error => {
                console.error("Login failed:", error);
                alert("Login failed. Please check your email and password and try again.");
                

            });
        */
        
        // temporary dummy login for testing without API
        setSessionToken(testProfileData.sessionToken ?? null!);
        setUserData(testProfileData.user);
        setCompanyData(testProfileData.company);
        router.push("/home");

    }



    return (
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <legend className="fieldset-legend">Login</legend>

            <label className="label">Email</label>
            <input 
                type="email" 
                className="input" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
            />

            <label className="label">Password</label>
            <input 
                type="password" 
                className="input" placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />

            <button className="btn btn-neutral mt-4" onClick={() => loginButtonHandler()}>Login</button>
            <button className="btn btn-neutral mt-4" onClick={() => router.push("/register")}>Register</button>
        </fieldset>
    )
}