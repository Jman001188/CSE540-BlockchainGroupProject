"use client";
import QRCamera from "../../components/global/QRCamera";
import QRFile from "../../components/global/QRFile";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CompanyData, BatchData } from "../utils/types";
import { PendingTransferData } from "../utils/types";


const testTransferListData: PendingTransferData[] = [
  {
    transferId: 1,
    batchId: 1,
    batchName: "Test Batch 1",
    fromCompanyName: "Test Company",
    toCompanyName: "Warehouse B",
    senderUserId: 1,
    senderUserName: "Test User",
    receivingUserId: 2,
    receivingUserName: "Warehouse User",
    status: "pending",
    createdAt: "2024-01-01T12:00:00Z"
  },
  {
    transferId: 2,
    batchId: 2,
    batchName: "Test Batch 2",
    fromCompanyName: "Test Company",
    toCompanyName: "Warehouse C",
    senderUserId: 1,
    senderUserName: "Test User",
    receivingUserId: 3,
    receivingUserName: "Warehouse User",
    status: "accepted",
    createdAt: "2024-01-01T12:00:00Z"
  }
];


export default function LoginPage() {
  const [ hasItemQrValue, setHasItemQrValue ] = useState<boolean>(false);
  const [ hasRecipientQrValue, setHasRecipientQrValue ] = useState<boolean>(false);
  const [ currentStepForSending, setCurrentStepForSending ] = useState<string>("scanItem");
  const [ processedItemData, setProcessedItemData ] = useState<BatchData | null>(null);
  const [ processedRecipientData, setProcessedRecipientData ] = useState<CompanyData | null>(null);
  const [ isValidBatch, setIsValidBatch ] = useState<boolean>(false);
  const [ viewSelect, setViewSelect ] = useState<string>("sendbatch");
  const [ transferList, setTransferList ] = useState<PendingTransferData[]>([]);
  

    const refreshTransferList = () => {
    // Fetch the list of pending transfers from the API and set them in state
    /*
    api.GetPendingTransfers() 
      .then(response => {
        setTransferList(response.transfers);
      })
      .catch(error => {
        console.error("Error fetching pending transfers:", error);
      });
    */
    console.log(testTransferListData);
    setTransferList(testTransferListData);
  };

  const handleRefreshTransferListClick = () => {
    refreshTransferList();
  }

  // Scans the QR Code for the item batch
  // This will catch an error if the json format is incorrect or the scanned QR code does not match the expected ItemBatchData structure
  const handleItemScan = (result: any) => {
    try {
      // This doesn't assign the data Since the test QR Codes are fake
      //setProcessedItemData(result as ItemBatchData);

      console.log("Item QR Result:", result);
      setHasItemQrValue(true);  
      result.blockchain.status === "confirmed" ? setIsValidBatch(true) : setIsValidBatch(false);

    } catch (error) {
      console.error("Error processing Item QR result:", error);
    }
  };

  // Scans the QR Code for the recipient company
  // This will catch an error if the json format is incorrect or the scanned QR code does not match the expected CompanyData structure
  const handleRecipientScan = (result: any) => {

    try {
      // This doesn't assign the data Since the test QR Codes are fake
      //setProcessedRecipientData(result as CompanyData);

      console.log("Recipient QR Result:", result);
      setHasRecipientQrValue(true);
    } catch (error) {
      console.error("Error processing Recipient QR result:", error);
    }
  };

  const clearItems = () => {
    setHasItemQrValue(false);
    setHasRecipientQrValue(false);

  }

  // This is a simulated function until APIS are connected
  const triggerItemTransfer = () => {
    // API CALL SIMULATION
    alert("You successfully transfered an item!")
    console.log("Transferring item batch:", processedItemData, "to recipient:", processedRecipientData);
    setCurrentStepForSending("scanItem");
    clearItems();
  }

  const cancelBatch = (transferId: number) => {
    // API CALL SIMULATION
    confirm("Are you sure you wish to cancel this transfer?") ? 
      console.log("Canceled transfer with ID:", transferId) : 
      console.log("Did not cancel transfer with ID:", transferId);
  }

  return (
    <div className="min-h-screen flex flex-col w-[500px] mx-auto items-center">
      <div className="flex flex-row gap-2">
        <button 
          className={`btn btn-sm ${viewSelect === 'register' ? 'selected-styles' : 'default-styles'}`}
          onClick={() => setViewSelect("sendbatch")}
        >
          Send Item Batch
        </button>
        <button 
          className={`btn btn-sm ${viewSelect === 'list' ? 'selected-styles' : 'default-styles'}`}
          onClick={() => {setViewSelect("viewtransfers"); handleRefreshTransferListClick();}}
        >
          View Transwer Requests
        </button>
      </div>
      {viewSelect === "viewtransfers" && (
        <>
          <button className="btn" onClick={handleRefreshTransferListClick}>
            Refresh List
          </button>

          {transferList
            .sort((a, b) => b.transferId - a.transferId)
            .map((transferRequest) => (
              <div
                key={transferRequest.transferId}
                className="p-4 border rounded-lg shadow cursor-pointer hover:bg-gray-100 transition"
              >
                <div className="font-bold">
                  Batch #{transferRequest.batchId}
                </div>

                <div className="text-sm text-gray-600">
                  {transferRequest.batchName} - Registered on{" "}
                  {new Date(transferRequest.createdAt).toLocaleDateString()} by{" "}
                  {transferRequest.fromCompanyName}
                </div>

                <div className="text-sm text-gray-600">
                  Company: {transferRequest.fromCompanyName} is sending this batch to{" "}
                  {transferRequest.toCompanyName}
                </div>

                <div className="text-sm text-gray-600">
                  User: {transferRequest.senderUserName} is sending this batch to{" "}
                  {transferRequest.receivingUserName}
                </div>

                <div
                  className={`mt-1 text-sm ${
                    transferRequest.status === "accepted"
                      ? "text-green-600"
                      : transferRequest.status === "pending"
                      ? "text-yellow-600"
                      : transferRequest.status === "rejected"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  Status: {transferRequest.status}
                </div>

                {transferRequest.status === "pending" && (
                  <div className="flex flex-row gap-2 mt-2">
                    <button
                      className="btn btn-sm btn-cancel"
                      onClick={() => cancelBatch(transferRequest.transferId)}
                    >
                      Cancel Transfer
                    </button>
                  </div>
                )}
              </div>
            ))}
        </>
      )}
      {
        currentStepForSending === "scanItem" && viewSelect === "sendbatch" &&
        <>
          <hr/> 
          { !hasItemQrValue &&
            <>
              <h2 className="text-2xl font-bold text-center">Scan the QR code on the item you want to send.</h2>
              <QRCamera onScan={handleItemScan} />
              <QRFile onScan={handleItemScan} />
            </>
          }
          { hasItemQrValue &&             
            <div className="columns" >
              <button onClick={() => setHasItemQrValue(false)} className="btn">
                Scan Item Again
              </button>
              <h2 className="text-2xl font-bold text-center">Item Information</h2>
              <p>Item Batch Blockchain ID: {processedItemData?.batchId}</p>
              <p>Item Batch Name: {processedItemData?.batchName}</p>
              <p>Item Owner: {processedItemData?.registeringCompanyName}</p>
              <p>Item Description: {processedItemData?.batchDescription}</p>
              <p>Item Status: {processedItemData?.blockchain.status}</p>
              <hr/>
              {!isValidBatch ? 
                <p className="text-red-500">This item batch is not confirmed on the blockchain. Please scan a different item.</p> :
                <button className="btn" onClick={() => setCurrentStepForSending("scanRecipient")}>Next</button>
              }
              
            </div> 
          }
        </>
      }
      { currentStepForSending === "scanRecipient" && viewSelect === "sendbatch" &&
        <>
          { hasItemQrValue &&             
            <div className="columns" >
              <button onClick={() => {setCurrentStepForSending("scanItem");setHasItemQrValue(false);setHasRecipientQrValue(false)}} className="btn">
                Scan Item Again
              </button>
              <h2 className="text-2xl font-bold text-center">Item Information</h2>
              <p>Item Batch Blockchain ID: {processedItemData?.batchId}</p>
              <p>Item Batch Name: {processedItemData?.batchName}</p>
              <p>Item Owner: {processedItemData?.registeringCompanyName}</p>
              <p>Item Description: {processedItemData?.batchDescription}</p>
              <p>Item Status: {processedItemData?.blockchain.status}</p>
              <hr/>
              { !hasRecipientQrValue &&
                <>
                  <h2 className="text-2xl font-bold text-center">Scan the QR code on the recipient you want to send the item to.</h2>
                  <QRCamera onScan={handleRecipientScan} />
                  <QRFile onScan={handleRecipientScan} />
                </>
              }
              { hasRecipientQrValue &&             
                <>
                  <button onClick={() => setHasRecipientQrValue(false)} className="btn">
                    Scan Recipient Again
                  </button>
                  <h2 className="text-2xl font-bold text-center">Recipient Information</h2>
                  <p>Company Description: {processedRecipientData?.companyId}</p>
                  <p>Company Name: {processedRecipientData?.companyName}</p>
                  <p>Company Ethereum Wallet: {processedRecipientData?.publicKey}</p>
                  <button className="btn" disabled={!hasRecipientQrValue || !hasItemQrValue} onClick={() => triggerItemTransfer()}>
                    Confirm Transfer Batch
                  </button> 
                </> 
              }
            </div> 
          }
        </>
      }
    </div>
  );
}