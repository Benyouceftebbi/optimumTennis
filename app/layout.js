"use client"
import { Inter } from "next/font/google";
import "../styles/global.css";
import { auth } from "./firebase";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

export default function RootLayout({
  children,
}) {
   console.log(auth.currentUser); 
    useEffect(() => {

        onAuthStateChanged(auth, async (user) => {
            if (user) {
  
                //router.replace('/Home/firstpage')
                console.log(user);
            } else {
                console.log("wqeqew");
                //router.push("/Auth")
            }
        });
  }, []);
  return (
    <html lang="en">
      <body className={inter.className}>

        <div className="flex min-h-screen w-full bg-slate-100">

            {children}
      
        </div>
      </body>
    </html>
  );
}

