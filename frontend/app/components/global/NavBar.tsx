"use client";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react"
import { Context } from "./Context";

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { sessionToken,setSessionToken } = useContext(Context);

    // Everytime sessionToken changes, update the isLoggedIn state
    // This will change once a backend token check is implemented to verify if the sessionToken is still valid
    useEffect(() => {
        if (sessionToken && sessionToken !== "") {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, [ sessionToken ]);

    const handleLogout = () => {
        setSessionToken("");
        router.push("/login");
    };

    const handleLogin = () => {
        router.push("/login");
    };

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" /> </svg>
                </div>
                <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
                    <li><a>Item 1</a></li>
                    <li>
                    <a>Parent</a>
                    <ul className="p-2">
                        <li><a>Submenu 1</a></li>
                        <li><a>Submenu 2</a></li>
                    </ul>
                    </li>
                    <li><a>Item 3</a></li>
                </ul>
                </div>
                <button className="btn btn-ghost text-xl" onClick={() => router.push("/home")} >Home</button>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                <li><a>Item 1</a></li>
                <li>
                    <details>
                    <summary>Parent</summary>
                    <ul className="p-2 bg-base-100 w-40 z-10">
                        <li><a>Submenu 1</a></li>
                        <li><a>Submenu 2</a></li>
                    </ul>
                    </details>
                </li>
                <li><a>Item 3</a></li>
                </ul>
            </div>
            <div className="navbar-end">
                {!isLoggedIn ? (<button className="btn" onClick={handleLogin}>
                        Login
                    </button>
                    ) : (
                    <button className="btn btn-error" onClick={handleLogout}>
                        Logout
                    </button>
                    )}
            </div>
        </div>
    );
}