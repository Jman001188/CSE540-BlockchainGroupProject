"use client";

import { PendingTransferData } from "../../utils/types";

type Props = {
  testTransferListData: PendingTransferData[];
  transferList: PendingTransferData[];
  refreshTransferList: () => void;
  cancelBatch: (transferId: number) => void;
};

export default function ViewTransfersComponent(props: Props) {
  return (
    <>
      <button className="btn" onClick={props.refreshTransferList}>
        Refresh List
      </button>

      {props.transferList
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
                  onClick={() => props.cancelBatch(transferRequest.transferId)}
                >
                  Cancel Transfer
                </button>
              </div>
            )}
          </div>
        ))}
    </>
  );
}