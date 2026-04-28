"use client";

import { useState } from "react";
import QRCamera from "./global/QRCamera";
import QRFile from "./global/QRFile";
import DetailRow from "./global/DetailRow";
import { BatchModel, BatchQrModel } from "./utils/types/models";
import { BatchAPI } from "./utils/apiclient";

export default function SupplyChain() {
    const [itemQrValue, setItemQrValue] = useState<BatchQrModel | null>(null);
    const [hasScannedItem, setHasScannedItem] = useState(false);

    const [hasItemHistory, setHasItemHistory] = useState(false);
    const [itemHistory, setItemHistory] = useState<BatchModel[]>([]);

    const handleItemScan = (result: string) => {
        console.log(result);
        try {
            const parsedValue = JSON.parse(result) as BatchQrModel;
            setItemQrValue(parsedValue);
            setHasScannedItem(true);
        } catch (error) {
            console.error("Error parsing item QR value:", error);
            alert("Could not read item QR code. Please scan a valid item QR code.");
        }
    };

    const getItemHistory = () => {
        if (!itemQrValue) return;

        BatchAPI.getSupplyChainHistory(itemQrValue.batchId)
            .then((response) => {
                setItemHistory(response.batches);
                setHasItemHistory(true);
            })
            .catch((error) => {
                console.error("Error fetching item history:", error);
                alert("Failed to fetch item history.");
            });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex items-center justify-center pb-40">
                {!hasScannedItem ? (
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
                        <legend className="fieldset-legend">Scan Item QR Code</legend>
                        <h2 className="text-lg font-bold mb-3">Scan the item QR code</h2>
                        <p className="text-sm text-gray-600 mb-4">Use the camera or upload an image of the QR code.</p>
                        <div className="flex flex-col gap-3">
                            <QRCamera onScan={handleItemScan} />
                            <QRFile onScan={handleItemScan} />
                        </div>
                    </fieldset>
                ) : (
                    <>
                    {!hasItemHistory ? (
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
                        <legend className="fieldset-legend">Item Details</legend>
                        <button className="btn" onClick={() => { setHasScannedItem(false); setItemQrValue(null); }}>Scan Different Item</button>
                        <div className="flex flex-col gap-3">
                            <DetailRow label="Item ID" value={itemQrValue?.batchId ?? ""} />
                            <DetailRow label="Item Name" value={itemQrValue?.batchName ?? ""} />
                            <DetailRow label="Item Description" value={itemQrValue?.batchDescription ?? ""} />
                            <DetailRow label="Status" value={itemQrValue?.blockchain?.status ?? ""} />
                            <DetailRow label="Data Hash" value={itemQrValue?.blockchain?.dataHash ?? ""} />
                        </div>
                        <button className="btn" onClick={getItemHistory}>View Item History</button>
                    </fieldset>
                    ) : (
                        <>
                        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
                            <legend className="fieldset-legend">Item History</legend>
                            <div className="flex flex-col gap-3">
                                <DetailRow label="Item ID" value={itemQrValue?.batchId ?? ""} />
                            </div>
                        </fieldset>
                        </>
                    )}
                </>
                )}
            </div>
        </div>
    );
}