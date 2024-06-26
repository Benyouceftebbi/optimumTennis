'use client'
import { Button, Eventcalendar, formatDate, Popup, setOptions, Toast,
  Draggable,Input, Select,Textarea,
  CalendarNav,
  CalendarPrev,
  CalendarToday,
  CalendarNext} from '@mobiscroll/react';
import { useCallback, useMemo, useRef, useState,useEffect } from 'react';
import '@mobiscroll/react/dist/css/mobiscroll.min.css'
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { collection, getDocs, query, where, getFirestore, Timestamp, updateDoc, doc, writeBatch, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { fetchFirestoreData } from './fetchData';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useAuth } from '@/context/AuthContext';
import { MatchDetails } from '../matches/page';
import { Item, NewItem } from '../classes/page';
import { NewItemTournament } from '../tournaments/page';
    // Function to calculate the difference in days based on the given day string
    const dayDiff = (day) => {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDay = daysOfWeek.indexOf(day);
      const today = new Date().getDay();
      return targetDay >= today ? targetDay - today : 7 - (today - targetDay);
  };

async function updateFirestoreEvent(updatedEvent,oldEvent) {
  // Assuming you have the Firestore document ID stored in the event's extended properties
  const event = updatedEvent.extendedProps;
  const eventType = updatedEvent.extendedProps.type;

  // Update Firestore document based on the event ID and updated event data
  switch (eventType) {
      case 'class':
          await updateClassEvent(event, updatedEvent,oldEvent);
          break;
      case 'tournament':
          await updateTournamentEvent(event,  updatedEvent,oldEvent);
          break;
      case 'match':
          await updateMatchEvent(event, updatedEvent,oldEvent);
          break;
      default:
          console.error('Unknown event type:', eventType);
          // Handle unknown event type error
          break;
  }
}

async function updateClassEvent(event, updatedEvent,oldEvent) {
  // Update Firestore document for court event
  await updateDoc(doc(db, 'Classes', event.classId,'attendance',event.attendanceId), {
      // Update Firestore fields based on the updatedEvent object properties
      date: Timestamp.fromDate(updatedEvent.start), // Update start time
      end: Timestamp.fromDate(updatedEvent.end),
    oldDate:Timestamp.fromDate(oldEvent.start),
    oldEnd:Timestamp.fromDate(oldEvent.end),
      updated:true // Update end time
      // Update other fields as needed for courts
  });
}

async function updateTournamentEvent(eventId, updatedEvent,oldEvent) {
  // Update Firestore document for tournament event
  await updateDoc(doc(db, 'Tournaments', eventId), {
      // Update Firestore fields based on the updatedEvent object properties
      date: Timestamp.fromDate(updatedEvent.start), // Update start time
      end: Timestamp.fromDate(updatedEvent.end),
    oldDate:Timestamp.fromDate(oldEvent.start),
    oldEnd:Timestamp.fromDate(oldEvent.end),
      updated:true // Update end time
  });
}

async function updateMatchEvent(event, updatedEvent,oldEvent) {

  await updateDoc(doc(db, 'Courts',event.courtName,'Reservations',event.matchid),{
      // Update Firestore fields based on the updatedEvent object properties
      date:Timestamp.fromDate(updatedEvent.start),
      startTime: Timestamp.fromDate(updatedEvent.start), // Update start time
      endTime: Timestamp.fromDate(updatedEvent.end),
      updated:true, 
      oldDate:Timestamp.fromDate(oldEvent.start),
      oldEnd:Timestamp.fromDate(oldEvent.end),
      oldStart:Timestamp.fromDate(oldEvent.start),

  });
}

const tasks = [
  {
    title: 'Private Class',
    color: '#7a5886',
    start: '08:00',
    end: '09:30',
    length: '1.5 h',
    type:'class'
  },
  {
    title: 'Group Class',
    color: '#50789d',
    start: '08:00',
    end: '09:30',
    length: '1.5 h',
    type:'class'
  },
  {
    title: '90 Minutes Court reservation',
    color: '#9da721',
    start: '08:00',
    end: '09:30',
    length: '1.5 h',
    type:'match'
  },
  {
    title: 'Tournament',
    color: '#cd6957',
    start: '08:00',
    end: '11:00',
    length: '3 h',
    type:'tournament'
  },

];

