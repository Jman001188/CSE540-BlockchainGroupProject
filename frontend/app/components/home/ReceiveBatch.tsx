"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DetailRow from "../global/DetailRow";
import QRGenerator from "../global/QRGenerator";
import { Context } from "../global/Context";
import { TransferBatchAPI } from "../utils/apiclient";
import type { RecipientQrModel, TransferModel } from "../utils/types/models";



export default function ReceiveBatch() {
  const { sessionToken, userData, companyData } = useContext(Context);

  const [selectedItem, setSelectedItem] = useState<TransferModel | null>(null);
  const [pendingTransfers, setPendingTransfers] = useState<TransferModel[]>([]);
  const [recipientData, setRecipientData] = useState<RecipientQrModel | null>(null);
  const [viewSelect, setViewSelect] = useState<"qr code" | "incoming transfers">("qr code");
  const [filteredForUserTransfers, setFilteredForUserTransfers] = useState(false);

  const router = useRouter();

  const handleRefreshPendingList = useCallback(() => {
    if (!sessionToken) {
      alert("You must be logged in to view transfers.");
      router.replace("/login");
      return;
    }
    TransferBatchAPI.getTransferList(sessionToken)
      .then((response) => {
        setPendingTransfers(response);
        setSelectedItem(null);
      })
      .catch((error) => {
        console.error("There was an error while fetching the transfer list:", error);
        alert("Failed to fetch transfer list.");
      });
  }, [sessionToken, router]);

  useEffect(() => {
    if (!sessionToken) return;
    handleRefreshPendingList();
  }, [sessionToken, handleRefreshPendingList]);

  useEffect(() => {
    if (!userData || !companyData) return;
    setRecipientData({
      userId: userData.userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      companyId: companyData.companyId,
      companyName: companyData.companyName,
      walletAddress: companyData.walletAddress,
    });
  }, [userData, companyData]);

  const sortedTransfers = [...pendingTransfers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const visibleTransfers = sortedTransfers.filter(
    (item) => !filteredForUserTransfers || item.receivingUserId === userData?.userId
  );

  const handleSelectItem = (item: TransferModel) => {
    setSelectedItem(item);
  };

  const acceptBatch = (item: TransferModel) => {
    if (!sessionToken) {
      router.replace("/login");
      return;
    }
    TransferBatchAPI.acceptTransfer(sessionToken, item.transferId)
      .then((response) => {
        console.log(response.message);
        setSelectedItem(null);
        handleRefreshPendingList();
      })
      .catch((error) => {
        console.error("Error while accepting transfer:", error);
        alert("Failed to accept transfer.");
      });
  };

  const rejectBatch = (item: TransferModel) => {
    if (!sessionToken) {
      router.replace("/login");
      return;
    }
    TransferBatchAPI.rejectTransfer(sessionToken, item.transferId)
      .then((response) => {
        console.log(response.message);
        setSelectedItem(null);
        handleRefreshPendingList();
      })
      .catch((error) => {
        console.error("Error while rejecting transfer:", error);
        alert("Failed to reject transfer.");
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex justify-center pb-40">
        <div className="flex flex-col gap-4 p-4 w-full max-w-lg mx-auto">
          <div className="flex flex-row gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${viewSelect === "qr code" ? "selected-styles" : "default-styles"}`}
              onClick={() => setViewSelect("qr code")}
            >
              My receive QR
            </button>
            <button
              className={`btn btn-sm ${viewSelect === "incoming transfers" ? "selected-styles" : "default-styles"}`}
              onClick={() => {
                setViewSelect("incoming transfers");
                handleRefreshPendingList();
              }}
            >
              Incoming transfers
            </button>
          </div>

          {viewSelect === "qr code" ? (
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
              <legend className="fieldset-legend">Your recipient QR</legend>
              <h2 className="text-lg font-bold mb-2">Share this QR with the sender</h2>
              <p className="text-sm text-gray-600 mb-4">
                They scan it in Send batch so the transfer is addressed to you and your company.
              </p>
              <QRGenerator data={JSON.stringify(recipientData)} />
            </fieldset>
          ) : (
            <div className="flex flex-col gap-3 w-full">
              <h2 className="text-lg font-bold">Incoming transfers</h2>
              <button type="button" className="btn" onClick={handleRefreshPendingList}>
                Refresh
              </button>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={filteredForUserTransfers}
                  onChange={(e) => setFilteredForUserTransfers(e.target.checked)}
                />
                Only show transfers where I am the listed recipient
              </label>

              {visibleTransfers.length > 0 && (
                <div className="flex flex-col gap-3">
                  {visibleTransfers.map((item) => (
                    <button
                      type="button"
                      key={item.transferId}
                      onClick={() => handleSelectItem(item)}
                      className={`text-left p-4 border rounded-lg shadow transition hover:bg-gray-100 ${
                        selectedItem?.transferId === item.transferId ? "ring-2 ring-primary/40 bg-base-200" : ""
                      }`}
                    >
                      <div className="font-bold">
                        Batch #{item.batchId} · {item.batchName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.fromCompanyName} → {item.toCompanyName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                      <div
                        className={`mt-1 text-sm ${
                          item.status === "completed"
                            ? "text-green-600"
                            : item.status === "accepted"
                              ? "text-blue-600"
                              : item.status === "rejected"
                                ? "text-red-600"
                                : item.status === "pending"
                                  ? "text-yellow-600"
                                  : "text-gray-600"
                        }`}
                      >
                        {item.status}
                        {item.blockchain?.status != null && (
                          <span className="block text-xs text-gray-500 mt-0.5">
                            Blockchain: {item.blockchain.status}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedItem && (
                <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4 mt-2">
                  <legend className="fieldset-legend">Selected transfer</legend>
                  <div className="space-y-1 mb-4">
                    <DetailRow label="Transfer ID" value={selectedItem.transferId} mono />
                    <DetailRow label="Batch" value={selectedItem.batchName} />
                    <DetailRow
                      label="Route"
                      value={`${selectedItem.fromCompanyName} → ${selectedItem.toCompanyName}`}
                    />
                    <DetailRow label="Status" value={selectedItem.status} />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button type="button" className="btn btn-success flex-1" onClick={() => acceptBatch(selectedItem)}>
                      Accept
                    </button>
                    <button type="button" className="btn btn-error flex-1" onClick={() => rejectBatch(selectedItem)}>
                      Reject
                    </button>
                  </div>
                </fieldset>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
