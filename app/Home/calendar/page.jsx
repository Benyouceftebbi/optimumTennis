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
import { collection, getDocs, query, where, getFirestore, Timestamp, updateDoc, doc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { fetchFirestoreData } from './fetchData';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useAuth } from '@/context/AuthContext';
import { MatchDetails } from '../matches/page';
import { NewItem } from '../classes/page';
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

    length: '1 h',
    type:'class'
  },
  {
    title: 'Group Class',
    color: '#50789d',

    length: '1 h',
    type:'class'
  },
  {
    title: '1 Hour Court reservation',
    color: '#9da721',

    length: '1 h',
    type:'match'
  },
  // {
  //   title: 'Tournament',
  //   color: '#cd6957',
  //   start: '08:00',
  //   end: '10:00',
  //   length: '2 h',
  //   type:'tournament'
  // },

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
      <div>{props.data.length}</div>
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
  const [selectedEventType, setSelectedEventType] = useState('all'); // Default value for select element
  const [noteList, setNoteList] = useState([
    {
      id: 1,
      content: "Contact HubbTennis Academy for partnership opportunities.",
      category: "Partnership",
      date: "2024-04-03"
    },
    {
      id: 2,
      content: "Research top tennis academies in Europe for coaching techniques.",
      category: "Research",
      date: "2024-04-03"
    },
    {
      id: 3,
      content: "Attend a workshop on sports psychology for tennis players.",
      category: "Training",
      date: "2024-04-03"
    },
    {
      id: 4,
      content: "Update website with new training programs for juniors.",
      category: "Website",
      date: "2024-04-03"
    },
    {
      id: 5,
      content: "Schedule a meeting with players to discuss tournament strategy.",
      category: "Strategy",
      date: "2024-04-03"
    }
  ])
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
    {
      id: 13,
      name: 'Court13',
      cssClass: 'md-col-tick-border',
    },
  ],
  [],
  );
  const {courts,trainers,trainees,setClasses,classes,tournaments}=useAuth() 
  const prevClassesRef = useRef([]);
  useEffect(() => {
    const fetchData = async (classes, courts, tournaments, trainers) => {
      try {
        if (prevClassesRef.current.length==0) {
          const all = await fetchFirestoreData(classes, courts, tournaments, trainers);
          setEvents(all.allEvents);
          prevClassesRef.current = all.classes;
        }
      } catch (error) {
        console.error('Error fetching Firestore data:', error);
      }
    };
 
        fetchData(classes,courts,tournaments,trainers);
      
    
  }, [courts,classes]);

  // Function to handle changes in selected event type
  const handleEventTypeChange = (event) => {
      setSelectedEventType(event.target.value); // Update selected event type
  };



  const getColor = (type) => {
    switch (type) {
      case 'class':
        return '#FF68A8';
      case 'tournament':
        return '#64CFF7';
      case 'leagues':
        return '#F7E752';
      case 'booking':
        return '#CA7CD8';
      default:
        return '#3968CB';
    }
  };




  const [notes, setNotes] = useState('');
  const [render,setRender]=useState(false)
  const handleNoteChange = (event) => {
    setNotes(event.target.value);
  };

  const handleSaveNotes = () => {
    if (notes.trim() !== '') {
      // Append note to the list
      setNoteList([...noteList, notes]);
      // Clear the notes field
      setNotes('');
    }
  };
  const filteredEvents = selectedEventType === 'all' ? events : events.filter(event => event.type === selectedEventType);
  const courtsData = [
    { id: 1, title: 'Court 1' },
    { id: 2, title: 'Court 2' },
    // Add more courts as needed
];
const [reservation,setReservation]=useState({players:[],reaccurance:0,date:new Date(),courtName:'',duration:60,startTime:"07:00",duration:60,payment:'cash',team1:[],team2:[],name:'',description:'',coachname:'',reaccuring:false})

