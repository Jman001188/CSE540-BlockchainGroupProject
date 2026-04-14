"use client";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { api } from "../utils/apiclient"
import { BatchData } from "../utils/types";
import QRGenerator from "../global/QRGenerator";



const testBatchListData: BatchData[] = [
  { 
    batchId: 1,
    registeringUser: "testUser",
    status: "registered",
    itemName: "Jarred Pickles",
    itemDescription: "A batch of homemade jarred pickles",
    itemCount: "10 Jars",
    itemWeight: "1 lb per jar",
    itemFileHash: null,
    itemAdditionalInformation: "No Additional Information"
  },
  {
    batchId: 2,
    registeringUser: "testUser",
    status: "pending",
    itemName: "Mayonaise",
    itemDescription: "A batch of homemade mayonaise",
    itemCount: "10 Jars",
    itemWeight: "1 lb per jar",
    itemFileHash: null,
    itemAdditionalInformation: "No Additional Information"
  }
];

export default function RegisterBatch() {
  const router = useRouter();
  const [ batchList, setBatchList ] = useState<BatchData[]>([]);
  const [ selectedBatch, setSelectedBatch ] = useState<BatchData | null>(null); 
  const [ viewSelect, setViewSelect ] = useState<"register" | "list">("register");

  const [ itemNameInput, setItemNameInput ] = useState("");
  const [ itemDescriptionInput, setItemDescriptionInput ] = useState("");
  const [ itemCountInput, setItemCountInput ] = useState("");
  const [ itemWeightInput, setItemWeightInput ] = useState("");
  const [ itemFileInput, setItemFileInput ] = useState("");
  const [ itemAdditionalInput, setItemAdditionalInput ] = useState("");



  const refreshBatchList = () => {
    setBatchList(testBatchListData);
  };

  const handleRefreshBatchListClick = () => {
        refreshBatchList();
        setSelectedBatch(null);
  }
  
  useEffect(() => { 
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
              onClick={() => {setViewSelect("list"); setSelectedBatch(null); refreshBatchList();}}
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
                <h2 className="text-lg font-bold">Batch #{selectedBatch.batchId} QR Code</h2>
                <QRGenerator data={JSON.stringify(selectedBatch)} />
                <hr/>
              </>
  
              }
              <button className="btn" onClick={ () => {setSelectedBatch(null); refreshBatchList();} }>Refresh List</button>
              {batchList
              .sort((a, b) => b.batchId - a.batchId)
              .map((item) => ( // Iterate over the list of pending transfers and render each one
                <div
                  key={item.batchId}
                  onClick={() => setSelectedBatch(item)}
                  className="p-4 border rounded-lg shadow cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="font-bold">Batch #{item.batchId}</div>
                  
                  <div className="text-sm text-gray-600">
                    {item.itemName}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Registered by {item.registeringUser}
                  </div>
                  <div   className={`mt-1 text-sm ${
                    item.status === "registered"
                      ? "text-green-600"
                      : item.status === "pending"
                      ? "text-yellow-600"
                      : item.status === "transferred"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}>
                    Status: {item.status}
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