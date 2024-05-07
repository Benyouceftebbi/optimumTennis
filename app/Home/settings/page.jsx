"use client"
import { db } from "@/app/firebase"
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore"
import { Check } from "lucide-react";
import { useEffect, useState } from "react"
import Switch from "react-switch";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MultiSelect } from "react-multi-select-component";
import { useAuth} from '@/context/AuthContext';
const TennisAmenitiesList = ({amenities,setAmenities}) => {
    
      const handleToggleAmenity = (amenity) => {

        setAmenities((prevClubInformation) => ({
          ...prevClubInformation,
          amenities: {
            ...prevClubInformation.amenities,
            [amenity]: { ...prevClubInformation.amenities[amenity], selected: !prevClubInformation.amenities[amenity]?.selected },
          },
        }));
      };
    return (
      <div className="flex flex-col space-y-2">
      {Object.keys(amenities).map((amenity, index) => (
          <div key={index} className="flex items-center flex-row  justify-between" style={{width:"350px"}}>
                     <span>{amenity}</span>
   
                     <div key={index} onClick={() => handleToggleAmenity(amenity)} className="border rounded-lg border-black-500 bg-white p-2 items-center justify-center align-center flex-col">
          { <Check color={amenities[amenity].selected ?"black" :'white' } />}
             </div>
   
          </div>
        ))}
      </div>
    );
  };