const myData = [
  { value: '1', text: 'Roly Chester' },
  { value: '2', text: 'Tucker Wayne' },
  { value: '3', text: 'Baker Brielle' },
  { value: '4', text: 'Jami Walter' },
  { value: '5', text: 'Patrick Toby' },
  { value: '6', text: 'Tranter Logan' },
  { value: '7', text: 'Payton Sinclair' },
];
function Task(props) {
  const [draggable, setDraggable] = useState();

  const setDragElm = useCallback((elm) => {
    setDraggable(elm);
  }, []);

  return (
    <div ref={setDragElm} style={{ background: props.data.color }} className="external-event-task">
      <div>{props.data.title}</div>
   
      <Draggable dragData={props.data} element={draggable} />
    </div>
  );
}
const DemoApp = () => {
  setOptions({
    theme: 'windows',
    themeVariant: 'light'
  });
  const [events, setEvents] = useState([]);
  const courtss = useMemo(
    () => [
    {
      id: 1,
      name: 'Court1',
      cssClass: 'md-col-tick-border',
    },
    {
      id: 2,
      name: 'Court2',
      cssClass: 'md-col-tick-border',
    },
    {
      id: 3,
      name: 'Court3',
      cssClass: 'md-col-tick-border',
    },
    {
      id: 4,
      name: 'Court4',
      cssClass: 'md-col-tick-border',
    },
    {
      id: 5,
      name: 'Court5',
      cssClass: 'md-col-tick-border',
    },
    {
      id: 6,
      name: 'Court6',
      cssClass: 'md-col-tick-border',
    },
    {
      id: 7,
      name: 'Court7',
      cssClass: 'md-col-tick-border',
    },
    {
      id: 8,
      name: 'Court8',
      cssClass: 'md-col-tick-border',
    },
    {
      id: 9,
      name: 'Court9',
      cssClass: 'md-col-tick-border',
    },
    {
      id: 10,
      name: 'Court10',
      cssClass: 'md-col-tick-border',
    },
    {
      id: 11,
      name: 'Court11',
      cssClass: 'md-col-tick-border',
    },
    {
      id: 12,
      name: 'Court12',
      cssClass: 'md-col-tick-border',
    },

  ],
  [],
  );
  const {courts,trainers,trainees,setClasses,classes,tournaments}=useAuth() 
  const [availableEvents,setAvailableEvents]=useState(trainers)
  const prevClassesRef = useRef([]);
  useEffect(() => {
    const fetchData = async (classes, courts, tournaments, trainers,trainees) => {
      try {
        if (prevClassesRef.current.length==0) {
          const all = await fetchFirestoreData(classes, courts, tournaments, trainers,trainees);
          setEvents(all.allEvents);
          prevClassesRef.current = all.classes;
        }
      } catch (error) {
        console.error('Error fetching Firestore data:', error);
      }
    };
 
        fetchData(classes,courts,tournaments,trainers,trainees);
      
    
  }, [courts,classes,tournaments]);

  const [render,setRender]=useState(false)

const [reservation,setReservation]=useState({players:[],reaccurance:0,date:new Date(),courtName:'',duration:60,startTime:"07:00",duration:60,payment:'cash',team1:[],team2:[],name:'',description:'',coachname:'',reaccuring:false})

const [modalIsOpen, setModalIsOpen] = useState(false);
const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editModalType,setEditModalType] = useState(null);
  const [anchor, setAnchor] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);

  const [closeOnOverlay, setCloseOnOverlay] = useState(false);
  const [info, setInfo] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState();
  const [location, setLocation] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonType, setButtonType] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [isToastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState();
  const [tournament,setTournament]=useState()
  const [tempEvent,setTempEvent]=useState()
const[cls,setClass]=useState({
  classTime: [{ day: "Monday", startTime: "13:00", endTime: "14:00" }],
  participants: [],
  participantsuid: [],
});
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [technician, setTechnician] = useState('');


  const openModal = (type) => {
    setModalType(type);
    setModalIsOpen(true)
  };
  const openEditModal = (type) => {
 setEditModalType(type);
  setEditModalIsOpen(true)
  };
  const handleEventCreateFail = useCallback(() => {
    setToastText("Can't create event on this date");
    setToastOpen(true);
  }, []);

  const handleEventUpdateFail = useCallback(() => {
    setToastText("Can't add event on this date");
    setToastOpen(true);
  }, []);

  const [mySelectedDate, setSelectedDate] = useState(new Date());

  const timerRef = useRef(null);

  const myView = useMemo(
    () => ({
  
      schedule: {
        type: 'day',
        

        
        startTime: '07:00',
        endTime: '22:00',
        allDay: false,

      },
    
    }),
    [],
  );
  const deleteFirestoreDocument = async () => {
    if (currentEvent.type === 'class') {
      const docRef = doc(db, 'Classes', currentEvent.classId, 'attendance', currentEvent.attendanceId);
      await deleteDoc(docRef);
      setEvents((prev) => prev.filter((event) => event.id !== currentEvent.id));
    } else if  (currentEvent.type === 'match') {
      const docRef = doc(db, 'Courts', currentEvent.courtName, 'Reservations', currentEvent.matchId);
      await deleteDoc(docRef);
      setEvents((prev) => prev.filter((event) => event.id !== currentEvent.id));
    }
    else {
      const docRef = doc(db, 'Competitions', currentEvent.tournamentId);
      await deleteDoc(docRef);
      setEvents((prev) => prev.filter((event) => event.id !== currentEvent.id));
    }
  };
  const openTooltip = useCallback((args, closeOption) => {
     const event = args.event;
    const resource = courtss.find((dr) => dr.id === event.resource);
    const time = formatDate('hh:mm A', new Date(event.start)) + ' - ' + formatDate('hh:mm A', new Date(event.end));
    const startDate = new Date(args.event.start);
    const endDate = new Date(args.event.end);
    const durationInMilliseconds = endDate.getTime() - startDate.getTime();
    const durationInMinutes = Math.floor(durationInMilliseconds / (1000 * 60));
    const startTimeString = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
    const court = courtss.find(obj => obj.id === args.event.resource);
    const filteredEvents = filterEvents(startDate, endDate, args.event.classType || "junior", args.event.resource);
   
    setAvailableEvents(filteredEvents)
    
    if (args.event.type === 'class') {
      
// Get day name for startDate
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayName = dayNames[startDate.getDay()];

// Format startTime and endTime
const startTimeString = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
const endTimeString = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
console.log({  ...event,
  date: startDate,
  endDate :endDate,
  startTime: startTimeString,
  duration: durationInMinutes,
  courtName: court.name,});
setCurrentEvent({
        ...event,
          classTime:event.classTime,type:'class',color:"#FFC0CB",
      })
   
     }
     else if(args.event.type === 'match') {
console.log({  ...event,
  date: startDate,
  endDate :endDate,
  startTime: startTimeString,
  duration: durationInMinutes,
  courtName: court.name,});
      setCurrentEvent({
        ...event,
        date: startDate,
        endDate :endDate,
        startTime: startTimeString,
        duration: durationInMinutes,
        courtName: `Court${event.resource}`,
      
      });
      setTempEvent(args.event)
 
     
    }
    else if (args.event.type === 'tournament') {
      setCurrentEvent((prev) => ({
        ...prev,
        date: startDate,
        startTime: startTimeString,
        duration: durationInMinutes,
        location: court.name,
        prizes:[],
        coachname:'',
      }));

    }


      setStatus(event.name);
      setButtonText('Cancel appointment');
      setButtonType('warning');

 

    setBgColor(event.color);
    setInfo(event.title);
    setTime(time);
    setReason(event.participants);
    setLocation(resource.name);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setAnchor(args.domEvent.currentTarget || args.domEvent.target);
    setCloseOnOverlay(closeOption);
    setOpen(true);
  }, []);

  const handleEventHoverIn = useCallback(
    (args) => {
      openTooltip(args, false);
      
    },
    [openTooltip],
  );

  const handleEventHoverOut = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  }, []);



  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  }, []);

  const handleToastClose = useCallback(() => {
    setToastOpen(false);
  }, []);
  const showToast = useCallback((message) => {
    setToastText(message);
    setToastOpen(true);
  }, []);
  const deleteApp = useCallback(() => {
    setEvents(events.filter((item) => item.id !== currentEvent.id));
    setOpen(false);
    showToast('Appointment deleted');
  }, [events, currentEvent, showToast]);



  const onSelectedDateChange = useCallback((event) => {
    setSelectedDate(event.date);
  }, []);


  const onEventCreated = useCallback(
    (args) => {
      const startDate = new Date(args.event.start);
      const endDate = new Date(startDate.getTime() + 90 * 60000); 
      const durationInMilliseconds = endDate.getTime() - startDate.getTime();
      const durationInMinutes = Math.floor(durationInMilliseconds / (1000 * 60));
      const startTimeString = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
      const court = courtss.find(obj => obj.id === args.event.resource);
      const filteredEvents = filterEvents(startDate, endDate, args.event.resource);
      console.log("events",filteredEvents);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[startDate.getDay()];
      
      // Format startTime and endTime
      const startTimeStringclass = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      const endTimeString = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      
   
      setAvailableEvents(filteredEvents)
      if (args.event.type === 'class') {
        
// Get day name for startDate
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayName = dayNames[startDate.getDay()];

// Format startTime and endTime
const startTimeString = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
const endTimeString = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        setClass((prev)=>({
          ...prev,
            classTime: [{ day: dayName, startTime: startTimeString, endTime: endTimeString,Court:court.name,}],type:'class',color:"#FFC0CB",
        }))
        openModal('class');
       }
       else if(args.event.type === 'match') {

        setReservation((prev) => ({
          ...prev,
          date: startDate,
       
          endDate :endDate,
          startTime: startTimeString,
          duration: durationInMinutes,
          courtName: court.name,
          participants:[],
        }));
        setTempEvent(args.event)
   
        openModal('match');
      }
      else if (args.event.type === 'tournament') {
        setTournament((prev) => ({
          ...prev,
          date: startDate,
          startTime: startTimeString,
          duration: durationInMinutes,
          location: court.name,
          prizes:[],
          coachname:'',
        }));
        openModal('tournament');
      }else{
        setReservation((prev) => ({
          ...prev,
          date: startDate,
       
          endDate :endDate,
          startTime: startTimeString,
          duration: durationInMinutes,
          courtName: court.name,
          participants:[],
          matchType:'single'

        }));
        setClass((prev)=>({
          ...prev,
            classTime: [{ day: dayName, startTime: startTimeStringclass, endTime: endTimeString,Court:court.name,}],type:'class',color:"#FFC0CB",
        }))
        setTempEvent(args.event)
   
        openModal('match');
      }
    },
    [],
  );



