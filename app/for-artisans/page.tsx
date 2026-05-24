import type { Metadata } from "next";

import { ForArtisansPage } from "@/components/landing/for-artisans-page";
import Footer from "@/components/layout/footer-new";
import Header from "@/components/layout/header-new";

export const metadata: Metadata = {
  title: "For Artisans — ChapaWorks",
  description:
    "Create a verified ChapaWorks artisan profile, showcase your portfolio, respond to client requests, and manage jobs from one focused workspace.",
};

export default function ForArtisansRoute() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ForArtisansPage />
      <Footer />
    </div>
  );
}