const LaneSchedule = ({schedule,setSchedule}) => {

    const handleToggleDay = (day) => {
        setSchedule((prevClubInformation) => ({
          ...prevClubInformation,
          schedule: {
            ...prevClubInformation.schedule,
            [day]: { ...prevClubInformation.schedule[day], open: !prevClubInformation.schedule[day]?.open },
          },
        }));
      };
    
      const handleTimeChange = (day, field, time) => {
        setSchedule((prevClubInformation) => ({
          ...prevClubInformation,
          schedule: {
            ...prevClubInformation.schedule,
            [day]: { ...prevClubInformation.schedule[day], [field]: time },
          },
        }));
      };
      const generateTimeOptions = () => {
        const options = [];
        for (let hour = 9; hour <= 21; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            options.push(<option key={time} value={time}>{time}</option>);
          }
        }
        return options;
      };    
  
    return (
      <div>
 
 {Object.keys(schedule).map((day) => (
           <div key={day} className="flex flex-row  align-center">
                       <div key={day} className="flex flex-col mr-5">
            <span className="font-medium text-gray-500 uppercase">{day}</span>
            <div className="my-3">

            <Switch onChange={()=>handleToggleDay(day)} checked={schedule[day].open} />
            </div>
            </div>
            <div className="flex flex-col align-starts mr-10" style={{width:'200px'}}>
            <span className="font-medium text-gray-500 uppercase">from</span>
           
                      
            <select
              value={schedule[day].from}
              onChange={(e) => handleTimeChange(day,"from", e.target.value)}
              className="rounded-lg  px-3 py-2 border focus:outline-none  "
              disabled={!schedule[day].open}
            >
              {generateTimeOptions()}
            </select>
 
          </div>
          <div className="flex flex-col align-starts" style={{width:'200px'}}>
            <span className="font-medium text-gray-500 uppercase">to</span>
           
                      
            <select
              value={schedule[day].to}
              onChange={(e) => handleTimeChange(day,"to", e.target.value)}
              className="rounded-lg  px-3 py-2 border focus:outline-none  "
              disabled={!schedule[day].open}
            >
              {generateTimeOptions()}
            </select>
 
          </div>
          </div>
        ))}
      </div>
    );
  };
  const MatchDetailsDiscount=({setShowModal,membership,setMemberships,classes,tournaments,courts})=>{
   
    const [discountType, setDiscountType] = useState('classes');
    const [selectedEntities, setSelectedEntities] = useState([]);
    
    const [options, setOptions] = useState([]);
    const [reservation,setReservation]=useState(membership?membership: {price:0, name:'',description:'',type:'discount',status:'enabled',consumers:0,startDate:new Date(),endDate:new Date(),})

    const getOptions = () => {
        switch (discountType) {
          case 'classes':

            // Map through the classes array to create options array
            return classes.map((classItem) => ({
              label: `${classItem.className}`,
              value: typeof classItem === 'object' ? classItem : classItem.id,
            }));
          case 'tournaments':
            return tournaments.map((classItem) => ({
              label: `${classItem.name}`,
              value: typeof classItem === 'object' ? classItem : classItem.id,
            }));
          case 'courts':
            return courts.map((classItem) => ({
              label: `${classItem.name}`,
              value: typeof classItem === 'object' ? classItem : classItem.id,
            }));
          default:
            return [];
        }
      };
    
      // Update options when discountType changes
      useEffect(() => {
        setOptions(getOptions());
        setSelectedEntities([]); // Reset selected entities when type changes
      }, [discountType]);
    
    const handleInputChange = (e) => {
      setReservation(prevReservation => ({
        ...prevReservation,
        [e.target.name]: e.target.value,
      }));
    };
    

    const handleSubmit = async () => {
      try {
       const discountData={
        ...reservation,
        discountType: discountType,
        uid: selectedEntities.map((doc) => doc.value.id),
        rate:parseInt(reservation.rate,10) // Extract only the 'id' values
      }
        await addDoc(collection(db, 'Discounts'),discountData);
        setMemberships((prev)=>[...prev,discountData])
      
  

   
    
      } catch (error) {
        console.log(error);
        console.error('Error submitting reservation:', error);
      
      }
    };
    const handleClose = () => {
     
      setShowModal(false);
    
    };
  
  
  
  
      return    (
        <div className="fixed inset-0 h-full flex bg-gray-600 bg-opacity-50 justify-end items-center overflow-scroll mb-10" style={{ height: '100%' }}>
          <button onClick={handleClose} className="absolute top-0 right-0 m-3 text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
    
          <div className="w-5/12 h-full bg-white border rounded-lg flex flex-col justify-start items-start">
            <div className='flex'>
              <h2 className="text-xl font-bold ml-4 mt-4 mb-6">New Discount</h2>
              
              <div className='ml-72'/>
              <div className="mt-4">
            
              </div>
            </div>
            {/* Form inputs */}
            <form onSubmit={handleSubmit} className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8 overflow-y-auto" style={{ width: 'calc(100% - 24px)' }}>
            <h2 className="text-xl font-bold ml-4 mt-4 mb-2">General Information</h2>
              <p class="font ml-4 text-slate-600 mb-6">Configure How Discount will be shown to your players</p> 
              <div className="ml-4 grid grid-cols-1 gap-4">
              <div className="flex flex-col">
                <strong>Name</strong>
                <input
            className="rounded-lg"
            type="text"
            name="name"
            value={reservation.name}
            onChange={handleInputChange}
          />
    
      </div>
      <div className="flex flex-col">
                <strong>Description</strong>
                <p class="font  text-slate-600 mb-2 mt-1">Club Discount Description</p> 

                <textarea  name='description'  onChange={handleInputChange} class="w-full rounded-md border py-2 px-2 bg-gray-50 outline-none ring-blue-600 focus:ring-1 bg-white" id="description" rows="4" value={reservation.description}></textarea>

    
      </div>
      </div>
      <h2 className="text-xl font-bold ml-4 mt-8 mb-2">Discount Privileges</h2>
              <p class="font ml-4 text-slate-600 mb-6">Configure Discount benefits</p> 
              <div className="flex flex-col justify-center ">
              <div className="self-center ">
        <input
          type="radio"
          id="classes"
          name="discountType"
          value="classes"
          checked={discountType === 'classes'}
          onChange={() => setDiscountType('classes')}
          
        />
                <label htmlFor="tournaments">Classes</label>

        <input
          type="radio"
          id="tournaments"
          name="discountType"
          value="tournaments"
          checked={discountType === 'tournaments'}
          onChange={() => setDiscountType('tournaments')}
        />
        <label htmlFor="tournaments">Tournaments</label>

        <input
          type="radio"
          id="courts"
          name="discountType"
          value="courts"
          checked={discountType === 'courts'}
          onChange={() => setDiscountType('courts')}
        />
        <label htmlFor="courts">Courts</label>
      </div>

      <div>
        <MultiSelect
          className="rounded-lg"
          options={options}
          value={selectedEntities}
          onChange={setSelectedEntities}
          labelledBy="Select"
        />
      </div>
      <div className="flex flex-col">
                <strong>discount rate</strong>
                <input
className="rounded-lg"
type="number"
name="discount"
value={reservation.discount}
onChange={handleInputChange}
/>
      </div>
    </div>
<h2 className="text-xl font-bold ml-4 mt-8 mb-2">Club Discount price</h2>
              <p class="font ml-4 text-slate-600 mb-6">this is the price that will be charged to your club Memebers</p> 
      <div className="ml-4 grid grid-cols-2 gap-4 mt-6">

      <div className="flex flex-col">
              <label htmlFor="startDate" className="font-semibold">Start Date</label>
       
                  <DatePicker
        selected={reservation.startDate}
        onChange={(date)=>setReservation(prevReservation => ({
          ...prevReservation,
          startDate: date,
        }))}
        selectsStart
        startDate={reservation.startDate}
        endDate={reservation.endDate}
        maxDate={reservation.endDate}
        className="rounded-lg w-full" 
        dateFormat="dd/MM/yyyy"
        name="startDate"
      />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="endDate" className="font-semibold">End Date</label>
              <DatePicker
        selected={reservation.endDate}
        onChange={(date)=>setReservation(prevReservation => ({
          ...prevReservation,
          endDate: date,
        }))}
        selectsEnd
        startDate={reservation.startDate}
        endDate={reservation.endDate}
        minDate={reservation.startDate}
       
        className="rounded-lg w-full" 
        dateFormat="dd/MM/yyyy"
        name="endDate"
      />
            </div>
       
            <div className="flex flex-col">
                <strong>Price</strong>
                <input
className="rounded-lg"
type="number"
name="price"
value={reservation.price}
onChange={handleInputChange}
/>
      </div>
   
  <button type="submit"  className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4">
          Create discount
        </button>
              </div>
      
            </form>
  
          </div>
  
        </div>
      )
    }
  const MatchDetails=({setShowModal,membership,setMemberships})=>{

    const [reservation,setReservation]=useState(membership?membership: {price:0,frequency:'', name:'',description:'',firstTrainingDiscount:0,otherTrainingDiscount:0,courtBookingDiscount:0,tournamentDiscount:0,type:'membership',status:'enabled',consumers:0})
  
    
   
    
    const handleInputChange = (e) => {
      setReservation(prevReservation => ({
        ...prevReservation,
        [e.target.name]: e.target.value,
      }));
    };
    
    const handleSubmit = async () => {
      try {
       
     await addDoc(collection(db,'Memberships'),reservation)
        setMemberships((prev)=>[...prev,reservation])
      
  

       
   
    
      } catch (error) {
        console.log(error);
        console.error('Error submitting reservation:', error);
      
      }
    };
    const handleClose = () => {
     
      setShowModal(false);
    
    };
  


  
  
      return    (
        <div className="fixed inset-0 h-full flex bg-gray-600 bg-opacity-50 justify-end items-center overflow-scroll mb-10" style={{ height: '100%' }}>
          <button onClick={handleClose} className="absolute top-0 right-0 m-3 text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
    
          <div className="w-5/12 h-full bg-white border rounded-lg flex flex-col justify-start items-start">
            <div className='flex'>
              <h2 className="text-xl font-bold ml-4 mt-4 mb-6">New Membership</h2>
              
              <div className='ml-72'/>
              <div className="mt-4">
            
              </div>
            </div>
            {/* Form inputs */}
            <form onSubmit={handleSubmit} className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8 overflow-y-auto" style={{ width: 'calc(100% - 24px)' }}>
            <h2 className="text-xl font-bold ml-4 mt-4 mb-2">General Information</h2>
              <p class="font ml-4 text-slate-600 mb-6">Configure How mebership will be shown to your players</p> 
              <div className="ml-4 grid grid-cols-1 gap-4">
              <div className="flex flex-col">
                <strong>Name</strong>
                <input
            className="rounded-lg"
            type="text"
            name="name"
            value={reservation.name}
            onChange={handleInputChange}
          />
    
      </div>
      <div className="flex flex-col">
                <strong>Description</strong>
                <p class="font  text-slate-600 mb-2 mt-1">Club membership Description</p> 

                <textarea  name='description'  onChange={handleInputChange} class="w-full rounded-md border py-2 px-2 bg-gray-50 outline-none ring-blue-600 focus:ring-1 bg-white" id="description" rows="4" value={reservation.description}></textarea>

    
      </div>
      </div>
      <h2 className="text-xl font-bold ml-4 mt-8 mb-2">Membership Privileges</h2>
              <p class="font ml-4 text-slate-600 mb-6">Configure membership benefits</p> 
      <div className="ml-4 grid grid-cols-2 gap-4 mt-6">
    <div className="flex flex-col">

                <strong>Discount on first training (%)</strong>
                <input
            className="rounded-lg"
            type="number"
            name="firstTrainingDiscount"
            value={reservation.firstTrainingDiscount}
            onChange={handleInputChange}
          />
    
      </div>
      <div className="flex flex-col">

<strong>Discount on other training (%)</strong>
<input
className="rounded-lg"
type="number"
name="otherTrainingDiscount"
value={reservation.otherTrainingDiscount}
onChange={handleInputChange}
/>

</div>
<div className="flex flex-col">

<strong>Discount on court Booking (%)</strong>
<input
className="rounded-lg"
type="number"
name="courtBookingDiscount"
value={reservation.courtBookingDiscount}
onChange={handleInputChange}
/>

</div>
<div className="flex flex-col">

<strong>Discount on Tournament Booking (%)</strong>
<input
className="rounded-lg"
type="number"
name="tournamentDiscount"
value={reservation.tournamentDiscount}
onChange={handleInputChange}
/>

</div>
</div>
<h2 className="text-xl font-bold ml-4 mt-8 mb-2">Club membership price</h2>
              <p class="font ml-4 text-slate-600 mb-6">this is the price that will be charged to your club Memebers</p> 
      <div className="ml-4 grid grid-cols-2 gap-4 mt-6">
      <div className="flex flex-col">
                <strong>Price</strong>
                <input
className="rounded-lg"
type="number"
name="price"
value={reservation.price}
onChange={handleInputChange}
/>
      </div>
      <div className="flex flex-col">
      <strong>Payment frequency</strong>
      <select
        name="frequency"
        value={reservation.frequency}
        onChange={handleInputChange}
        className="rounded-lg"
      >
    
        <option value="monthly">
           Monthly
          </option>
          <option  value="yearly">
           Yearly
          </option>
      </select>
      </div>

  <button type="submit"  className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4">
          Create membership
        </button>
              </div>
      
            </form>
  
          </div>
  
        </div>
      )
    }
