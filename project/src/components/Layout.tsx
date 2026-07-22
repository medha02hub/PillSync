import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

// Wraps every authenticated page with the navbar
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