const filterEvents = (startDate, endDate,resource) => {
  return events.filter((event) => {
    const eventStart = event.start;
    const eventEnd = event.end;
    const newEventStart = startDate;
    const newEventEnd = endDate;

    // Check if the new event overlaps with the existing event
    const overlapsStart = newEventStart < eventEnd && newEventEnd > eventStart;
    const overlapsEnd = newEventEnd > eventStart && newEventEnd < eventEnd;
    const overlapsWithin = newEventStart >= eventStart && newEventEnd <= eventEnd;

    // Filter out events that overlap in any form
    const overlaps = overlapsStart || overlapsEnd || overlapsWithin;
    const isSameEvent = newEventStart === eventStart && newEventEnd === eventEnd;
    
    return (overlaps && !isSameEvent) && event.resource === resource;
  });
};

 
  const onEventUpdated = async (args) => {
    try {
      let eventsRef;
      
      if (args.event.type === 'match') {
        eventsRef = doc(db, "Courts", args.event.courtName, "Reservations", args.event.matchId);
      } else if (args.event.type === 'class') {
        eventsRef = doc(db, "Classes", args.event.classId, "attendance", args.event.attendanceId);
      }  else if (args.event.type === 'tournament') {
        eventsRef = doc(db, 'Competitions', args.event.tournamentId);
      }else {
        console.error('Invalid event type:', args.event.type);
        return;
      }
  
      const batch = writeBatch(db);
  
      const oldEventData = args.oldEvent;
  
      if (oldEventData && oldEventData.resource === args.event.resource) {
        // Update existing event
        if (args.event.type === 'match') {
          const durationMs = args.event.end - args.event.start;
          const durationMin = durationMs / 60000;
          batch.update(eventsRef, {
            startTime: args.event.start,
            endTime: args.event.end,
            date: args.event.start,
            duration: durationMin
          });
        } else if (args.event.type === 'class') {
          batch.update(eventsRef, {
            date: args.event.start,
            end: args.event.end
          });
        }
        else if (args.event.type === 'tournament') {
          batch.update(eventsRef, {
            date: args.event.start,
            end: args.event.end
          });
        }
        console.log('Event updated in Firestore');
      } else {
        // Create new event
        const eventSnapshot = await getDoc(eventsRef);
        const event = eventSnapshot.data();
        batch.delete(eventsRef); // Delete old event
  
        if (args.event.type === 'match') {
          const durationMs = args.event.end - args.event.start;
          const durationMin = durationMs / 60000;
          batch.set(eventsRef, {
            startTime: args.event.start,
            endTime: args.event.end,
            date: args.event.start,
            duration: durationMin,
            courtName: `Court${args.event.resource}`,
            ...event // Copy other fields from old event if needed
          });
        } else if (args.event.type === 'class') {
          batch.set(eventsRef, {
            date: args.event.start,
            end: args.event.end,
            court: `Court${args.event.resource}`,
            // ...event // Copy other fields from old event if needed
          });
        }
        else if (args.event.type === 'tournament') {
          batch.set(eventsRef, {
            date: args.event.start,
            end: args.event.end,
            court: `Court${args.event.resource}`,
            // ...event // Copy other fields from old event if needed
          });
        }
        console.log('Event added in Firestore');
      }
  
      await batch.commit(); // Commit batched operations
    } catch (error) {
      console.error('Error updating event in Firestore:', error);
    }
  };
  const colors = [
    '#FFC0CB', // Pink
    '#ADD8E6', // Light Blue
    '#90EE90', // Light Green
    '#FFD700', // Gold
    '#FFA07A', // Light Salmon
    '#20B2AA', // Light Sea Green
    '#DDA0DD', // Plum
    '#87CEEB', // Sky Blue
    '#FF6347', // Tomato
    '#FFB6C1', // Light Pink
    '#7FFFD4', // Aquamarine
    '#B0C4DE', // Light Steel Blue
    '#FFE4B5', // Moccasin
    '#9370DB', // Medium Purple
    '#F0E68C', // Khaki
  ]; 
