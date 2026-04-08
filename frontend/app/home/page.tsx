"use client";
import { useRouter } from "next/navigation";
import Card from "../components/global/Card";

export default function HomePage() {
const router = useRouter();

const actions = [
  { action: "Register New Items", route: "/home/registerbatch" },
  { action: "Send", route: "/home/sendbatch" },
  { action: "Receive", route: "/home/receivebatch" },
  { action: "User Profile", route: "/home/userprofile" },
  { action: "Company Profile", route: "/home/companyprofile" },
]

  return (
    <div className="grid grid-cols-3 gap-6 pt-10">
        {actions.map((currentAction) => (
          <Card
            key={currentAction.route}
            action={currentAction.action}
            route={currentAction.route}
          />
        ))}
    </div>
  );
}

