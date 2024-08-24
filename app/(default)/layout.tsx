"use client";

import "aos/dist/aos.css";

import AOS from "aos";
import Footer from "@/components/ui/footer";
import { useEffect } from "react";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  });

  return (
    <>
      <main className="grow">{children}</main>

      {/* <Footer /> */}
    </>
  );
}
