
'use client'
import React from "react";
import LottiePlayer from "@lottiefiles/react-lottie-player";
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import { auth } from "./firebase";
import { redirect } from 'next/navigation'
import { useEffect,useState} from "react";
import Router, { useRouter } from "next/navigation"
import { usePathname } from "next/navigation";
import { createUserWithEmailAndPassword, deleteUser, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";




   
const DashboardPage = () => {

  const router=useRouter()
  useEffect(() => {
    
      onAuthStateChanged(auth, async (user) => {
          if (user) {
  
              router.replace('/Home/calendar')
       
          } else {
              router.push("/Auth")
          }
      });
}, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor:'#0E2433', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <Player
      autoplay
      loop
      src={require("@/public/animations/loadingAnimation.json")}
      style={{ width: '300px', height: '300px' }}
    />
    <img
      src="/logo-expanded.png"
      alt="Your Image"
      style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', height:'100px' }}
    />
  </div>
  )
};

export default DashboardPage;