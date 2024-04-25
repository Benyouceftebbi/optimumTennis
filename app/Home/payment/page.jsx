// pages/index.js
'use client'
import { BadgeDollarSign, Banknote, Download, RefreshCcw, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import styles from '@/styles/global.css'; // Import CSS styles
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/app/firebase';
import { addDoc, collection,doc, getDocs, increment,  orderBy,  query,  setDoc, updateDoc, where, } from 'firebase/firestore';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, ReferenceLine, Label,Text } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable'
import * as XLSX from 'xlsx';
import AutosuggestComponent from '@/components/UI/Autocomplete';
import { getStatusColorClass } from '../tournaments/page';
const Card = ({ title, data, subtitle, icon }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-72">
      
      <div className="flex items-center flex-col justify-between mb-4">
      {icon && <div className="bg-gray-200 p-4  rounded-xl self-start mb-2 ">{icon}</div>}
 
      </div>
      <div className="text-gray-700">
      <h2 className="text-xl font-bold self-start"  style={{ color: '#0E2433' }}>{title}</h2>
        <p className="text-2xl font-bold mb-2">{data}</p>
        <p className="text-sm">{subtitle}</p>
      </div>
    </div>
  );
};

const generateRandomUid = (length) => {
  const uid = uuidv4().replace(/-/g, ''); // Remove hyphens
  return uid.slice(0, length); // Get the first 'length' characters
};