const Settings=()=>{
    const [clubInformation,setClubInformation]=useState({courts:[],schedule:{},amenities:{},prices:[]})
    const [clubInformationOriginal,setClubInformationOriginal]=useState({courts:[],schedule:{},amenities:{}})
    const {classes,tournaments,courts,discounts,memberships,setDiscounts,setMemberships } = useAuth();

    useEffect(()=>{
      console.log("afesfsdfsdfsdffsd");
        const getClubInfo=async()=>{
            const clubInfoRef=doc(db,'Club','GeneralInformation')
            const clubinfoData=await getDoc(clubInfoRef)
            const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

            // Assuming clubinfoData is the Firestore document containing the schedule data
            const scheduleData = clubinfoData.data().schedule;

// Custom sorting function based on the orderedDays array
const sortedSchedule = Object.fromEntries(
    Object.entries(scheduleData).sort((a, b) => orderedDays.indexOf(a[0]) - orderedDays.indexOf(b[0]))
  );
  
  // Update clubInformation with the sorted schedule and other data
  setClubInformation({ ...clubinfoData.data(), schedule: sortedSchedule, });
          setClubInformationOriginal({ ...clubinfoData.data(), schedule: sortedSchedule });
        }
getClubInfo()
    },[])
    
    const handleAddCourt = async () => {
        const newCourt = prompt('Enter the new court name:');
        if (newCourt) {
            setClubInformation((prev) => ({
                ...prev,
                courts: [...prev.courts, newCourt],
              }));
              setClubInformationOriginal((prev) => ({
                ...prev,
                courts: [...prev.courts, newCourt],
              }));
              await updateDoc(doc(db,'Club','GeneralInformation'),{
                courts:arrayUnion(newCourt)
              })
              await setDoc(collection(db,'Courts',newCourt),{
                name:newCourt
              })
              
        }
      };
    
      const handleRemoveCourt = async() => {
        const newCourt = prompt('Enter the court name:');
        const updatedCourts = clubInformation.courts.filter((court) => court !== newCourt);
        console.log(updatedCourts);
        setClubInformation((prev) => ({
            ...prev,
            courts:updatedCourts,
          }));
          setClubInformationOriginal((prev) => ({
            ...prev,
            courts:updatedCourts,
          }));
          await updateDoc(doc(db,'Club','GeneralInformation'),{
            courts:arrayRemove(newCourt)
          })
      };
      const handleInputChange = (e) => {
        console.log(e.target.name);
        setClubInformation(prevReservation => ({
          ...prevReservation,
          [e.target.name]: e.target.value,
        }));
      };
      const writeAmenitiesToFirestore = async (amenitiesList) => {
        try {
          const amenitiesRef = doc(db, 'Club','GeneralInformation');
      
          const schedule = {
            Mon: { open: true, from: "07:00", to: "20:00" },
            Tue: { open: true, from: "07:00", to: "20:00" },
            Wed: { open: true, from: "07:00", to: "20:00" },
            Thu: { open: true, from: "07:00", to: "20:00" },
            Fri: { open: true, from: "07:00", to: "20:00" },
            Sat: { open: true, from: "07:00", to: "20:00" },
            Sun: { open: true, from: "07:00", to: "20:00" },
          };
      
          // Write the amenities data to Firestore
          await updateDoc(amenitiesRef, {schedule:schedule});
      
          console.log('Amenities successfully written to Firestore!');
        } catch (error) {
          console.error('Error writing amenities to Firestore:', error);
        }
      };
      
      const amenities = {
        "Outdoor tennis courts": { selected: true },
        "Indoor tennis courts": { selected: false },
        "Professional tennis coaching": { selected: false },
        "Tennis equipment rental": { selected: true },
        "Tennis training programs": { selected: true },
        "Tennis tournaments": { selected: false },
        "Fitness center or gym": { selected: true },
        "Pro shop for tennis gear": { selected: false },
        "Tennis clinics or workshops": { selected: true },
        "Cafe or lounge area": { selected: false }
      };
      
      const submitChanges=async()=>{
        await updateDoc(doc(db,'Club','GeneralInformation'),clubInformation)
        setClubInformationOriginal(clubInformation)
        alert("Changes Commited!")
      }
      const [selectedScreen, setSelectedScreen] = useState('Settings');

      const handleScreenChange = (screen) => {
        setSelectedScreen(screen);
      };

      const [showModal,setShowModal]=useState(false)
      const [showModalDiscount,setShowModalDiscount]=useState(false)
      const handleAddPrice = () => {
        const newPrice = { id: clubInformation.prices.length + 1, value: 0 };
        setClubInformation(prevClubInfo => ({
          ...prevClubInfo,
          prices: [...prevClubInfo.prices, newPrice]
        }));
      };
    
      const handleChange = (id, value) => {
        const updatedPrices = clubInformation.prices.map(price =>
          price.id === id ? { ...price, value } : price
        );
        setClubInformation(prevClubInfo => ({
          ...prevClubInfo,
          prices: updatedPrices
        }));
      };
return(
    <>
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap" rel="stylesheet" />


<div class="mx-4 max-w-screen-xl sm:mx-8 xl:mx-auto">
  <h1 class="border-b py-6 text-4xl font-semibold">Settings</h1>
  <div class="grid grid-cols-8 pt-3 pb-10 sm:grid-cols-10">
    <div class="relative my-4 w-56 sm:hidden">
      <input class="peer hidden" type="checkbox" name="select-1" id="select-1" />
      <label for="select-1" class="flex w-full cursor-pointer select-none rounded-lg border p-2 px-3 text-sm text-gray-700 ring-blue-700 peer-checked:ring">Teams </label>
      <svg xmlns="http://www.w3.org/2000/svg" class="pointer-events-none absolute right-0 top-3 ml-auto mr-5 h-4 text-slate-700 transition peer-checked:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>

    </div>

    <div class="col-span-2 hidden sm:block">
    <ul>
        <li
          className={`mt-5 cursor-pointer border-l-2 ${selectedScreen === 'Settings' ? 'border-l-blue-700 text-blue-700' : 'border-transparent text-gray-700'} px-2 py-2 font-semibold transition hover:border-l-blue-700 hover:text-blue-700`}
          onClick={() => handleScreenChange('Settings')}
        >
          Settings
        </li>
        <li
          className={`mt-5 cursor-pointer border-l-2 ${selectedScreen === 'Memberships' ? 'border-l-blue-700 text-blue-700' : 'border-transparent text-gray-700'} px-2 py-2 font-semibold transition hover:border-l-blue-700 hover:text-blue-700`}
          onClick={() => handleScreenChange('Memberships')}
        >
          Memberships & Discounts
        </li>
      </ul>
    </div>

 {selectedScreen ==='Settings' && (  <div class="col-span-8 overflow-hidden rounded-xl sm:bg-gray-50 sm:px-8 sm:shadow">
      <div class="pt-4">
        <h1 class="py-2 text-2xl font-semibold">Settings</h1>
         <p class="font- text-slate-600">Court info,Description,Location,Images,Courts....</p> 
      </div>
      <hr class="mt-4 mb-8" />
      <p class="py-2 text-xl font-semibold">Court Info</p>

      <div class="grid grid-cols-3 gap-3 flex items-center">
          <label for="club-name">
            <span class="text-sm text-gray-500">Club Name</span>
            <div class="relative flex overflow-hidden rounded-md border-2 transition focus-within:border-blue-600">
              <input onChange={handleInputChange} type="text" name='name' id="club-name" class="w-full flex-shrink appearance-none border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none" value={clubInformation?.name} />
            </div>
          </label>
          <label for="club-website">
            <span class="text-sm text-gray-500">Website</span>
            <div class="relative flex overflow-hidden rounded-md border-2 transition focus-within:border-blue-600">
              <input  onChange={handleInputChange} name="website" type="website" id="club-website" class="w-full flex-shrink appearance-none border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none"  />
            </div>
          </label>
          <label for="club-phone">
            <span class="text-sm text-gray-500">Phone</span>
            <div class="relative flex overflow-hidden rounded-md border-2 transition focus-within:border-blue-600">
              <input type="number"  onChange={handleInputChange} name="phone" id="club-phone" class="w-full flex-shrink appearance-none border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none"  />
            </div>
          </label>

        </div>


      <hr class="mt-4 mb-8" />
      <p class="py-2 text-xl font-semibold">Location</p>
      <div class="space-y-1">
        <div class="rounded-md border ">
 
          <div class="flex flex-col space-y-3 px-4 py-6 sm:px-10">
            <label class="block" for="address">
              <p class="text-sm">Address</p>
              <input   onChange={handleInputChange} name='address' class="w-full rounded-md border py-2 px-2 bg-gray-50 outline-none ring-blue-600 focus:ring-1 bg-white" type="text" value={clubInformation?.address} />
            </label>
           
          </div>
        </div>
      </div>

      <hr class="mt-4 mb-8" />
      <p class="py-2 text-xl font-semibold">Description</p>
      <div class="space-y-1">
        <div class="rounded-md border ">
 
        <div class="flex flex-col space-y-3 px-4 py-6 sm:px-10">
  <label class="block" for="description">
    <p class="text-sm">Description</p>
    <textarea  name='description'  onChange={handleInputChange} class="w-full rounded-md border py-2 px-2 bg-gray-50 outline-none ring-blue-600 focus:ring-1 bg-white" id="description" rows="4" value={clubInformation?.description}></textarea>
  </label>
</div>
        </div>
      </div>
      
      <hr class="mt-4 mb-8" />
      <div >
      <p class="text-sm">Courts</p>
  <svg xmlns="http://www.w3.org/2000/svg" class="absolute top-0 right-0 m-5 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <div class="grid grid-cols-5 gap-3 flex items-center mt-3">
  {clubInformation?.courts?.map((court, index) => (
        <div
          key={index}
          className="flex h-12 w-16 cursor-pointer items-center justify-center rounded-md bg-sky-200 font-bold text-blue-900 hover:bg-blue-300"
        >
          {court}
        
        </div>
      ))}
  </div>
  <div class="mt-2 flex justify-between text-sm text-gray-400">
  <div
        className="flex h-12 w-16 cursor-pointer items-center justify-center rounded-md bg-red-200 font-bold text-red-900 hover:bg-red-300 align-center flex text-center"
        onClick={handleRemoveCourt}
      >
        remove court
      </div>
          <div
        className="flex h-12 w-16 cursor-pointer items-center justify-center rounded-md bg-sky-200 font-bold text-blue-900 hover:bg-blue-300 text-center"
onClick={handleAddCourt}
      >
        add court
      </div>
  </div>
  </div>
  <hr class="mt-4 mb-8" />
  <div>

  <label htmlFor="classPrice">Class Price:</label>

  
      {clubInformation.prices.slice(1).map(price => (
        <div key={price.id}>
          <label htmlFor={`classPrice${price.id}`}>Price:</label>
          <input
            type="number"
            id={`classPrice${price.id}`}
            value={price.value}
            onChange={e => handleChange(price.id, e.target.value)}
            className="border rounded-lg border-black-500 bg-white p-2 items-center justify-center align-center flex-col"
          />
        </div>
      ))}
          <button onClick={handleAddPrice} className="flex h-12 w-16 cursor-pointer items-center justify-center rounded-md bg-sky-200 font-bold text-blue-900 hover:bg-blue-300 text-center">Add Price</button>
    </div>
  <hr class="mt-4 mb-8" />
  <p class="py-2 text-xl font-semibold">Opening hours</p>
  <p class="py-2 text-xl font-semibold">weekdays</p>

{clubInformation.schedule &&(<LaneSchedule schedule={clubInformation.schedule} setSchedule={setClubInformation}/>)}

<hr class="mt-4 mb-8" />
  <p class="py-2 text-xl font-semibold">Amenities</p>


<TennisAmenitiesList amenities={clubInformation.amenities} setAmenities={setClubInformation}/>
<hr class="mt-4 mb-8" />
  {JSON.stringify(clubInformationOriginal) !=JSON.stringify(clubInformation) && (
                         <>
                    <button
                         
                     onClick={submitChanges}
                         className="button-blue  mt-5 mb-8"
                       >
                        submit Changes
                       </button>
                         <button
                           onClick={()=> setClubInformation(clubInformationOriginal)}
                     
                           className="button-red font-bold mt-5 ml-5 border rounded-lg px-5 py-2 mt-8"
                         >
                          Cancel Changes
                         </button>
                         </> )}  

    </div>)}
    {selectedScreen ==='Memberships' && (  <div class="col-span-8 overflow-hidden rounded-xl sm:bg-gray-50 sm:px-8 sm:shadow">
      <div class="pt-4">
        <h1 class="py-2 text-2xl font-semibold">Memberships & Discounts</h1>

         <p class="font- text-slate-600">Add, Edit, Remove Memberships and Discounts</p> 
  
      </div>
      <hr class="mt-4 mb-8" />
      <div className="flex flex-row justify-between">
        <p class="py-2 text-xl font-semibold">Memebership List</p>
    
         <button
                 type="button"
                className="mb-3 button-blue rounded-md mr-4 "
            
                onClick={()=>setShowModal(true)}

              >
                Add MemberShip
              </button>
              </div>


          <table className="w-full min-w-full divide-y divide-gray-200 mt-4">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider " style={{ width: '50%' }}>
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 Consumers
                </th>
             
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {memberships?.map(membership => (
            
                <tr key={membership.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{membership.name}</td>
               
                  <td className="px-6 py-4 whitespace-nowrap flex-row flex ">   <div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2 self-center"></div> {membership.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{membership.consumers}</td>
                </tr>
              ))}
            </tbody>
          </table>
          


      <hr class="mt-4 mb-8" />
      <div className="flex flex-row justify-between">
        <p class="py-2 text-xl font-semibold">Discounts List</p>
    
         <button
                 type="button"
                className="mb-3 button-blue rounded-md mr-4 "
            
                onClick={()=>setShowModalDiscount(true)}

              >
                Add Discounts
              </button>
              </div>


          <table className="w-full min-w-full divide-y divide-gray-200 mt-4">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider " style={{ width: '50%' }}>
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 Consumers
                </th>
             
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {discounts?.map(discount=> (
            
                <tr key={discount.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{discount.name}</td>
               
                  <td className="px-6 py-4 whitespace-nowrap flex-row flex ">   <div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2 self-center"></div> {discount.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{discount.consumers}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
      <hr class="mt-4 mb-8" />
    {showModal &&(<MatchDetails setShowModal={setShowModal} setMemberships={setMemberships}/>)}
    {showModalDiscount &&(<MatchDetailsDiscount setShowModal={setShowModalDiscount} setMemberships={setDiscounts} classes={classes} tournaments={tournaments} courts={courts}/>)}

    </div>)}

  </div>
</div>

    </>
  
)
}
export default Settings