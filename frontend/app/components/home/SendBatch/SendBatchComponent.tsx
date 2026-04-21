"use client";
import QRCamera from "../../global/QRCamera";
import QRFile from "../../global/QRFile";
import { RecipientQrData, BatchQrData } from "../../utils/types";

type Props = {
    currentStepForSending: string; setCurrentStepForSending: React.Dispatch<React.SetStateAction<string>>;
    hasItemQrValue: boolean; setHasItemQrValue: React.Dispatch<React.SetStateAction<boolean>>;
    hasRecipientQrValue: boolean; setHasRecipientQrValue: React.Dispatch<React.SetStateAction<boolean>>;
    processedItemData: BatchQrData | null; setProcessedItemData: React.Dispatch<React.SetStateAction<BatchQrData | null>>;
    processedRecipientData: RecipientQrData | null; setProcessedRecipientData: React.Dispatch<React.SetStateAction<RecipientQrData | null>>;
    isValidBatch: boolean; setIsValidBatch: React.Dispatch<React.SetStateAction<boolean>>;
    handleRecipientScan: (data: string) => void;
    handleItemScan: (data: string) => void;
    triggerItemTransfer: () => void;
};

export default function SendBatchComponent({
    currentStepForSending, setCurrentStepForSending,
    hasItemQrValue, setHasItemQrValue,
    hasRecipientQrValue, setHasRecipientQrValue,
    processedItemData, setProcessedItemData,
    processedRecipientData, setProcessedRecipientData,
    isValidBatch, setIsValidBatch,
    handleRecipientScan,
    handleItemScan,
    triggerItemTransfer}: Props) {
    
    return (
        <>
            {currentStepForSending === "scanItem" &&
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
                    <p>Item Batch ID: {processedItemData?.batchId}</p>
                    <p>Item Batch Name: {processedItemData?.batchName}</p>
                    <p>Item Owner: {processedItemData?.registeringCompanyName}</p>
                    <p>Item Description: {processedItemData?.batchDescription}</p>
                    <p>Item Status: {processedItemData?.blockchain.status}</p>
                    <hr/>
                    {!isValidBatch ? 
                        <p className="text-red-500">This item batch is not confirmed on the blockchain. Please scan a different item.</p> :
                        <button className="btn" onClick={() => setCurrentStepForSending("scanRecipient")}>Next</button>
                    }
                    
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
                    <p>Item Batch Blockchain ID: {processedItemData?.batchId}</p>
                    <p>Item Batch Name: {processedItemData?.batchName}</p>
                    <p>Item Owner: {processedItemData?.registeringCompanyName}</p>
                    <p>Item Description: {processedItemData?.batchDescription}</p>
                    <p>Item Status: {processedItemData?.blockchain.status}</p>
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
                        <p>Company Description: {processedRecipientData?.companyId}</p>
                        <p>Company Name: {processedRecipientData?.companyName}</p>
                        <p>Company Ethereum Wallet: {processedRecipientData?.walletAddress}</p>
                        <button className="btn" disabled={!hasRecipientQrValue || !hasItemQrValue} onClick={() => triggerItemTransfer()}>
                            Confirm Transfer Batch
                        </button> 
                        </> 
                    }
                    </div> 
                }
                </>
            }
        </>
    );
        
}