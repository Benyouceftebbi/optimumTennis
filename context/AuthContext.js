"use client"
import React, { createContext, useState,useContext,useEffect} from 'react';
import { db } from '@/app/firebase';
import { getDocs,collection,query,where,orderBy,getDoc} from 'firebase/firestore';
// Create the context
export const AppContext = createContext();
export const fetchCourtsAndReservations = async () => {
  try {
    const courtsQuerySnapshot = await getDocs(collection(db, 'Courts'));
    const matches = [];

    const courtsData = await Promise.all(
      courtsQuerySnapshot.docs.map(async (courtDoc) => {
        const courtData = courtDoc.data();
        const reservationsQuerySnapshot = await getDocs(collection(courtDoc.ref, 'Reservations'));

        const reservationsData = reservationsQuerySnapshot.docs.map((resDoc) => ({
          id: resDoc.id,
          ...resDoc.data()
        }));

        matches.push(reservationsData);
        return {
          id:courtDoc.id,
          name: courtData.name,
          reservations: reservationsData,
        };
      })
    );

    return { courtsData, matches };
  } catch (error) {
    console.error('Error fetching courts and reservations:', error);
  }
};
// Create the provider component
export const  AppProvider = ({ children }) => {
  // State or any other logic you want to manage with context
  const [exampleState, setExampleState] = useState('loool');
  const classesCollection = collection(db, "Classes");
    const [classes,setClasses]=useState([])
    const [tournaments,setTournaments]=useState([])
    const [courts,setCourts]=useState([])
    const [memberships,setMemberships]=useState([])
    const [discounts,setDiscounts]=useState([])
    const [trainers,setTrainers]=useState([])
    const [trainees,setTrainees]=useState([])
    useEffect(() => {
      const getClasses = async () => {
        try {
  
          const querySnapshot = await getDocs(classesCollection);
      
          const promises = querySnapshot.docs.map(async (doc) => {
            const classData = doc.data();
            const trainerDoc = await getDoc(classData.TrainerRef);
            const attendanceSnapshot = await getDocs(query(collection(db, `Classes/${doc.id}/attendance`),where('date','>=',(new Date()))));
            const CanceledSnapshot = (await getDocs(collection(db, `Classes/${doc.id}/CanceledClasses`)));
            const canceledClasses = CanceledSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            
            const HistorySnapshot = await getDocs(query(collection(db, `Classes/${doc.id}/attendance`),where('date','<',(new Date()))));
            const HistoryPromises = HistorySnapshot.docs.map(async (HistoryDoc) => {
              const HistoryData = HistoryDoc.data();
              const participants = HistoryData.Participants;
    
              // Merging participant details
              const mergedParticipants = participants.map((participant) => {
                if (Array.isArray(classData.participants)) {
                  const additionalDetail = classData.participants.find((detail) => detail.uid === participant.uid);
                  return { ...participant, ...additionalDetail };
                } else {
                  console.error('classData.participants is not an array.');
                  return participant; // Return the participant without additional details
                }
              });
         
              return { ...HistoryData, Participants: mergedParticipants, id: HistoryDoc.id };
            });
     
            const attendancePromises = attendanceSnapshot.docs.map(async (attendanceDoc) => {
              const attendanceData = attendanceDoc.data();
              const participants = attendanceData.Participants;
              console.log("eqweqlolol");
              // Merging participant details
              const mergedParticipants = participants.map((participant) => {
                if (Array.isArray(classData.participants)) {
                  const additionalDetail = classData.participants.find((detail) => detail.uid === participant.uid);
                  console.log("mammaia");
                  return { ...participant, ...additionalDetail };
                } else {
                  console.error('classData.participants is not an array.');
                  return participant; // Return the participant without additional details
                }
              });
         
              return { ...attendanceData, Participants: mergedParticipants, id: attendanceDoc.id };
            });
    
            const resolvedAttendance = await Promise.all(attendancePromises);
            const resolvedHistory = await Promise.all(HistoryPromises);
            return { ...classData, id: doc.id, trainer: trainerDoc.data(), attendance: resolvedAttendance,history:resolvedHistory,canceled:canceledClasses };
          });
      
          const resolvedClasses = await Promise.all(promises);
          setClasses(resolvedClasses);
        } catch (error) {
          console.error('Error fetching classes:', error);
        }
      };
      getClasses()
  
    }, []);
  useEffect(() => {

    const getTournaments= async () => {
      const querySnapshot = await getDocs(collection(db, "Competitions"));
      const data= querySnapshot.docs.map((doc)=>({id:doc.id,...doc.data()}))
      setTournaments(data)
  }



    getTournaments()
    },[])

    useEffect(()=>{
      const getMemberships=async()=>{
          const ref=await getDocs(collection(db,'Memberships'))
          const data=ref.docs.map((doc)=>({id:doc.id,...doc.data()}))
          setMemberships(data)
      }
      getMemberships()
    },[])

    useEffect(()=>{
      const getMemberships=async()=>{
          const ref=await getDocs(collection(db,'Discounts'))
          const data=ref.docs.map((doc)=>({id:doc.id,...doc.data()}))
          setDiscounts(data)
      }
      getMemberships()
    },[])

useEffect(()=>{
  const geetTrainers=async ()=>{
    const trainersRef= await getDocs(collection(db,'Trainees'))
    const trainersData= trainersRef.docs.map((doc)=>({id:doc.id,...doc.data()}))
    setTrainees(trainersData)
  }
  geetTrainers()
  },[])
  useEffect(()=>{
    const geetTrainers=async ()=>{
      const trainersRef= await getDocs(collection(db,'Trainers'))
      const trainersData= trainersRef.docs.map((doc)=>({Ref: doc.ref,id:doc.id,...doc.data()}))
      setTrainers(trainersData)
    }
    geetTrainers()
    },[])


useEffect(() => {
 
  const fetchData = async () => {
    try {
      const { courtsData} = await fetchCourtsAndReservations();
      setCourts(courtsData);

    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error or show user notification
    }
  };

  fetchData();
}, []);
  return (
    <AppContext.Provider value={{ exampleState, setExampleState,classes,setClasses,tournaments,setTournaments,courts,setCourts,discounts,setDiscounts,memberships,setMemberships,trainers,trainees,setTrainees}}>
      {children}
    </AppContext.Provider>
  );
};
export const  useAuth =()=>{


 
    const value=useContext(AppContext)
    try{
    if(!value){
        throw new Error("Error not wrapped inside layout  ",)
    }   }catch(e){
        console.log(e);
    }
    return value
}
