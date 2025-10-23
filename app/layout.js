import { Inter } from "next/font/google";
import "./globals.css";
import "./prism.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "NoBody",
  description: "Full Stack Project",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <AppContextProvider>
        <html lang="en">
          <body className={`${inter.className} antialiased`}>
            <Toaster 
              position="top-center"
              toastOptions={{
                success: {
                  style: { 
                    background: "black", 
                    color: "white",
                    border: "2px solid #22c55e"
                  }
                },
                error: {
                  style: { 
                    background: "black", 
                    color: "white",
                    border: "2px solid #ef4444"
                  }
                }
              }}
            />
            {children}</body>
        </html>
      </AppContextProvider>
    </ClerkProvider>
  );
}
