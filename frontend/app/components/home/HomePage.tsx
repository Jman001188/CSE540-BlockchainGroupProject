"use client";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { Context } from "../global/Context";
import Card from "../global/Card";


export default function HomePage() {

  const actions = [
    { action: "Register New Items", route: "/home/registerbatch" },
    { action: "Send", route: "/home/sendbatch" },
    { action: "Receive", route: "/home/receivebatch" },
    { action: "User Profile", route: "/home/userprofile" },
    { action: "Company Management", route: "/home/companyprofile" },
  ]
  const { sessionToken, userData} = useContext(Context);

  if (sessionToken === "") return null;
  
  return (
    <div className="grid grid-cols-3 gap-6 pt-10">
      {actions.map((currentAction) => {
        if (currentAction.route === "/home/companyprofile" && userData?.role === "user") return null;

        return (
          <Card
            key={currentAction.route}
            action={currentAction.action}
            route={currentAction.route}
          />
        )
      })}
    </div>
  );
}

