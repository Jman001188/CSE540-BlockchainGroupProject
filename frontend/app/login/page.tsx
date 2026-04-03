"use client";
import { useRouter } from "next/navigation";



export default function LoginPage() {
const router = useRouter();

  return (
    <div>
        <button onClick={() => router.push("/")}>Back to Next.js Page</button><hr/><br/>
        Login Page<br/><br/>
        <input type="text" placeholder="Username"></input><br/>
        <input type="password" placeholder="Password"></input><br/>
        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            onClick={() => router.push("/home")}>
            Login
        </button><br/>
    </div>
  );
}