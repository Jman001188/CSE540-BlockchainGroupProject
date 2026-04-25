"use client";

import { useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";

import { Context } from "../../global/Context";
import { TransferBatchAPI } from "../../utils/apiclient";
import type { BatchQrModel, RecipientQrModel, TransferModel } from "../../utils/types/models";
import SendBatchComponent from "./SendBatchComponent";
import ViewTransfersComponent from "./ViewTransfersComponent";
import { CreateTransferRequest } from "../../utils/types/api-contract";

export default function SendBatchPage() {
  const [hasItemQrValue, setHasItemQrValue] = useState(false);
  const [hasRecipientQrValue, setHasRecipientQrValue] = useState(false);
  const [currentStepForSending, setCurrentStepForSending] = useState("scanItem");
  const [processedItemData, setProcessedItemData] = useState<BatchQrModel | null>(null);
  const [processedRecipientData, setProcessedRecipientData] = useState<RecipientQrModel | null>(null);
  const [isValidBatch, setIsValidBatch] = useState(false);
  const [viewSelect, setViewSelect] = useState("sendbatch");
  const [transferList, setTransferList] = useState<TransferModel[]>([]);

  const { sessionToken } = useContext(Context);
  const router = useRouter();

  const resetSendFlow = () => {
    setHasItemQrValue(false);
    setHasRecipientQrValue(false);
    setProcessedItemData(null);
    setProcessedRecipientData(null);
    setIsValidBatch(false);
    setCurrentStepForSending("scanItem");
  };

  const refreshTransferList = useCallback(() => {
    if (!sessionToken) {
      alert("You must be logged in to view transfers.");
      router.push("/login");
      return;
    }

    TransferBatchAPI.getTransferList(sessionToken)
      .then((response) => {
        setTransferList(response);
      })
      .catch((error) => {
        console.error("Error fetching transfers:", error);
        alert("Failed to fetch transfer list.");
      });
  }, [sessionToken, router]);

  const handleItemScan = (result: string) => {
    if (!result.trim()) return;
    try {
      const parsed = JSON.parse(result) as BatchQrModel;
      const status = parsed?.blockchain?.status;
      if (!status) throw new Error("Invalid batch QR payload");

      setProcessedItemData(parsed);
      console.log("Item QR Result:", parsed);
      setHasItemQrValue(true);
      setIsValidBatch(status !== "failed");
    } catch (error) {
      console.error("Error processing Item QR result:", error);
      alert("Could not read item QR code. Please scan a valid batch QR.");
    }
  };

  const handleRecipientScan = (result: string) => {
    if (!result.trim()) return;
    try {
      const parsed = JSON.parse(result) as RecipientQrModel;
      if (!parsed?.companyId || !parsed?.userId) throw new Error("Invalid recipient QR payload");

      setProcessedRecipientData(parsed);
      console.log("Recipient QR Result:", parsed);
      setHasRecipientQrValue(true);
    } catch (error) {
      console.error("Error processing Recipient QR result:", error);
      alert("Could not read recipient QR code. Please scan a valid recipient QR.");
    }
  };

  const triggerItemTransfer = () => {
    if (!sessionToken) {
      alert("You must be logged in to send a batch.");
      router.push("/login");
      return;
    }

    if (!processedItemData?.batchId || !processedRecipientData?.companyId || !processedRecipientData?.userId) {
      alert("Scan both the item batch QR and the recipient QR before confirming.");
      return;
    }

    if (!isValidBatch) {
      alert("This batch cannot be transferred (blockchain status failed).");
      return;
    }

    const apiPayload: CreateTransferRequest = {
      batchId: processedItemData.batchId,
      toCompanyId: processedRecipientData.companyId,
      receivingUserID: processedRecipientData.userId,
    };

    TransferBatchAPI.initiateTransfer(sessionToken, apiPayload)
      .then((response) => {
        alert(`Transfer created. Transfer ID: ${response.transferId}`);
        resetSendFlow();
        refreshTransferList();
      })
      .catch((error) => {
        console.error("Error initiating transfer:", error);
        alert("Failed to start transfer.");
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex justify-center pb-40">
        <div className="flex flex-col gap-4 p-4 w-full max-w-lg mx-auto">
          <div className="flex flex-row gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${viewSelect === "sendbatch" ? "selected-styles" : "default-styles"}`}
              onClick={() => setViewSelect("sendbatch")}
            >
              Send item batch
            </button>
            <button
              className={`btn btn-sm ${viewSelect === "viewtransfers" ? "selected-styles" : "default-styles"}`}
              onClick={() => {
                setViewSelect("viewtransfers");
                refreshTransferList();
              }}
            >
              View transfer requests
            </button>
          </div>

          {viewSelect === "viewtransfers" && (
            <ViewTransfersComponent transferList={transferList} refreshTransferList={refreshTransferList} />
          )}

          {viewSelect === "sendbatch" && (
            <SendBatchComponent
              currentStepForSending={currentStepForSending}
              setCurrentStepForSending={setCurrentStepForSending}
              hasItemQrValue={hasItemQrValue}
              setHasItemQrValue={setHasItemQrValue}
              hasRecipientQrValue={hasRecipientQrValue}
              setHasRecipientQrValue={setHasRecipientQrValue}
              processedItemData={processedItemData}
              setProcessedItemData={setProcessedItemData}
              processedRecipientData={processedRecipientData}
              setProcessedRecipientData={setProcessedRecipientData}
              isValidBatch={isValidBatch}
              setIsValidBatch={setIsValidBatch}
              handleRecipientScan={handleRecipientScan}
              handleItemScan={handleItemScan}
              triggerItemTransfer={triggerItemTransfer}
            />
          )}
        </div>
      </div>
    </div>
  );
}
