"use client";
import QRCamera from "../../components/global/QRCamera";
import QRFile from "../../components/global/QRFile";
import { useRouter } from "next/navigation";
import { useState } from "react";


const tempItemBatchInformation = {
  name: "Green Olives",
  itemBatchId: 123,
  currentOwner: "Acme inc.",
  count: 500,
  weight: "1kg",
  description: "A crate of Green Olives"
}
const tempCompanyInformation = {
  companyId: 1,
  name: "Acme inc.",
  description: "A company that produces and distributes Green Olives",
  publicKey: "PUBLIC_KEY_STRING_HERE",

}


export default function LoginPage() {
  const [ itemQrValue, setItemQrValue ] = useState<string | null>(null);
  const [ recipientQrValue, setRecipientQrValue ] = useState<string | null>(null);
  const [ currentStepForSending, setCurrentStepForSending ] = useState<string>("scanItem");

  const router = useRouter();

  const handleItemScan = (result: string) => {
    console.log("QR Result:", result);
    setItemQrValue(result);
    // Use the QR scan result
  };

  const handleRecipientScan = (result: string) => {
    console.log("QR Result:", result);
    setRecipientQrValue(result);
    // Use the QR scan result
  };

  const clearItems = () => {
    setItemQrValue("");
    setRecipientQrValue("");

  }

  const triggerItemTransfer = () => {
    alert("You successfully transfered an item!")
    console.log("Transferring item batch:", itemQrValue, "to recipient:", recipientQrValue);
    setCurrentStepForSending("scanItem");
    clearItems();
  }


  return (
    <div className="min-h-screen flex flex-col w-[500px] mx-auto items-center">
        {
          currentStepForSending === "scanItem" &&
          <>
            <hr/> 
            
            { !itemQrValue &&
              <>
                <h2 className="text-2xl font-bold text-center">Scan the QR code on the item you want to send.</h2>
                <QRCamera onScan={handleItemScan} />
                <QRFile onScan={handleItemScan} />
              </>
            }
            { itemQrValue &&             
              <div className="columns" >
                <button onClick={() => setItemQrValue(null)} className="btn">
                  Scan Item Again
                </button>
                <h2 className="text-2xl font-bold text-center">Item Information</h2>
                <p>Item Batch Blockchain ID: {tempItemBatchInformation.itemBatchId}</p>
                <p>Item Owner: {tempItemBatchInformation.currentOwner}</p>
                <p>Item Count: {tempItemBatchInformation.count}</p>
                <p>Item Weight: {tempItemBatchInformation.weight}</p>
                <p>Item Description: {tempItemBatchInformation.description}</p>
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
            { itemQrValue &&             
              <div className="columns" >
                <button onClick={() => {setCurrentStepForSending("scanItem");setItemQrValue(null);setRecipientQrValue(null)}} className="btn">
                  Scan Item Again
                </button>
                <h2 className="text-2xl font-bold text-center">Item Information</h2>
                <p>Item Batch Blockchain ID: {tempItemBatchInformation.itemBatchId}</p>
                <p>Item Owner: {tempItemBatchInformation.currentOwner}</p>
                <p>Item Count: {tempItemBatchInformation.count}</p>
                <p>Item Weight: {tempItemBatchInformation.weight}</p>
                <p>Item Description: {tempItemBatchInformation.description}</p>
                <hr/>
                { !recipientQrValue &&
                  <>
                    <h2 className="text-2xl font-bold text-center">Scan the QR code on the recipient you want to send the item to.</h2>
                    <QRCamera onScan={handleRecipientScan} />
                    <QRFile onScan={handleRecipientScan} />
                  </>
                }
                { recipientQrValue &&             
                  <>
                    <button onClick={() => setRecipientQrValue(null)} className="btn">
                      Scan Recipient Again
                    </button>
                    <h2 className="text-2xl font-bold text-center">Recipient Information</h2>
                    <p>Company Name: {tempCompanyInformation.name}</p>
                    <p>Company Blockchain ID: {tempCompanyInformation.companyId}</p>
                    <p>Description: {tempCompanyInformation.description}</p>
                    <p>Public Key: {tempCompanyInformation.publicKey}</p>
                    <button className="btn" disabled={!recipientQrValue || !itemQrValue} onClick={() => triggerItemTransfer()}>
                      Transfer Batch
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