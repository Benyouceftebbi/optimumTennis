"use client"

import { db } from "@/app/firebase"
import { collection, getDocs } from "firebase/firestore"
import { useEffect, useState } from "react"
import { MultiSelect } from "react-multi-select-component"
export default function Component() {
    const [notifications,setNotifications]=useState([])
    const getNotifications=async()=>{
        const notificationsRef=await getDocs(collection(db,"Club","GeneralInformation","Notifications"))
        const data= notificationsRef.docs.map((doc)=>({id:doc.id,...doc.data()}))
        setNotifications(data)

    }
    useEffect(()=>{
getNotifications()
    },[])
    const options = [
        {
          label: 'Group 1',
          options: [
            { label: 'Option 1-1', value: 'option1-1' },
            { label: 'Option 1-2', value: 'option1-2' },
          ],
        },
        {
          label: 'Group 2',
          options: [
            { label: 'Option 2-1', value: 'option2-1' },
            { label: 'Option 2-2', value: 'option2-2' },
          ],
        },
      ];
    
      const handleSelectChange = (selectedOptions) => {
        console.log('Selected options:', selectedOptions);
      };
    const handleChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
        handleSelectChange(selectedOptions);
      };
    return (
        <div className="container mx-auto  h-full mt-10 ">
            <h1 className="text-3xl font-bold mb-5">Notifications</h1>
      <div className="grid grid-cols-4 gap-4 h-screen p-2 bg-white pt-4 border rounded-lg ">
        <div className="border-r border-zinc-200 overflow-y-auto w-3/20 p-2 space-y-2">
          <ul>
            <li className="p-3 hover:bg-zinc-100 cursor-pointer flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-1">
                <InboxIcon className="w-4 h-4" />
                <span className="text-sm">All Notifications</span>
              </div>
              <span className="bg-zinc-200 rounded-full px-2 py-1 text-xs">{notifications.length}</span>
            </li>
          </ul>
          <hr className="my-4 " />
        
        </div>
        <div className="border-r border-zinc-200 overflow-y-auto w-5/20 p-2">
      <ul className="divide-y divide-zinc-200">
        {notifications.map((notification, index) => (
          <li key={index} className="p-4 hover:bg-zinc-100 cursor-pointer flex justify-between items-start">
            <div>
            <h2 className="text-base font-bold">
                {notification.receivers.map((receiver, i) => (
                  <span key={i}>
                    {receiver.name}
                    {i !== notification.receivers.length - 1 && ', '}
                  </span>
                ))}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{notification.subject}</p>
              <p className="text-sm truncate">{notification.body}</p>
            </div>
            <time className="text-xs text-zinc-500 dark:text-zinc-400 self-center">{notification.date}</time>
          </li>
        ))}
      </ul>
    </div>
        <div className="col-span-2 flex flex-col w-12/20">
          <div className="flex items-center space-x-0 border-b border-zinc-200  p-4 sticky top-0 bg-white w-full">
          <div className="flex items-center justify-between w-1/3">
            {/* <button variant="ghost" className="hover:bg-zinc-100 p-2 rounded-lg">
            <h2 class=" font-semibold  ">add new</h2>
            </button> */}
                       <h2 class=" font-semibold  ">New notification</h2>
            </div>
          </div>
      
          <div className="p-4 space-y-4 flex-grow overflow-y-auto">
    <h2 class="text-2xl font-semibold text-white mb-6">Say Something!</h2>
    <form action="https://fabform.io/f/insert-form-id" method="POST">
      <div class="mb-4">
        <label for="name" class="block text-white-300 text-sm font-bold mb-2">To</label>
        <MultiSelect
  displayValue="key"
  groupBy="cat"
//   onKeyPressFn={function noRefCheck(){}}
//   onRemove={function noRefCheck(){}}
//   onSearch={function noRefCheck(){}}
//   onSelect={function noRefCheck(){}}
  options={[
    {
      cat: 'Group 1',
      key: 'Option 1'
    },
    {
      cat: 'Group 1',
      key: 'Option 2'
    },
    {
      cat: 'Group 1',
      key: 'Option 3'
    },
    {
      cat: 'Group 2',
      key: 'Option 4'
    },
    {
      cat: 'Group 2',
      key: 'Option 5'
    },
    {
      cat: 'Group 2',
      key: 'Option 6'
    },
    {
      cat: 'Group 2',
      key: 'Option 7'
    }
  ]}
  style={{
    chips: {
      background: 'red'
    },
    multiselectContainer: {
      color: 'red'
    },
    searchBox: {
      border: 'none',
      'border-bottom': '1px solid blue',
      'border-radius': '0px'
    }
  }}
  showCheckbox
/>
        <input type="text" id="name" name="name" placeholder="John Doe" required
class="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-white-700 "/>
      </div>
      <div class="mb-4">
        <label for="email" class="block text-white-300 text-sm font-bold mb-2">Title</label>
        <input type="email" id="email" name="email" placeholder="john@example.com" required
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-white-700 "/>
      </div>
      <div class="mb-6">
        <label for="message" class="block text-white-300 text-sm font-bold mb-2">Body</label>
        <textarea id="message" name="message" rows="4" placeholder="How can we help you?" required
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-white-700 "></textarea>
      </div>
      <button type="submit"
        class="button-white">
        Send Notification
      </button>
    </form>
  </div>

          {/* <div className="p-4 space-y-4 flex-grow overflow-y-auto">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <h2 className="text-xl font-bold">Meeting Tomorrow</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">From: John Doe</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">To: Me</p>
              <time className="text-xs text-zinc-500 dark:text-zinc-400">Nov 1, 2023, 10:00 AM</time>
            </div>
            <div>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor nunc ac nulla cursus, at fermentum
                purus blandit. Sed euismod, mi at pellentesque mollis, orci magna dapibus lorem, in pretium dui tortor non
                est. In hac habitasse platea dictumst. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                posuere cubilia curae; Donec at condimentum metus, nec suscipit erat.
              </p>
              <p>Best,</p>
              <p>John</p>
            </div>
          </div> */}
        </div>
      </div>
      

      </div>
    )
  }
  
  function FlagIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" x2="4" y1="22" y2="15" />
      </svg>
    )
  }
  
  
  function FolderIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      </svg>
    )
  }
  
  
  function ForwardIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 17 20 12 15 7" />
        <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
      </svg>
    )
  }
  
  
  function InboxIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    )
  }
  
  
  function MailIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    )
  }
  
  
  function ReplyIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 17 4 12 9 7" />
        <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
      </svg>
    )
  }
  
  
  function SearchIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    )
  }
  
  
  function SendIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </svg>
    )
  }
  
  
  function TrashIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    )
  }