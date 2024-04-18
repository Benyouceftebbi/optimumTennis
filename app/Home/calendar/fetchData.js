
import { collection, getDocs, query, where, getFirestore, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/app/firebase';

export  const fetchFirestoreData = async (classes,courts,tournaments,trainers) => {


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
            color:"#FFC0CB",
            participants:classData.participants,
            coachname:trainerName
        }));
    });
    
    const allClasses = (await Promise.all(eventsPromises)).flat();

    const tournamentsEvents = tournaments.map(doc => ({
        title: doc.type,
        start: new Date(doc.date.toDate()), // Assuming start is a Firestore timestamp
        end: new Date(doc.end.toDate()), // Assuming end is a Firestore timestamp
        type: 'tournament',
        tournamentsId:doc.id,
        resource:parseInt(doc.court.match(/\d+/)[0]),
        color:"#ADD8E6 "
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
      color:"#90EE90",
     participants:doc.players,
     coachname:doc.coachname,

    }));

    // Merge reservationsData into courtsWithReservations
    courtsWithReservations.push(...reservationsData);
}

    const allEvents = [...allClasses,...courtsWithReservations,...tournamentsEvents]

    return { classes: allClasses,allEvents: allEvents,courts:courtsWithReservations,tournaments:tournamentsEvents };
};