const MatchDetails=({setShowModal,trainers})=>{

  const [bookingType, setBookingType] = useState('match');
  const [reservation,setReservation]=useState( {date: new Date(),
  [`${bookingType}Ref`]:'',
  payment:'Card',
  price: 0,
  type:'',
name:'',description:''})

  
 
  
  const handleInputChange = (e) => {
    setReservation(prevReservation => ({
      ...prevReservation,
      [e.target.name]: e.target.value,
    }));
  };
  
  const handleSubmit = async () => {
    try {
     
   
      const id=generateRandomUid(20);
   
    

      const paymentReceivedRef = collection(db, 'Club/GeneralInformation/PaymentReceived');
      const aa=await addDoc(paymentReceivedRef, {
   
        date:reservation.date,
        [`${bookingType}Ref`]:id,
        payment:reservation.payment,
        price:parseInt( reservation.price,10),
        name:reservation.name,
        description:reservation.description,
        typedis:reservation.type,
        status:reservation.status
      });
      console.log(aa);
    await updateDoc(doc(db, 'Club/GeneralInformation'), {
      totalRevenue: increment(reservation.price),
    });
     
      alert('submitted successfully!');
    setShowModal(false);
  
    } catch (error) {
      console.error('Error submitting reservation:', error);
      alert('Failed to submit reservation. Please try again.');
    }
  };
  const handleClose = () => {
   
    setShowModal(false);
  
  };


 const handleBookingTypeChange = (type) => {
    setBookingType(type);

  }; 



    return    (
      <div className="fixed inset-0 h-full flex bg-gray-600 bg-opacity-50 justify-end items-center overflow-scroll mb-10" style={{ height: '100%' }}>
        <button onClick={handleClose} className="absolute top-0 right-0 m-3 text-gray-500 hover:text-gray-700 focus:outline-none">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
  
        <div className="w-2/6 h-full bg-white border rounded-lg flex flex-col justify-start items-start">
          <div className='flex'>
            <h2 className="text-xl font-bold ml-4 mt-4 mb-6">Invoices Billing</h2>
            <div className='ml-72'/>
            <div className="mt-4">
          
            </div>
          </div>
          {/* Form inputs */}
          <div className="p-6 mt-4 border rounded-lg ml-4 mr-4 mb-8" style={{ width: 'calc(100% - 24px)' }}>
            <div className="ml-4 grid grid-cols-1 gap-4">
            <div className="flex flex-col">
                <strong>Date</strong>
  
  
      <DatePicker
     selected={reservation.date.seconds?new Date(reservation.date.toDate()):reservation.date}
  
        onChange={(date) => {
          setReservation({ ...reservation, date: date })
        // Close calendar after date selection
        }}
  
    className='rounded-lg flex flex-col w-full'
    calendarClassName='flex flex-start'
      /> 
    
              </div>
          
              <div className="flex flex-col">
                <strong>Consumer</strong>   
                <AutosuggestComponent trainers={trainers} setReservation={setReservation} reservation={reservation} name={reservation.name} field={"name"}
         />
      </div>
  <div className="flex flex-col">
              <strong>Payment</strong>
              <select
      name="payment"
      value={reservation.payment}
      onChange={handleInputChange}
      className="rounded-lg"
    >
  
      <option value="cash">
          Cash
        </option>
        <option  value="card">
          Card
        </option>
    </select>
    </div>
    <div className="flex flex-col">
              <strong>Status</strong>
              <select
      name="status"
      value={reservation.status}
      onChange={handleInputChange}
      className="rounded-lg"
    >
  
      <option value="paid">
         Paid
        </option>
        <option  value="not paid">
         Not paid
        </option>
    </select>
    </div>
    <div className="flex flex-col">
              <strong>Price</strong>
              <input
          className="rounded-lg"
          type="text"
          name="price"
          value={reservation.price}
          onChange={handleInputChange}
        />
  
    </div>
    <div className="flex flex-col">
        <label className="font-semibold mb-2">Booking Type</label>
        <div  className="flex justify-center">
          <label className="inline-block mr-4">
            <input
              type="radio"
              name="bookingType"
              value="match"
              checked={bookingType === 'match'}
              onChange={() => handleBookingTypeChange('match')}
              className="mr-2"
            />
            Court
          </label>
          <label className="inline-block">
            <input
              type="radio"
              name="bookingType"
              value="class"
              checked={bookingType === 'class'}
              onChange={() => handleBookingTypeChange('class')}
              className="mr-2"
            />
            Class
          </label>
          <label className="inline-block">
            <input
              type="radio"
              name="bookingType"
              value="other"
              checked={bookingType === 'other'}
              onChange={() => handleBookingTypeChange('other')}
              className="ml-2"
            />
            Other
          </label>
        </div>
        
      </div>
      {bookingType === 'other' && (
        <>
            <div className="flex flex-col">
              <strong>Other:</strong>
              <input
          className="rounded-lg"
          type="text"
          name="type"
          value={reservation.type}
          onChange={handleInputChange}
        />
  
    </div>
        </>
      )}
          <div className="flex flex-col">
              <strong>Description</strong>
              <input
          className="rounded-lg"
          type="text"
          name="description"
          value={reservation.description}
          onChange={handleInputChange}
        />
  
    </div>
                <button type="submit" onClick={handleSubmit} className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4">
        Submit
      </button>
            </div>
    
          </div>

        </div>

      </div>
    )
  }
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StraightAnglePieChart = ({data}) => (



    <div className='flex flex-col w-full self-center justify-center'>
    <h2 className="text-3xl font-bold mb-10 ml-2">Invoicess Types</h2>
    <ResponsiveContainer width="40%" height={400} className='flex flex-col w-full self-center justify-center'>
    <BarChart data={data} >
 
 <XAxis dataKey="name" tick={{  fill: '#0e2433' }}/>
 <YAxis hide="true" />
 <Tooltip />

 <Bar dataKey="value" fill="#0e2433"  radius={[10, 10, 0, 0]} >
   
 <LabelList dataKey="value" name='price' position="top" fill="#0e2433"/>
 </Bar>

</BarChart>
      

    </ResponsiveContainer>
    </div>
);
const ManageSalaryPage = () => {

   
  const [transactions, setTransactions] = useState([]);
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  
  const [trainers,setTrainers]=useState([])
  const [status, setStatus] = useState({
    overallBalance: 0,
    performanceChange: 0,
    highestPaymentDay: null,
    secondHighestPaymentDay: null,
    classRefCount: 0,
    matchRefCount: 0,
    highestPayment:0,
    secondHighestPayment:0,
    data:[{name:'',value:0}],
    totalRefund:0
  });
useEffect(()=>{
  const getTransactions = async () => {
    let totalRevenue = 0;
    let highestPayment = 0;
    let secondHighestPayment = 0;
    let highestPaymentDay = null;
    let secondHighestPaymentDay = null;
    let classRefCount = 0;
    let matchRefCount = 0;
    let classRefPayment=0;
    let matchRefPayment=0;
    let totalRefund=0;

    const q1 = query(
      collection(db, 'Club', 'GeneralInformation', 'PaymentReceived'),
      where("date", ">=", startDate),
      where("date", "<", endDate),
      orderBy("date", "desc")
  );
    const transactionsRef = await getDocs( q1)
    const transactionsData = transactionsRef.docs.map((doc) => {
      const { classRef, matchRef, otherRef, tournamentRef, description } = doc.data();
      let key = null;
    
      if (classRef !== undefined) {
        key = 'class';

      } else if (matchRef !== undefined) {
        key = 'match';

      } else if (tournamentRef !== undefined) {
        key = 'tournament';
      
      } else if (otherRef !== undefined) {
        key = description;

      }
      return {
        id: doc.id,
        type: 'payment',
        ref: key,
     ...doc.data()
      };
    });
   
    const q2=query(collection(db, 'Club', 'GeneralInformation', 'PaymentRefund'),where("date",">",startDate), where("date", "<", endDate),orderBy("date","desc"))
    const refundRef = await getDocs(q2);
    const refundData = refundRef.docs.map((doc) => ({
      id: doc.id,
      type: 'refund',
      ...doc.data(),
      
    }));

    // Combine transactions and refund data into one array
    const combinedData = [transactionsData, refundData].flatMap(array => array);

    // Sort the combined data array from newest to oldest based on the date field (assuming there's a 'date' field in the data)
    combinedData.sort((a, b) => new Date(b.date.toDate()) - new Date(a.date.toDate()));

    combinedData.forEach((transaction) => {
      if (transaction.type === 'payment') {
        totalRevenue += transaction.price;
        if (transaction.price > highestPayment) {
          secondHighestPayment = highestPayment;
          secondHighestPaymentDay = highestPaymentDay;
          highestPayment = transaction.price;
          highestPaymentDay = transaction.date.toDate();
        } else if (transaction.price > secondHighestPayment) {
          secondHighestPayment = transaction.price;
          secondHighestPaymentDay = transaction.date.toDate();
        }
        if (transaction.classRef) {
          classRefCount++;
          classRefPayment += transaction.price;
        }
        if (transaction.matchRef) {
          matchRefCount++;
          matchRefPayment += transaction.price;
        }
        
      } else if (transaction.type === 'refund') {
        totalRevenue -= transaction.price;
        totalRefund+=transaction.price
      }
    });
    let performanceChange=0
    // Calculate performance change compared to the previous month
   if (combinedData.length>1) {
  performanceChange = ((totalRevenue - combinedData[combinedData.length-1].price) /combinedData[combinedData.length-1].price) * 100;
   }
setTransactions(combinedData)
    setStatus({
      overallBalance: totalRevenue,
      performanceChange,
      highestPaymentDay,
      secondHighestPaymentDay,
      classRefCount,
      matchRefCount,
      highestPayment,
      secondHighestPayment,
      data:[{name:'Class',value:classRefPayment},{name:'Matches',value:matchRefPayment}],
      totalRefund:totalRefund
    });
  };

  getTransactions();
}, [startDate,endDate]);
useEffect(()=>{
const geetTrainers=async ()=>{
  const trainersRef= await getDocs(collection(db,'Trainees'))
  const trainersData= trainersRef.docs.map((doc)=>({id:doc.id,...doc.data()}))
  setTrainers(trainersData)
}
geetTrainers()
},[])

  const handleEyeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowDetails(true);
  };

