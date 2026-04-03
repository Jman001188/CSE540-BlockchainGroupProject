"use client";
import { useRouter } from "next/navigation";



export default function LoginPage() {
const router = useRouter();

  return (
    <div>
        <button onClick={() => router.push("/home")}>Back</button><hr/><br/>
        User Profile<br/><br/>
    </div>
  );
}