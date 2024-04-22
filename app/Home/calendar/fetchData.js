
import { collection, getDocs, query, where, getFirestore, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/app/firebase';
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
export  const fetchFirestoreData = async (classes,courts,tournaments,trainers,trainees) => {

      const trainerColors = assignTrainerColors(trainers);
      const traineeColors = assignTraineeColors(trainees);
    const eventsPromises = classes.map(async classData => {
        const attendanceQuery = query(collection(db, `Classes/${classData.id}/attendance`));
        const attendanceSnapshot = await getDocs(attendanceQuery);

        const attendanceData = attendanceSnapshot.docs.map(doc => ({
            attendanceId: doc.id,
            ...doc.data()
            // Include other data you need from the attendance document
        }));
        const trainerName = trainers.find((trainer) => JSON.stringify(trainer.Ref) === JSON.stringify(classData.TrainerRef)).nameandsurname

        return attendanceData.map(attendance => ({
            title: classData.className,
            start: new Date(attendance.date.toDate()), // Assuming start is a Firestore timestamp
            end:new Date(new Date(attendance.date.toDate()).getTime() + 2 * 60 * 60 * 1000) , // Assuming end is a Firestore timestamp
            type: 'class',
            classId: classData.id,
            attendanceId: attendance.attendanceId,
            resource: parseInt(attendance.court.match(/\d+/)[0]),
            color: trainerColors[trainerName] ,
            participants:classData.participants,
            coachname:trainerName,
            ...classData,
            
        }));
    });
    
    const allClasses = (await Promise.all(eventsPromises)).flat();

    const tournamentsEvents = tournaments.map(doc => ({
        title: doc.type,
        start: new Date(doc.date.toDate()), // Assuming start is a Firestore timestamp
        end: new Date(doc.end.toDate()), // Assuming end is a Firestore timestamp
        type: 'tournament',
        tournamentId:doc.id,
        courtName:doc.location,
        resource:parseInt(doc.location.match(/\d+/)[0]),
        color:"#ADD8E6 ",
        ...doc
    }));

    // Fetch court reservations data and construct events

    const courtsWithReservations = [];
 // Fetch court reservations data


  // Assuming each court has a subcollection "Reservations"
  
  for (const court of courts) {
    const reservationsData = court.reservations
    .filter(doc => doc.type === undefined) // Filter out documents without the 'type' field
    .map(doc => ({
      title:"Court Booking",
      start: new Date(doc.startTime.toDate()),
      end: new Date(doc.endTime.toDate()),
      type: 'match',
      matchId: doc.id,
      courtName: doc.courtName,
      resource:parseInt(doc.courtName.match(/\d+/)[0]),
      color:doc.coachname && doc.coachname != "coach" ? trainerColors[doc.coachname] : traineeColors[doc.name], // Random color if no match found
     participants:doc.players,
     coachname:doc.coachname,
     name:doc.name,
     ...doc

    }));

    // Merge reservationsData into courtsWithReservations
    courtsWithReservations.push(...reservationsData);
}

    const allEvents = [...allClasses,...courtsWithReservations,...tournamentsEvents]

    return { classes: allClasses,allEvents: allEvents,courts:courtsWithReservations,tournaments:tournamentsEvents };
};