"use client";
import QRCamera from "../../components/global/QRCamera";
import QRFile from "../../components/global/QRFile";
import { useRouter } from "next/navigation";
import { useState } from "react";



export default function LoginPage() {
  const [ itemQrMode, setItemQrMode ] = useState("none");
  const [ itemQrValue, setItemQrValue ] = useState<string | null>(null);
  const [ recipientQrMode, setRecipientQrMode ] = useState("none");
  const [ recipientQrValue, setRecipientQrValue ] = useState<string | null>(null);

  const router = useRouter();

  const handleItemScan = (result: string) => {
    console.log("QR Result:", result);

    setItemQrValue(result);
    setItemQrMode("none");
    // Use the QR scan result
  };

  const handleRecipientScan = (result: string) => {
    console.log("QR Result:", result);

    setRecipientQrValue(result);
    setRecipientQrMode("none");
    // Use the QR scan result
  };

  const changeItemQrMode = (mode: string) => {
    setItemQrMode(mode);
    setRecipientQrMode("none");
  }
  const changeRecipientQrMode = (mode: string) => {
    setRecipientQrMode(mode);
    setItemQrMode("none");
  }
  const clearItems = () => {
    setItemQrValue("");
    setRecipientQrValue("");
  }


  return (
    <div className="min-h-screen flex flex-col">

        <button onClick={() => router.push("/home")}>Back</button><hr/><br/>

        { itemQrMode === "none" &&
          <>
            <button className="btn" onClick={() => changeItemQrMode("camera")}>Scan QR</button>
            <button className="btn" onClick={() => changeItemQrMode("file")}>Upload QR</button> 
          </>
        }

        { itemQrMode === "camera" && 
          <>
            <QRCamera onScan={handleItemScan} />
            <button className="btn" onClick={() => changeItemQrMode("file")}>Upload QR</button> 
          </>
        }

        { itemQrMode === "file" &&
          <>
            <QRFile onScan={handleItemScan} />
            <button className="btn" onClick={() => changeItemQrMode("camera")}>Scan QR</button> 
          </>
        }

        <hr/>

        { itemQrValue && <p>Scanned: {itemQrValue}</p> }

        <hr/>

        { recipientQrMode === "none" &&
          <>
            <button className="btn" onClick={() => changeRecipientQrMode("camera")}>Scan QR</button>
            <button className="btn" onClick={() => changeRecipientQrMode("file")}>Upload QR</button> 
          </>
        }

        { recipientQrMode === "camera" && 
          <>
            <QRCamera onScan={handleRecipientScan} />
            <button className="btn" onClick={() => changeRecipientQrMode("file")}>Upload QR</button> 
          </>
        }

        { recipientQrMode === "file" &&
          <>
            <QRFile onScan={handleRecipientScan} />
            <button className="btn" onClick={() => changeRecipientQrMode("camera")}>Scan QR</button> 
          </>
        }

        <hr/>

        { recipientQrValue && <p>Scanned: {recipientQrValue}</p> }

        <hr/>

        <button className="btn" disabled={!recipientQrValue || !itemQrValue} onClick={() => clearItems()}>Transfer Batch</button> 

        This will scan the item goods QR code, which will then show the user<br/>
        a confirmation of the goods they are sending. It will then allow to scan the receiving user's QR code.

    </div>
  );
}