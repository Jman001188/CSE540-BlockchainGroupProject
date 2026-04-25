"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRGenerator from "../global/QRGenerator";
import { Context } from "../global/Context";
import { BatchAPI } from "../utils/apiclient";
import type { CreateBatchRequest } from "../utils/types/api-contract";
import type { BatchModel } from "../utils/types/models";

export default function RegisterBatch() {
  const [batchList, setBatchList] = useState<BatchModel[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchModel | null>(null);
  const [viewSelect, setViewSelect] = useState<"register" | "list">("register");
  const [itemNameInput, setItemNameInput] = useState("");
  const [itemDescriptionInput, setItemDescriptionInput] = useState("");
  const { sessionToken } = useContext(Context);

  const router = useRouter();

  // Refreshes the batch list
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

  // Refreshes the batch list when the sessionToken changes and upon loading the page
  useEffect(() => {
    if (!sessionToken) return;
    refreshBatchList();
  }, [sessionToken, refreshBatchList]);

  // Refreshes the batch list when the refresh button is clicked
  const handleRefreshBatchListClick = () => {
    refreshBatchList();
    setSelectedBatch(null);
  };

  // Clears the item name and description fields
  const clearFields = () => {
    setItemNameInput("");
    setItemDescriptionInput("");
  };

  // Submits the item batch to the backend
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

    const apiPayload: CreateBatchRequest = {
      batchName: tempName,
      batchDescription: description,
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
              className={`btn btn-sm ${viewSelect === 'register' ? 'selected-styles' : 'default-styles'}`}
              onClick={() => setViewSelect("register")}
            >
              Register New Batch
            </button>
            <button 
              className={`btn btn-sm ${viewSelect === 'list' ? 'selected-styles' : 'default-styles'}`}
              onClick={() => {setViewSelect("list"); handleRefreshBatchListClick();}}
            >
              View Registered Batches
            </button>

          </div>

          {viewSelect === "register" ? 
          
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
              <legend className="fieldset-legend">Register Item Batch</legend>
              
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
              <button 
                className="btn"
                onClick={ submitItemBatch }>
                  Submit
              </button>
            </fieldset>
            :
            <div className="flex flex-col gap-3">
              
              {selectedBatch &&
              <>
                <h2 className="text-lg font-bold">Batch ID: {selectedBatch.batchId} QR Code</h2>
                <QRGenerator data={JSON.stringify(selectedBatch)} />
                <hr/>
              </>
  
              }
              <button className="btn" onClick={handleRefreshBatchListClick}>Refresh List</button>
              {[...batchList]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((item) => (
                <div
                  key={item.batchId}
                  onClick={() => setSelectedBatch(item)}
                  className="p-4 border rounded-lg shadow cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="font-bold">Batch #{item.batchId}</div>
                  
                  <div className="text-sm text-gray-600">
                    {item.batchName} - Registered on {new Date(item.createdAt).toLocaleDateString()} by {item.registeringCompanyName}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Registered by {item.registeringUserName}
                  </div>
                  <div   className={`mt-1 text-sm ${
                    item.blockchain.status === "confirmed"
                      ? "text-green-600"
                      : item.blockchain.status === "pending"
                      ? "text-yellow-600"
                      : item.blockchain.status === "failed"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}>
                    Status: {item.blockchain.status}
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}