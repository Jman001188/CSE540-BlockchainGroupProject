"use client";
import QRGenerator from "@/app/components/global/QRGenerator";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { RecipientData, TransferData } from "../utils/types";
import { Context } from "../global/Context";

// Dummy Data
const transfers: TransferData[] = [
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

  const { userData, companyData } = useContext(Context)

  const [selectedItem, setSelectedItem] = useState<TransferData | null>(null);
  const [pendingTransfers, setPendingTransfers] = useState<TransferData[]>([]);
  const [recipientData, setRecipientData] = useState<RecipientData | null>(null);

  
  useEffect(() => {
    handleRefreshPendingList();
    const userFullName = `${userData?.firstName} ${userData?.lastName }`
    const tempRecipientData: RecipientData = {
      name: userFullName,
      email: userData?.email ?? "",
      companyPublicKey: companyData?.publicKey ?? ""

    }
    setRecipientData(tempRecipientData)
  }, []);
 
  
  const handleRefreshPendingList = () => {
    setSelectedItem(null);
    // Fetch from API to refresh the list of pending transfers here 
    setPendingTransfers(transfers)
  };



  const router = useRouter();
  
  const handleSelectItem = (item: TransferData) => {
    setSelectedItem(item);
    console.log("Clicked:", item);
  };

  const acceptBatch = (item: TransferData) => {
    console.log("Accepted Item Batch ID:", item.batchId);
    setSelectedItem(null);
    // Call API to mark the batch as accepted here
  };

  const rejectBatch = (item: TransferData) => {
    console.log("Rejected Item Batch ID:", item.batchId);
    setSelectedItem(null);
    // Call API to mark the batch as rejected here
  };

  return (
    <>
      <button className="btn" onClick={() => router.push("/home")}>Back</button><hr/><br/>
      
      <div className="flex flex-col gap-3">
        {transfers.map((item) => ( // Iterate over the list of pending transfers and render each one
          <div
            key={item.id}
            onClick={() => handleSelectItem(item)}
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
          <button className="btn" onClick={() => acceptBatch(selectedItem)}>Accept</button>
          <button className="btn" onClick={() => rejectBatch(selectedItem)}>Reject</button>
        </>
        
      }
      <hr/>

      <QRGenerator data={JSON.stringify(recipientData)} />

        
    
    </>
  );
}