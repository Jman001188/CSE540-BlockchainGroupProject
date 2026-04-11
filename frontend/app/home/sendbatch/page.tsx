"use client";
import QRCamera from "../../components/global/QRCamera";
import QRFile from "../../components/global/QRFile";
import { useRouter } from "next/navigation";
import { useState } from "react";


type ItemBatchData = {
  itemBatchId: number,  //
  currentOwner: string, // corresponds to the companyId of the current owner
  data: {   // All data is stored as strings for simpler processing as its for informational purposes only.
    name: string,
    count: string,      
    weight: string,
    description: string
  }
};
type CompanyData = {
  publicKey: string,
  name: string,
  description: string,
  

}


export default function LoginPage() {
  const [ hasItemQrValue, setHasItemQrValue ] = useState<boolean>(false);
  const [ hasRecipientQrValue, setHasRecipientQrValue ] = useState<boolean>(false);
  const [ currentStepForSending, setCurrentStepForSending ] = useState<string>("scanItem");
  const [ processedItemData, setProcessedItemData ] = useState<ItemBatchData>({ // Populated with dummy data until API integration is complete
    itemBatchId: 0,
    currentOwner: "0x8f3D7bA6c2F91e4D5C7aB8291E0f4C3a9dB6E2F1",
    data: {
      name: "Pickled Olives",
      count: "100 jars",
      weight: "100 lbs",
      description: "Interesting information about the pickled olives batch"
    }
  });
  const [ processedRecipientData, setProcessedRecipientData ] = useState<CompanyData>({ // Populated with dummy data until API integration is complete
    publicKey: "0x8f3D7bA6c2F91e4D5C7aB8291E0f4C3a9dB6E2F1",
    name: "Acme Pickles Inc.",
    description: "This company produces pickled olives."
  });

  // Scans the QR Code for the item batch
  // This will catch an error if the json format is incorrect or the scanned QR code does not match the expected ItemBatchData structure
  const handleItemScan = (result: unknown) => {
    try {
      setProcessedItemData(result as ItemBatchData);
      // This doesn't assign the data to processedItemData until the Apis are connected
      console.log("Item QR Result:", result);
      setHasItemQrValue(true);  
    } catch (error) {
      console.error("Error processing Item QR result:", error);
    }
  };

  // Scans the QR Code for the recipient company
  // This will catch an error if the json format is incorrect or the scanned QR code does not match the expected CompanyData structure
  const handleRecipientScan = (result: unknown) => {

    try {
      setProcessedRecipientData(result as CompanyData);
      // This doesn't assign the data to processedRecipientData until the Apis are connected
      console.log("Recipient QR Result:", result);
      setHasRecipientQrValue(true);
    } catch (error) {
      console.error("Error processing Recipient QR result:", error);
    }
  };

  const clearItems = () => {
    setHasItemQrValue(false);
    setHasRecipientQrValue(false);

  }

  // This is a simulated function until APIS are connected
  const triggerItemTransfer = () => {
    alert("You successfully transfered an item!")
    console.log("Transferring item batch:", processedItemData, "to recipient:", processedRecipientData);
    setCurrentStepForSending("scanItem");
    clearItems();
  }

  return (
    <div className="min-h-screen flex flex-col w-[500px] mx-auto items-center">
        {
          currentStepForSending === "scanItem" &&
          <>
            <hr/> 
            { !hasItemQrValue &&
              <>
                <h2 className="text-2xl font-bold text-center">Scan the QR code on the item you want to send.</h2>
                <QRCamera onScan={handleItemScan} />
                <QRFile onScan={handleItemScan} />
              </>
            }
            { hasItemQrValue &&             
              <div className="columns" >
                <button onClick={() => setHasItemQrValue(false)} className="btn">
                  Scan Item Again
                </button>
                <h2 className="text-2xl font-bold text-center">Item Information</h2>
                <p>Item Batch Blockchain ID: {processedItemData.itemBatchId}</p>
                <p>Item Owner: {processedItemData.currentOwner}</p>
                <p>Item Count: {processedItemData.data.count}</p>
                <p>Item Weight: {processedItemData.data.weight}</p>
                <p>Item Description: {processedItemData.data.description}</p>
                <hr/>
                <button className="btn" onClick={() => setCurrentStepForSending("scanRecipient")} >
                  Next
                </button>
              </div> 
            }
          </>
        }
        { currentStepForSending === "scanRecipient" &&
          <>
            { hasItemQrValue &&             
              <div className="columns" >
                <button onClick={() => {setCurrentStepForSending("scanItem");setHasItemQrValue(false);setHasRecipientQrValue(false)}} className="btn">
                  Scan Item Again
                </button>
                <h2 className="text-2xl font-bold text-center">Item Information</h2>
                <p>Item Batch Blockchain ID: {processedItemData.itemBatchId}</p>
                <p>Item Owner: {processedItemData.currentOwner}</p>
                <p>Item Count: {processedItemData.data.count}</p>
                <p>Item Weight: {processedItemData.data.weight}</p>
                <p>Item Description: {processedItemData.data.description}</p>
                <hr/>
                { !hasRecipientQrValue &&
                  <>
                    <h2 className="text-2xl font-bold text-center">Scan the QR code on the recipient you want to send the item to.</h2>
                    <QRCamera onScan={handleRecipientScan} />
                    <QRFile onScan={handleRecipientScan} />
                  </>
                }
                { hasRecipientQrValue &&             
                  <>
                    <button onClick={() => setHasRecipientQrValue(false)} className="btn">
                      Scan Recipient Again
                    </button>
                    <h2 className="text-2xl font-bold text-center">Recipient Information</h2>
                    <p>Company Ethereum Key: {processedRecipientData.publicKey}</p>
                    <p>Company Name: {processedRecipientData.name}</p>
                    <p>Company Description: {processedRecipientData.description}</p>
                    <button className="btn" disabled={!hasRecipientQrValue || !hasItemQrValue} onClick={() => triggerItemTransfer()}>
                      Confirm Transfer Batch
                    </button> 
                  </> 
                }
              </div> 
            }
          </>
        }
    </div>
  );
}