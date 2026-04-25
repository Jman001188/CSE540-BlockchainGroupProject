"use client";

import QRCamera from "../../global/QRCamera";
import QRFile from "../../global/QRFile";
import DetailRow from "../../global/DetailRow";
import type { BatchQrModel, RecipientQrModel } from "../../utils/types/models";

type Props = {
  currentStepForSending: string;
  setCurrentStepForSending: React.Dispatch<React.SetStateAction<string>>;
  hasItemQrValue: boolean;
  setHasItemQrValue: React.Dispatch<React.SetStateAction<boolean>>;
  hasRecipientQrValue: boolean;
  setHasRecipientQrValue: React.Dispatch<React.SetStateAction<boolean>>;
  processedItemData: BatchQrModel | null;
  setProcessedItemData: React.Dispatch<React.SetStateAction<BatchQrModel | null>>;
  processedRecipientData: RecipientQrModel | null;
  setProcessedRecipientData: React.Dispatch<React.SetStateAction<RecipientQrModel | null>>;
  isValidBatch: boolean;
  setIsValidBatch: React.Dispatch<React.SetStateAction<boolean>>;
  handleRecipientScan: (data: string) => void;
  handleItemScan: (data: string) => void;
  triggerItemTransfer: () => void;
};

export default function SendBatchComponent({
  currentStepForSending,
  setCurrentStepForSending,
  hasItemQrValue,
  setHasItemQrValue,
  hasRecipientQrValue,
  setHasRecipientQrValue,
  processedItemData,
  setProcessedItemData,
  processedRecipientData,
  setProcessedRecipientData,
  isValidBatch,
  setIsValidBatch,
  handleRecipientScan,
  handleItemScan,
  triggerItemTransfer,
}: Props) {
  const itemSummary = processedItemData && (
    <div className="mt-4 space-y-1">
      <DetailRow label="Batch ID" value={processedItemData.batchId} mono />
      <DetailRow label="Name" value={processedItemData.batchName} />
      <DetailRow label="Owner" value={processedItemData.registeringCompanyName} />
      <DetailRow label="Description" value={processedItemData.batchDescription ?? "—"} />
      <DetailRow label="Blockchain status" value={processedItemData.blockchain?.status ?? "—"} />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      {currentStepForSending === "scanItem" && (
        <>
          {!hasItemQrValue ? (
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
              <legend className="fieldset-legend">Step 1 — Item batch</legend>
              <h2 className="text-lg font-bold mb-3">Scan the batch QR you are sending</h2>
              <p className="text-sm text-gray-600 mb-4">Use the camera or upload an image of the QR code.</p>
              <div className="flex flex-col gap-3">
                <QRCamera onScan={handleItemScan} />
                <QRFile onScan={handleItemScan} />
              </div>
            </fieldset>
          ) : (
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
              <legend className="fieldset-legend">Item details</legend>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <h2 className="text-lg font-bold">Review batch</h2>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    setHasItemQrValue(false);
                    setProcessedItemData(null);
                    setIsValidBatch(false);
                  }}
                >
                  Scan again
                </button>
              </div>
              {itemSummary}
              <div className="mt-4">
                {!isValidBatch ? (
                  <p className="text-sm text-red-600">
                    This batch has a failed blockchain status and cannot be transferred.
                  </p>
                ) : (
                  <button type="button" className="btn" onClick={() => setCurrentStepForSending("scanRecipient")}>
                    Next — scan recipient
                  </button>
                )}
              </div>
            </fieldset>
          )}
        </>
      )}

      {currentStepForSending === "scanRecipient" && hasItemQrValue && (
        <div className="flex flex-col gap-4">
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
            <legend className="fieldset-legend">Item (reference)</legend>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <h2 className="text-lg font-bold">Sending this batch</h2>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  setCurrentStepForSending("scanItem");
                  setHasItemQrValue(false);
                  setHasRecipientQrValue(false);
                  setProcessedItemData(null);
                  setProcessedRecipientData(null);
                  setIsValidBatch(false);
                }}
              >
                Start over
              </button>
            </div>
            {itemSummary}
          </fieldset>

          {!hasRecipientQrValue ? (
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
              <legend className="fieldset-legend">Step 2 — Recipient</legend>
              <h2 className="text-lg font-bold mb-3">Scan the recipient&apos;s QR</h2>
              <p className="text-sm text-gray-600 mb-4">They can show their profile QR from Receive batch.</p>
              <div className="flex flex-col gap-3">
                <QRCamera onScan={handleRecipientScan} />
                <QRFile onScan={handleRecipientScan} />
              </div>
            </fieldset>
          ) : (
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
              <legend className="fieldset-legend">Recipient details</legend>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <h2 className="text-lg font-bold">Recipient</h2>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    setHasRecipientQrValue(false);
                    setProcessedRecipientData(null);
                  }}
                >
                  Scan recipient again
                </button>
              </div>
              <div className="mt-4 space-y-1">
                <DetailRow label="Company ID" value={processedRecipientData?.companyId ?? "—"} mono />
                <DetailRow label="Company name" value={processedRecipientData?.companyName ?? "—"} />
                <DetailRow label="Wallet" value={processedRecipientData?.walletAddress ?? "—"} mono />
              </div>
              <button
                type="button"
                className="btn w-full mt-4"
                disabled={!hasRecipientQrValue || !hasItemQrValue}
                onClick={() => triggerItemTransfer()}
              >
                Confirm transfer
              </button>
            </fieldset>
          )}
        </div>
      )}
    </div>
  );
}
