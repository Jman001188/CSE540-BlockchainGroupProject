"use client";
import QRGenerator from "@/app/components/global/QRGenerator";
import { useContext, useEffect, useState } from "react";
import { PendingTransferData, RecipientData, TransferData } from "../utils/types";
import { Context } from "../global/Context";
import { testTransferListData, acceptBatch as testAccept, rejectBatch as testReject  } from "@/app/tempData";
import { BatchAPI, TransferBatchAPI } from "../utils/apiclient";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const { sessionToken, userData, companyData } = useContext(Context)

  const [selectedItem, setSelectedItem] = useState<PendingTransferData | null>(null);
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransferData[]>([]);
  const [recipientData, setRecipientData] = useState<RecipientData | null>(null);
  const [viewSelect, setViewSelect] = useState<string>("qr code");
  const [filteredForUserTransfers, setFilteredForUserTransfers] = useState<boolean>(false);

  const router = useRouter();

  
  useEffect(() => {
    handleRefreshPendingList();
    const userFullName = `${userData?.firstName} ${userData?.lastName }`
    const tempRecipientData: RecipientData = {
      name: userFullName,
      email: userData?.email ?? "",
      companyPublicKey: companyData?.walletAddress ?? ""

    }
    
    setRecipientData(tempRecipientData)
  }, []);
 
  
  const handleRefreshPendingList = () => {
    if (!sessionToken) router.replace("/login")

    // API CALL
    /*
    TransferBatchAPI.getTransferList(sessionToken!)
      .then( (response) => {
        setPendingTransfers(response);
        setSelectedItem(null);
      })
      .catch( (error) => {
        console.error("There was an error while fetching the transfer list:", error);
        alert("Failed toi fetch transfer list.");
      })

    */
    // Test Logic - remove when APIs are complete
    setPendingTransfers(testTransferListData);
    setSelectedItem(null);
  };

  
  const handleSelectItem = (item: PendingTransferData) => {
    setSelectedItem(item);
    console.log("Clicked:", item);
  };

  const acceptBatch = (item: PendingTransferData) => {
    if (!sessionToken) router.replace("/login")
    
    // Call API to mark the batch as accepted here
    /*
    TransferBatchAPI.acceptTransfer(sessionToken!, selectedItem?.batchId!)
      .then( (response) => {
        console.log(response.message)
        setSelectedItem(null);
      })
      .catch( (error) => {
        console.error("Error while accepting transfer:", error);
        alert("Failed to accept transfer.");
      })
    */

    console.log("Accepted Item Batch ID:", item.batchId);
    testAccept(selectedItem?.batchId!)
    setSelectedItem(null);

  };

  const rejectBatch = (item: PendingTransferData) => {
    if (!sessionToken) router.replace("/login")
    
    // Call API to mark the batch as rejected here
    /*
    TransferBatchAPI.rejectTransfer(sessionToken!, selectedItem?.batchId!)
      .then( (response) => {
        console.log(response.message)
        setSelectedItem(null);
      })
      .catch( (error) => {
        console.error("Error while rejecting transfer:", error);
        alert("Failed to reject transfer.");
      })
    */

    console.log("Rejected Item Batch ID:", item.batchId);
    testReject(selectedItem?.batchId!)
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex justify-center pb-40">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-row gap-2">
            <button 
              className={`btn btn-sm ${viewSelect === "qr code" ? 'selected-styles' : 'default-styles'}`}
              onClick={() => {setViewSelect("qr code");}}
            >
              Show QR Code for Receiving Items
            </button>
            <button 
              className={`btn btn-sm ${viewSelect === "incoming transfers" ? 'selected-styles' : 'default-styles'}`}
              onClick={() => {setViewSelect("incoming transfers"); handleRefreshPendingList() }}
            >
              View Incoming Transfers
            </button>
          </div>

          {viewSelect === "qr code" ?
            <QRGenerator data={JSON.stringify(recipientData)} />
          :
            <>
              <h2 className="text-lg font-bold">Pending Incoming Transfers</h2>
              <button className="btn" onClick={handleRefreshPendingList}>Refresh</button>
              <input type="checkbox" className="checkbox" onChange={() => setFilteredForUserTransfers(!filteredForUserTransfers)} />
              <div className="flex flex-col gap-3">
                {pendingTransfers.map((item) => 
                  filteredForUserTransfers && item.receivingUserId !== userData?.userId ? null :
                  (
                    <div
                      key={item.transferId}
                      onClick={() => handleSelectItem(item)}
                      className="p-4 border rounded-lg shadow cursor-pointer hover:bg-gray-100 transition"
                    >
                      <div className="font-bold">Batch #{item.batchId}</div>

                      <div className="text-sm text-gray-600">
                        {item.fromCompanyName} → {item.toCompanyName}
                      </div>

                      <div
                        className={`mt-1 text-sm ${
                          item.status === "approved"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {item.status}
                      </div>
                    </div>
                  )
                )}
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
            </>
          }

            
        </div>
      </div>
    </div>
  );
}