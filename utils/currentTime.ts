const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  
  const getMonthAndYear = (date: Date) => {
    const year = date.getFullYear();
    const monthName = date.toLocaleString("default", { month: "long" }); // Get the full month name
    return {
      year: year.toString(),
      monthName: monthName,
    };
  };
  
  function extractUUID(str: string) {
    const regex = /^([A-Z0-9-]+)\/L0\/001$/;
    const match = str.match(regex);
  
    if (match) {
      return match[1];
    } else {
      return null; // Or handle the error as needed
    }
  }
  
  const getCurrentDayDetails = (date:Date) => {
    let day = String(date.getDate()).padStart(2, '0'); 
    let month = String(date.getMonth() + 1).padStart(2, '0'); 
    let year = date.getFullYear(); 
  
    let hours24 = date.getHours();
    let hours12 = hours24 % 12 || 12; // Convert to 12-hour format
    let ampm = hours24 >= 12 ? 'PM' : 'AM';
    let hours = String(hours12).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0'); 
  
    let daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let monthsOfYear = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let dayOfWeek = daysOfWeek[date.getDay()]; 
    let monthName = monthsOfYear[date.getMonth()]; 
    
    return {
      day: day, 
      month: month, 
      year: year, 
      hours: hours, 
      minutes: minutes, 
      ampm: ampm,
      monthName: monthName, 
      dayOfWeek: dayOfWeek
    };
  };
  
  
  
  export { formatDate, getMonthAndYear, extractUUID, getCurrentDayDetails };
  