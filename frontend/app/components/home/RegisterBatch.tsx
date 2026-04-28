"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRGenerator from "../global/QRGenerator";
import DetailRow from "../global/DetailRow";
import QRCamera from "../global/QRCamera";
import QRFile from "../global/QRFile";
import { Context } from "../global/Context";
import { BatchAPI } from "../utils/apiclient";
import type { CreateBatchRequest } from "../utils/types/api-contract";
import type { BatchModel, BatchQrModel } from "../utils/types/models";

export default function RegisterBatch() {
  const [batchList, setBatchList] = useState<BatchModel[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchModel | null>(null);
  const [viewSelect, setViewSelect] = useState<"register" | "list">("register");
  const [itemNameInput, setItemNameInput] = useState("");
  const [itemDescriptionInput, setItemDescriptionInput] = useState("");
  const [sourceBatchDataList, setSourceBatchDataList] = useState<Array<BatchQrModel | null>>([]);
  const [expandedSourceIndex, setExpandedSourceIndex] = useState<number | null>(null);

  const { sessionToken } = useContext(Context);
  const router = useRouter();

  const refreshBatchList = useCallback(() => {
    if (!sessionToken) {
      alert("You must be logged in to view batches.");
      router.push("/login");
      return;
    }

    BatchAPI.getBatchList(sessionToken)
      .then((response) => {
        setBatchList(response);
      })
      .catch((error) => {
        console.error("Error fetching batch list:", error);
        alert("Failed to fetch batch list.");
      });
  }, [sessionToken, router]);

  useEffect(() => {
    if (!sessionToken) return;
    refreshBatchList();
  }, [sessionToken, refreshBatchList]);

  const handleRefreshBatchListClick = () => {
    refreshBatchList();
    setSelectedBatch(null);
  };

  const clearFields = () => {
    setItemNameInput("");
    setItemDescriptionInput("");
    setSourceBatchDataList([]);
    setExpandedSourceIndex(null);
  };

  const addSourceRow = () => {
    setSourceBatchDataList((prev) => [...prev, null]);
  };

  const removeSourceRow = (index: number) => {
    setSourceBatchDataList((prev) => prev.filter((_, i) => i !== index));
    setExpandedSourceIndex((cur) =>
      cur === index ? null : cur != null && cur > index ? cur - 1 : cur
    );
  };

  const clearSourceRow = (index: number) => {
    setSourceBatchDataList((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setExpandedSourceIndex((current) => (current === index ? null : current));
  };

  const applyQrAtIndex = (index: number, result: string) => {
    if (!result.trim()) return;
    try {
      const parsed = JSON.parse(result) as BatchQrModel;
      const status = parsed?.blockchain?.status;
      if (!parsed?.batchId || !status) throw new Error("Invalid batch QR payload");

      if (status === "failed") {
        alert("This batch has a failed blockchain status and cannot be used as a source.");
        return;
      }

      const isDuplicate = sourceBatchDataList.some(
        (existing, i) =>
          i !== index &&
          existing != null &&
          existing.batchId === parsed.batchId
      );
      if (isDuplicate) {
        alert("That batch is already in the source list.");
        return;
      }

      setSourceBatchDataList((prev) => {
        const next = [...prev];
        next[index] = parsed;
        return next;
      });
      setExpandedSourceIndex(null);
    } catch (error) {
      console.error("Error processing batch QR:", error);
      alert("Could not read batch QR. Use a valid batch QR from this app.");
    }
  };

  const submitItemBatch = () => {
    if (!sessionToken) {
      alert("You must be logged in to register a batch.");
      router.push("/login");
      return;
    }

    const tempName = itemNameInput.trim();
    const description = itemDescriptionInput.trim();
    if (!tempName || !description) {
      alert("Please enter an item name and description.");
      return;
    }

    const sourceBatchIds = sourceBatchDataList
      .filter((item): item is BatchQrModel => item != null && item.batchId !== "")
      .map((item) => item.batchId);

    const apiPayload: CreateBatchRequest = {
      batchName: tempName,
      batchDescription: description,
      sourceBatchIds: sourceBatchIds.length > 0 ? sourceBatchIds : [],
    };

    BatchAPI.registerBatch(sessionToken, apiPayload)
      .then((response) => {
        alert("Batch registered successfully! Batch ID: " + response.batchId);
        clearFields();
        refreshBatchList();
      })
      .catch((error) => {
        console.error("Error registering batch:", error);
        alert("Failed to register batch.");
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex justify-center pb-40">
        <div className="flex flex-col gap-4 p-4 w-full max-w-lg mx-auto">
          <div className="flex flex-row gap-2">
            <button
              type="button"
              className={`btn btn-sm ${viewSelect === "register" ? "selected-styles" : "default-styles"}`}
              onClick={() => setViewSelect("register")}
            >
              Register New Batch
            </button>
            <button 
              type="button"
              className={`btn btn-sm ${viewSelect === 'list' ? 'selected-styles' : 'default-styles'}`}
              onClick={() => {setViewSelect("list"); handleRefreshBatchListClick();}}
            >
              View Registered Batches
            </button>
          </div>

          {viewSelect === "register" ? (
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
              <legend className="fieldset-legend">Register Item Batch</legend>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Source batches (required if the registered batch is derived from other batches). Add rows and use Scan or upload on each empty row in any order, or leave the list empty.
                </p>
                <button type="button" className="btn btn-sm btn-outline mb-3" onClick={addSourceRow}>
                  Add source batch
                </button>
                <div className="flex flex-col gap-3">
                  {sourceBatchDataList.map((item, index) => {
                    const populated = item != null && item.batchId !== "";
                    return (
                      <div
                        key={index}
                        className="border border-base-300 rounded-lg p-3 bg-base-100 space-y-2"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-sm font-medium">Source {index + 1}</span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => removeSourceRow(index)}
                          >
                            Remove
                          </button>
                        </div>

                        {populated ? (
                          <div className="space-y-1">
                            <DetailRow label="Batch ID" value={item.batchId} mono />
                            <DetailRow label="Name" value={item.batchName} />
                            <DetailRow label="Owner" value={item.registeringCompanyName} />
                            <DetailRow label="Description" value={item.batchDescription ?? "—"} />
                            <DetailRow label="Blockchain status" value={item.blockchain?.status ?? "—"} />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline mt-2"
                              onClick={() => clearSourceRow(index)}
                            >
                              Clear / scan again
                            </button>
                          </div>
                        ) : expandedSourceIndex === index ? (
                          <div className="flex flex-col gap-2">
                            <QRCamera onScan={(data) => applyQrAtIndex(index, data)} />
                            <QRFile onScan={(data) => applyQrAtIndex(index, data)} />
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => setExpandedSourceIndex(null)}
                            >
                              Cancel scan
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm w-full sm:w-auto"
                            onClick={() => setExpandedSourceIndex(index)}
                          >
                            Scan or upload QR
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <label className="label">Item Name</label>
              <input
                className="input input-bordered"
                value={itemNameInput}
                placeholder="Item Name"
                onChange={(event) => setItemNameInput(event.target.value)}
              />
              <label className="label">Item Description</label>
              <textarea
                className="textarea textarea-bordered"
                value={itemDescriptionInput}
                placeholder="What is this item batch. Give some detail"
                onChange={(event) => setItemDescriptionInput(event.target.value)}
              />
              <button type="button" className="btn mt-2" onClick={submitItemBatch}>
                Submit
              </button>
            </fieldset>
          ) : (
            <div className="flex flex-col gap-3">
              {selectedBatch && (
                <>
                  <h2 className="text-lg font-bold">Batch ID: {selectedBatch.batchId} QR Code</h2>
                  <QRGenerator data={JSON.stringify(selectedBatch)} />
                  <hr />
                </>
              )}
              <button type="button" className="btn" onClick={handleRefreshBatchListClick}>
                Refresh List
              </button>
              {[...batchList]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((item) => (
                  <div
                    key={item.batchId}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedBatch(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedBatch(item);
                      }
                    }}
                    className="p-4 border rounded-lg shadow cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div className="font-bold">Batch #{item.batchId}</div>

                    <div className="text-sm text-gray-600">
                      {item.batchName} - Registered on {new Date(item.createdAt).toLocaleDateString()} by{" "}
                      {item.registeringCompanyName}
                    </div>

                    <div className="text-sm text-gray-600">Registered by {item.registeringUserName}</div>
                    <div
                      className={`mt-1 text-sm ${
                        item.blockchain.status === "confirmed"
                          ? "text-green-600"
                          : item.blockchain.status === "pending"
                            ? "text-yellow-600"
                            : item.blockchain.status === "failed"
                              ? "text-red-600"
                              : "text-gray-600"
                      }`}
                    >
                      Status: {item.blockchain.status}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