const updateStatus=async (e,index,transaction)=>{
  const { name, value } = e.target;
  const prevStatus = transaction.status;
  const transactionAmount = transaction.price;
  setTransactions((prev) =>
    prev.map((part, idx) =>
      idx === index ? { ...part, [name]: value } : part
    )
  );
  await updateDoc(doc(db,'Club','GeneralInformation','PaymentReceived',transaction.id),{
    status:value
  })
  if (prevStatus === 'not paid' && value === 'paid') {
    await updateDoc(doc(db,'Club','GeneralInformation'),{
      totalRevenue:increment(transactionAmount)
    })
  } else if (prevStatus === 'paid' && value === 'not paid') {
    await updateDoc(doc(db,'Club','GeneralInformation'),{
      totalRevenue:increment(-transactionAmount)
    })
  }
}

  const dateFormat=(Datte)=>{
    const currentDate= new Date(Datte)
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
const formattedDate = currentDate.toLocaleDateString('en-US', options);
return formattedDate

  }
  const [showModal, setShowModal] = useState(false);
  const addNewMatch = () => {
    setShowModal(true);
  };

const generatePDF = (transaction) => {
  console.log(transaction);
  const doc = new jsPDF();

  // Set font size and style
  doc.setFontSize(12);

  // Add logo image
  const logoImg = new Image();
  logoImg.src = '/logo-expanded.png'; // Path to your logo image
  const logoHeight = (logoImg.height * 50) / logoImg.width; 
      const logoWidth = 50; // Adjust logo width as needed
// Maintain aspect ratio
doc.addImage(logoImg, 'PNG', 80, 20, 25, 25); // Adjust position and size as needed


  // Company Name
  const companyName = 'Optimum Tennis';
  doc.text(companyName, 75,50); // Position below the logo

  // Page numbering
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 50, 10);
  }

  // Client Information

  doc.text(`Name and Surname: ${"transaction.name"}`, 10, 70); // Adjust position and content as needed
  doc.text(`date: ${new Date(transaction.date.toDate()).toLocaleDateString()}`, 10, 80); // Adjust position and content as needed

  // Company Information
  const companyInfoX = doc.internal.pageSize.getWidth() - 120;
  doc.text(`Company Name: ${companyName}`, companyInfoX+100, 70,{ align: 'right' }); // Adjust position and content as needed
  doc.text('Company Address:Istanbul Turkey', companyInfoX+100, 80,{ align: 'right' }); // Adjust position and content as needed


  const itemizedListHeader = ['Description', 'Date', 'Type', 'Total Price'];
  const itemizedListData = [
      ["Match", new Date(transaction.date.toDate()).toLocaleDateString(), transaction.payment, `$${transaction.price}`]
  ];
  
  doc.autoTable({
      startY: 100,
      head: [itemizedListHeader],
      body: itemizedListData,
      theme: 'grid', // Add borders and grid theme
      margin: { top: 10 },
  });
  // Subtotal, Tax, Total
  const subtotalText = `Subtotal: $${transaction.price}`;
  const taxText = `Tax (18%): $${transaction.price*0.18}`;
  const totalText = `Total: $${transaction.price+(transaction.price*0.18)}`;
