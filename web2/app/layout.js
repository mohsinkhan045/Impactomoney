import localFont from "next/font/local";
import "./globals.css";
import {connectDB} from "./api/utils/connectDB"
import { icons } from "lucide-react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Impact to Money",
  description: "Donation Website",
  icons: {
    icon:"/icon.ico"
  }
};

export default async function RootLayout({ children }) {
  //  await connectDB()
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       
        {children}
        
      </body>
    </html>
  );
}
