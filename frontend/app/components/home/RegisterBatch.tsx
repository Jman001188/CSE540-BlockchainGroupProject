"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../utils/apiclient"


export default function LoginPage() {
  const router = useRouter();

  const [ itemNameInput, setItemNameInput ] = useState("");
  const [ itemDescriptionInput, setItemDescriptionInput ] = useState("");
  const [ itemCountInput, setItemCountInput ] = useState("");
  const [ itemWeightInput, setItemWeightInput ] = useState("");
  const [ itemFileInput, setItemFileInput ] = useState("");
  const [ itemAdditionalInput, setItemAdditionalInput ] = useState("");

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
      <div className="flex-1 flex items-center justify-center pb-40">
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
      </div>
    </div>

  );
}