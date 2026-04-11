"use client";
import { useRouter } from "next/navigation";
import Card from "../components/global/Card";
import { useContext } from "react";
import { Context } from "../components/global/Context";

export default function HomePage() {
  const router = useRouter();

  const actions = [
    { action: "Register New Items", route: "/home/registerbatch" },
    { action: "Send", route: "/home/sendbatch" },
    { action: "Receive", route: "/home/receivebatch" },
    { action: "User Profile", route: "/home/userprofile" },
    { action: "Company Profile", route: "/home/companyprofile" },
  ]
  const { sessionToken } = useContext(Context);

  if (sessionToken === "") return null;
  
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

