const InstituteAdmin = require("../../models/InstituteAdmin");
const Subject = require("../../models/Subject");

const getInstituteProfile = async (instituteId) => {
  try {
    const institute = await InstituteAdmin.findById(instituteId)
      .select(
        "insName insProfilePhoto insEditableText_one insEditableText_two affliatedLogo insAffiliated insEditableText insEditableTexts insEmail insAddress insPhoneNumber authority authority_signature autority_stamp_profile"
      )
      .lean()
      .exec();
    return institute;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const subjectDataRequest = async (subjectId) => {
  const subject = await Subject.findById(subjectId)
    .populate({
      path: "selected_batch_query",
      select: "batchName",
    })
    .populate({
      path: "class",
      populate: {
        path: "batch",
        select: "batchName",
      },
      select: "classTitle className batch institute department",
    })
    .populate({
      path: "class",
      populate: {
        path: "department",
        select: "dName",
      },
      select: "department classTitle className batch institute",
    })
    .populate({
      path: "subjectTeacherName",
      select: "staffFirstName staffMiddleName staffLastName",
    })
    .populate({
      path: "subjectMasterName",
      select: "course_code",
    });
  const dt = await getInstituteProfile(subject?.class?.institute);

  let current_subject_name = "";
  if (subject?.selected_batch_query?.batchName) {
    let dt = "";
    if (subject?.subject_category === "Practical") {
      dt = "P:";
    } else {
      dt = "T:";
    }
    dt = `${dt}${subject?.selected_batch_query?.batchName ?? ""} `;
    current_subject_name += dt;
  }
  current_subject_name += subject?.subjectName ?? "";

  return {
    subject_data: {
      current_subject_name: current_subject_name,
      subject: subject,
    },
    dt: dt,
  };
};
module.exports = subjectDataRequest;