const assignTrainerColors = (trainers) => {
// Add more colors as needed
  
    const trainerColors = {};
  
    trainers.forEach((trainer, index) => {
      trainerColors[trainer.nameandsurname] = colors[index % colors.length];
    });
  
    return trainerColors;
  };  
  const traineeColorPairs = [
    '#7FFFD4', // Aquamarine
    '#B0C4DE', // Light Steel Blue
    '#FFE4B5', // Moccasin
    '#9370DB', // Medium Purple
    '#F0E68C', // Khaki
    '#00FFFF', // Cyan
    '#FF00FF', // Magenta
    '#FFFF00', // Yellow
    '#00FF00', // Lime
    '#FF0000', // Red
  ];
  const assignTraineeColors = (trainees) => {
    // Add more colors as needed
      
        const traineeColors = {};
  
        trainees.forEach((trainer, index) => {
          traineeColors[trainer.nameandsurname] = traineeColorPairs[index % traineeColorPairs.length];
        });
      
        return traineeColors;
      };              
  const saveEvent = (id,docId, startTime, endTime, resource, title, description, coachname,participants, name, matchType,duration) => {
    const colors=assignTrainerColors(trainers)
    const traineecolor=assignTraineeColors(trainees)
   console.log("dwqdqwdqd",participants);
    const newEvent = {
        id: id,
        title: title,
        description: description,
        start: startTime,
        end: endTime,
        allDay: false,
        status: "not paid",
        color: colors[coachname] || traineecolor[name],
        resource: resource,
        type: description,
        participants: participants,
        ...(name != null && { name }), // Include name only if it's not null or undefined
        ...(coachname != null && { coachname }), 
        ...(matchType != null && { matchType }), 
        ...(duration != null && { duration }), 
        [`${description}Id`]:docId,
        courtName:`Court${resource}`,
        date:startTime
     
    };
  
    // Accessing properties from ...reservation
    if (reservation.length > 0) {
        console.log('Additional properties from reservation:', reservation);
        // Example: Accessing a specific property from ...reservation
        const additionalProperty = reservation[0]; // Access the first property in ...reservation
        console.log('Additional property:', additionalProperty);
    }
    const index = events.findIndex(event => event.id === id);
  
    if (index !== -1) {
      // Replace the existing event with the new one
      const updatedEvents = [...events];
      updatedEvents[index] = {...currentEvent,...newEvent};
      setEvents(updatedEvents);
    } else {
      // Add the new event if no match is found
      setEvents(prevEvents => [...prevEvents, newEvent]);
    } 
    };
  

  

    const onClose = useCallback(() => {
  
 
        setEvents([...events]);
  
      setModalIsOpen(false);
    }, [events]);
    const onCloseEdit = useCallback(() => {
  
 
      setEvents([...events]);

    setEditModalIsOpen(false);
  }, [events]);
    const renderCustomResource = useCallback(
      (resource) => (
        <div className="flex flex-row justify-center align-center items-center " >
                    <div className="mr-2"  >
          <svg width="20px" height="20px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
<path fill="#000000" d="M120.8 55L87.58 199h18.52l29.1-126h18.2l-20.6 126h18.3l10.1-62H247v62h18v-62h85.8l10.1 62h18.3L358.6 73h18.2l29.1 126h18.5L391.2 55H120.8zm50.9 18h168.6l7.6 46H164.1l7.6-46zM73 217v30h366v-30H73zm-.64 48L20.69 489H491.3l-51.7-224h-18.5l47.6 206h-45L390 265h-18.3l14.2 87H265v-87h-18v87H126.1l14.2-87H122L88.35 471H43.31l47.56-206H72.36zm50.74 105h265.8l16.5 101H106.6l16.5-101z"/>
          </svg>
            
            </div>
          <div className="resource-name">{resource.name}</div>

        </div>
      ),
      [],
    );
    const getCategory = (id) => {
      switch (id) {
        case 1:
          return {
            name: 'Project X',
            color: '#ff825d',
          };
        case 2:
          return {
            name: 'Stakeholder Mtg.',
            color: '#bd75d0',
          };
        case 3:
          return {
            name: 'Status Update',
            color: '#7f9230',
          };
        case 4:
          return {
            name: 'Information Sharing',
            color: '#f14590',
          };
        case 5:
          return {
            name: 'Team Building',
            color: '#64cad4',
          };
        default:
          return {
            name: 'No category',
            color: '#5ac8fa',
          };
      }
    };
  

    const customScheduleEvent = useCallback((data) => {
    
      const cat = getCategory(data.original.category);
      if (data.allDay) {
        return (
          <div style={{ background: data.original.color }} className="md-custom-event-allday-title">
            {data.title}
          </div>
        );
      } else {
        return (
          <div className="md-custom-event-cont" style={{ borderLeft: '5px solid ' + data.original.color, background:data.original.color}}>
            <div className="md-custom-event-wrapper">
              {/* <div style={{ background: data.original.color}} className="md-custom-event-category">
                {cat.name}
              </div> */}
              <div className="md-custom-event-details">
                <div className="md-custom-event-title">{data.original?.coachname && data.original.coachname != "coach"?data.original.coachname: data.original.name}</div>
          
                {data?.original?.participants && (
       <div className="md-custom-event-time">
    
        {data?.original?.participants?.map((player, index) => (
          <div key={index}>{player.name}{","}</div>
        ))}
        </div>
  )
}
   
              </div>
            </div>
          </div>
        );
      }
    }, []);
  

  return (
    <div className="  ">
 
<div className='flex items-center justify-between'>
      <h1 className="text-3xl font-bold mb-5">Schedule</h1>
     
          <div className=" flex-row flex items-center">
          <div className="mbsc-form-group-title ">Reservations:</div>
          {tasks.map((task, i) => (
            <Task key={i} data={task} />
          ))}
        </div>

   
         
      </div> 
        {/* <div className='bg-white pt-4 border rounded-lg flex-row flex'> */}
        <div className="">
   
      <Eventcalendar

        view={myView}
        resources={courtss}
        data={events}
        clickToCreate={true}
        dragToCreate={true}
        dragToMove={true}
        dragToResize={true}
        showEventTooltip={false}
        onEventHoverIn={handleEventHoverIn}
        onEventHoverOut={handleEventHoverOut} 
        selectedDate={mySelectedDate}
        onSelectedDateChange={onSelectedDateChange}
        onEventCreated={onEventCreated}
        onEventUpdated={onEventUpdated}
        dragTimeStep={30}
    renderResource={renderCustomResource}
renderScheduleEvent={customScheduleEvent}
    externalDrop={true}
          height={1000}
          
    onEventCreateFailed={handleEventCreateFail}
    onEventUpdateFailed={handleEventUpdateFail}
      
      />


    <Popup
        display="anchored"
        isOpen={isOpen}
        anchor={anchor}
        touchUi={false}
        showOverlay={false}
        contentPadding={false}
        closeOnOverlayClick={closeOnOverlay}
        width={350}
        cssClass="md-tooltip"
      >
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <div className="md-tooltip-header" style={{ backgroundColor: bgColor }}>
            <span className="md-tooltip-name-age">{info}</span>
            <span className="md-tooltip-time">{time}</span>
          </div>
          <div className="md-tooltip-info">
          {currentEvent?.coachname && ( <div className="md-tooltip-title">
   
   Coach :<span className="md-tooltip-status md-tooltip-text">{currentEvent.coachname}</span>
 
  </div>)}
          {currentEvent?.type==="match" && (<div className="md-tooltip-title">
   
             Resrvation maker :<span className="md-tooltip-status md-tooltip-text">{status}</span>

            </div>)}

            <div className="md-tooltip-title">
   
            <span className="md-tooltip-status md-tooltip-text">
  Type: {currentEvent?.type ? `${currentEvent.type} (${currentEvent.matchType || ''})` : ''}
</span>

 </div>
            <div className="md-tooltip-title">
              Participants: 
              {reason &&
   reason.map((player, index) => (
<span className="md-tooltip-reason md-tooltip-text" key={index}>{player.name}{","}</span>
    ))}
            </div>
                      
     


            <div className="md-tooltip-title">
              Court: <span className="md-tooltip-location md-tooltip-text">{location}</span>
            </div>
       {currentEvent?.type !="tournament" &&(<>
        <button
                      onClick={()=>openEditModal(currentEvent.type)}
                          className="button-white  mt-5 mb-5"
                        >
                          Edit reservation
                        </button>
                        <button className="px-3 py-1 button-red rounded "  onClick={()=>deleteFirestoreDocument()}>Delete reservation</button>
       </>)  }
          </div>
        </div>
      </Popup>
      <Toast message={toastText} isOpen={isToastOpen} onClose={handleToastClose} />


      {editModalIsOpen && (
    <>
   
          {editModalType === 'match' && 
          
          
          
          (<div className="fixed inset-0 h-full flex bg-gray-600 bg-opacity-50 justify-end items-center overflow-scroll z-50 pt-20" style={{ height: '100%' }}>
<button onClick={()=>{onCloseEdit()}} className="absolute top-0 right-0 m-3 text-gray-500 hover:text-gray-700 focus:outline-none">
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
  </button>
  <div className="w-4/6 pt-10 bg-white border rounded-t flex flex-col justify-start items-start">
  <div className='flex'>
        <h2 className="text-xl font-bold ml-4 mt-4 mb-6">Reservation Details</h2>
     

    </div>
    <div className="flex flex-col justify-start items-start w-full self-center">

      </div>
          <MatchDetails 
          removeEvent={onCloseEdit}  filteredEvents={availableEvents} 
          saveEvent={saveEvent} setI={setRender}i={render} courts={courts}
           setShowModal={setEditModalIsOpen} 
           setReservation={setCurrentEvent} 
    reservationDetails={currentEvent} trainees={trainees} trainers={trainers}/>
    
    </div>
        </div>)
    }
          {editModalType === 'class' &&   <Item
        fiteredEvents={availableEvents}
          trainers={trainers}
          trainees={trainees.map((trainee) => ({
            uid: trainee.id,
            ...trainee,
          }))}
          setI={setClasses}
          i={render}
          toggleForm={()=>onCloseEdit()}
          saveEvent={saveEvent}
          setShowModal={setEditModalIsOpen} 
          item={currentEvent}
        />
 
        }
          </>
      )}
 

</div>
{modalIsOpen && (

   
      
<div className="fixed inset-0 h-full flex bg-gray-600 bg-opacity-50 justify-end items-center overflow-scroll z-50 pt-20" style={{ height: '100%' }}>
<button onClick={()=>{onClose()}} className="absolute top-0 right-0 m-3 text-gray-500 hover:text-gray-700 focus:outline-none">
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
  </button>
  <div className="w-4/6 pt-10 bg-white border rounded-t flex flex-col justify-start items-start">
  <div className='flex'>
        <h2 className="text-xl font-bold ml-4 mt-4 mb-6">Reservation Details</h2>
     

    </div>
    <div className="flex flex-col justify-start items-start w-full self-center">
        
        <div className="flex justify-center mb-6">
        <button onClick={() => setModalType('match')} className={`px-4 py-2 font-semibold text-xl rounded-lg focus:outline-none ${modalType === 'match' ? 'text-indigo-600 hover:bg-indigo-100' : 'text-gray-600 hover:bg-gray-100'}`}>match</button>
          <button onClick={() => setModalType('class')} className={`px-4 py-2 font-semibold text-xl  rounded-lg focus:outline-none ${modalType === 'class' ? 'text-indigo-600 hover:bg-indigo-100' : 'text-gray-600 hover:bg-gray-100'}`}>class</button>
         
      </div>

      </div>
  {modalType === 'match' && 
(
     <MatchDetails removeEvent={onClose}  filteredEvents={availableEvents} saveEvent={saveEvent} setI={setRender}i={render} courts={courts} setShowModal={setModalIsOpen} setReservation={setReservation} reservationDetails={reservation} trainees={trainees} trainers={trainers}/> 
  )}
{modalType === 'class' &&


   <NewItem
        fiteredEvents={availableEvents}
          trainers={trainers}
          trainees={trainees.map((trainee) => ({
            uid: trainee.id,
            ...trainee,
          }))}
          setI={setClasses}
          i={render}
          toggleForm={()=>onClose()}
          classDetails={cls}
          setClassDetails={setClass}
          saveEvent={saveEvent}
          setShowModal={setModalIsOpen} 
          setEvents={setEvents}
        />
         }
         {modalType === 'tournament' &&   <NewItemTournament 
        courts={courts}
        toggleForm={()=>onClose()}
       tournamentData={tournament}
        saveEvent={saveEvent}
        setShowModal={setModalIsOpen} 

        />
   
        }
</div>
</div>
)}
    </div>
  );
};

