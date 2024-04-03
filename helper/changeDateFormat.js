
const changeDateFormat = (timestamp) => {
    const date = new Date(timestamp);
    const options = { day: "numeric", month: "short", year: "numeric" };
  
    const formattedDate = date
      .toLocaleDateString("en-GB", options)
      .replace(",", "");
    return formattedDate;
  };
  module.exports = changeDateFormat;
  