"use client";

import type { TransferModel } from "../../utils/types/models";

type Props = {
  transferList: TransferModel[];
  refreshTransferList: () => void;
};

export default function ViewTransfersComponent({ transferList, refreshTransferList }: Props) {
  const sorted = [...transferList].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      <h2 className="text-lg font-bold">Transfer requests</h2>
      <button className="btn" onClick={refreshTransferList}>
        Refresh
      </button>
      <div className="flex flex-col gap-3">
        {sorted.map((transferRequest) => (
          <div
            key={transferRequest.transferId}
            className="p-4 border rounded-lg shadow hover:bg-gray-100 transition"
          >
            <div className="font-bold">Batch #{transferRequest.batchId}</div>

            <div className="text-sm text-gray-600">
              {transferRequest.batchName} — {new Date(transferRequest.createdAt).toLocaleDateString()} ·{" "}
              {transferRequest.fromCompanyName}
            </div>

            <div className="text-sm text-gray-600">
              {transferRequest.fromCompanyName} → {transferRequest.toCompanyName}
            </div>

            <div className="text-sm text-gray-600">
              From: {transferRequest.senderUserName}
              {transferRequest.receivingUserName != null && transferRequest.receivingUserName !== ""
                ? ` · To: ${transferRequest.receivingUserName}`
                : ""}
            </div>

            <div
              className={`mt-1 text-sm ${
                transferRequest.status === "completed"
                  ? "text-green-600"
                  : transferRequest.status === "accepted"
                    ? "text-blue-600"
                    : transferRequest.status === "pending"
                      ? "text-yellow-600"
                      : transferRequest.status === "rejected"
                        ? "text-red-600"
                        : "text-gray-600"
              }`}
            >
              Status: {transferRequest.status}
              {transferRequest.blockchain?.status != null && (
                <span className="block text-xs text-gray-500 mt-0.5">
                  Blockchain: {transferRequest.blockchain.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