export default DemoApp;
{/* <FullCalendar
plugins={[timeGridPlugin, interactionPlugin, listPlugin]} // Include listPlugin for list view
initialView="timeGridWeek"
headerToolbar={{
    left: 'prev,next today',
    center: 'title',
    right: 'timeGridWeek,timeGridDay,listWeek' // Include list views in the header
}}
views={{
  listWeek: { buttonText: 'List Week' }, // Customize list week button text

}}
events={filteredEvents.map(event => ({
...event,
backgroundColor: getColor(event.type),
}))}
editable={true}
eventResizable={true}
eventClick={handleEventClick} 
eventDrop={async (info) => {
try {

await updateFirestoreEvent(info.event,info.oldEvent);
// Optionally handle success cases
} catch (error) {
console.error('Error updating Firestore event:', error);
// Handle error cases
}
}}
eventStartEditable={true}
eventResize={async (info) => {
try {

await updateFirestoreEvent(info.event,info.oldEvent);
// Optionally handle success cases
} catch (error) {
console.error('Error updating Firestore event:', error);
// Handle error cases
}
}}
slotMinTime="09:00:00" // Set minimum time to 9 AM
slotMaxTime="22:00:00" // Set maximum time to 9 PM
slotDuration="00:30:00" 
selectable={true} // Allow selecting time slots
        select={(info) => {
          // When a time slot is selected, set the start time in the reservation and open the modal
          setReservation((prevReservation) => ({
            ...prevReservation,
            startTime: new Date(info.start),
            date:new Date(info.start)
          }));
          setModalIsOpen(true);
        }}// Set slot duration to 15 minutes (adjust as needed)
/>  */}

{/* <div style={{ flex: '1', padding: '0 20px', display: 'flex', flexDirection: 'column' }}>


<h1 className='my-5 text-xl font-bold mb-5'>Notes</h1>
<div>
<ul style={{ listStyleType: 'none', padding: '0' }}>
  {noteList.map((note, index) => (
    <li key={index} style={{ marginBottom: '5px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>{note.content}</li>
  ))}
</ul>
</div>
<textarea
  value={notes}
  onChange={handleNoteChange}
  style={{ width: '100%', minHeight: '100px', padding: '8px', fontSize: '16px', marginBottom: '10px' }}
  placeholder="Write your notes here..."
></textarea>
<button onClick={handleSaveNotes} className='button-white'>Save Notes</button>
</div> */}