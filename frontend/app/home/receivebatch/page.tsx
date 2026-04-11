"use client";
import QRGenerator from "@/app/components/global/QRGenerator";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Dummy Data
const transfers = [
  {
    id: 1,
    batchId: 123,
    fromCompany: "Farm A",
    toCompany: "Warehouse B",
    status: "pending",
  },
  {
    id: 2,
    batchId: 124,
    fromCompany: "Farm C",
    toCompany: "Store D",
    status: "accepted",
  },
];

export default function LoginPage() {
  const [ selectedItem, setSelectedItem ] = useState<{} | null> (null);

  const router = useRouter();
  
  const handleClick = (item: any) => {
    console.log("Clicked:", item);
  };

  const acceptBatch = (item: number) => {
    console.log("Clicked:", item);
  };
  const rejectBatch = (item: number) => {
    console.log("Clicked:", item);
  };

  return (
    <>
      <button className="btn" onClick={() => router.push("/home")}>Back</button><hr/><br/>
      
      <div className="flex flex-col gap-3">
        {transfers.map((item) => ( // Iterate over the list of pending transfers and render each one
          <div
            key={item.id}
            onClick={() => setSelectedItem(item.batchId)}
            className="p-4 border rounded-lg shadow cursor-pointer hover:bg-gray-100 transition"
          >
            <div className="font-bold">Batch #{item.batchId}</div>

            <div className="text-sm text-gray-600">
              {item.fromCompany} → {item.toCompany}
            </div>

            <div
              className={`mt-1 text-sm ${
                item.status === "accepted"
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            >
              {item.status}
            </div>
          </div>
        ))}
      </div>

      {
        selectedItem &&
        <>
          <p>***Selected Item Information***</p>
          <hr/>
          <button className="btn" onClick={() => acceptBatch(1)}>Accept</button>
          <button className="btn" onClick={() => rejectBatch(1)}>Reject</button>
        </>
        
      }
      <hr/>

      <QRGenerator data="teststring" />

        
    
    </>
  );
}