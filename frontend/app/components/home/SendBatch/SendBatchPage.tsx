"use client";

import { useContext, useState } from "react";
import { RecipientQrData, BatchQrData } from "../../utils/types";
import { PendingTransferData } from "../../utils/types";
import { Context } from "../../global/Context";
import ViewTransfersComponent from "./ViewTransfersComponent";
import SendBatchComponent from "./SendBatchComponent";
import { testTransferListData } from "@/app/tempData";

export default function LoginPage() {
  const [ hasItemQrValue, setHasItemQrValue ] = useState<boolean>(false);
  const [ hasRecipientQrValue, setHasRecipientQrValue ] = useState<boolean>(false);
  const [ currentStepForSending, setCurrentStepForSending ] = useState<string>("scanItem");
  const [ processedItemData, setProcessedItemData ] = useState<BatchQrData | null>(null);
  const [ processedRecipientData, setProcessedRecipientData ] = useState<RecipientQrData | null>(null);
  const [ isValidBatch, setIsValidBatch ] = useState<boolean>(false);
  const [ viewSelect, setViewSelect ] = useState<string>("sendbatch");
  const [ transferList, setTransferList ] = useState<PendingTransferData[]>([]);
  const { sessionToken } = useContext(Context);

  const refreshTransferList = () => {
    // Fetch the list of pending transfers from the API and set them in state
    /*
    TransferBatchAPI.getTransferList(sessionToken) 
      .then(response => {
        setTransferList(response);
      })
      .catch(error => {
        console.error("Error fetching pending transfers:", error);
      });
    */

    console.log(testTransferListData);
    setTransferList(testTransferListData);
  };

  // Scans the QR Code for the item batch
  // This will catch an error if the json format is incorrect or the scanned QR code does not match the expected ItemBatchData structure
  const handleItemScan = (result: any) => {
    try {
      setProcessedItemData(result as BatchQrData);

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
      setProcessedRecipientData(result as RecipientQrData);

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
    /*
    const requestData = {
      batchId: processedItemData?.batchId,
      toCompanyId: processedRecipientData?.companyId,
      receivingUserId: processedRecipientData?.userId
    };
    
    TransferBatchAPI.initiateTransfer(sessionToken, requestData)  
    */

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
          onClick={() => {setViewSelect("viewtransfers"); refreshTransferList();}}
        >
          View Transfer Requests
        </button>
      </div>

      { viewSelect === "viewtransfers" &&
        <ViewTransfersComponent testTransferListData={testTransferListData} transferList={transferList} refreshTransferList={refreshTransferList} cancelBatch={cancelBatch} />
      }

      { viewSelect === "sendbatch" &&
        <SendBatchComponent 
          currentStepForSending={currentStepForSending} setCurrentStepForSending={setCurrentStepForSending}
          hasItemQrValue={hasItemQrValue} setHasItemQrValue={setHasItemQrValue}
          hasRecipientQrValue={hasRecipientQrValue} setHasRecipientQrValue={setHasRecipientQrValue} 
          processedItemData={processedItemData} setProcessedItemData={setProcessedItemData}
          processedRecipientData={processedRecipientData} setProcessedRecipientData={setProcessedRecipientData}
          isValidBatch={isValidBatch} setIsValidBatch={setIsValidBatch}
          handleRecipientScan={handleRecipientScan}
          handleItemScan={handleItemScan}
          triggerItemTransfer={triggerItemTransfer}/> 
      }
    </div>
  );
}