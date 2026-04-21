"use client";
import { useContext, useEffect, useState } from "react";
import { BatchData } from "../utils/types";
import QRGenerator from "../global/QRGenerator";
import { Context } from "../global/Context";
import { tempAddNewBatch, tempIncreaseBatchIndex, tempTestbatchDataIndex, testBatchListData } from "@/app/tempData";

export default function RegisterBatch() {
  const [ batchList, setBatchList ] = useState<BatchData[]>([]);
  const [ selectedBatch, setSelectedBatch ] = useState<BatchData | null>(null); 
  const [ viewSelect, setViewSelect ] = useState<"register" | "list">("register");
  const [ itemNameInput, setItemNameInput ] = useState("");
  const [ itemDescriptionInput, setItemDescriptionInput ] = useState("");
  const { companyData, userData, sessionToken } = useContext(Context);


  const refreshBatchList = () => {
    // Uncomment once the APIs are connected to the backend.
    /*
    BatchAPI.getBatchList(sessionToken)
      .then((response) => {
        setBatchList(response);
      })
      .catch((error) => {
        console.error("Error fetching batch list:", error);
      });
    */

    // Temp data assignment for testing the list and QR code generation without API
    console.log(testBatchListData);
    setBatchList(testBatchListData);
  };



  const handleRefreshBatchListClick = () => {
    refreshBatchList();
    setSelectedBatch(null);
  }
  
  useEffect(() => { 
    refreshBatchList();
  }, []);

  
  const clearFields = () => {
    setItemNameInput("");
    setItemDescriptionInput("");
  }

  const submitItemBatch = () => {

    // Uncomment once the APIs are connected to the backend.
    /* 
    const requestData: CreateBatchRequest = {
      batchName: itemNameInput,
      batchDescription: itemDescriptionInput,
    };  

    BatchAPI.registerBatch(sessionToken, requestData)
      .then((response) => {
        alert("Batch registered successfully! Batch ID: " + response.batchId);
        clearFields();
      })
      .catch((error) => {
        console.error("Error registering batch:", error);
        alert("Failed to register batch.");
      });

    */

    // Temp Code to add the new batch to the list without API connection. Remove once APIs are working.
    tempAddNewBatch(
      {
        batchId: tempTestbatchDataIndex,
        batchName: itemNameInput,
        batchDescription: itemDescriptionInput,
        createdAt: new Date().toISOString(),
        registeringCompanyId: companyData?.companyId!,  
        registeringCompanyName: companyData?.companyName!,
        registeringUserId: userData?.userId!,
        registeringUserName: userData?.firstName + " " + userData?.lastName,
        blockchain: {
          transactionId: "0x123456789abcdef",
          status: "pending",
          dataHash: "0xabcdef123456789"
        }
      }
    );
    tempIncreaseBatchIndex();

    clearFields();
    alert("Your item has been successfully registered! The item's registration number is 1234")
    
    // End Temp Code
    
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex justify-center pb-40">
        <div className="flex flex-col gap-4 p-4">
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
              .sort((a, b) => b.batchId - a.batchId)
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
                    item.blockchain.status === "registered"
                      ? "text-green-600"
                      : item.blockchain.status === "pending"
                      ? "text-yellow-600"
                      : item.blockchain.status === "transferred"
                      ? "text-blue-600"
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