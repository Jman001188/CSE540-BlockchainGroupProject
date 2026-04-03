"use client";
import { useRouter } from "next/navigation";



export default function LoginPage() {
const router = useRouter();

  return (
    <div>
        <button onClick={() => router.push("/home")}>Back</button><hr/><br/>
        Receive Batch<br/><br/>
        ***PENDING GOODS TO BE ACCEPTED***<hr/><br/>
        
        
        ***QR CODE***<br/>
        ***QR CODE***<br/>
        ***QR CODE***<br/>
        ***QR CODE***<br/>

        
    </div>
  );
}