const Leave = require("../../models/Leave");
const Subject = require("../../models/Subject");
const Staff = require("../../models/Staff");

// const duumy_data = {
//   leave_number: "2024-09-01",
//   createdAt: "2024-10-14",
// };

const getLeaveData = async (leaveId) => {
  try {
    const leaves_data = await Leave.findById(leaveId).populate({
      path: "staff",
      populate: {
        path: "staff_department",
        select: "dName",
      },
      select:
        "staffFirstName staffLastName staffMiddleName current_designation inward_outward_signature",
    });

    // console.log("leaves_data", leaves_data);
    return leaves_data;
  } catch (e) {
    console.log(e);
  }
};

const staffLeaveRequestReportData = async (leaveId) => {
  let dt = null;
  dt = await getLeaveData(leaveId);
  let rep_data = [];

  if (dt?.is_replacement === "Yes" && dt?.leave_dates?.length > 0) {
    if (dt?.staff_replace_type === "Single") {
      for (let yt of dt?.leave_dates) {
        let sub = await Subject.findById(yt?.subject)
          .populate({
            path: "class",
            populate: {
              path: "batch",
              select: "batchName",
            },
            select: "className classTitle",
          })
          .populate({
            path: "selected_batch_query",
            select: "batchName",
          })
          .select("subjectName class selected_batch_query");
        const st = await Staff.findById(yt?.replace_staff).select(
          "staffFirstName staffLastName staffMiddleName"
        );
        let current_subject_name = "";
        if (sub?.selected_batch_query?.batchName) {
          let dt = "";
          if (sub?.subject_category === "Practical") {
            dt = "P:";
          } else {
            dt = "T:";
          }
          dt = `${dt}${sub?.selected_batch_query?.batchName ?? ""} `;
          current_subject_name += dt;
        }
        current_subject_name += sub?.subjectName ?? "";
        if (sub?.class?.classTitle) {
          current_subject_name += ` - ${sub?.class?.batch?.batchName ?? ""}`;
        }

        rep_data.push({
          date: yt?.date,
          cls: `${sub?.class?.classTitle}`,
          subject: current_subject_name,
          time: `${yt?.from},${yt?.to}`,
          staff: `${st?.staffFirstName ?? ""} ${st?.staffMiddleName ?? ""} ${
            st?.staffLastName ?? ""
          }`,
        });
      }
    } else {
      const st = await Staff.findById(
        dt?.leave_dates?.[0]?.replace_staff
      ).select("staffFirstName staffLastName staffMiddleName");
      rep_data = `${st?.staffFirstName ?? ""} ${st?.staffMiddleName ?? ""} ${
        st?.staffLastName ?? ""
      }`;
    }
  }
  // console.log(rep_data);
  return { dt: dt, rep_data };
};
module.exports = staffLeaveRequestReportData;
