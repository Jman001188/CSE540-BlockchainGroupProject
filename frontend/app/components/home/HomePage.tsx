"use client";

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
  ];
  const { sessionToken, userData, companyData } = useContext(Context);

  if (sessionToken === "") return null;

  const visibleActions = actions.filter(
    (action) => !(action.route === "/home/companyprofile" && userData?.role === "user")
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex justify-center pb-40">
        <div className="w-full max-w-5xl px-4 pt-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              {companyData?.companyName ? `Company: ${companyData.companyName}` : "Manage your supply chain tasks"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleActions.map((currentAction) => (
              <Card key={currentAction.route} action={currentAction.action} route={currentAction.route} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
