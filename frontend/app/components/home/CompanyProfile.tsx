"use client";
import { useRouter } from "next/navigation";



export default function CompanyProfile() {
const router = useRouter();

  return (
    <div>
        <button onClick={() => router.push("/home")}>Back</button><hr/><br/>
        Company Profile<br/><br/>
    </div>
  );
}
