"use client";

import DetailRow from "../../global/DetailRow";
import type { TransferModel } from "../../utils/types/models";

type Props = {
  transferList: TransferModel[];
  refreshTransferList: () => void;
};

export default function ViewTransfersComponent({ transferList, refreshTransferList }: Props) {
  const isActiveStatus = (status: TransferModel["status"]) => status === "pending" || status === "accepted";

  const getStatusClassName = (status: TransferModel["status"]) => {
    if (status === "completed") return "text-green-600";
    if (status === "accepted") return "text-blue-600";
    if (status === "pending") return "text-yellow-600";
    if (status === "rejected") return "text-red-600";
    return "text-gray-600";
  };

  const sorted = [...transferList].sort((a, b) => {
    const aIsActive = isActiveStatus(a.status);
    const bIsActive = isActiveStatus(b.status);
    if (aIsActive !== bIsActive) return aIsActive ? -1 : 1;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="flex flex-col gap-3 w-full">
      <h2 className="text-lg font-bold">Transfer requests</h2>
      <button className="btn" onClick={refreshTransferList}>
        Refresh
      </button>
      <div className="flex flex-col gap-3">
        {sorted.length === 0 && (
          <div className="p-4 border rounded-lg text-sm text-gray-600">No transfer requests yet.</div>
        )}
        {sorted.map((transferRequest) => (
          <div
            key={transferRequest.transferId}
            className="p-4 border rounded-lg shadow hover:bg-gray-100 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold">{transferRequest.batchName}</div>
                <div className="text-xs text-gray-500">Batch ID: {transferRequest.batchId}</div>
              </div>
              <div className={`text-sm font-medium ${getStatusClassName(transferRequest.status)}`}>
                {transferRequest.status}
              </div>
            </div>

            <div className="mt-3">
              <DetailRow
                label="Route"
                value={`${transferRequest.fromCompanyName} to ${transferRequest.toCompanyName}`}
              />
              <DetailRow label="Requested by" value={transferRequest.senderUserName} />
              <DetailRow
                label="Receiving user"
                value={
                  transferRequest.receivingUserName && transferRequest.receivingUserName !== ""
                    ? transferRequest.receivingUserName
                    : "Not assigned"
                }
              />
              <DetailRow label="Created" value={new Date(transferRequest.createdAt).toLocaleString()} />
              {transferRequest.blockchain?.status != null && (
                <DetailRow label="Blockchain" value={transferRequest.blockchain.status} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
