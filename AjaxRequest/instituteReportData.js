const InstituteAdmin = require("../models/InstituteAdmin");

const getInstituteProfile = async (instituteId) => {
  try {
    const institute = await InstituteAdmin.findById(instituteId)
      .select(
        "insName name insProfilePhoto insEditableText_one insEditableText_two affliatedLogo insAffiliated insEditableText insEditableTexts insEmail insAddress insPhoneNumber authority authority_signature autority_stamp_profile"
      )
      .lean()
      .exec();
    return institute;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const instituteReportData = async (instituteId) => {
  const dt = await getInstituteProfile(instituteId);
  return {
    dt: dt,
  };
};
module.exports = instituteReportData;
