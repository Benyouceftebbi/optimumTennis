"use client";
import React, { useState, useEffect, useReducer, useRef } from "react";
import { db } from "@/app/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  deleteDoc,
  setDoc,
  Timestamp,
  orderBy,
  onSnapshot,
  writeBatch,
  increment,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Clock, Clock12, Clock4, Download, LogIn, Repeat2 } from "lucide-react";
import Image from "next/image";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import Modal from "react-modal";
import { getFunctions, httpsCallable } from "firebase/functions";
import { X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/context/AuthContext";
import { formatTimestampToDate,formatCreatedAt } from "./dateFormat";
import AutosuggestComponent from "@/components/UI/Autocomplete";
const getStatusColorClass = (status) => {
  switch (status) {
    case "active":
      return "bg-green-200 text-green-800";
    case "suspended":
      return "bg-orange-200 text-orange-800";

    default:
      return "bg-gray-200 text-gray-800";
  }
};
const ChatScreen = ({ classId, classData }) => {
  const [participants, setParticipants] = useState(classData.participants);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState();
  const [message, setMessage] = useState("");
  const functions = getFunctions();
  const sendNotificationToParticipants = httpsCallable(
    functions,
    "sendNotificationToParticipants"
  );
  const [isLoading, setIsLoading] = useState(false);

  //ref for collecting messages
  //id for the docuemnt
  const fetchMessagesAndCreateConversation = async (setIsLoading) => {
    try {
      setIsLoading(true);
      const conversationRef = collection(db, "Classes", classId, "Messages");
      // Query conversation where Members array contains the traineeId

      const messagesQuery = query(conversationRef, orderBy("CreatedAt", "asc"));

      // Listen for real-time updates to the 'Messages' subcollection
      const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
        const messages = querySnapshot.docs.map((messageDoc) => ({
          id: messageDoc.id,
          ...messageDoc.data(),
        }));

        setMessages(messages);
        setIsLoading(false);
      });

      // Check if the conversation exists, if not, create it

      setIsLoading(false);
      // Return the unsubscribe function to clean up the listener
      return unsubscribe;
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = fetchMessagesAndCreateConversation(setIsLoading);

    // Clean up the listener when the component unmounts
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe(); // Ensure unsubscribe is a function before calling it
      }
    };
  }, []);

  const sendMessage = async () => {
    const msg = message.trim();

    if (msg.length === 0) return false; // Return false if message is empty

    const newMessage = {
      CreatedAt: Timestamp.fromDate(new Date()),
      SentBy: "TeamSupport",
      text: msg,

      SentByName: "TeamSupport",
    };

    const data = {
      participants: participants,
      title: newMessage.SentByName,
      body: newMessage.text,
      data: {
        notificationType: "newMessage",
        url: "/Chat/[Chat]",
        documentId: `Classes/${classId}`,
        id: `Classes/${classId}`,
        ref: `Classes/${classId}/Messages`,
        date: new Date(),
      },
      name: "TeamSupport",
    };
    try {
      setMessage("");

      // Attempt to create the conversation document and add the message in one operation
      const messagesRef = collection(db, `Classes/${classId}/Messages`);
      const conversationRef = doc(db, "Classes", classId);

      const messageRef = await addDoc(messagesRef, newMessage);
      await setDoc(
        conversationRef,
        { LastMessage: { By: "TeamSupport", SentAt: newMessage.CreatedAt } },
        { merge: true }
      );
      sendNotificationToParticipants(data)
        .then((result) => {
          console.log("Notifications sent successfully:", result.data);
        })
        .catch((error) => {
          console.error("Error sending notifications:", error);
        });
      console.log("Message document created with ID:", messageRef.id);
      return true; // Return true if message added successfully
    } catch (error) {
      console.error("Error adding message to conversation:", error);
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
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevents adding new line
      sendMessage();
    }
  };
  return (
    <div className="bg-white w-full">
      <div className="flex-grow p-4 bg-gray-100">
        <div
          className="p-4 w-full flex"
          style={{
            maxHeight: "calc(100vh - 250px)",
            overflowY: "auto",
            flexDirection: "column",
          }}
          ref={scrollRef}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className="mb-4 flex"
              style={{
                padding: "10px",
                borderRadius: "10px",
                maxWidth: "100%",
                alignSelf:
                  message.SentBy === "TeamSupport" ? "flex-end" : "flex-start",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                  {message.SentByName}
                </div>
                <div
                  style={{
                    backgroundColor:
                      message.SentBy === "TeamSupport" ? "#dcf8c6" : "#fff",
                    padding: "10px",
                    borderRadius: "10px",
                    marginTop: "5px",
                  }}
                >
                  {message.text}
                </div>
                <div
                  style={{
                    color: "#777",
                    fontSize: "12px",
                    marginTop: "5px",
                    alignSelf: "flex-end",
                  }}
                >
                  {message.CreatedAt && message.CreatedAt.nanoseconds
                    ? formatCreatedAt(message.CreatedAt)
                    : ""}
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
          <button
            onClick={sendMessage}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
const generateRandomUid = (length) => {
  const uid = uuidv4().replace(/-/g, ""); // Remove hyphens
  return uid.slice(0, length); // Get the first 'length' characters
};
const ParticipantsHorizontalScroll = ({
  participants,
  trainees,
  setClassDetails,
  classDetails,
}) => {
  const { discounts,memberships } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState(participants);
  const [newPlayerDetails, setNewPlayerDetails] = useState({
    status: "active",
    image: "",
    name: "",
    level: "",
    Category: 0,
    lessonsLeft: 0,
    Price: classDetails.classTime[0].price,
    Duration: 0,
    date: new Date(),
    paymentStatus: "",
    paymentType: "",
    discount:null,
    uid: generateRandomUid(20),
  });

  const nonParticipants = trainees.filter((player) => {
    const notInParticipants = !participants.some(
      (participant) => participant.nameandsurname === player.nameandsurname
    );
    const notInSelectedPlayers = !selectedPlayers.some(
      (selectedPlayer) =>
        selectedPlayer.name === player.nameandsurname ||
        selectedPlayer.nameandsurname === player.nameandsurname
    );
    return notInParticipants && notInSelectedPlayers;
  });

  const handleSaveOther = () => {
    setSelectedPlayers([...selectedPlayers, newPlayerDetails]);
    setShowModal(false);
    setNewPlayerDetails({
      name: "",
      level: "",
      Category: 0,
      lessonsLeft: 0,
      Price: classDetails.classTime[0].price * 1 * 1,
      Duration: 0,
      date: new Date(),
      paymentStatus: "",
      paymentType: "",
      uid: generateRandomUid(20),
      status: "active",
      discount: null
    });
  };
  const handleCancelAddOtherRow = () => {
    setShowModal(false);
    setNewPlayerDetails({
      name: "",
      level: "",
      Category: 0,
      lessonsLeft: 0,
      Price: classDetails.classTime[0].price * 1 * 1,
      Duration: 0,
      date: new Date(),
      paymentStatus: "",
      paymentType: "",
      uid: generateRandomUid(20),
      status: "active",
      discount:null,
    });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlayerDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const priceBeforeDiscount =
      classDetails.classTime[newPlayerDetails.Category].price *
      newPlayerDetails.Duration;
    const discountRate = newPlayerDetails.discount != null ? parseInt(newPlayerDetails.discount.rate, 10) : 0; // Assuming a 20% discount

    // Calculate the discount amount
    const discountAmount = (priceBeforeDiscount * discountRate) / 100;

    // Apply the discount to get the final price
    let finalPrice = priceBeforeDiscount - discountAmount;

    // Check if the user is a member
    if (newPlayerDetails.member) {
      // Find the membership with the same ID as membership.id
      const membership = memberships.find((m) => m.id === newPlayerDetails.membership.membershipId);
  console.log(membership);
      if (membership) {
        // Check if the user's classes array is empty
        if (newPlayerDetails.classes && newPlayerDetails.classes.length === 0) {
      const firstClassDiscountRate = parseInt(membership.firstTrainingDiscount,10);
      const firstClassDiscountAmount = (finalPrice * firstClassDiscountRate) / 100;
      finalPrice -= firstClassDiscountAmount;
        } else {
          const firstClassDiscountRate = parseInt(membership.otherTrainingDiscount,10);
          const firstClassDiscountAmount = (finalPrice * firstClassDiscountRate) / 100;
          finalPrice -= firstClassDiscountAmount;
        }
      }
    }

    setNewPlayerDetails((prev) => ({
      ...prev,
      Price: finalPrice,
      lessonsLeft: (Number(newPlayerDetails.Category) + 1) * Number(newPlayerDetails.Duration) * 4,
    }));
  }, [newPlayerDetails.Duration, newPlayerDetails.Category, newPlayerDetails.discount, newPlayerDetails.name]);
  async function updateOthers(e) {

    e.preventDefault();
    // Check for new participants
    const newParticipants = selectedPlayers.filter(
      (participant) =>
        !participants.some(
          (prevParticipant) => prevParticipant.uid === participant.uid
        )
    );
    if (newParticipants.length > 0 && classDetails.id) {
      const currentDate = new Date();
      let total = 0;
      const paymentReceivedPromises = [];

      newParticipants.forEach((participant) => {
        const paymentReceivedRef = collection(
          db,
          "Club/GeneralInformation/PaymentReceived"
        ); // Generate a new document ID

        const paymentReceivedPromise = addDoc(paymentReceivedRef, {
          uid: participant.uid,
          date: currentDate,
          classRef: doc(db, "Classes", classDetails.id),
          payment: participant.paymentType,
          status: participant.paymentStatus,
          paymentType: participant.paymentType,
          price: participant.Price,
          description: null,
        });

        paymentReceivedPromises.push(paymentReceivedPromise);

        total += participant.Price;

        if (participant.discount) {
          const discountId = participant.discount.id;
          paymentReceivedPromises.push(
            updateDoc(doc(db, "Discounts", discountId), {
              consumers: increment(1),
            })
          );
        } else {
          console.log("Discount object is missing or incomplete.");
        }
      });

      await Promise.all(paymentReceivedPromises);

      await updateDoc(doc(db, "Club", "GeneralInformation"), {
        totalRevenue: increment(total),
      });
    }



    if (classDetails.id) {
      await updateDoc(doc(db, "Classes", classDetails.id), {
      participants: selectedPlayers.map((player) => ({
        ...player,
        discount: player.discount != null
          ? { name: player.discount.name, rate: player.discount.rate }
          : null,
          membership: player.membership != null
          ? player.membership
          : null,
          image:null
      })),
      participantsuid: selectedPlayers.map((p) => p.uid),
    });
  }
  setClassDetails((prevClassDetails) => ({
    ...prevClassDetails,
    participants: selectedPlayers,
    participantsuid: selectedPlayers.map((p) => p.uid),
  }));
    setShowModal(false);
  }
  // priceMap[reservation.duration] - (priceMap[reservation.duration] * parseInt(discount?.rate || 0, 10) / 100),
  useEffect(()=>{
if(newPlayerDetails.membership){

  setNewPlayerDetails((prev)=>({...prev,member:true}))
}

  }
,[newPlayerDetails.name])

  return (
    <div className="relative">
      {!showModal && (
        <button
          className="absolute top-0 right-0 button-white px-2 py-2 rounded"
          style={{ top: "-50px", right: "-10px" }}
          onClick={() => setShowModal(true)}
        >
          Add Player
        </button>
      )}

      <table className="w-full divide-y divide-gray-200 ">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              level
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {"times per week"}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {"duration (months)"}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {"lessons left"}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {"Payment status"}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              type
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Amount
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Discount
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {"Joining date"}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {selectedPlayers.map((participant, index) => (
            <tr key={index}>
              <td
                className="px-6 py-4 whitespace-nowrap"
                style={{ color: "#737373" }}
              >
                {participant.name}
              </td>
              <td
                className="px-6 py-4 whitespace-nowrap"
                style={{ color: "#737373" }}
              >
                {participant.level}
              </td>
              <td
                className="px-6 py-4 whitespace-nowrap"
                style={{ color: "#737373" }}
              >
                {participant.Category}
              </td>
              <td
                className="px-6 py-4 whitespace-nowrap"
                style={{ color: "#737373" }}
              >
                {participant.Duration}
              </td>
              <td
                className="px-6 py-4 whitespace-nowrap"
                style={{ color: "#737373" }}
              >
                {participant.lessonsLeft}
              </td>
              <td
                className="px-6 py-4 whitespace-nowrap"
                style={{ color: "#737373" }}
              >
                {participant.paymentStatus}
              </td>
              <td
                className="px-6 py-4 whitespace-nowrap"
                style={{ color: "#737373" }}
              >
                {participant.paymentType}
              </td>
              <td
                className="px-6 py-4 whitespace-nowrap"
                style={{ color: "#737373" }}
              >
                {participant.Price}
              </td>

              <td
                className="px-6 py-4 whitespace-nowrap"
                style={{ color: "#737373" }}
              >
                {participant.discount
                  ? participant.discount.name
                  : "No discount"}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-center">
                {participant.date.toDate
                  ? participant.date.toDate().toLocaleDateString()
                  : participant.date.toLocaleDateString()}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-center ">
                <select
                  name="status"
                  value={participant.status}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setSelectedPlayers((prev) =>
                      prev.map((part, idx) =>
                        idx === index ? { ...part, [name]: value } : part
                      )
                    );
                  }}
                  id="cssassas"
                  className={`rounded-lg w-full px-3 py-2 border-none focus:outline-none ${getStatusColorClass(
                    participant.status
                  )}`}
                >
                  <option value="">Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="paused">Paused</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
        {showModal && (
          <tfoot className="">
               <tr>
            <td className="px-3 py-4 whitespace-nowrap">
              <select
                className="px-3 py-2 border rounded-md w-full sm:w-auto"
                style={{ width: "70px" }}
                onChange={(e) => {
                  const selectedParticipant = JSON.parse(e.target.value);
                  console.log(selectedParticipant);
                  setNewPlayerDetails((prev) => ({
                    ...prev,
                    name: selectedParticipant.nameandsurname,
                    uid: selectedParticipant.uid,
                    image: selectedParticipant.image,
                    membership:selectedParticipant.membership,
                    member:selectedParticipant.membership?true:false,
                  }));
                }}
              >
                <option value="">Select player</option>
                {nonParticipants.map((participant, index) => (
                  <option key={index} value={JSON.stringify(participant)}>
                    {participant.nameandsurname}
                  </option>
                ))}
              </select>
            </td>

            <td className="px-3 py-4 whitespace-nowrap w-30">
              <select
                className="px-3 py-2 border rounded-md w-full sm:w-auto"
                style={{ width: "70px" }}
                name="level"
                value={newPlayerDetails.level}
                onChange={handleInputChange}
              >
                <option value="" disabled hidden>
                  Select Level
                </option>
                <option value="Begginer">Begginer</option>
                <option value="Advanced">Advanced</option>
                <option value="Pro">Pro</option>
                {/* Add more options as needed */}
              </select>
            </td>

            <td className="px-3 py-4 whitespace-nowrap w-30">
              <select
                className="px-3 py-2 border rounded-md w-full sm:w-auto"
                style={{ width: "70px" }}
                name="Category"
                value={newPlayerDetails.Category}
                onChange={handleInputChange}
              >
                <option value="">Select times</option>
                {classDetails.classTime.map((cls, index) => (
                  <option key={index} value={Number(index)}>
                    {index + 1} time/week
                  </option>
                ))}
              </select>
            </td>

            <td className="px-3 py-4 whitespace-nowrap">
              {" "}
              <select
                className="px-3 py-2 border rounded-md w-full sm:w-auto"
                style={{ width: "70px" }}
                name="Duration"
                value={newPlayerDetails.Duration}
                onChange={handleInputChange}
                itemType="number"
              >
                <option value="">Select duration</option>
                <option value={1}>1 Month</option>
                <option value={2}>2 Months</option>
                <option value={3}>3 Months</option>
                {/* Add more options as needed */}
              </select>
            </td>

            <td className="px-3 py-4 whitespace-nowrap">
              <input
                type="number"
                placeholder="Weeks left"
                className="px-3 py-2 border rounded-md w-full sm:w-auto"
                style={{ width: "70px" }}
                readOnly
                value={newPlayerDetails.lessonsLeft}
              />
            </td>

            <td className="px-3 py-4 whitespace-nowrap">
              <select
                className="px-3 py-2 border rounded-md w-full sm:w-auto"
                style={{ width: "70px" }}
                name="paymentStatus"
                value={newPlayerDetails.paymentStatus}
                onChange={handleInputChange}
              >
                <option value="" disabled hidden>
                  Select Payment Status
                </option>
                <option value="paid">Paid</option>
                <option value="not paid">Not Paid</option>
                {/* Add more options as needed */}
              </select>
            </td>

            <td className="px-3 py-4 whitespace-nowrap">
              <select
                className="px-3 py-2 border rounded-md w-full sm:w-auto"
                style={{ width: "70px" }}
                name="paymentType"
                value={newPlayerDetails.paymentType}
                onChange={handleInputChange}
                disabled={newPlayerDetails.paymentStatus != "paid"}
              >
                <option value="" disabled hidden>
                  Select Payemnt Type
                </option>
                <option value="bank">Bank</option>
                <option value="cash">Cash</option>
                {/* Add more options as needed */}
              </select>
            </td>

            <td className="px-3 py-4 whitespace-nowrap">
              {" "}
              <input
                type="number"
                placeholder="Amount"
                className="px-3 py-2 border rounded-md w-full sm:w-auto"
                style={{ width: "80px" }}
                name="Price"
                value={newPlayerDetails.Price}
                onChange={handleInputChange}
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <select
                name="discount"
                onChange={(e) => {
                  const selectedDicount = JSON.parse(e.target.value);
                  setNewPlayerDetails((prev) => ({
                    ...prev,
                    discount: selectedDicount,
                  }));
                }}
                className="rounded-lg"
                style={{ width: "90px" }}
              >
                <option value={0}>No discount</option>
                {discounts.filter((discount) =>discount.uid.some((uid) => uid === classDetails.id)).map((discount, index) => (
                  <option key={index} value={JSON.stringify(discount)}>
                    {discount.name}
                  </option>
                ))}
              </select>
            </td>
            <td className="px-3 py-4 whitespace-nowrap">
              <DatePicker
                id="date"
                selected={newPlayerDetails.date}
                onChange={(date) =>
                  setNewPlayerDetails((prev) => ({ ...prev, date: date }))
                } // Update the 'date' field in newPlayerDetails
                dateFormat="dd-MM-yyyy" // Specify the date format
                className="rounded-lg w-full px-3 py-2 border-none"
                placeholderText="Date"
              />
            </td>
            </tr>
          </tfoot>
        )}
      </table>
      {!showModal ? (
        <>
          {participants != selectedPlayers && (
            <>
              <button onClick={updateOthers} className="button-blue  mt-5">
                submit Changes
              </button>
              <button
                onClick={() => setSelectedPlayers(participants)}
                className="bg-gray-500 text-black-500  font-bold mt-5 ml-5 border rounded-lg px-5 py-2"
              >
                Cancel Changes
              </button>
            </>
          )}
        </>
      ) : (
        <div className="flex flex-row">
          <button onClick={handleSaveOther} className="button-blue mr-2">
            Save
          </button>
          <button onClick={handleCancelAddOtherRow} className="button-red">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

const ClassHistory = ({ classes }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const handleDropdownToggle = (classId) => {
    setSelectedClass(selectedClass === classId ? null : classId);
  };

  const formatTimestampToDate = (timestamp) => {
    const timestamps = timestamp.toDate(); // Convert Firebase Timestamp to JavaScript Date object

    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    };
    const dateTimeFormat = new Intl.DateTimeFormat("en-US", options);

    const formattedDate = dateTimeFormat.format(timestamps);
    return formattedDate; // Adjust date format as needed
  };

  return (
    <div className="bg-white w-full">
      <h1 className="text-xl font-semibold  mb-4">Classes History</h1>
      {classes.map((cls, index) => (
        <div key={index} className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold ">
              {formatTimestampToDate(cls.date)}
            </h2>
            <div>
              <button
                className="px-3 py-1 rounded bg-blue-500 text-white ml-5"
                onClick={() => handleDropdownToggle(cls.id)}
              >
                {selectedClass === cls.id
                  ? "Hide Participants"
                  : "Show Participants"}
              </button>
            </div>
          </div>
          {selectedClass === cls.id && (
            <div className="flex justify-center overflow-x-scroll space-x-4 py-4 w-full">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="px-4 py-2">Player</th>
                    <th className="px-4 py-2">Overall</th>

                    <th className="px-4 py-2">Forehand</th>
                    <th className="px-4 py-2">Backhand</th>
                    <th className="px-4 py-2">Serve</th>
                    <th className="px-4 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {cls.Participants.map((participant, index) => (
                    <tr key={index} className="bg-white hover:bg-gray-100">
                      <td className="px-4 py-2 border border-gray-300">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                            <img
                              src={participant.image}
                              alt={participant.name}
                              className="rounded-full object-cover"
                            />
                          </div>
                          <div>
                            <p>{participant.name}</p>
                            <p>{participant.level}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 border border-gray-300">
                        {participant?.classRate?.overAll}
                      </td>

                      <td className="px-4 py-2 border border-gray-300">
                        {participant?.classRate?.forehand}
                      </td>
                      <td className="px-4 py-2 border border-gray-300">
                        {participant?.classRate?.backhand}
                      </td>
                      <td className="px-4 py-2 border border-gray-300">
                        {participant?.classRate?.serve}
                      </td>
                      <td className="px-4 py-2 border border-gray-300">
                        {participant?.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
const UpcomingClasses = ({ classes, setI, i, canceled, classId }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [newDateTime, setNewDateTime] = useState(new Date()); // State for the new class date and time

  const [showModal, setShowModal] = useState(false); // State for showing/hiding the modal
  const [showModal1, setShowModal1] = useState(false);
  const handleDropdownToggle = (classId) => {
    setSelectedClass(selectedClass === classId ? null : classId);
  };

  const handleConfirmChange = async (cls, newData) => {
    // Logic to handle confirmation and update class time in the database
    // Placeholder for handling the new date and time
    const classRef = doc(db, "Classes", classId, "attendance", cls.id);

    try {
      await updateDoc(classRef, { date: newData });
      const match = (
        await getDoc(doc(db, "Courts", cls.court, "Reservations", cls.id))
      ).data();
      const newEndTime = new Date(newData.getTime() + match.duration * 60000); // Assuming duration is in minutes
      await updateDoc(doc(db, "Courts", cls.court, "Reservations", cls.id), {
        startTime: newData,
        date: newData,
        endTime: newEndTime,
      });
      console.log("Document successfully updated!");
      setI(!i);
    } catch (error) {
      console.error("Error updating document: ", error);
    }

    setShowModal(false);
  };
  const handleCancelClass = async (cls) => {
    // Logic to handle confirmation and update class time in the database
    // Placeholder for handling the new date and time
    const classRef = collection(db, "Classes", classId, "CanceledClasses");
    const matchingCanceledClass = canceled.find((canceledClass) =>
      isSameDay(canceledClass.start.toDate(), cls.date.toDate())
    );
    if (matchingCanceledClass) {
      const canceledClassDocRef = doc(
        db,
        `Classes/${classId}/CanceledClasses/${matchingCanceledClass.id}`
      );
      const durationMs =
        new Date(cls.end.toDate()).getTime() -
        new Date(cls.date.toDate()).getTime();
      await setDoc(doc(db, "Courts", cls.court, "Reservations", cls.id), {
        startTime: cls.date,
        endTime: cls.end,
        date: cls.date,
        duration: Math.floor(durationMs / (1000 * 60)),
        type: "class",
      });
      await deleteDoc(canceledClassDocRef).finally(setI(!i));
    } else {
      await deleteDoc(doc(db, "Courts", cls.court, "Reservations", cls.id));
      await addDoc(classRef, {
        start: cls.date,
      });

      setI(!i);
    }

    setShowModal1(false);
  };

  const findCanceledClassByDate = (canceledClasses, dateToFind) => {
    const aa = canceledClasses.find((canceledClass) =>
      isSameDay(canceledClass.start.toDate(), dateToFind.toDate())
    );

    return aa;
  };
  return (
    <div className="bg-white w-full">
      <h1 className="text-xl font-semibold  mb-4">Upcoming Classes</h1>
      {classes.map((cls, index) => (
        <div key={index} className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold ">
              {formatTimestampToDate(cls.date)}
            </h2>
            <div>
              <button
                className={`px-3 py-1 mt-4 rounded ${
                  findCanceledClassByDate(canceled, cls.date)
                    ? "bg-blue-500 "
                    : "bg-red-500"
                } text-white mr-4`}
                onClick={() => setShowModal1(!showModal1)}
              >
                {findCanceledClassByDate(canceled, cls.date)
                  ? "resume Class"
                  : "Cancel Class"}
              </button>
              <button
                className="px-3 py-1 mt-4 rounded bg-green-500 text-white"
                onClick={() => setShowModal(!showModal)}
              >
                Change Time
              </button>

              <Modal
                isOpen={showModal}
                onRequestClose={() => setShowModal(false)}
                contentLabel="Confirm Change Modal"
                style={{
                  overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
                    zIndex: 99999, // Set a high z-index value for the overlay
                  },
                  content: {
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "white",
                    padding: "1rem",
                    borderRadius: "0.5rem",

                    zIndex: 100000, // Set a higher z-index value for the modal content
                  },
                }}
                ariaHideApp={false} // Disable accessibility features
              >
                <h2 className="text-xl font-semibold  mb-4">
                  Confirm Class Time Change
                </h2>
                <p className="mb-4">Select the new time for the class:</p>
                <DateTimePicker
                  onChange={(date) => {
                    setNewDateTime(date);
                    setShowModal(true); // Show modal after selecting the date and time
                  }}
                  clearIcon={false}
                  value={newDateTime}
                  minDate={new Date()} // Set minimum date to today
                />
                <div className="flex justify-between mt-4">
                  <button
                    className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => handleConfirmChange(cls, newDateTime)}
                  >
                    Confirm Change
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </Modal>
              <Modal
                isOpen={showModal1}
                onRequestClose={() => setShowModal1(false)}
                contentLabel="Confirm Change Modal"
                style={{
                  overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
                    zIndex: 99999, // Set a high z-index value for the overlay
                  },
                  content: {
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "white",
                    padding: "1rem",
                    borderRadius: "0.5rem",

                    zIndex: 100000, // Set a higher z-index value for the modal content
                  },
                }}
                ariaHideApp={false} // Disable accessibility features
              >
                <h2 className="text-xl font-semibold  mb-4">
                  {" "}
                  {cls.canceled
                    ? "Are you sure you want to resume the class"
                    : "Are you sure you want to cancel class"}
                </h2>

                <div className="flex justify-between mt-4">
                  <button
                    className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => handleCancelClass(cls)}
                  >
                    Confirm
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
                    onClick={() => setShowModal1(false)}
                  >
                    Cancel
                  </button>
                </div>
              </Modal>
              <button
                className="px-3 py-1 rounded bg-blue-500 text-white ml-5"
                onClick={() => handleDropdownToggle(cls.id)}
              >
                {selectedClass === cls.id
                  ? "Hide Participants"
                  : "Show Participants"}
              </button>
            </div>
          </div>
          {selectedClass === cls.id && (
            <div className="flex justify-center overflow-x-scroll space-x-4 py-4 w-full">
              {cls.Participants.map((participant, index) => (
                <div key={index} className="flex items-center my-2">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <img
                      src={participant.image}
                      alt={participant.name}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <p>{participant.name}</p>
                    <p>{participant.level}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const Item = ({ item,i, setI, trainers, trainees,saveEvent,toggleForm,setShowModal,fiteredEvents}) => {
  const filterTrainers = (fiteredEvents) => {
    // Extract unique relevant coach names from filtered events
    const relevantCoachNames = new Set(fiteredEvents
      .filter(event => event.type === 'class') // Filter events of type 'class'
      .map((event) => event.coachname)
    );

    // Filter trainers array to remove trainers with relevant coach names
    return trainers.filter((trainer) => !relevantCoachNames.has(trainer.nameandsurname));
  };

  const filteredTrainers=filterTrainers(fiteredEvents)
  const [classDetails, setClassDetails] = useState(item);
  console.log("item",item);
  const [showDetails, setShowDetails] = useState(false);
  const courts = [
    "Court1",
    "Court2",
    "Court3",
    "Court4",
    "Court5",
    "Court6",
    "Court7",
    "Court8",
    "Court9",
    "Court10",
    "Court11",
    "Court12",
    "Court13",
  ];
  const [activeTab, setActiveTab] = useState("details"); // Default active tab is details

  const [showCalendar, setShowCalendar] = useState(false); // State to control calendar visibility

  const [isSubmitting, setIsSubmitting] = useState(false);
  const previous = item;

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleTextClick = () => {
    setShowCalendar(true); // Show calendar when text is clicked
  };

  const handleCalendarClose = () => {
    setShowCalendar(false); // Close calendar when date is selected
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClassDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleTimeChange = (value, change, index) => {
    const formattedTime = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters

    if (formattedTime.length === 2) {
      // Add colon after the second number if the input is within HH:mm format
      value = formattedTime + ":";
    }

    // Update either startTime or endTime in the date object based on the change parameter
    setClassDetails({
      ...classDetails,
      classTime: classDetails.classTime.map((item, idx) =>
        idx === index ? { ...item, [change]: value } : item
      ),
    });
  };
  const handlePriceChange = (value, change, index) => {
    // Update either startTime or endTime in the date object based on the change parameter
    setClassDetails({
      ...classDetails,
      classTime: classDetails.classTime.map((item, idx) =>
        idx === index ? { ...item, [change]: value } : item
      ),
    });
  };

  const handleAddTime = () => {
    if (classDetails.classTime.length < 7) {
      setClassDetails({
        ...classDetails,
        classTime: [
          ...classDetails.classTime,
          { day: "", startTime: "", endTime: "" },
        ],
      });
    } else {
      alert("You can only add up to seven times.");
    }
  };
  const handleRemoveTime = (index) => {
    if (classDetails.classTime.length > 1) {
      const updatedTimes = classDetails.classTime.filter(
        (time, idx) => idx !== index
      );

      setClassDetails({
        ...classDetails,
        classTime: updatedTimes,
      });
    } else {
      alert("You must leave one class Time.");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const updatedClassDetails = { ...classDetails };

    // Remove properties from updatedClassDetails
    delete updatedClassDetails.attendance;
    delete updatedClassDetails.trainer;
    delete updatedClassDetails.history;
    delete updatedClassDetails.canceled;
    delete updatedClassDetails.allDay;
    // Extract UIDs from participants and add them to participantsUid
    // const participantsUid = classDetails.participants.map(
    //   (participant) => participant.uid
    // );
    // updatedClassDetails.participantsuid = participantsUid;
    if (previous !== classDetails) {
      try {
        await updateDoc(
          doc(db, "Classes", classDetails.classId),
         {...updatedClassDetails,trainers:selectedCoaches}
        );
        const dayMap = {
          Sunday: 0,
          Monday: 1,
          Tuesday: 2,
          Wednesday: 3,
          Thursday: 4,
          Friday: 5,
          Saturday: 6,
        };
        const ar=[]
        classDetails.classTime.forEach(async (classTime) => {
          const numberWeeks = parseInt(classDetails.Duration, 10);
  
          for (let i = 0; i < numberWeeks; i++) {
            let startDate = new Date(); // Use the current date as the base
            const currentDay = startDate.getDay(); // Get the current day of the week
            const targetDay = dayMap[classTime.day]; // Get the numeric value for the target day
            const daysUntilTargetDay = (targetDay - currentDay + 7) % 7; // Calculate days until target day
            startDate.setDate(startDate.getDate() + daysUntilTargetDay + i * 7); // Set the start date for the current week
            startDate.setHours(classTime.startTime.split(":")[0]); // Set end time hours
            startDate.setMinutes(classTime.startTime.split(":")[1]);
  
            let endDate = new Date(startDate);
            endDate.setHours(classTime.endTime.split(":")[0]); // Set end time hours
            endDate.setMinutes(classTime.endTime.split(":")[1]); // Set end time minutes
  
            const id = generateRandomUid(13);
            const courtId = parseInt(classTime.Court.match(/\d+/)[0]);
            const docData = {
              Participants: classDetails.participantsuid,
              date: startDate,
              end: endDate,
              court: classTime.Court,
            };
            await updateDoc(
              doc(db, "Classes", item.classId, "attendance",item.attendanceId),
              docData
            );
        console.log("old part",item);
           ar.push( await saveEvent(classDetails.attendanceId,classDetails.classId, startDate, endDate, courtId, classDetails.className, "class",classDetails.coachname,classDetails.participants))
      
            const durationMs = endDate.getTime() - startDate.getTime();
            // Write to Firestore

  
            await setDoc(
              doc(
                db,
                "Courts",
                classTime.Court,
                "Reservations",
                classDetails.attendanceId
              ),
              {
                startTime: startDate,
                endTime: endDate,
                date: startDate,
                duration: Math.floor(durationMs / (1000 * 60)),
                type: "class",
              }
            );
  
          }
        });
        await Promise.all(ar)
        alert("Changes Submitted.");
        setIsSubmitting(false);
        setI(!i);
        setShowModal(false)
      } catch (error) {
        console.error("Error updating document:", error);
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
      alert("No changes to submit.");
    }
  };
  const [participants, setParticipants] = useState(classDetails.participants?classDetails.participants:[]);
  const [newParticipant,setParticipant]=useState({name:'',payment:''})

  const addParticipant = async(participant) => {
    // Check if participant exists in trainees array


    if (participants.length < 4) {
      setParticipants(prev => [...prev, participant]);
      setParticipant({ name: '', payment: '' });
      setClassDetails(prevReservation => ({
        ...prevReservation,
        participants: [...prevReservation.participants, participant],
      }));
      const participantExists = trainees.some(trainee => trainee.nameandsurname === participant.name);
      if(!participantExists){
        const trainee=await addDoc(collection(db,"Trainees"),{nameandsurname:participant.name,Email:null,Documents:[]})
        await updateDoc(doc(db,"Trainees",trainee.id),{uid:trainee.id})
      }
    } else {
      console.log('Maximum participants limit reached (4 participants).');
      // Handle case where maximum participants limit is reached
    }
  };
  const handleParticipantChange = (e) => {
    const { name, value } = e.target;
    setParticipant((prevParticipant) =>
  ({...prevParticipant,[name]:value})
      )
  };
  const filteredTrainees = React.useMemo(() => {
    const traineeIdsToRemove = participants.map(participant => participant.name);
    return trainees.filter(trainee => !traineeIdsToRemove.includes(trainee.nameandsurname));
  }, [trainees, participants]);
  const [selectedCoaches, setSelectedCoaches] = useState(item.trainers);

// Function to handle coach selection
const handleCoachSelection = (e) => {
  const selectedCoachName = e.target.value;
  const isChecked = e.target.checked;

  if (isChecked && selectedCoaches.length < 3) {
    // Add coach to selected coaches if less than 3 are already selected
    setSelectedCoaches((prevSelected) => [
      ...prevSelected,
      { name: selectedCoachName },
    ]);
  } else if (!isChecked) {
    // Remove coach from selected coaches
    setSelectedCoaches((prevSelected) =>
      prevSelected.filter((coach) => coach.name !== selectedCoachName)
    );
  }
};
const listStyle = {
  maxHeight: '200px', // Set a max height for scrolling
  overflowY: 'auto', // Enable vertical scrolling
};
const [showCoachList, setShowCoachList] = useState(false);
const timeIntervals = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];
  return (
    // <div
    //   className="bg-gray-100 p-1 rounded-md cursor-pointer hover:shadow-lg relative font-semibold text-gray-600"
    //   style={{
    //     width: "300px",
    //     height: "300px",

    //     margin: "10px",
    //     padding: "20px",
    //     border: "1px solid #ccc",
    //     borderRadius: "8px",
    //     color: "#000", // Setting text color to black
    //   }}
    // >
    //   <div className="flex items-start">
    //     <div>
    //       {previous.image && (
    //         <img
    //           src={previous.image}
    //           alt="Class"
    //           className="w-16 h-16 rounded-full"
    //         />
    //       )}
    //     </div>
    //     <div className="ml-4">
    //       <p className="text-lg font-semibold">{previous.className}</p>
    //       <p className="text-sm">
    //         Time: {previous.classTime[0].startTime} -{" "}
    //         {previous.classTime[0].endTime}, {previous.classTime[0].day}
    //       </p>

    //       <div className="items-start w-full h-px bg-gray-400 my-2 mt-8 ml-0"></div>
    //       <div className="flex flex-wrap mb-2">
    //         {previous.participants &&
    //           previous.participants.map((participant, index) => (
    //             <img
    //               key={index}
    //               src={participant.image}
    //               alt={`Participant ${index + 1}`}
    //               className="w-8 h-8 rounded-full mr-1"
    //             />
    //           ))}
    //       </div>

    //       <button
    //         className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-20 ml-10"
    //         onClick={toggleDetails}
    //       >
    //         View Details
    //       </button>
    //     </div>
    //   </div>

        <div
          className="fixed inset-0 flex justify-end items-center h-full overflow-auto bg-gray-600 bg-opacity-50"
          style={{ height: "calc(100% )", zIndex: "9999" }}
        >
          <button
            onClick={toggleForm}
            className="absolute top-0 right-0 m-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="w-10/12 h-full bg-white border rounded-t flex flex-col justify-start items-start">
            <div className="flex">
              <h2 className="text-xl font-semibold text-gray-600 ml-4 mt-4 mb-6">
                Class Details
              </h2>
              <div className="ml-72" />
              <div className="mt-4">
                <strong className="ml-2 mt-4 mb-6 font-semibold text-gray-600">
                  Class ID
                </strong>
                <input
                  className="rounded-lg ml-5"
                  type="text"
                  readOnly
                  value={classDetails.id}
                />
              </div>
            </div>
            <div className="flex flex-col justify-start items-start w-full">
              <div className="flex justify-center space-x-4 w-full">
                <button
                  className={`px-4 py-2 font-semibold rounded-lg focus:outline-none ${
                    activeTab === "details"
                      ? "text-indigo-600 hover:bg-indigo-100"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </button>
                <button
                  className={`px-4 py-2 font-semibold rounded-lg focus:outline-none ${
                    activeTab === "attendance"
                      ? "text-indigo-600 hover:bg-indigo-100"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("attendance")}
                >
                  Up Coming Classes
                </button>
                <button
                  className={`px-4 py-2 font-semibold  rounded-lg focus:outline-none ${
                    activeTab === "classHistory"
                      ? "text-indigo-600 hover:bg-indigo-100"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("classHistory")}
                >
                  Class History
                </button>
                <button
                  className={`px-4 py-2 font-semibold rounded-lg focus:outline-none ${
                    activeTab === "Chat"
                      ? "text-indigo-600 hover:bg-indigo-100"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("Chat")}
                >
                  Chat
                </button>
              </div>
            </div>
            {activeTab === "details" && (
              <div className="bg-white w-full">
                <h1 className="text-lg font-semibold  ml-4 mb-2">
                  General Information
                </h1>

                <div
                  className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8"
                  style={{ width: "calc(100% - 24px)" }}
                >
                  <div className="ml-4 grid grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <strong className="text-gray-600 font-semibold">
                        Name
                      </strong>
                      <input
                        className="rounded-lg "
                        type="text"
                        name="className"
                        value={classDetails.className}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 font-semibold">
                        Type
                      </strong>

                      <select
                        className="rounded-lg"
                        name="Type"
                        value={classDetails.Type}
                        onChange={handleInputChange}
                      >
                        <option value="Group">Group</option>
                        <option value="Semi-Group">Semi-Group</option>
                        <option value="Private">Private</option>
                      </select>
                    </div>
                    <div className="flex flex-col rounded-lg">
                      <strong className="text-gray-600 font-semibold">
                        Duration(weeks)
                      </strong>
                      <div className="flex flex-row">
                        <input
                          className="rounded-lg ml-2"
                          type="number"
                          name="Duration"
                          value={classDetails.Duration}
                          min={1}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-col">
                        <strong className="text-gray-600 font-semibold">
                          Trainer
                        </strong>
                        <select
                          className="rounded-lg"
                          name="TrainerRef"
                          value={classDetails.trainerId}
                          onChange={handleInputChange}
                        >
                          <option value={classDetails.TrainerRef}>
                            {classDetails.coachname}
                          </option>
                          {trainers.map((trainer, index) => (
                            <option key={index} value={trainer.Ref}>
                              {trainer.nameandsurname}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                  <div className="flex flex-col">
                      <strong className="text-gray-600 font-semibold">
                        Trainers
                      </strong>
    <input
      type="button"
      className="rounded-lg border py-2 border-black relative"
      value={showCoachList ? 'Hide Coaches' : 'Show Coaches'}
      onClick={() => setShowCoachList(!showCoachList)}
    />
    {showCoachList && (
      <div style={listStyle} className="z-10 bg-white w-full ">
           {filteredTrainers.map((trainer) => (
          <div key={trainer.id}>
            <input
              type="checkbox"
              id={trainer.nameandsurname}
              value={trainer.nameandsurname}
              checked={selectedCoaches.some((coach) => coach.name === trainer.nameandsurname)}
              onChange={handleCoachSelection}
              disabled={
                selectedCoaches.length >= 3 &&
                !selectedCoaches.some((coach) => coach.name === trainer.nameandsurname)
              }
            />
            <label htmlFor={trainer.nameandsurname}>{trainer.nameandsurname}</label>
          </div>
        ))}
      </div>
    )}
  </div>
{/*
                    <div className="flex flex-col">
                      <strong className="text-gray-600 font-semibold">
                        Features
                      </strong>

                      <input
                        className="rounded-lg"
                        type="text"
                        name="Features"
                        value={classDetails.features.join(", ")}
                        onChange={(e) =>
                          setClassDetails({
                            ...classDetails,
                            features: e.target.value.split(", "),
                          })
                        } // Convert string back to array on change
                      />
                    </div> */}
                    <div className="flex flex-col">
                      <strong className="text-gray-600 font-semibold">
                        Registration deadline
                      </strong>

<div          className="rounded-lg rounded-xl px-3 mt-2 w-90 ">
                        {/* <DateTimePicker
                        className="border-none"

                        calendarClassName="border-none"
                          value={
                            classDetails.RegistrationDeadLine.seconds
                              ? classDetails.RegistrationDeadLine.toDate()
                              : classDetails.RegistrationDeadLine
                          }
                          onChange={(date) => {
                            setClassDetails({
                              ...classDetails,
                              RegistrationDeadLine: date,
                            });
                            handleCalendarClose(); // Close calendar after date selection
                          }}
                          calendarIcon={null} // Remove default calendar icon
                          clearIcon={false}
                        /> */}
                     </div>
                    </div>

                    {classDetails.classTime.map((cls, index) => (
                      <div key={index} className="flex flex-col">
                        <strong className="text-gray-600 font-semibold">
                          {index + 1} time a week Price(Monthly)
                        </strong>
                        <input
                          className="rounded-lg "
                          type="text"
                          name="classTime"
                          value={cls.price}
                          onChange={(e) =>
                            handlePriceChange(e.target.value, "price", index)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <h3 className="text-lg font-semibold  ml-4 mb-2">
                  Description
                </h3>
                <div
                  className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8 w-full"
                  style={{ width: "calc(100% - 24px)" }}
                >
                  <input
                    className="rounded-lg w-full"
                    type="text"
                    name="description"
                    multiple
                    value={classDetails.description}
                    onChange={handleInputChange} // Convert string back to array on change
                  />
                </div>
                <h3 className="text-lg font-semibold  ml-4 mb-2">Time</h3>
                <div
                  className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8 relative"
                  style={{ width: "calc(100% - 24px)" }}
                >
                  <button
                    className="absolute top-2 right-2 bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleAddTime}
                  >
                    Add Time
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    {classDetails.classTime.map((date, index) => (
                      <div key={index} className="">
                        <strong className="text-gray-600 font-semibold">
                          Date {index + 1}
                        </strong>{" "}
                        <br />
                        <div className="flex flex-row">
                          <div className="mr-4">
                            <strong className="text-gray-600 font-semibold">
                              Day
                            </strong>{" "}
                            <br />
                            <select
                              className="rounded-lg"
                              value={date.day}
                              onChange={(e) =>
                                handleTimeChange(e.target.value, "day", index)
                              }
                            >
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                              <option value="Saturday">Saturday</option>
                              <option value="Sunday">Sunday</option>
                            </select>
                          </div>
                          <div className="mr-2">
                            <strong className="text-gray-600 font-semibold">
                              Start Time
                            </strong>{" "}
                            <br />
                            <input
                              className="rounded-lg w-24"
                              type="text"
                              name="startTime"
                              value={date.startTime}
                              onChange={(e) =>
                                handleTimeChange(
                                  e.target.value,
                                  "startTime",
                                  index
                                )
                              }
                            />
                          </div>
                          <div className="mr-2">
                            <strong className="text-gray-600 font-semibold">
                              End Time
                            </strong>{" "}
                            <br />
                            <input
                              className="rounded-lg w-24"
                              type="text"
                              name="endTime"
                              value={date.endTime}
                              onChange={(e) =>
                                handleTimeChange(
                                  e.target.value,
                                  "endTime",
                                  index
                                )
                              }
                            />
                          </div>
                          <div className="flex flex-col">
                            <strong className="text-gray-600 font-semibold">
                              Court
                            </strong>
                            <select
                              className="rounded-lg"
                              name="Court"
                              value={date.Court}
                              onChange={(e) =>
                                handlePriceChange(
                                  e.target.value,
                                  "Court",
                                  index
                                )
                              }
                            >
                              <option value="">choose a court</option>
                              {courts.map((court, index) => (
                                <option key={index} value={court}>
                                  {court}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveTime(index)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <h3 className="text-lg font-semibold  ml-4 mb-2">
                  Restrictions
                </h3>
                <div
                  className="p-6 mt-4  border rounded-lg ml-4 mr-4 mb-8"
                  style={{ width: "calc(100% - 24px)" }}
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <strong className="text-gray-600 font-semibold">
                        Min. Players
                      </strong>{" "}
                      <br />
                      <input
                        className="rounded-lg"
                        type="number"
                        name="minmumNumber"
                        onChange={handleInputChange}
                        min={1}
                        value={classDetails.minmumNumber}
                      />
                    </div>
                    <div>
                      <strong className="text-gray-600 font-semibold">
                        Max. Players
                      </strong>{" "}
                      <br />
                      <input
                        className="rounded-lg"
                        type="number"
                        name="maximumNumber"
                        onChange={handleInputChange}
                        min={classDetails.minmumNumber}
                        value={classDetails.maximumNumber}
                      />
                    </div>

                    <div>
                      <strong className="text-gray-600 font-semibold">
                        Level
                      </strong>{" "}
                      <br />
                      <select
                        className="rounded-lg"
                        value={classDetails.level}
                        onChange={(e) =>
                          setClassDetails({
                            ...classDetails,
                            level: e.target.value,
                          })
                        }
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <strong className="text-gray-600 font-semibold">
                        Average Age
                      </strong>{" "}
                      <br />
                      <input
                        className="rounded-lg mt-2"
                        type="text"
                        name="age"
                        onChange={handleInputChange}
                        value={classDetails.age}
                      />
                    </div>
                  </div>
                </div>
                <div
                className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8 relative"
                style={{ width: "calc(100% - 24px)" }}
              >
                     <div className="flex flex-col my-5">
          <strong>Add Participants </strong>


<div class="relative overflow-x-auto my-5">
<table className="w-full divide-y divide-gray-200 mb-5">
          <thead className="bg-gray-50">
            <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"   >
                    Player Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"   >
                    Payment method
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"   >
                    Action
                </th>
            </tr>
        </thead>
        <tbody>
        {participants.map((participant, index) => (
            <tr  key={index}>


               <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>
             {participant.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>
                {participant.payment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>
                <button
                 type="button"
                className="mb-3 button-blue rounded-md mr-4 "
                onClick={() => {
                  setParticipants(prev => prev.filter(parti => parti.name !== participant.name));
                 setClassDetails(prevReservation => ({
                    ...prevReservation,
                    participants:  prevReservation.participants.filter(parti => parti.name !== participant.name),

                  }));

                                                                   }}

              >
               remove
              </button>
                </td>

            </tr>
              ))}
        </tbody>
        {participants.length < 4 &&(
        <tr >


               <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>
               <AutosuggestComponent
                trainers={filteredTrainees}
                setReservation={setParticipant}
                reservation={newParticipant}
                name={newParticipant.name}
                field={'name'}
              />
                </td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>
                <select
    name="payment"
    value={newParticipant.payment}
    onChange={handleParticipantChange}
    className="px-3 py-2 border rounded-md w-full sm:w-auto w-full"
    style={{width:'150px'}}
    required
  >

    <option value="full">
        Full
      </option>
      <option  value="split">
        Split
      </option>
  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>
                <button
                 type="button"
                className="mb-3 button-blue rounded-md mr-4 "
                onClick={() => addParticipant(newParticipant)}

              >
                Add Participant
              </button>
              </td>
            </tr>
            )}
            </table>
</div>

            </div>
                {/* <ParticipantsHorizontalScroll
                  classDetails={classDetails}
                  participants={classDetails.participants}
                  trainees={trainees}
                  setClassDetails={setClassDetails}
                /> */}
              </div>

                <div className="bg-white w-full">
                  <button
                    className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold  py-2 px-4 rounded mb-10"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
            {activeTab === "attendance" && (
              <UpcomingClasses
                classes={item.attendance}
                clss={classDetails}
                setI={setI}
                i={i}
                canceled={item.canceled}
                classId={classDetails.id}
              />
            )}
            {activeTab === "classHistory" && (
              <ClassHistory classes={classDetails.history} />
            )}
            {activeTab === "Chat" && (
              <ChatScreen classData={item} classId={item.id} />
            )}
          </div>
        </div>

    // </div>
  );
};

export const NewItem = ({ trainers, trainees, setI, i,toggleForm,classDetails, setClassDetails,saveEvent,setShowModal,setEvents,fiteredEvents}) => {
  console.log(fiteredEvents);
  const filterTrainers = (filteredEvents) => {
    // Extract unique relevant coach names from filtered events
    const relevantCoachNames = new Set(filteredEvents
      .filter(event => event.type === 'class') // Filter events of type 'class'
      .map((event) => event.coachname)
    );

    // Filter trainers array to remove trainers with relevant coach names
    return trainers.filter((trainer) => !relevantCoachNames.has(trainer.nameandsurname));
  };

  const filteredTrainers=filterTrainers(fiteredEvents)
  const [selectedDateTime, setSelectedDateTime] = useState([new Date()]);
  const [selectedDurations, setSelectedDurations] = useState([60]);
  const [showDetails, setShowDetails] = useState(false);
  const { courts } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false); // State to control calendar visibility

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleTextClick = () => {
    setShowCalendar(true); // Show calendar when text is clicked
  };

  const handleCalendarClose = () => {
    setShowCalendar(false); // Close calendar when date is selected
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(value);
    setClassDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleTimeChange = (value, change, index) => {
    const formattedTime = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters

    if (formattedTime.length === 2) {
      // Add colon after the second number if the input is within HH:mm format
      value = formattedTime + ":";
    }

    // Update either startTime or endTime in the date object based on the change parameter
    setClassDetails({
      ...classDetails,
      classTime: classDetails.classTime.map((item, idx) =>
        idx === index ? { ...item, [change]: value } : item
      ),
    });
  };
  const handlePriceChange = (value, change, index) => {
    setClassDetails({
      ...classDetails,
      classTime: classDetails.classTime.map((item, idx) =>
        idx === index ? { ...item, [change]: value } : item
      ),
    });
  };

  const handleAddTime = () => {
    if (classDetails.classTime.length < 7) {
      setClassDetails({
        ...classDetails,
        classTime: [
          ...classDetails.classTime,
          { day: "", startTime: "", endTime: "" },
        ],
      });
    } else {
      alert("You can only add up to seven times.");
    }
  };
  const handleRemoveTime = (index) => {
    if (classDetails.classTime.length > 1) {
      const updatedTimes = classDetails.classTime.filter(
        (time, idx) => idx !== index
      );

      setClassDetails({
        ...classDetails,
        classTime: updatedTimes,
      });
    } else {
      alert("You must leave one class Time.");
    }
  };
  async function createAttendanceForClass(docRef,title) {
    try {
      const dayMap = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };
         const reservationPromises = [];
 for (const classTime of classDetails.classTime) {
        const numberWeeks = parseInt(classDetails.Duration, 10);

        for (let i = 0; i < numberWeeks; i++) {
          let startDate = new Date(); // Use the current date as the base
          const currentDay = startDate.getDay(); // Get the current day of the week
          const targetDay = dayMap[classTime.day]; // Get the numeric value for the target day
          const daysUntilTargetDay = (targetDay - currentDay + 7) % 7; // Calculate days until target day
          startDate.setDate(startDate.getDate() + daysUntilTargetDay + i * 7); // Set the start date for the current week
          startDate.setHours(classTime.startTime.split(":")[0]); // Set end time hours
          startDate.setMinutes(classTime.startTime.split(":")[1]);

          let endDate = new Date(startDate);
          endDate.setHours(classTime.endTime.split(":")[0]); // Set end time hours
          endDate.setMinutes(classTime.endTime.split(":")[1]); // Set end time minutes

          const id = generateRandomUid(13);
          const courtId = parseInt(classTime.Court.match(/\d+/)[0]);

         
          const docData = {
            Participants: classDetails.participantsuid,
            date: startDate,
            end: endDate,
            court: classTime.Court,
          };
          const durationMs = endDate.getTime() - startDate.getTime();
          // Write to Firestore
          const attendanceref = await addDoc(
            collection(db, "Classes", docRef, "attendance"),
            docData
          );
          reservationPromises.push(await saveEvent(attendanceref.id,docRef, startDate, endDate, courtId, title, "class",classDetails.coachname,classDetails.participants))
          await setDoc(
            doc(
              db,
              "Courts",
              classTime.Court,
              "Reservations",
              attendanceref.id
            ),
            {
              startTime: startDate,
              endTime: endDate,
              date: startDate,
              duration: Math.floor(durationMs / (1000 * 60)),
              type: "class",
            }
          );

        }
      };
    await Promise.all(reservationPromises);
      console.log("Attendance data created successfully.");
    } catch (error) {
      // Log any errors
      console.error("Error creating attendance data:", error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (Object.values(classDetails).some((value) => value === undefined)) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      // Remove unnecessary properties from classDetails
      const updatedClassDetails = { ...classDetails };
      delete updatedClassDetails.attendance;
      delete updatedClassDetails.trainer;
      delete updatedClassDetails.history;
      delete updatedClassDetails.canceled;
      delete updatedClassDetails.RegistrationDeadLine;
      delete updatedClassDetails.color;
      //delete updatedClassDetails.participantsuid
      console.log(updatedClassDetails);
      // Create class document in Firestore
      const docRef = await addDoc(
        collection(db, "Classes"),
        {...updatedClassDetails,trainers:selectedCoaches}
      );

      await createAttendanceForClass(docRef.id, classDetails.className); // Create attendance records

     //await handlePaymentDetails(classDetails.participants, docRef.id);
      handleClose();
     setI((prev) => [...prev, classDetails]);
      setShowModal(false)
     alert("Class Created Successfully");
    } catch (error) {
      console.error("Error adding document:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handlePaymentDetails = async (participants, classId) => {

      const currentDate = new Date();
      let total = 0;
      const paymentReceivedPromises = [];

      participants.forEach((participant) => {
        const paymentReceivedRef = collection(
          db,
          "Club/GeneralInformation/PaymentReceived"
        ); // Generate a new document ID

        const paymentReceivedPromise = addDoc(paymentReceivedRef, {
          uid: participant.uid,
          date: currentDate,
          classRef: doc(db, "Classes", classId),
          payment: participant.paymentType,
          status: participant.paymentStatus,
          paymentType: participant.paymentType,
          price: participant.Price,
          description: null,
        });

        paymentReceivedPromises.push(paymentReceivedPromise);

        total += participant.Price;

        if (participant.discount) {
          const discountId = participant.discount.id;
          paymentReceivedPromises.push(
            updateDoc(doc(db, "Discounts", discountId), {
              consumers: increment(1),
            })
          );
        } else {
          console.log("Discount object is missing or incomplete.");
        }
      });

      await Promise.all(paymentReceivedPromises);

      await updateDoc(doc(db, "Club", "GeneralInformation"), {
        totalRevenue: increment(total),
      });



      await updateDoc(doc(db, "Classes", classId), {
        participants: classDetails.participants.map((player) => ({
          ...player,
          discount: player.discount != null
            ? { name: player.discount.name, rate: player.discount.rate }
            : null,
            membership: player.membership != null
            ? player.membership
            : null,
            image:null
        })),
        participantsuid: classDetails.participants.map((p) => p.uid),
      });

  };

  const handleClose = () => {
    setShowForm(false);
  };
  const [participants, setParticipants] = useState(classDetails.participants?classDetails.participants:[]);
  const [newParticipant,setParticipant]=useState({name:'',payment:''})

  const addParticipant = async(participant) => {
    // Check if participant exists in trainees array


    if (participants.length < 4) {
      setParticipants(prev => [...prev, participant]);
      setParticipant({ name: '', payment: '' });
      setClassDetails(prevReservation => ({
        ...prevReservation,
        participants: [...prevReservation.participants, participant],
      }));
      const participantExists = trainees.some(trainee => trainee.nameandsurname === participant.name);
      if(!participantExists){
        const trainee=await addDoc(collection(db,"Trainees"),{nameandsurname:participant.name,Email:null,Documents:[]})
        await updateDoc(doc(db,"Trainees",trainee.id),{uid:trainee.id})
      }
    } else {
      console.log('Maximum participants limit reached (4 participants).');
      // Handle case where maximum participants limit is reached
    }
  };
  const handleParticipantChange = (e,) => {
    const { name, value } = e.target;
    setParticipant((prevParticipant) =>
  ({...prevParticipant,[name]:value})
      )
  };
  const filteredTrainees = React.useMemo(() => {
    const traineeIdsToRemove = participants.map(participant => participant.name);
    return trainees.filter(trainee => !traineeIdsToRemove.includes(trainee.nameandsurname));
  }, [trainees, participants]);
  const [selectedCoaches, setSelectedCoaches] = useState([]);

// Function to handle coach selection
const handleCoachSelection = (e) => {
  const selectedCoachName = e.target.value;
  const isChecked = e.target.checked;

  if (isChecked && selectedCoaches.length < 3) {
    // Add coach to selected coaches if less than 3 are already selected
    setSelectedCoaches((prevSelected) => [
      ...prevSelected,
      { name: selectedCoachName },
    ]);
  } else if (!isChecked) {
    // Remove coach from selected coaches
    setSelectedCoaches((prevSelected) =>
      prevSelected.filter((coach) => coach.name !== selectedCoachName)
    );
  }
};
const listStyle = {
  maxHeight: '200px', // Set a max height for scrolling
  overflowY: 'auto', // Enable vertical scrolling
};
const [showCoachList, setShowCoachList] = useState(false);
const timeIntervals = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];
  return (


      <div className=" flex flex-col  h-[850px]" style={{}}>



            <form className="bg-white w-full" onSubmit={handleSubmit}>
              <h1 className="text-lg font-semibold  ml-4 mb-2">
                General Information
              </h1>

              <div
                className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8"
                style={{ width: "calc(100% - 24px)" }}
              >
                <div className="ml-4 grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                    <strong className="text-gray-600 font-semibold">
                      Name
                    </strong>
                    <input
                      required
                      className="rounded-lg"
                      type="text"
                      name="className"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex flex-col">
                    <strong className="text-gray-600 font-semibold">
                      Type
                    </strong>

                    <select
                      className="rounded-lg"
                      name="Type"
                      required
                      onChange={handleInputChange}
                    >
                      <option value="Group">Group</option>
                      <option value="Semi-Group">Semi-Group</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <strong className="text-gray-600 font-semibold">
                     Class type
                    </strong>

                    <select
                      className="rounded-lg"
                      name="classType"
                      required
                      onChange={handleInputChange}
                    >

                      <option value="junior">Junoir</option>
                      <option value="adult">Adult</option>
                    </select>
                  </div>
                  <div className="flex flex-col rounded-lg">
                    <strong className="text-gray-600 font-semibold">
                      Duration(weeks)
                    </strong>
                    <div className="flex flex-row">
                      <input
                        className="rounded-lg ml-2"
                        type="number"
                        name="Duration"
                        required
                        min={1}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 font-semibold">
                        Main Trainer
                      </strong>
                      <select
                        className="rounded-lg"
                        name="TrainerRef"
                        onChange={(e) => {
                          const selectedTrainerId = e.target.value;
                          const selectedTrainer = trainers.find(
                            (trainer) =>
                              trainer.nameandsurname === selectedTrainerId
                          );
                          setClassDetails((prevDetails) => ({
                            ...prevDetails,
                            TrainerRef: selectedTrainer.Ref,
                            coachname:selectedTrainer.nameandsurname // Assuming selectedTrainer is the object reference
                          }));
                        }}
                        required
                      >
                        <option value="">select Trainer</option>
                        {filteredTrainers.map((trainer, index) => (
                          <option
                            key={trainer.id}
                            value={trainer.nameandsurname}
                          >
                            {trainer.nameandsurname}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>


                  <div className="flex flex-col">
                      <strong className="text-gray-600 font-semibold">
                        Trainers
                      </strong>
    <input
      type="button"
      className="rounded-lg border py-2 border-black relative"
      value={showCoachList ? 'Hide Coaches' : 'Show Coaches'}
      onClick={() => setShowCoachList(!showCoachList)}
    />
    {showCoachList && (
      <div style={listStyle} className="z-10 bg-white w-full ">
           {filteredTrainers.map((trainer) => (
          <div key={trainer.id}>
            <input
              type="checkbox"
              id={trainer.nameandsurname}
              value={trainer.nameandsurname}
              checked={selectedCoaches.some((coach) => coach.name === trainer.nameandsurname)}
              onChange={handleCoachSelection}
              disabled={
                selectedCoaches.length >= 3 &&
                !selectedCoaches.some((coach) => coach.name === trainer.nameandsurname)
              }
            />
            <label htmlFor={trainer.nameandsurname}>{trainer.nameandsurname}</label>
          </div>
        ))}
      </div>
    )}
  </div>
                  <div className="flex flex-col">
                    <strong className="text-gray-600 font-semibold">
                      Features
                    </strong>

                    <input
                      className="rounded-lg"
                      type="text"
                      name="Features"
                      required
                      onChange={(e) =>
                        setClassDetails({
                          ...classDetails,
                          features: e.target.value.split(", "),
                        })
                      } // Convert string back to array on change
                    />
                  </div>
                  {/* <div className="flex flex-col">
                    <strong className="text-gray-600 font-semibold">
                      Registration deadline
                    </strong>

                      <DateTimePicker
                        value={ classDetails.RegistrationDeadLine
                          ? classDetails.RegistrationDeadLine
                          : new Date()}
                        onChange={(date) => {
                          setClassDetails({
                            ...classDetails,
                            RegistrationDeadLine: date,
                          });
                          handleCalendarClose(); // Close calendar after date selection
                        }}
                        calendarIcon={null} // Remove default calendar icon
                        required
                      />

                  </div> */}
{/*
                  <div className="flex flex-col">
                    <strong className="text-gray-600 font-semibold">
                      Upload Class Image
                    </strong>
                    <label
                      htmlFor="imageInput"
                      className="rounded-lg border border-black-900 px-3 py-2  cursor-pointer "
                    >
                      {classDetails.image ? "Change Image" : "Upload Image"}
                      <input
                        id="imageInput"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          handleImageChange(e);
                        }}
                        style={{ display: "none" }}
                        required
                      />
                    </label>
                  </div> */}
                  {classDetails.classTime.map((cls, index) => (
                    <div key={index}>
                      <strong className="text-gray-600 font-semibold">
                        attending {index + 1} times a week Price (Monthly)
                      </strong>
                      <input
                        className="rounded-lg"
                        type="text"
                        name="classTime"
                        value={cls.price}
                        onChange={(e) =>
                          handlePriceChange(e.target.value, "price", index)
                        }
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-semibold  ml-4 mb-2">Description</h3>
              <div
                className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8 w-full"
                style={{ width: "calc(100% - 24px)" }}
              >
                <input
                  className="rounded-lg w-full"
                  type="text"
                  name="description"
                  multiple
                  required
                  onChange={handleInputChange} // Convert string back to array on change
                />
              </div>
              <h3 className="text-lg font-semibold  ml-4 mb-2">Time</h3>
              <div
                className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8 relative"
                style={{ width: "calc(100% - 24px)" }}
              >
                <button
                type="button"
                  className="absolute top-2 right-2 bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleAddTime}
                >
                  Add Time
                </button>
                <div className="grid grid-cols-1 gap-4">
                  {classDetails.classTime.map((date, index) => (
                    <div key={index} className="">
                      <strong className="text-gray-600 font-semibold">
                        Date {index + 1}
                      </strong>{" "}
                      <br />
                      <div className="flex flex-row">
                        <div className="mr-4">
                          <strong className="text-gray-600 font-semibold">
                            Day
                          </strong>{" "}
                          <br />
                          <select
                            className="rounded-lg"
                            value={date.day}
                            onChange={(e) =>
                              handleTimeChange(e.target.value, "day", index)
                            }
                            required
                          >
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                          </select>
                        </div>
                        <div className="mr-2">
                          <strong className="text-gray-600 font-semibold">
                            Start Time
                          </strong>{" "}
                          <br />
                          <select
          className="rounded-lg w-24"
          name="startTime"
          value={date.startTime}
          onChange={(e) => handleTimeChange(e.target.value, 'startTime', index)}
          required
        >
          {timeIntervals.map((time, idx) => (
            <option key={idx} value={time}>
              {time}
            </option>
          ))}
        </select>
                        </div>
                        <div className="mr-2">
                          <strong className="text-gray-600 font-semibold">
                            End Time
                          </strong>{" "}
                          <br />
                          <select
          className="rounded-lg w-24"
          name="endTime"
          value={date.endTime}
          onChange={(e) => handleTimeChange(e.target.value, 'endTime', index)}
          required
        >
          {timeIntervals.map((time, idx) => (
            <option key={idx} value={time}>
              {time}
            </option>
          ))}
        </select>
                        </div>
                        <div className="flex flex-col">
                          <strong className="text-gray-600 font-semibold">
                            Court
                          </strong>
                          <select
                            className="rounded-lg"
                            name="Court"
                            required
                            value={date.Court}
                            onChange={(e) =>
                              handlePriceChange(e.target.value, "Court", index)
                            }
                          >
                            <option value="">choose a court</option>
                            {courts.map((court, index) => (
                              <option key={index} value={court.name}>
                                {court.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveTime(index)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-semibold  ml-4 mb-2">Restrictions</h3>
              <div
                className="p-6 mt-4  border rounded-lg ml-4 mr-4 mb-8"
                style={{ width: "calc(100% - 24px)" }}
              >
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <strong className="text-gray-600 font-semibold">
                      Min. Players
                    </strong>{" "}
                    <br />
                    <input
                      className="rounded-lg"
                      type="number"
                      name="minmumNumber"
                      onChange={handleInputChange}
                      min={1}
                      required
                    />
                  </div>
                  <div>
                    <strong className="text-gray-600 font-semibold">
                      Max. Players
                    </strong>{" "}
                    <br />
                    <input
                      className="rounded-lg"
                      type="number"
                      name="maximumNumber"
                      onChange={handleInputChange}
                      min={classDetails.minmumNumber}
                      required
                    />
                  </div>

                  <div>
                    <strong className="text-gray-600 font-semibold">
                      Level
                    </strong>{" "}
                    <br />
                    <select
                      className="rounded-lg"
                      required
                      onChange={(e) =>
                        setClassDetails({
                          ...classDetails,
                          level: e.target.value,
                        })
                      }
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <strong className="text-gray-600 font-semibold">
                      Average Age
                    </strong>{" "}
                    <br />
                    <input
                      className="rounded-lg mt-2"
                      type="text"
                      name="age"
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div
                className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8 relative"
                style={{ width: "calc(100% - 24px)" }}
              >
                     <div className="flex flex-col my-5">
          <strong>Add Participants </strong>


<div class="relative overflow-x-auto my-5">
<table className="w-full divide-y divide-gray-200 mb-5">
          <thead className="bg-gray-50">
            <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"   >
                    Player Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"   >
                    Payment method
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"   >
                    Action
                </th>
            </tr>
        </thead>
        <tbody>
        {participants.map((participant, index) => (
            <tr  key={index}>


               <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>
             {participant.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>
                {participant.payment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>
                <button
                 type="button"
                className="mb-3 button-blue rounded-md mr-4 "
                onClick={() => {
                  setParticipants(prev => prev.filter(parti => parti.name !== participant.name));
                 setClassDetails(prevReservation => ({
                    ...prevReservation,
                    participants:  prevReservation.participants.filter(parti => parti.name !== participant.name),

                  }));

                                                                   }}

              >
               remove
              </button>
                </td>

            </tr>
              ))}
        </tbody>
        {participants.length < 4 &&(
        <tr >


               <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>
               <AutosuggestComponent
                trainers={filteredTrainees}
                setReservation={setParticipant}
                reservation={newParticipant}
                name={newParticipant.name}
                field={'name'}
              />
                </td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>
                <select
    name="payment"
    value={newParticipant.payment}
    onChange={handleParticipantChange}
    className="px-3 py-2 border rounded-md w-full sm:w-auto w-full"
    style={{width:'150px'}}
    required
  >

    <option value="full">
        Full
      </option>
      <option  value="split">
        Split
      </option>
  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>
                <button
                 type="button"
                className="mb-3 button-blue rounded-md mr-4 "
                onClick={() => addParticipant(newParticipant)}

              >
                Add Participant
              </button>
              </td>
            </tr>
            )}
            </table>
</div>

            </div>
                {/* <ParticipantsHorizontalScroll
                  classDetails={classDetails}
                  participants={classDetails.participants}
                  trainees={trainees}
                  setClassDetails={setClassDetails}
                /> */}
              </div>

              <div className="bg-white w-full">
                <button
                  className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold  py-2 px-4 rounded mb-10"
                  disabled={isSubmitting}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>



  );
};

const Dashboard = () => {
  const { classes, setClasses, trainers, trainees } = useAuth();

  const [rerender, setRerender] = useState(true);
  const [classDetails, setClassDetails] = useState({
    classTime: [{ day: "Monday", startTime: "13:00", endTime: "14:00" }],
    participants: [],
    participantsuid: [],
  });
  const navigateToDetails = (item) => {
    // You can define your navigation logic here
    console.log("Navigate to details:", item);
  };
const [newModal,setNewModal]=useState(false)
const onClose = ()=>{




setNewModal(false);
};
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-semibold  my-4 text-center">Class List</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {classes.map((item, index) => (
          <Item
            key={index}
            item={item}
            onNavigate={navigateToDetails}
            setI={setClasses}
            i={rerender}
            trainers={trainers}
            trainees={trainees.map((trainee) => ({
              uid: trainee.id,
              ...trainee,
            }))}
          />
        ))}
  <div
          className="bg-gray-200 p-3 rounded-md cursor-pointer hover:shadow-lg flex items-center justify-center"
          style={{
            width: "300px",
            height: "300px",
            margin: "10px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            textAlign: "center",
          }}
          onClick={()=>setNewModal(true)}
        >
          <span className="text-5xl">+</span>
        </div>
        {newModal &&   <NewItem
          trainers={trainers}
          trainees={trainees.map((trainee) => ({
            uid: trainee.id,
            ...trainee,
          }))}
          setI={setClasses}

          toggleForm={()=>onClose()}
          classDetails={classDetails}
          setClassDetails={setClassDetails}

          setShowModal={setNewModal}

        />}
      </div>
    </div>
  );
};

export default Dashboard;