const [modalIsOpen, setModalIsOpen] = useState(false);

  const [isOpen, setOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
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
  const handleEventCreateFail = useCallback(() => {
    setToastText("Can't create event on this date");
    setToastOpen(true);
  }, []);

  const handleEventUpdateFail = useCallback(() => {
    setToastText("Can't add event on this date");
    setToastOpen(true);
  }, []);

  // const onClose = useCallback(() => {
  //   setOpen(false);
  //   setToastText('New task added');
  //   setToastOpen(true);
  // }, []);

  const changeSelected = useCallback((event) => {
    setTechnician(event.value);
  }, []);

  const handleCloseToast = useCallback(() => {
    setToastOpen(false);
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

  const openTooltip = useCallback((args, closeOption) => {
    const event = args.event;
    const resource = courtss.find((dr) => dr.id === event.resource);
    const time = formatDate('hh:mm A', new Date(event.start)) + ' - ' + formatDate('hh:mm A', new Date(event.end));

    setCurrentEvent(event);


      setStatus(event.coachname);
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
  const setStatusButton = useCallback(() => {
    setOpen(false);
    const index = events.findIndex((item) => item.id === currentEvent.id);
    const newApp = [...events];
    newApp[index].confirmed = !events[index].confirmed;
    setEvents(newApp);
    showToast('Appointment ' + (currentEvent.confirmed ? 'confirmed' : 'canceled'));
  }, [events, currentEvent, showToast]);

  const viewFile = useCallback(() => {
    setOpen(false);
    showToast('View file');
  }, [showToast]);

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
      const endDate = new Date(args.event.end);
      const durationInMilliseconds = endDate.getTime() - startDate.getTime();
      const durationInMinutes = Math.floor(durationInMilliseconds / (1000 * 60));
      const startTimeString = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
      const court = courtss.find(obj => obj.id === args.event.resource);

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
       else {
        console.log(args);
        setReservation((prev) => ({
          ...prev,
          date: startDate,
          startTime: startTimeString,
          duration: durationInMinutes,
          courtName: court.name,
        }));
        setTempEvent(args.event)
   
        openModal('match');
      }
      // else if (args.event.type === 'tournament') {
      //   setTournament((prev) => ({
      //     ...prev,
      //     date: startDate,
      //     startTime: startTimeString,
      //     duration: durationInMinutes,
      //     courtName: court.name,
      //   }));
      //   openModal('tournament');
      // }
    },
    [],
  );





 
  const onEventUpdated = async (args) => {
    try {
      let eventsRef;
  
      if (args.event.type === 'match') {
        eventsRef = doc(db, "Courts", args.event.courtName, "Reservations", args.event.matchId);
      } else if (args.event.type === 'class') {
        eventsRef = doc(db, "Classes", args.event.classId, "attendance", args.event.attendanceId);
      } else {
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
        console.log('Event added in Firestore');
      }
  
      await batch.commit(); // Commit batched operations
    } catch (error) {
      console.error('Error updating event in Firestore:', error);
    }
  };
                  
  const saveEvent = (id, startTime, endTime, resource, title, description, color,coachname,participants) => {
    const newEvent = {
      id:id,
      title: title,
      description: description,
      start: startTime,
      end: endTime,
      allDay: false,
      status: "not paid",
      color: color,
      resource: resource,
      type:description,
      coachname:coachname,
      participants:participants
    };
  

console.log(newEvent);
    setEvents((prev) => [...prev, newEvent]);
  
  };

    const onClose = useCallback(() => {
  
 
        setEvents([...events]);
  
      setModalIsOpen(false);
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
    const customWithNavButtons = useCallback(
      () => (
        <> 
          <CalendarNav className="cal-header-nav" />
          <div className="cal-header-picker">
          <div className="resource-name">{mySelectedDate.toLocaleString()}</div>

          </div>
          <CalendarPrev className="cal-header-prev" />
          <CalendarToday className="cal-header-today" />
          <CalendarNext className="cal-header-next" />
        </>
      ),
    
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
  
    const getParticipant = (id) => {
      switch (id) {
        case 1:
          return {
            name: 'Lisa',
            img: 'https://img.mobiscroll.com/demos/f1.png',
          };
        case 2:
          return {
            name: 'Sharon',
            img: 'https://img.mobiscroll.com/demos/f2.png',
          };
        case 3:
          return {
            name: 'Emily',
            img: 'https://img.mobiscroll.com/demos/f3.png',
          };
        case 4:
          return {
            name: 'Rose',
            img: 'https://img.mobiscroll.com/demos/f4.png',
          };
        case 5:
          return {
            name: 'Matt',
            img: 'https://img.mobiscroll.com/demos/m1.png',
          };
        case 6:
          return {
            name: 'Rick',
            img: 'https://img.mobiscroll.com/demos/m2.png',
          };
        case 7:
          return {
            name: 'John',
            img: 'https://img.mobiscroll.com/demos/m3.png',
          };
        case 8:
          return {
            name: 'Ethan',
            img: 'https://img.mobiscroll.com/demos/m4.png',
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
                <div className="md-custom-event-title">{data.original.coachname}</div>
          
                {data.original.participants && (
       <div className="md-custom-event-time">
       Participants:
    
        {data.original.participants.map((player, index) => (
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
  
    const myBeforeBuffer = useCallback((args) => {
      var cat = getCategory(args.original.category);
  
      return (
        <div className="md-schedule-buffer md-schedule-before-buffer">
          <div
            className=" md-schedule-buffer-background"
            style={{ background: `repeating-linear-gradient(-45deg,#fcfffc,#fcfffc 10px,${cat.color} 10px,${cat.color} 20px)` }}
          ></div>
          <span className="md-buffer-text">Travel time </span>
          <span className="md-buffer-time">{args.original.bufferBefore} minutes </span>
        </div>
      );
    }, []);
  return (
    <div className="container mx-auto  h-full mt-10 ">
      <div className='flex items-center justify-between'>
      <h1 className="text-3xl font-bold mb-5">Schedule</h1>
        <div>
        <h2 style={{ marginBottom: '10px' }}>Event Type</h2>
        <select
         value={selectedEventType} onChange={handleEventTypeChange}
          style={{
            padding: '8px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginBottom: '20px',
            width:"200px"
          }}
        >
         
          <option value="all">All</option>
          <option value="class">Class</option>
          <option value="tournament">Tournament</option>
          <option value="leagues">Leagues</option>
          <option value="match">Booking</option>
          
        </select>
        </div>
      </div>
        
        {/* <div className='bg-white pt-4 border rounded-lg flex-row flex'> */}
        <div className="mbsc-grid mbsc-no-padding">
      <div className="mbsc-row">
        <div className="mbsc-col-sm-9 external-event-calendar">
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
          height={1500}
    onEventCreateFailed={handleEventCreateFail}
    onEventUpdateFailed={handleEventUpdateFail}
      
      />
      </div>
    <div className="mbsc-col-sm-3 bg-white">
          <div className="mbsc-form-group-title ml-4 mt-3">Available Reservations</div>
          {tasks.map((task, i) => (
            <Task key={i} data={task} />
          ))}
        </div>
    
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
            <div className="md-tooltip-title">
              {currentEvent?.type==="class"?"Coach:" :"Player:" }<span className="md-tooltip-status md-tooltip-text">{status}</span>

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
            {/* <Button color="secondary" className="md-tooltip-view-button" onClick={viewFile}>
              View patient file
            </Button>
            <Button color="danger" variant="outline" className="md-tooltip-delete-button" onClick={deleteApp}>
              Delete appointment
            </Button> */}
          </div>
        </div>
      </Popup>
      <Toast message={toastText} isOpen={isToastOpen} onClose={handleToastClose} />

</div>

  {modalIsOpen && (
    <>
   
          {modalType === 'match' && <MatchDetails removeEvent={onClose}  saveEvent={saveEvent} setI={setRender}i={render} courts={courts} setShowModal={setModalIsOpen} setReservation={setReservation} reservationDetails={reservation} trainees={trainees} trainers={trainers}/>}
          {modalType === 'class' &&   <NewItem
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
        />}
          </>
      )}
      </div>

      {/* </div> */}
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