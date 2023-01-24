const InstituteAdmin = require("../../models/InstituteAdmin");

exports.chart_category = async (args, flow, oldData, newData) => {
  try {
    if (flow === "Edit_Staff") {
      const institute = await InstituteAdmin.findById({ _id: args });
      if (oldData?.gender === "Male" && newData?.gender === "Female") {
        institute.staff_category.girlCount += 1;
      } else if (oldData?.gender === "Female" && newData?.gender === "Male") {
        institute.staff_category.boyCount += 1;
      } else if (oldData?.gender === "Male" && newData?.gender === "Other") {
        institute.staff_category.otherCount += 1;
      } else if (oldData?.gender === "Female" && newData?.gender === "Other") {
        institute.staff_category.otherCount += 1;
      } else if (oldData?.gender === "Other" && newData?.gender === "Male") {
        institute.staff_category.boyCount += 1;
      } else if (oldData?.gender === "Other" && newData?.gender === "Female") {
        institute.staff_category.girlCount += 1;
      }
      if (source.staffCastCategory === "General") {
        institute.staff_category.generalCount += 1;
      } else if (source.staffCastCategory === "OBC") {
        institute.staff_category.obcCount += 1;
      } else if (source.staffCastCategory === "SC") {
        institute.staff_category.scCount += 1;
      } else if (source.staffCastCategory === "ST") {
        institute.staff_category.stCount += 1;
      } else if (source.staffCastCategory === "NT-A") {
        institute.staff_category.ntaCount += 1;
      } else if (source.staffCastCategory === "NT-B") {
        institute.staff_category.ntbCount += 1;
      } else if (source.staffCastCategory === "NT-C") {
        institute.staff_category.ntcCount += 1;
      } else if (source.staffCastCategory === "NT-D") {
        institute.staff_category.ntdCount += 1;
      } else if (source.staffCastCategory === "VJ") {
        institute.staff_category.vjCount += 1;
      } else {
      }
      await Promise.all([institute.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};
