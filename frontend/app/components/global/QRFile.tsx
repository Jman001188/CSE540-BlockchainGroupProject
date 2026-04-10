"use client";

import { Html5Qrcode } from "html5-qrcode";

type QRUploadProps = {
  onScan: (result: string) => void;
};

export default function QRFile({ onScan }: QRUploadProps) {
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const scanner = new Html5Qrcode("qr-file-reader"); 

    try {
      const result = await scanner.scanFile(file, false);
      console.log("QR result:", result);
      onScan(result);
    } catch (err: any) {
      console.error("QR decode error:", err);
      onScan("");
      alert("Invalid QR code");
    }

    e.target.value = "";
  };

  return (
    <div>
      <input type="file" className="file-input" accept="image/*" onChange={handleFile} />
      <div id="qr-file-reader" style={{ display: "none" }} />
    </div>
  );
}