// pages/index.js
'use client';
import { db } from '/app/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc, doc,query,where, arrayUnion,orderBy,onSnapshot, Timestamp, setDoc
  
} from 'firebase/firestore';7
import { auth } from '@/app/firebase';
import { createUserWithEmailAndPassword, deleteUser, getAuth, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import {CoinsIcon, Eye, HandCoins, Search,  UserCheck2, Users2, X,School, Star, } from "lucide-react";
import React ,{useState, useEffect, useRef} from "react";
import { formatTimestampToDate} from '../classes/dateFormat';
import DateTimePicker from 'react-datetime-picker';
import { Router } from 'react-router-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation'
// Importing an SVG file
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import AttendanceRateChart from './AttendanceChart';
import { getFunctions,httpsCallable } from 'firebase/functions';
import { formatCreatedAt } from '../classes/page';
const ChatScreen = ({coachDetails}) => {
 
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState('');
  const functions = getFunctions();
  const sendNotificationToParticipants = httpsCallable(functions, 'sendNotificationToParticipants');
  const [isLoading, setIsLoading] = useState(false);
  
  //ref for collecting messages
  //id for the docuemnt
  const fetchMessagesAndCreateConversation = async (setIsLoading) => {
    try {
      setIsLoading(true);
      const conversationRef = collection(db,'Trainers',coachDetails.id,'Messages');
      // Query conversation where Members array contains the traineeId 
      
      const messagesQuery = query(conversationRef, orderBy('CreatedAt', 'asc'));
  
      // Listen for real-time updates to the 'Messages' subcollection
      const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
  
        const messages = querySnapshot.docs.map(messageDoc => ({ id: messageDoc.id, ...messageDoc.data() }));
  
        
        setMessages(messages);
        setIsLoading(false);
      });
  
      // Check if the conversation exists, if not, create it
  
      setIsLoading(false);
      // Return the unsubscribe function to clean up the listener
      return unsubscribe;
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching messages:', error);
    }
  };
  
  
  useEffect(() => {
    
    const unsubscribe = fetchMessagesAndCreateConversation(setIsLoading);
  
    // Clean up the listener when the component unmounts
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe(); // Ensure unsubscribe is a function before calling it
      }
    };
  }, []);
  
  const sendMessage = async () => {
    const msg = message.trim();
    
    if (msg.length === 0) return false; // Return false if message is empty
  
    const newMessage = {
      CreatedAt: Timestamp.fromDate(new Date()),
      SentBy: 'TeamSupport',
      text: msg,
     
      SentByName: 'TeamSupport'
    };
  
    const data = {
      participants: [{ExpoToken:coachDetails.ExpoToken}],
      title:newMessage.SentByName,
      body:newMessage.text,
      data:{notificationType:"newMessage",url:"/Chat/[Chat]" ,documentId: `Trainers/${coachDetails.id}`,   id:`Classes/${coachDetails.id}`,
      ref:`Trainers/${coachDetails.id}/Messages`,
      date: new Date()},
      name:'TeamSupport',
   
  
    };
    try {
     
      setMessage('');
  
      // Attempt to create the conversation document and add the message in one operation
      const messagesRef = collection(db, `Trainers/${coachDetails.id}/Messages`);
      const conversationRef=doc(db,"Trainers",coachDetails.id);
  
      const messageRef = await addDoc(messagesRef, newMessage);
      await setDoc(conversationRef, { LastMessage: { By: 'TeamSupport', SentAt: newMessage.CreatedAt }, }, { merge: true });
      sendNotificationToParticipants(data)
      .then((result) => {
        console.log('Notifications sent successfully:', result.data);
      })
      .catch((error) => {
        console.error('Error sending notifications:', error);
      });
      console.log('Message document created with ID:', messageRef.id);
      return true; // Return true if message added successfully
    } catch (error) {
      console.error('Error adding message to conversation:', error);
      return false; // Return false in case of error
    }
  };
  const scrollRef = useRef(null);
  
  // Scroll to bottom on initial render and when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevents adding new line
      sendMessage();
    }
  }
    return (
  
  
  
  <div className="bg-white w-full">
    <div className="flex-grow p-4 bg-gray-100">
  
      <div className="p-4 w-full flex" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto',flexDirection:'column'}} ref={scrollRef}>
        {messages.map((message, index) => (
          <div key={index} className="mb-4 flex" style={{ padding: '10px', borderRadius: '10px', maxWidth: '100%',alignSelf:message.SentBy ==='TeamSupport' ?  'flex-end':'flex-start'}}>
            <div style={{ display: 'flex', flexDirection: 'column', }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{message.SentByName}</div>
              <div style={{ backgroundColor:  message.SentBy ==='TeamSupport' ? '#dcf8c6' : '#fff', padding: '10px', borderRadius: '10px', marginTop: '5px' }}>
                {message.text}
              </div>
              <div style={{ color: '#777', fontSize: '12px', marginTop: '5px', alignSelf: 'flex-end' }}>
                {message.CreatedAt && message.CreatedAt.nanoseconds ? formatCreatedAt(message.CreatedAt) : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="w-full p-2 border border-gray-300 rounded"
          rows="3"
        />
        <button onClick={sendMessage} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">Send</button>
      </div>
    </div>
  </div>
  
  
    );
  };
  const NewCoach=({toggleDetailsmake,setI,i})=>{

  const [coachDetails,setCoachDetails]=useState()

  const [documents,setDocuments]=useState([])
  const [image,setImage]=useState([])
const [showCalendar,setShowCalendar]=useState(false)   



const handleTextClick=()=>{
 setShowCalendar(!showCalendar)

}

const handleCalendarClose = () => {
  setShowCalendar(false); // Close calendar when date is selected
};
const handleInputChange = (e)=> {
  setCoachDetails((prevDetails) => ({
    ...prevDetails,
    [e.target.name]: e.target.value,
  }))}


  const handleFileUpload = async (files) => {
    const urls=[]
    try {
      for (const key in files) {
        if (files.hasOwnProperty(key)) {
          const item = files[key];
  
        
              urls.push({ name: item.name, pdf: item });
           
      
        }
      }

      setDocuments(urls)
        
  
    } catch (error) {
      console.error('Error selecting documents:', error);
    
    }
  };
  
  const createAccountAndSaveData = async () => {
    try {
     console.log(documents);
      const response = await createUserWithEmailAndPassword(auth, coachDetails.contact, 'Optimumtennis123@');
  
      // Upload documents to Firebase Cloud Storage
  const authUser=response.user
      const storage = getStorage();
      const uploadTasks = [];

      try {
        for (const file of documents) {
          const storageRef = ref(storage, `Trainers/${authUser.uid}/Documents/${file.name}`);
          const uploadTask = uploadBytesResumable(storageRef, file);
    
          uploadTasks.push(uploadTask); // Add upload task to array
        }
    
        // Wait for all upload tasks to complete
        await Promise.all(uploadTasks.map((task) => task.on));
    
        const urls = [];
        for (const file of documents) {
          const downloadURL = await getDownloadURL(ref(storage, `Trainers/${authUser.uid}/Documents/${file.name}`));
          urls.push({ name: file.name, pdf: downloadURL });
        }
    
        const docRef = doc(db, 'Trainers', authUser.uid);
        await setDoc(docRef, coachDetails);
        await updateDoc(docRef, { Documents: urls, uid: authUser.uid });
        setI(!i)
        toggleDetailsmake()
        console.log('Account created and data saved successfully.');
        return urls;
      } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
      }

    } catch (error) {
      console.error('Error creating account and saving data:', error);
      throw error;
    }
  };
  return (
    <div className={`flex bg-white p-1 mb-1 rounded-lg items-center border-b border-gray-400`}>
<div className="fixed inset-0 flex bg-gray-600 bg-opacity-50 justify-end items-center h-full overflow-auto" style={{ height: 'calc(100% )' }}>
<button onClick={toggleDetailsmake} className="absolute top-0 right-0 m-3 text-gray-500 hover:text-gray-700 focus:outline-none">
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
</button>


<div className="w-3/6 h-full bg-white border rounded-t flex flex-col justify-start items-start">
<div className='flex'>
 
 <h2 className="text-xl font-bold ml-4 mt-4 mb-6">New Coach</h2>
 <div className='ml-72'/>
 </div>


   
          <div className="bg-white w-full mt-10">
              <h1 className="text-lg font-bold ml-4 mb-2">General Information</h1>

              <div className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8" style={{ width: 'calc(100% - 24px)' }}>

<div className="ml-4 grid grid-cols-3 gap-4">
              <div className="">
                <strong className="block mb-1">Name:</strong>
                <input
          className="rounded-lg"
          type="text"
          name="nameandsurname"
         
          onChange={handleInputChange}
        />
              </div>
      
              <div className="">
                <strong className="block mb-1">Position:</strong>
                <input type="text" name="position"  onChange={handleInputChange}  className="rounded-lg" />
              </div>
              <div className="">
                <strong className="">Email:</strong>
                <input type="email" name="contact"  onChange={handleInputChange}  className="rounded-lg" />
              </div>
              
              <div className="">
                <strong className="block mb-1">Blood Type:</strong>
                <input type="text"  name="BloodType"  onChange={handleInputChange}  className="rounded-lg" />
              </div>
              <div className="">
          <strong>Date of Birth</strong> 
          <input
          className="rounded-lg"
          type="text"
          name="birthDay"
          value={coachDetails?.birthDay?coachDetails.birthDay:new Date()}
         onClick={handleTextClick} // Convert string back to array on change
        />
   
      {showCalendar && (
        <DateTimePicker
          value={coachDetails?.birthDay?coachDetails.birthDay:new Date()}
          onChange={(date) => {
            setCoachDetails({ ...coachDetails, birthDay: date })
            handleCalendarClose(); // Close calendar after date selection
          }}
          calendarIcon={null} // Remove default calendar icon
     
        />
      )}
        </div>
              <div className="">
                <strong className="">Experience:</strong>
                <input type="text" onChange={handleInputChange} name='experience'  className="rounded-lg" />
              </div>
              <div className="">
                <strong className="block mb-1">Phone Number:</strong>
                <input type="tel"  onChange={handleInputChange} name='phoneNumber'  className="rounded-lg" />
              </div>
                            
              <div className="flex flex-col">
      <strong>Upload Class Image</strong>
      <label htmlFor="imageInput" className="rounded-lg border border-black-900 px-3 py-2  cursor-pointer ">
        {image ? 'Change Image' : 'Upload Image'}
        <input
          id="imageInput"
          type="file"
          accept="image/*"
          name='image'
          onChange={(e) => {
            const urls=[]
            const files=e.target.files
            for (const key in files) {
              if (files.hasOwnProperty(key)) {
                const item = files[key];
        
              
                    urls.push({ name: item.name, pdf: item });
                 
            
              }
            }
            console.log(urls);
            setImage(urls)
          
          }}
          style={{ display: 'none' }}
        />
      </label>
      </div>
            </div>


    
            <div className="flex flex-wrap mb-6">
              </div>
         
            </div>
            <h3 className="text-lg font-bold ml-4 mb-2">Bio</h3>
    <div className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8 w-full"style={{ width: 'calc(100% - 24px)' }}>
          
          <input
          className="rounded-lg w-full"
          type="text"
          name="description"
          multiple

          onChange={handleInputChange} // Convert string back to array on change
        />
          
          
        </div>

  <h3 className="text-lg font-bold ml-4 mb-2">Documents</h3>
  <div className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8 w-full"style={{ width: 'calc(100% - 24px)' }}>
  {documents.length===0?(
    
    <div className="flex items-center justify-center bg-gray-200 rounded-full h-48 opacity-50">
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className='items-center justify-center flex'>
        <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 15L12 2M12 2L15 5.5M12 2L9 5.5" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 22.0002H16C18.8284 22.0002 20.2426 22.0002 21.1213 21.1215C22 20.2429 22 18.8286 22 16.0002V15.0002C22 12.1718 22 10.7576 21.1213 9.8789C20.3529 9.11051 19.175 9.01406 17 9.00195M7 9.00195C4.82497 9.01406 3.64706 9.11051 2.87868 9.87889C2 10.7576 2 12.1718 2 15.0002L2 16.0002C2 18.8286 2 20.2429 2.87868 21.1215C3.17848 21.4213 3.54062 21.6188 4 21.749" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
</svg>
        </div>

        <p className="text-lg text-gray-500 mt-4">Upload Coach's documents</p>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </label>
    </div>

) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {documents?.map((cls) => (
    <div key={cls.id} className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
     <div className='items-center justify-center flex'>
      <svg width="100px" height="100px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.5" d="M3 10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157C21 4.34315 21 6.22876 21 10V14C21 17.7712 21 19.6569 19.8284 20.8284C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8284C3 19.6569 3 17.7712 3 14V10Z" stroke="#1C274C" stroke-width="1.5"/>
<path d="M8 10H16" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
<path d="M8 14H13" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
</svg>
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">{cls.name}</h3>
          
        </div>
        <button
      onClick={()=>  window.open(cls.pdf, '_blank')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 self-end"
        >
          Open
        </button>
      </div>
    </div>
  ))}
</div>
)}
</div>
           
        <button
          className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-10"
          onClick={createAccountAndSaveData}

        >
          Add Coach
        </button>
          </div>

        </div>
  </div>







    </div>
  );
  }
const CoachItem = ({ coach,setI,i }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDetailsedit, setShowDetailsedit] = useState(false);
  const [coachDetails,setCoachDetails]=useState(coach)
  const [activeTab,setActiveTab]=useState('details')
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previous=coach
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  const toggleDetailsedit = () => {
    setShowDetailsedit(!showDetailsedit);
  };


const [showCalendar,setShowCalendar]=useState(false)   
const fetchDocumentsByTrainerRef = async () => {
  const q = query(collection(db, 'Classes'), where('TrainerRef', '==', coach.Ref));

  try {
    const querySnapshot = await getDocs(q);
const classes = querySnapshot.docs.map(async (doc) => {
  const attendanceRef = collection(db, 'Classes', doc.id, 'attendance');
  const attendanceSnapshot = await getDocs(attendanceRef);
  const attendanceData = attendanceSnapshot.docs.map((attendanceDoc) => ({
    id: attendanceDoc.id,
    date: attendanceDoc.data().date,
    participants: attendanceDoc.data().Participants,
  }));

  const classhistoryRef = collection(db, 'Classes', doc.id, 'ClassHistory');
  const classhistorySnapshot = await getDocs(classhistoryRef);
  const classhistoryData = classhistorySnapshot.docs.map((classhistoryDoc) => ({
    id: classhistoryDoc.id,
    date: classhistoryDoc.data().start,
    participants: classhistoryDoc.data().Trainees,
  }));

  return {
    id: doc.id,
    ...doc.data(),
    attendance: attendanceData,
    classhistory: classhistoryData,
  };
});

// Wait for all async operations to complete
const classesWithData = await Promise.all(classes);

// Update CoachDetails with the fetched data
setCoachDetails((prevDetails) => ({
  ...prevDetails,
  classes: classesWithData,
}));


  } catch (error) {
    console.error('Error fetching documents:', error);
    setCoachDetails((prevDetails) => ({
      ...prevDetails,
      classes: [],
    }));
  }
};
useEffect(()=>{
fetchDocumentsByTrainerRef()


},[])




const handleTextClick=()=>{
 setShowCalendar(!showCalendar)

}

const handleCalendarClose = () => {
  setShowCalendar(false); // Close calendar when date is selected
};
const handleInputChange = (e)=> {
  setCoachDetails((prevDetails) => ({
    ...prevDetails,
    [e.target.name]: e.target.value,
  }))}
  const router=useRouter()

  const handleFileUpload = async (files) => {
    try {

      const storage = getStorage();
   
          // Perform actions on each item in the object
    
      
      for (const key in files) {
        if (files.hasOwnProperty(key)) {
          const item = files[key];

        const storageRef = ref(storage, `Trainers/${coachDetails.id}/${item.name}`);
        const uploadTask = uploadBytesResumable(storageRef, item);

        uploadTask.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        }, (error) => {
          console.error('Error uploading document:', error);
 
        }, async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('File available at', downloadURL);


            // Update user document in Firestore with the download URL
            const userRef = doc(db, 'Trainers',coachDetails.id);
            updateDoc(userRef, { Documents: arrayUnion({ name: item.name, pdf: downloadURL }) });
          } catch (error) {
            console.error('Error getting download URL:', error);
          }
        });
    }
  }
    } catch (error) {
      console.error('Error selecting documents:', error);
    
    }
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (previous !== coachDetails) {
      try {
        // Update the document in Firebase with classDetails
        await updateDoc(doc(db, 'Trainers', coachDetails.id), coachDetails);
        // If the update is successful, setIsSubmitting(false);
        alert('Changes Submitted.');
        setIsSubmitting(false);
        setI(!i)
        toggleDetailsedit()
      } catch (error) {
        console.error('Error updating document:', error);
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
      alert('No changes to submit.');
    }
  };
  return (
    <div className={`flex bg-white p-1 mb-1 rounded-lg items-center border-b border-gray-400 mr-5 ml-5`}>
      <div className="w-1/4 pr-4">
        <img src={coach.image} alt={coach.id} className="w-12 h-12 rounded-full" />
      </div>
      <div className="w-3/4">{coach.nameandsurname}</div>

      <div className="w-3/4">{coach.contact}</div>
      <div className="w-1/4 pr-4 font-semibold">
        {/* <div className={`rounded px-1 py-1 ${getStatusColorClass(coach.status)} flex justify-center items-center`} style={{ whiteSpace: 'nowrap' }}>
          {getStatusText(coach.status)}
        </div> */}
      </div>
      <div className="w-80"></div>
      <div className="w-20"></div>
      <div className="w-2/5">{coach.phoneNumber}</div>
      <button className="mr-20" onClick={toggleDetailsedit}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>





{showDetailsedit && (
<div className="fixed inset-0 flex bg-gray-600 bg-opacity-50 justify-end items-center h-full overflow-auto" style={{ height: 'calc(100% )' }}>
<button onClick={toggleDetailsedit} className="absolute top-0 right-0 m-3 text-gray-500 hover:text-gray-700 focus:outline-none">
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
</button>


<div className="w-3/6 h-full bg-white border rounded-t flex flex-col justify-start items-start">
<div className='flex'>
 
 <h2 className="text-xl font-bold ml-4 mt-4 mb-6">Coach Details</h2>
 <div className='ml-72'/>
 <div className="mt-4" >
   <strong className='ml-2 mt-4 mb-6'>Coach ID</strong> 
   <input className="rounded-lg ml-5" type="text" readOnly value={coachDetails.id} />
 </div>
 </div>
<div className='flex ml-4 mt-4 mb-6'/>
<div className="flex flex-col justify-start items-start w-full">
  <div className="flex justify-center space-x-4 w-full"> 
<button
  className={`px-4 py-2 text-xl font-bold ${
    activeTab === 'details'
      ? 'border-b-2 border-blue-500 text-blue-500'
      : 'border-b border-transparent hover:border-blue-500 hover:text-blue-500'
  }`}
  onClick={() => setActiveTab('details')}
>
  Details
</button>
<button
  className={`px-4 py-2 text-xl font-bold ${
    activeTab === 'Performance'
      ? 'border-b-2 border-blue-500 text-blue-500'
      : 'border-b border-transparent hover:border-blue-500 hover:text-blue-500'
  }`}
  onClick={() => setActiveTab('Performance')}
>
 Performance
</button>

<button
  className={`px-4 py-2 text-xl font-bold ${
    activeTab === 'Chat'
      ? 'border-b-2 border-blue-500 text-blue-500'
      : 'border-b border-transparent hover:border-blue-500 hover:text-blue-500'
  }`}
  onClick={() => setActiveTab('Chat')}
>
  Chat
</button>
</div>

</div>

          {activeTab === 'details' && ( 
          <div className="bg-white w-full mt-10">
              <h1 className="text-lg font-bold ml-4 mb-2">Coach Details</h1>

              <div className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8" style={{ width: 'calc(100% - 24px)' }}>

<div className="ml-4 grid grid-cols-3 gap-4">
              <div className="">
                <strong className="block mb-1">Name:</strong>
                <input
          className="rounded-lg"
          type="text"
          name="nameandsurname"
          value={coachDetails.nameandsurname}
          onChange={handleInputChange}
        />
              </div>
      
              <div className="">
                <strong className="block mb-1">Position:</strong>
                <input type="text" name="position"  value={coachDetails.position} onChange={handleInputChange}  className="rounded-lg" />
              </div>
              <div className="">
                <strong className="">Email:</strong>
                <input type="email" name="contact" value={coachDetails.contact} onChange={handleInputChange}  className="rounded-lg" />
              </div>
              
              <div className="">
                <strong className="block mb-1">Blood Type:</strong>
                <input type="text"  name="BloodType" value={coachDetails.BloodType} onChange={handleInputChange}  className="rounded-lg" />
              </div>
              <div className="">
          <strong>Date of Birth</strong> 
          <input
          className="rounded-lg"
          type="text"
          name="birthDay"
          value={coachDetails.birthDay?.nanoseconds?formatTimestampToDate(coachDetails.birthDay):coachDetails?.birthDay}
         onClick={handleTextClick} // Convert string back to array on change
        />
   
      {showCalendar && (
        <DateTimePicker
          value={coachDetails.birthDay?.nanoseconds?coachDetails?.birthDay.toDate():coachDetails?.birthDay}
          onChange={(date) => {
            setCoachDetails({ ...coachDetails, birthDay: date })
            handleCalendarClose(); // Close calendar after date selection
          }}
          calendarIcon={null} // Remove default calendar icon
     
        />
      )}
        </div>
              <div className="">
                <strong className="">Experience:</strong>
                <input type="text" value={coachDetails.experience} onChange={handleInputChange} name='experience'  className="rounded-lg" />
              </div>
              <div className="">
                <strong className="block mb-1">Phone Number:</strong>
                <input type="tel" value={coachDetails.phoneNumber} onChange={handleInputChange} name='phoneNumber'  className="rounded-lg" />
              </div>
            </div>


    
            <div className="flex flex-wrap mb-6">
              </div>
         
            </div>
            <h3 className="text-lg font-bold ml-4 mb-2">Bio</h3>
    <div className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8 w-full"style={{ width: 'calc(100% - 24px)' }}>
          
          <input
          className="rounded-lg w-full"
          type="text"
          name="description"
          multiple
          value={coachDetails.description}
          onChange={handleInputChange} // Convert string back to array on change
        />
          
          
        </div>
            <div className="bg-white w-full">
              <h1 className="text-lg font-bold ml-4 mb-2">Classes:</h1>

              <div className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8" style={{ width: 'calc(100% - 24px)' }}>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {coachDetails.classes.map((cls) => (
        <div key={cls.id} className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
          <div className="h-44">
            <img src={cls.image} alt={cls.className} className="w-full h-full object-cover" />
          </div>
          <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">{cls.className}</h3>
              <p className="text-gray-600 mb-2">Participants: {cls.participants.length}</p>
            </div>
            <button
          onClick={()=>router.push("classes")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 self-end"
            >
              View Class
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
  </div>
  <h3 className="text-lg font-bold ml-4 mb-2">Documents</h3>
    <div className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8 w-full"style={{ width: 'calc(100% - 24px)' }}>
          
    {coachDetails.Documents.length === 0 ? (
    
          <div className="flex items-center justify-center bg-gray-200 rounded-full h-48 opacity-50">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className='items-center justify-center flex'>
              <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 15L12 2M12 2L15 5.5M12 2L9 5.5" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 22.0002H16C18.8284 22.0002 20.2426 22.0002 21.1213 21.1215C22 20.2429 22 18.8286 22 16.0002V15.0002C22 12.1718 22 10.7576 21.1213 9.8789C20.3529 9.11051 19.175 9.01406 17 9.00195M7 9.00195C4.82497 9.01406 3.64706 9.11051 2.87868 9.87889C2 10.7576 2 12.1718 2 15.0002L2 16.0002C2 18.8286 2 20.2429 2.87868 21.1215C3.17848 21.4213 3.54062 21.6188 4 21.749" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
</svg>
              </div>

              <p className="text-lg text-gray-500 mt-4">Upload {coachDetails.nameandsurname}'s documents</p>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
     
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coachDetails.Documents.map((cls) => (
          <div key={cls.id} className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
           <div className='items-center justify-center flex'>
            <svg width="100px" height="100px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.5" d="M3 10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157C21 4.34315 21 6.22876 21 10V14C21 17.7712 21 19.6569 19.8284 20.8284C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8284C3 19.6569 3 17.7712 3 14V10Z" stroke="#1C274C" stroke-width="1.5"/>
<path d="M8 10H16" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
<path d="M8 14H13" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
</svg>
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{cls.name}</h3>
                
              </div>
              <button
            onClick={()=>  window.open(cls.pdf, '_blank')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 self-end"
              >
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

          
        </div>
        <button
      className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-10"
      onClick={handleSubmit}
      disabled={isSubmitting}
    >
      Submit Changes
    </button>
          </div>)}
          {activeTab === 'Performance' && ( 
              <div className="bg-white w-full flex flex-col">
                  {coachDetails ? (
        <div>
          

          <AttendanceRateChart coachDetails={coachDetails} />
        </div>
      ) : (
        <p>Loading coach details...</p>
      )}
                </div>
          )}
           {activeTab==='Chat'&&(
<ChatScreen coachDetails={coachDetails} />
  )}
        </div>
  </div>

)}





    </div>
  );
}

const IndexPage = () => {
  const [coaches, setCoaches] = useState([]);
  const [filteredSport, setFilteredSport] = useState(null);
  const [totalClasses,setTotalClasses]=useState(0)
  const [i,setI]=useState(false)
  // State to hold new coach data
 

  useEffect(() => {
    const fetchCoaches = async () => {
      const coachesCollectionRef = collection(db, 'Trainers');
      try {
        const querySnapshot = await getDocs(coachesCollectionRef);
        const coachesData = querySnapshot.docs.map(doc => {return{...doc.data(),id:doc.id,Ref:doc.ref}});
        setCoaches(coachesData);
      } catch (error) {
        console.error('Error fetching coaches:', error);
      }
    };

    fetchCoaches();
  }, [i]);

  
  useEffect(() => {
    const fetchClasses = async () => {
      const coachesCollectionRef = collection(db, 'Classes');
      
      try {
        const querySnapshot = await getDocs(coachesCollectionRef);
        setTotalClasses(querySnapshot.size);
   
      } catch (error) {
        console.error('Error fetching coaches:', error);
      }
    };

    fetchClasses();
  }, []);
  
;
  
  function getStatusColorClass(status) {
    switch (status) {
      case "present":
        return "bg-green-200 text-green-800";
      case "absent":
        return "bg-red-200 text-red-800";
      case "on vacation":
        return "bg-gray-200 text-gray-800";
      default:
        return "";
    }
  }
  

  function getStatusText(status) {
    switch (status) {
      case "present":
        return <span style={{ color: 'green' }}>Present</span>;
      case "absent":
        return <span style={{ color: 'red' }}>Absent</span>;
      case "on vacation":
        return <span style={{ color: 'gray', }}>On Vacation</span>;
      default:
        return "";
    }
  }
  const sports = [
    "Football",
    "Basketball",
    "Tennis",
    "Baseball",
    "Volleyball",
    "Golf",
    "Rugby",
    "Cricket",
    "Hockey",
    "Table Tennis"
    // Add more sports as needed
  ];

  function getStatusText(status) {
    switch (status) {
      case "present":
        return "Present";
      case "absent":
        return "Absent";
      case "on vacation":
        return "On Vacation";
      default:
        return "";
    }
  }


const handleAddCoach = async () => {
  // Construct the new coach object with input data
  try {
    if (profilePicture) {
      // Upload profile picture to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `profilePictures/${profilePicture.name}`);
      await uploadBytes(storageRef, profilePicture);
      console.log("Profile picture uploaded successfully.");
      const downloadURL = await getDownloadURL(storageRef);

    }
    // Construct the new coach object with input data
    const newCoach = {
      
      nameandsurname: coachName,
      sport: coachSport,
      contact: coachEmail,
      phoneNumber: coachPhoneNumber,
      BloodType: coachBloodType,
      birthDaytest: coachDateOfBirth,
      salary: coachSalary,
      startDatetest: coachJoiningDate,
      description: coachDescription,
      image: profilePicture ? profilePicture.name : '',
      coachJoiningDatetest:coachJoiningDate,
      status: 'present',
      experience: CoachExperience+' Years'
      
      // Add other attributes as needed
    };

    // Add new coach data to Firestore
    const docRef = await addDoc(collection(db, 'Trainers'), newCoach)
    const uid = docRef.id;

    // Update the new coach object with the Firestore-generated UID
    await updateDoc(doc(db, 'Trainers', docRef.id), { uid: docRef.id });
    
    
    console.log('Coach added with auto-generated UID: ', uid);
    console.log('New coach data:', updatedCoach);
    console.log('Coach added with ID: ', docRef.id);
    
  }
  catch (error) {
      console.error('Error adding coach: ', error);
    }
};



  

  const [searchTerm, setSearchTerm] = useState("");


// Filtering the coaches based on the search term
const filteredCoaches2 = coaches.filter(coach =>
  coach.nameandsurname.toLowerCase().includes(searchTerm.toLowerCase())
);

const [makeCoash, setmakeCoash] = useState(false);
    const toggleDetailsmake = () => {
      setmakeCoash(!makeCoash);
    };

const [selectedSport, setSelectedSport] = useState("");




const [profilePicture, setProfilePicture] = useState(null);

  return (
    <div className="container mx-auto  h-full mt-10 ">
           <h2 className="text-3xl font-bold mb-10 ml-2">Coaches</h2>

           <div className="flex p-3 bg-white   mt-5 shadow-3xl items-center flex-col  shadow-3xl">
  <h2 className="text-xl font-semibold ">Status</h2>
  
  <div className="flex w-full items-center justify-between mt-10 rounded-lg p-3 ">
  {/* Medium-sized divs */}
  <div className="flex flex-col items-center mr-4 w-full h-full border text-xs font-medium text-gray-500 uppercase tracking-wider rounded-lg p-2">
    <Users2/> 
    <div className="font-semibold">Total Coaches</div>
    <div>{coaches.length}</div>
  </div>
  <div className="flex flex-col items-center mr-4 w-full h-full border text-xs font-medium text-gray-500 uppercase tracking-wider rounded-lg p-2">
    <School className="justify-start"/> 
    <div className="font-semibold justify-start">total Classes</div>
    <div>{totalClasses}</div> {/* Assuming revenue is defined somewhere */}
  </div>
  <div className="flex flex-col items-center mr-4 w-full h-full border text-xs font-medium text-gray-500 uppercase tracking-wider rounded-lg p-2">
    <UserCheck2/> 
    <div className="font-semibold">Active coaches</div>
    <div>{coaches.filter(coach => coach.status === 'active').length}</div> {/* Assuming attendance is defined somewhere */}
  </div>
  <div className="flex flex-col items-center mr-4 w-full h-full border text-xs font-medium text-gray-500 uppercase tracking-wider rounded-lg p-2">
  <Star /> 
    <div className="font-semibold ">Average Satisfaction rate</div>
    <div>{5/5}</div> {/* Assuming expense is defined somewhere */}
  </div>
</div>

</div>




      {/* Filtering section */}
      <div className="p-3 bg-white  border-opacity-50 shadow-3xl" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>

      <div className="flex items-center justify-between mb-4 bg-white rounded-lg mt-5 mr-5 ml-5">

        <div className="flex w-2/4 items-center mb-4 bg-white rounded-lg">

          <input
            type="text"
            placeholder="Type Coach Name"
            className="border border-gray-300 rounded-l p-2 h-8"
            onChange={e => setSearchTerm(e.target.value)}
            style={{ fontSize: "0.8rem" }} // Adjust font size if needed
         />
        </div>
        <button
          className="flex items-center bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600"
          onClick={toggleDetailsmake}
        >
          <span className="mr-2">+</span>
          <span>Add New</span>
        </button>
      </div>



 {makeCoash &&(<NewCoach toggleDetailsmake={toggleDetailsmake} setI={setI} i={i}/>)}

 
      {/* Coach list */}
      <div className="flex mb-2 bg-gray-100 h-10 items-center rounded-lg mr-5 ml-5">
        <div className="w-1/4 pr-4 font-semibold"></div>
        <div className="w-3/4 text-xs font-medium text-gray-500 uppercase tracking-wider">Coach Name</div>

        <div className="w-3/4 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</div>
        <div className="w-2/4 pr-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</div>
        <div className="w-2/5 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</div>
        <div className="w-1/5 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</div>
      </div>
       {/* Coach list */}
       {/* Iterate over coaches and render each */}
       {filteredCoaches2.map(coach => (
  <CoachItem key={coach.uid} coach={coach} setI={setI} i={i}/> // Pass coach data to CoachItem
))}
      
      
    </div>
    </div>
  );
};

export default IndexPage;
