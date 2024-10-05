const OutwardCreate = require("../../models/InwardOutward/OutwardCreate");

const getOutward = async (outwardId) => {
  try {
    const outward = await OutwardCreate.findById(outwardId)
      .populate({
        path: "prepare_by",
        select:
          "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto inward_outward_signature",
      })
      .populate({
        path: "approvals_for.staff",
        select:
          "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto inward_outward_signature",
      })
      .select(
        "outward_type subject body image prepare_by approvals_for created_at outward_number"
      );

    return outward;
  } catch (e) {
    console.log(e);
  }
};

const inwardOutwardDataRequest = async (typeId, isType) => {
  let dt = null;

  if (isType === "OT") {
    dt = await getOutward(typeId);
  } else if (isType === "IN") {
    dt = await getOutward(typeId);
  } else {
    dt = await getOutward(typeId);
  }
  return { dt };
};
module.exports = inwardOutwardDataRequest;
