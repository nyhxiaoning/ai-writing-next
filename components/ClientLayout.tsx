"use client";

import "aos/dist/aos.css";
import AOS from "aos";
import { useEffect } from "react";
import Footer from "@/components/ui/footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <>
      <main className="grow">{children}</main>
      <Footer />
    </>
  );
}
