"use client";
import { useRouter } from "next/navigation";
import LoginForm from "../components/login/LoginForm";


export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center pb-40">
        <LoginForm />
      </div>
    </div>
  );
}