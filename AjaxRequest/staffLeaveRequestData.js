const Admission = require("../models/Admission/Admission");
const NewApplication = require("../models/Admission/NewApplication");
const Batch = require("../models/Batch");
const Student = require("../models/Student");

const duumy_data = [
  {
    key_label: "Leave Record Number",
    key_value: "CL2402158",
  },
  {
    key_label: "Post Dated",
    key_value: "Yes",
  },
  {
    key_label: "Employee Name & Code",
    key_value: "Vrushali Shetye (M. Shetye), PT202200142",
  },
  {
    key_label: "University Employee Code",
    key_value: "HEY",
  },
  {
    key_label: "Employee Organization Unit",
    key_value: "Accounts Section",
  },
  {
    key_label: "Designation",
    key_value: "Clerk-Cum-Typist",
  },
  {
    key_label: "Leave Type",
    key_value: "CASUAL LEAVE",
  },
  {
    key_label: "Leave Status",
    key_value: "New Request",
  },
  {
    key_label: "From",
    key_value: "Jul 10, 2024 (10 AM)",
  },
  {
    key_label: "To",
    key_value: "Jul 10, 2024 (6 PM)",
  },
  {
    key_label: "Prefix",
    key_value: "HEY",
  },
  {
    key_label: "Suffix",
    key_value: "HEY",
  },
  {
    key_label: "Leave Created Date",
    key_value: "Jul 29, 2024 14:09:29",
  },
  {
    key_label: "Total Days applied for Leave",
    key_value: "1",
  },
  {
    key_label: "Reason / Description",
    key_value: "Personal Work",
  },
  {
    key_label: "Purpose",
    key_value: "Personal",
  },
  {
    key_label: "Station Leave",
    key_value: "No",
  },
  {
    key_label: "Combined Leave",
    key_value: "No",
  },
  {
    key_label: "University/Institution Name & Address",
    key_value: "HEY",
  },
  {
    key_label: "Teaching Assignment",
    key_value: "HEY",
  },
  {
    key_label: "Teaching Arrangement",
    key_value: "HEY",
  },
  {
    key_label: "Financial Obligation",
    key_value: "HEY",
  },
  {
    key_label: "Financial Assistance",
    key_value: "N/A",
  },
  {
    key_label: "Amount in INR",
    key_value: "HEY",
  },
  {
    key_label: "Invitation",
    key_value: "No Invitation File",
  },
  {
    key_label: "Supporting Document",
    key_value: "No Upload File",
  },
  {
    key_label: "Leave Recommendation Status",
    key_value: "HEY",
  },
  {
    key_label: "Recommended By",
    key_value: "HEY",
  },
  {
    key_label: "Recommended On",
    key_value: "HEY",
  },

  {
    key_label: "Recommend Remarks",
    key_value: "HEY",
  },
  {
    key_label: "Sanction Remarks",
    key_value: "HEY",
  },
  {
    key_label: "Sanctioned By",
    key_value: "HEY",
  },
  {
    key_label: "Sanctioned On",
    key_value: "HEY",
  },
  {
    key_label: "Rejected By",
    key_value: "HEY",
  },
  {
    key_label: "Rejected On",
    key_value: "HEY",
  },
  {
    key_label: "Cancelled By",
    key_value: "HEY",
  },
  {
    key_label: "Cancelled On",
    key_value: "HEY",
  },
];

const staffLeaveRequestData = async (admissionId = "", batchId = "") => {
  // const dt = await admissionIntakeQuery(admissionId, batchId);
  return { dt: duumy_data };
};
module.exports = staffLeaveRequestData;
