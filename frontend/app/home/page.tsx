"use client";
import { useRouter } from "next/navigation";

export default function HomePage() {
const router = useRouter();

  return (
    <div>
        <button onClick={() => router.push("/login")}>Logout</button><hr/><br/>
        Home Page <br/><br/>
        <button onClick={() => router.push("/home/registerbatch")}>Register New Items</button><br/>
        <button onClick={() => router.push("/home/sendbatch")}>Send</button><br/>
        <button onClick={() => router.push("/home/receivebatch")}>Receive</button><br/>
        <button onClick={() => router.push("/home/userprofile")}>User Profile</button><br/>
        <button onClick={() => router.push("/home/companyprofile")}>Company Profile</button><br/>
    </div>
  );
}