// Calculate the x-coordinate for right alignment
const textWidth = doc.getStringUnitWidth(subtotalText) * doc.internal.getFontSize(); // Assuming font size of 12
const rightAlignX = doc.internal.pageSize.getWidth() +25 - textWidth;
// Subtotal, Tax, Total
doc.text(subtotalText, rightAlignX, doc.autoTable.previous.finalY + 10, { align: 'left' }); // Align text to the right
doc.text(taxText, rightAlignX, doc.autoTable.previous.finalY + 20, { align: 'left' }); // Align text to the right
doc.text(totalText, rightAlignX, doc.autoTable.previous.finalY + 30, { align: 'left' }); // Align text to the right

// Payment Information
doc.text(`Payment Method: ${transaction.payment}`, rightAlignX+35, doc.autoTable.previous.finalY + 50, { align: 'right' }); // Align text to the right
doc.text(`Payment Date: ${new Date(transaction.date.toDate()).toLocaleDateString()}`, rightAlignX+35, doc.autoTable.previous.finalY + 60, { align: 'right' }); // Align text to the right
  
// Footer
const footerTextHeight = 10; // Assuming font size of 10
const footerTextY = doc.internal.pageSize.getHeight() - 20 - footerTextHeight; // Adjust spacing as needed

// Add footer text centered horizontally
const textWidth1 = doc.getStringUnitWidth('Thank you for your business!') * doc.internal.getFontSize();
const textWidth2 = doc.getStringUnitWidth('Contact us at support@example.com for any inquiries.') * doc.internal.getFontSize();
const footerTextX1 = (doc.internal.pageSize.getWidth() - textWidth1);
const footerTextX2 = (doc.internal.pageSize.getWidth() - textWidth2) ;
console.log(footerTextX1);
doc.text('Thank you for your business!', footerTextX1+15, footerTextY);
doc.text('Contact us at support@example.com for any inquiries.', footerTextX1, footerTextY + 10);
  doc.save('invoice_receipt.pdf');
};
const exportToExcelSalary = (from,to,tableName) => {
  const updatedData = transactions.map(item => {
    let updatedItem = { ...item }; // Create a copy of the item
    updatedItem.date=updatedItem.date.toDate().toLocaleDateString()
    if (updatedItem.matchRef) {
      updatedItem.reason = 'match';
      delete updatedItem.matchRef; // Remove matchRef

    } else if (updatedItem.classRef) {
      updatedItem.reason = 'class';
      delete updatedItem.classRef; // Remove classRef
    } else if (updatedItem.typedis) {
      updatedItem.reason = updatedItem.typedis;
      delete updatedItem.typedis; // Remove typedis
      delete updatedItem.otherRef; // Remove typedis
    }
    delete updatedItem.type; 
    return updatedItem; // Return the updated item
  });
  
  const worksheet = XLSX.utils.json_to_sheet(updatedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, 'data.xlsx');
//   // Preprocess data before exporting
//   const rows = tableElement.querySelectorAll('tr');
//   const data = [];

//   // Add styled title row with trainer name and date
//   const trainerRow = [`Trainer Name: ${trainerName}`];
//   data.push(trainerRow);

//   // Add the table titles row as the second row
//   const titlesRow = [];
//   rows[0].querySelectorAll('th, td').forEach((cell) => {
//       titlesRow.push(cell.textContent.trim());
//   });
//   data.push(titlesRow);
//   for (let i = 1; i < rows.length; i++) {
//     const row = rows[i];
//     const rowData = [];
//     const cells = row.querySelectorAll('th, td');

//     // Extract start and end data from the first cell
//     if (cells.length > 0) {
//         const startDatePicker = cells[0].querySelector('.react-datepicker-wrapper:first-child input');
//         const endDatePicker = cells[0].querySelector('.react-datepicker-wrapper:last-child input');
//         const start = startDatePicker ? startDatePicker.value : '';
//         const end = endDatePicker ? endDatePicker.value : '';
//         rowData.push(start.trim());
//         rowData.push(end.trim());
//     }

//     // Add other cells' data to rowData as needed
//     cells.forEach((cell, index) => {
//         if (index > 0 && index < cells.length - 1) { // Exclude the last column
//             if (cell.classList.contains('multi-select')) {
//                 const selectedOptions = [];
//                 cell.querySelectorAll('option:checked').forEach((option) => {
//                     selectedOptions.push(option.textContent);
//                 });
//                 rowData.push(selectedOptions.join(', ')); // Separate options by commas
//             } else {
//                 rowData.push(cell.textContent.trim());
//             }
//         }
//     });

//     data.push(rowData);
// }


//   const ws = XLSX.utils.aoa_to_sheet(data)

//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

//   // Save the Excel file
//   const fileName = `${trainerName} ${tableName} ${from} - ${to}.xlsx`;
//   XLSX.writeFile(wb, fileName);
};
  return (
    <div className="container mx-auto h-full mt-10">
<div className="flex items-center justify-between">
  <div>
    <h2 className="text-3xl font-bold mb-10 ml-2">Invoicess</h2>
  </div>
  <div className='flex flex-row'>
  <div className='flex flex-row self-end px-4'>
            <div>
             <strong className='mr-2 mt-4 mb-6'>from : </strong>
                  <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        maxDate={endDate}
        className="rounded-lg" 
        dateFormat="dd/MM/yyyy"
      />
            </div>
      
            <div>
             <strong className='ml-2 mt-4 mb-6'>to :</strong>
      <DatePicker
        selected={endDate}
        onChange={(date) => setEndDate(date)}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        maxDate={today}
        className="rounded-lg ml-5" 
        dateFormat="dd/MM/yyyy"
      />
      </div>
    </div>
    <button className="text-blue-500 text-2xl" onClick={addNewMatch}>Add Invoices</button>
  </div>
</div>

    <div className="flex    rounded-lg mt-5 shadow-3xl flex-col  shadow-3xl overflow-x-auto w-full ">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-5 self-center">
        <Card title={'Overall Balance'} data={`$ ${status.overallBalance.toFixed(2)}`} subtitle={`${status.performanceChange.toFixed(2)}% from last month`} icon={<Wallet size={32} color="#0E2433" className="text-gray-600" /> }/>
        <Card title={'Highest Paying Day'} data={status.highestPaymentDay &&(`${status?.highestPaymentDay?.toLocaleDateString()}`)} subtitle={`with amout of $ ${status.highestPayment.toFixed(2)}`} icon={    <BadgeDollarSign  size={32}  color="#0E2433" className="text-gray-600" />}/>
        <Card title={'Refund'} data={`$ ${status.totalRefund.toFixed(2)}`} subtitle={`Total Refunds`} icon={   <RefreshCcw  size={32}  color="#0E2433" className="text-gray-600" /> }/>
        <Card title={'Expenses'} data={`$ ${status.totalRefund.toFixed(2)}`} subtitle={`TotalExpenses`} icon={   <Banknote size={32}  color="#0E2433" className="text-gray-600" /> }/>

      {/*  */}

      </div>
    
      <div className="flex overflow-x-auto border bg-white flex-col p-4 rounded-lg relative">
      <StraightAnglePieChart data={status.data}/>
      <button      className="button-excel  ml-5 absolute right-6 top-4" onClick={()=>exportToExcelSalary(startDate.toLocaleDateString(),endDate.toLocaleDateString(),'receipts')}>Import</button>

        <table className="w-full divide-y divide-gray-200" id='receipts'>
          <thead className="bg-gray-50">
            <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"   >
                #
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"   >
              Invoices Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"   >
                name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"   >
                Amout
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"   >
               Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"   >
              type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"   >
                Download Invoices
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction,index) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>{transaction.id}</td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>{dateFormat(transaction.date.toDate())}</td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>{transaction.name}</td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>
      {transaction.type === 'refund' ? '-₺' : '+₺'}
      {Math.abs(transaction.price)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-center ">  
         <select
    name="status"
    value={transaction.status}
    onChange={(e) =>updateStatus(e,index,transaction)}
    id='cssassas'
    className={`rounded-lg w-full px-3 py-2 border-none focus:outline-none ${getStatusColorClass(transaction.status)}`}
  >
    <option value="">Unknown</option>
    <option value="paid">Paid</option>
    <option value="not paid">Not paid</option>
   

  </select></td> 
  <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#737373' }}>{transaction.ref}</td>
    <td className="px-6 py-4 whitespace-nowrap">
           <button onClick={()=>generatePDF(transaction)}>
                 <Download color='#737373'/>
                  </button>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (<MatchDetails setShowModal={setShowModal} trainers={trainers}/>     )}

    </div>
    </div>
  );
};

export default ManageSalaryPage;