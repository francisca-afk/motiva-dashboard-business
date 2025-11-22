import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import React from "react";

export default function AuthLayout({ children }) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
          {children}
          
          <div className="lg:w-1/2 w-full h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 dark:bg-gray-900 lg:flex items-center justify-center hidden overflow-hidden">
            <Image
              src="/images/logo/auth-logo-2.png"
              alt="Logo"
              width={1920}
              height={1080}
              className="h-full w-auto max-w-none"
              priority
            />
          </div>
          
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}