const Class = require("../../models/Class");
const InstituteAdmin = require("../../models/InstituteAdmin");

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

const clsTheoryPracticalDataRequest = async (clsId) => {
  const cls = await Class.findById(clsId)
    .populate({
      path: "batch",
      select: "batchName",
    })
    .populate({
      path: "department",
      select: "dName",
    })
    .populate({
      path: "classTeacher",
      select: "staffFirstName staffMiddleName staffLastName",
    })
    .select("institute className classTitle studentCount");
  const dt = await getInstituteProfile(cls?.institute);

  return {
    cls: cls,
    dt: dt,
  };
};
module.exports = clsTheoryPracticalDataRequest;
