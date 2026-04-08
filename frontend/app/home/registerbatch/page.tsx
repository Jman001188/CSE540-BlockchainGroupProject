"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../apiclient"


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
    <div className="flex justify-center">
        <button 
          className="btn w-32"
          onClick={() => router.push("/home")}>Back
        </button>

        <div className="flex flex-col w-110 gap-5" >
          <h1 className="text-2xl font-bold">Register Batch</h1>
          
          <div className="flex gap-2">
            <p>Item Name</p>
            <input 
              className="input input-bordered"
              value={itemNameInput}
              placeholder="Item Name" 
              onChange={(event) => setItemNameInput(event.target.value)} 
            />
          </div>
          <div className="flex gap-2">
            <p>Item Description</p>
            <textarea 
              className="textarea textarea-bordered"
              value={itemDescriptionInput}
              placeholder="What is this item batch. Give some detail" 
              onChange={(event) => setItemDescriptionInput(event.target.value)} 
            />
          </div>
          <div className="flex gap-2">
            <p>Item Count</p>
            <input 
              className="input input-bordered"
              value={itemCountInput}
              placeholder="Number of items"
              onChange={(event) => setItemCountInput(event.target.value)} 
            />
          </div>
          <div className="flex gap-2">
            <p>Item Weight</p>
            <input 
              className="input input-bordered"
              value={itemWeightInput}
              placeholder="Weight per item" 
              onChange={(event) => setItemWeightInput(event.target.value)} 
            />           
          </div>
          <div className="flex gap-2">
            <p>File Upload</p>
            <input 
              className="input input-bordered"
              value={itemFileInput}
              placeholder="Not Yet Implemented"
              onChange={(event) => setItemFileInput(event.target.value)}  
            />
          </div>
          <div className="flex gap-2">
            <p>Additional Information</p>
            <textarea 
              className="textarea textarea-bordered"
              value={itemAdditionalInput}
              placeholder="Additional Relevant Information"
              onChange={(event) => setItemAdditionalInput(event.target.value)} 
            />            
          </div>
          <button 
            className="btn"
            onClick={ submitItemBatch }>
              Submit
          </button>
        </div>
    </div>
  );
}