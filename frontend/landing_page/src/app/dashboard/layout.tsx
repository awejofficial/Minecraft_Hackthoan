import React from "react";
import DashboardNav from "@/components/DashboardNav";
import DashboardAuthGuard from "@/components/DashboardAuthGuard";
import VisionXLogo from "@/components/VisionXLogo";

export const metadata = {
  title: "Vision X • Surveillance Intelligence Platform",
  description: "Automated Number Plate Recognition, CCTV Timeline Spotting & Transit Intelligence",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGuard>
      <div className="min-h-screen bg-[#F8F9FA] text-[#000000] font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
        {/* Rekor Scout Left Nav Rail & Top Utility Header */}
        <DashboardNav />

        {/* Content Canvas Offset by Left Rail (w-20) and Top Bar (pt-14) */}
        <div className="flex-1 md:pl-20 pt-14 flex flex-col justify-between">
          <main className="flex-1 w-full">
            {children}
          </main>

          {/* Console Footer */}
          <footer className="border-t border-black/10 py-6 px-6 sm:px-8 bg-white mt-12">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <VisionXLogo size="sm" />
                <span className="text-xs font-mono text-[#5E5E59]">
                  ADVANCED MOBILITY &amp; ROADWAY INTELLIGENCE
                </span>
              </div>
              <span className="text-xs font-mono text-[#5E5E59]">
                SIH26127 • THREE-STAGE YOLO11 + TROCR LOCAL INFERENCE
              </span>
            </div>
          </footer>
        </div>
      </div>
    </DashboardAuthGuard>
  );
}
