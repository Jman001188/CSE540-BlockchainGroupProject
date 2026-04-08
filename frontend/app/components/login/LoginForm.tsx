"use client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    
    return (
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <legend className="fieldset-legend">Login</legend>

            <label className="label">Email</label>
            <input type="email" className="input" placeholder="Email" />

            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Password" />

            <button className="btn btn-neutral mt-4" onClick={() => router.push("/home")}>Login</button>
            <button className="btn btn-neutral mt-4" onClick={() => router.push("/register")}>Register</button>
        </fieldset>
    )
}