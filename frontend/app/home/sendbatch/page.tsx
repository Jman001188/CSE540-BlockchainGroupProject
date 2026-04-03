"use client";
import { useRouter } from "next/navigation";



export default function LoginPage() {
const router = useRouter();

  return (
    <div>
        <button onClick={() => router.push("/home")}>Back</button><hr/><br/>
        Send Batch<br/><br/>
        ***integrate a scanning function here***<br/>
        ***integrate a scanning function here***<br/>
        ***integrate a scanning function here***<br/>
        ***integrate a scanning function here***<hr/><br/>

        This will scan the item goods QR code, which will then show the user<br/>
        a confirmation of the goods they are sending. It will then allow to scan the receiving user's QR code.
    </div>
  );
}