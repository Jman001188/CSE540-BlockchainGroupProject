"use client";

import SiteAdmin from "../components/utils/SiteAdmin";

export default function SiteAdminPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center pb-40">
        <SiteAdmin />
      </div>
    </div>
  );
}