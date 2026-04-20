"use client";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { api } from "../utils/apiclient"
import { BatchData } from "../utils/types";
import QRGenerator from "../global/QRGenerator";
import { Context } from "../global/Context";



const testBatchListData: BatchData[] = [
  { 
    batchId: 1,
    batchName: "Test Batch 1",
    batchDescription: "This is a test batch for demonstration purposes.",
    createdAt: "2024-01-01T12:00:00Z",
    registeringCompanyId: 1,
    registeringCompanyName: "Test Company",
    registeringUserId: 1,
    registeringUserName: "Test User",
    blockchain: {
      transactionId: "0x123456789abcdef",
      status: "registered",
      dataHash: "0xabcdef123456789"
    }
  },
  {
    batchId: 2,
    batchName: "Test Batch 2",
    batchDescription: "This is another test batch for demonstration purposes.",
    createdAt: "2024-01-02T12:00:00Z",
    registeringCompanyId: 1,
    registeringCompanyName: "Test Company",
    registeringUserId: 1,
    registeringUserName: "Test User",
    blockchain: {
      transactionId: "0x987654321fedcba",
      status: "pending",
      dataHash: "0xfedcba987654321"
    }
  }
];

let tempTestbatchDataIndex = 3;

export default function RegisterBatch() {
  const [ batchList, setBatchList ] = useState<BatchData[]>([]);
  const [ selectedBatch, setSelectedBatch ] = useState<BatchData | null>(null); 
  const [ viewSelect, setViewSelect ] = useState<"register" | "list">("register");

  const [ itemNameInput, setItemNameInput ] = useState("");
  const [ itemDescriptionInput, setItemDescriptionInput ] = useState("");
  const [ itemCountInput, setItemCountInput ] = useState("");
  const [ itemWeightInput, setItemWeightInput ] = useState("");
  const [ itemFileInput, setItemFileInput ] = useState("");
  const [ itemAdditionalInput, setItemAdditionalInput ] = useState("");

  const { companyData, userData } = useContext(Context);

  const refreshBatchList = () => {
    // Fetch the list of batches from the API and set them in state
    /*
    api.get("/batches")
      .then((response) => {
        setBatches(response.data);
      })
      .catch((error) => {
        console.error("Error fetching batches:", error);
      });
    */
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
    setItemCountInput("");
    setItemWeightInput("");
    setItemFileInput("");
    setItemAdditionalInput("");
  }

  const submitItemBatch = () => {
    // We need to add the end point interaction here
    
    /* 
      endpoint interaction 
      Pass:
        itemNameInput
        itemDescriptionInput
        itemCountInput
        itemWeightInput
        itemFilemInput
        itemAdditionalInput
      
      Into the API.

      Get back a success or failure.
      Get back the item number from the contract
    */

    // Temp data assignment for testing the list and QR code generation without API
    testBatchListData.push({
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
    });

    tempTestbatchDataIndex++; 

    // Change this to check the success of the API call.
    if ( true ) {
      clearFields();
      
      alert("Your item has been successfully registered! The item's registration number is 1234")
    }
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
              <label className="label">Item Count</label>
              <input 
                className="input input-bordered"
                value={itemCountInput}
                placeholder="Number of items"
                onChange={(event) => setItemCountInput(event.target.value)} 
              />
              <label className="label">Item Weight</label>
              <input 
                className="input input-bordered"
                value={itemWeightInput}
                placeholder="Weight per item" 
                onChange={(event) => setItemWeightInput(event.target.value)} 
              />           
              <label className="label">File Upload</label>
              <input 
                className="input input-bordered"
                value={itemFileInput}
                placeholder="Not Yet Implemented"
                onChange={(event) => setItemFileInput(event.target.value)}  
              />
              <label className="label">Additional Information</label>
              <textarea 
                className="textarea textarea-bordered"
                value={itemAdditionalInput}
                placeholder="Additional Relevant Information"
                onChange={(event) => setItemAdditionalInput(event.target.value)} 
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
              {batchList
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