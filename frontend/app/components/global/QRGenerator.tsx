"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  data: string;
};

export default function QRGenerator({data}: Props) {
  const [qr, setQr] = useState("");

  useEffect(() => {
    const generate = async () => {
      const url = await QRCode.toDataURL(data);
      setQr(url);
    };

    generate();
  }, []);

  return (
    <div>
      <h2>QR Code</h2>
      {qr && <img src={qr} alt="QR Code" />}
    </div>
  );
}