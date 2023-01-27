const InstituteAdmin = require("../models/InstituteAdmin");
const Batch = require("../models/Batch");
const Class = require("../models/Class");

const general_function = async (oldData, newData, batch) => {
  if (oldData?.caste === "General" && newData?.caste === "OBC") {
    batch.student_category.obcCount += 1;
    batch.student_category.generalCount -= 1;
  } else if (oldData?.caste === "General" && newData?.caste === "SC") {
    batch.student_category.scCount += 1;
    batch.student_category.generalCount -= 1;
  } else if (oldData?.caste === "General" && newData?.caste === "ST") {
    batch.student_category.stCount += 1;
    batch.student_category.generalCount -= 1;
  } else if (oldData?.caste === "General" && newData?.caste === "NT-A") {
    batch.student_category.ntaCount += 1;
    batch.student_category.generalCount -= 1;
  } else if (oldData?.caste === "General" && newData?.caste === "NT-B") {
    batch.student_category.ntbCount += 1;
    batch.student_category.generalCount -= 1;
  } else if (oldData?.caste === "General" && newData?.caste === "NT-C") {
    batch.student_category.ntcCount += 1;
    batch.student_category.generalCount -= 1;
  } else if (oldData?.caste === "General" && newData?.caste === "NT-D") {
    batch.student_category.ntdCount += 1;
    batch.student_category.generalCount -= 1;
  } else if (oldData?.caste === "General" && newData?.caste === "VJ") {
    batch.student_category.vjCount += 1;
    batch.student_category.generalCount -= 1;
  } else {
  }
  await batch.save();
};

const obc_function = async (oldData, newData, batch) => {
  if (oldData?.caste === "OBC" && newData?.caste === "General") {
    batch.student_category.generalCount += 1;
    batch.student_category.obcCount -= 1;
  } else if (oldData?.caste === "OBC" && newData?.caste === "SC") {
    batch.student_category.scCount += 1;
    batch.student_category.obcCount -= 1;
  } else if (oldData?.caste === "OBC" && newData?.caste === "ST") {
    batch.student_category.stCount += 1;
    batch.student_category.obcCount -= 1;
  } else if (oldData?.caste === "OBC" && newData?.caste === "NT-A") {
    batch.student_category.ntaCount += 1;
    batch.student_category.obcCount -= 1;
  } else if (oldData?.caste === "OBC" && newData?.caste === "NT-B") {
    batch.student_category.ntbCount += 1;
    batch.student_category.obcCount -= 1;
  } else if (oldData?.caste === "OBC" && newData?.caste === "NT-C") {
    batch.student_category.ntcCount += 1;
    batch.student_category.obcCount -= 1;
  } else if (oldData?.caste === "OBC" && newData?.caste === "NT-D") {
    batch.student_category.ntdCount += 1;
    batch.student_category.obcCount -= 1;
  } else if (oldData?.caste === "OBC" && newData?.caste === "VJ") {
    batch.student_category.vjCount += 1;
    batch.student_category.obcCount -= 1;
  } else {
  }
  await batch.save();
};

const sc_function = async (oldData, newData, batch) => {
  if (oldData?.caste === "SC" && newData?.caste === "General") {
    batch.student_category.generalCount += 1;
    batch.student_category.scCount -= 1;
  } else if (oldData?.caste === "SC" && newData?.caste === "OBC") {
    batch.student_category.obcCount += 1;
    batch.student_category.scCount -= 1;
  } else if (oldData?.caste === "SC" && newData?.caste === "ST") {
    batch.student_category.stCount += 1;
    batch.student_category.scCount -= 1;
  } else if (oldData?.caste === "SC" && newData?.caste === "NT-A") {
    batch.student_category.ntaCount += 1;
    batch.student_category.scCount -= 1;
  } else if (oldData?.caste === "SC" && newData?.caste === "NT-B") {
    batch.student_category.ntbCount += 1;
    batch.student_category.scCount -= 1;
  } else if (oldData?.caste === "SC" && newData?.caste === "NT-C") {
    batch.student_category.ntcCount += 1;
    batch.student_category.scCount -= 1;
  } else if (oldData?.caste === "SC" && newData?.caste === "NT-D") {
    batch.student_category.ntdCount += 1;
    batch.student_category.scCount -= 1;
  } else if (oldData?.caste === "SC" && newData?.caste === "VJ") {
    batch.student_category.vjCount += 1;
    batch.student_category.scCount -= 1;
  } else {
  }
  await batch.save();
};

const st_function = async (oldData, newData, batch) => {
  if (oldData?.caste === "ST" && newData?.caste === "General") {
    batch.student_category.generalCount += 1;
    batch.student_category.stCount -= 1;
  } else if (oldData?.caste === "ST" && newData?.caste === "OBC") {
    batch.student_category.obcCount += 1;
    batch.student_category.stCount -= 1;
  } else if (oldData?.caste === "ST" && newData?.caste === "SC") {
    batch.student_category.scCount += 1;
    batch.student_category.stCount -= 1;
  } else if (oldData?.caste === "ST" && newData?.caste === "NT-A") {
    batch.student_category.ntaCount += 1;
    batch.student_category.stCount -= 1;
  } else if (oldData?.caste === "ST" && newData?.caste === "NT-B") {
    batch.student_category.ntbCount += 1;
    batch.student_category.stCount -= 1;
  } else if (oldData?.caste === "ST" && newData?.caste === "NT-C") {
    batch.student_category.ntcCount += 1;
    batch.student_category.stCount -= 1;
  } else if (oldData?.caste === "ST" && newData?.caste === "NT-D") {
    batch.student_category.ntdCount += 1;
    batch.student_category.stCount -= 1;
  } else if (oldData?.caste === "ST" && newData?.caste === "VJ") {
    batch.student_category.vjCount += 1;
    batch.student_category.stCount -= 1;
  } else {
  }
  await batch.save();
};

const nta_function = async (oldData, newData, batch) => {
  if (oldData?.caste === "NT-A" && newData?.caste === "General") {
    batch.student_category.generalCount += 1;
    batch.student_category.ntaCount -= 1;
  } else if (oldData?.caste === "NT-A" && newData?.caste === "OBC") {
    batch.student_category.obcCount += 1;
    batch.student_category.ntaCount -= 1;
  } else if (oldData?.caste === "NT-A" && newData?.caste === "SC") {
    batch.student_category.scCount += 1;
    batch.student_category.ntaCount -= 1;
  } else if (oldData?.caste === "NT-A" && newData?.caste === "ST") {
    batch.student_category.stCount += 1;
    batch.student_category.ntaCount -= 1;
  } else if (oldData?.caste === "NT-A" && newData?.caste === "NT-B") {
    batch.student_category.ntbCount += 1;
    batch.student_category.ntaCount -= 1;
  } else if (oldData?.caste === "NT-A" && newData?.caste === "NT-C") {
    batch.student_category.ntcCount += 1;
    batch.student_category.ntaCount -= 1;
  } else if (oldData?.caste === "NT-A" && newData?.caste === "NT-D") {
    batch.student_category.ntdCount += 1;
    batch.student_category.ntaCount -= 1;
  } else if (oldData?.caste === "NT-A" && newData?.caste === "VJ") {
    batch.student_category.vjCount += 1;
    batch.student_category.ntaCount -= 1;
  } else {
  }
  await batch.save();
};

const ntb_function = async (oldData, newData, batch) => {
  if (oldData?.caste === "NT-B" && newData?.caste === "General") {
    batch.student_category.generalCount += 1;
    batch.student_category.ntbCount -= 1;
  } else if (oldData?.caste === "NT-B" && newData?.caste === "OBC") {
    batch.student_category.obcCount += 1;
    batch.student_category.ntbCount -= 1;
  } else if (oldData?.caste === "NT-B" && newData?.caste === "SC") {
    batch.student_category.scCount += 1;
    batch.student_category.ntbCount -= 1;
  } else if (oldData?.caste === "NT-B" && newData?.caste === "ST") {
    batch.student_category.stCount += 1;
    batch.student_category.ntbCount -= 1;
  } else if (oldData?.caste === "NT-B" && newData?.caste === "NT-A") {
    batch.student_category.ntaCount += 1;
    batch.student_category.ntbCount -= 1;
  } else if (oldData?.caste === "NT-B" && newData?.caste === "NT-C") {
    batch.student_category.ntcCount += 1;
    batch.student_category.ntbCount -= 1;
  } else if (oldData?.caste === "NT-B" && newData?.caste === "NT-D") {
    batch.student_category.ntdCount += 1;
    batch.student_category.ntbCount -= 1;
  } else if (oldData?.caste === "NT-B" && newData?.caste === "VJ") {
    batch.student_category.vjCount += 1;
    batch.student_category.ntbCount -= 1;
  } else {
  }
  await batch.save();
};

const ntc_function = async (oldData, newData, batch) => {
  if (oldData?.caste === "NT-C" && newData?.caste === "General") {
    batch.student_category.generalCount += 1;
    batch.student_category.ntcCount -= 1;
  } else if (oldData?.caste === "NT-C" && newData?.caste === "OBC") {
    batch.student_category.obcCount += 1;
    batch.student_category.ntcCount -= 1;
  } else if (oldData?.caste === "NT-C" && newData?.caste === "SC") {
    batch.student_category.scCount += 1;
    batch.student_category.ntcCount -= 1;
  } else if (oldData?.caste === "NT-C" && newData?.caste === "ST") {
    batch.student_category.stCount += 1;
    batch.student_category.ntcCount -= 1;
  } else if (oldData?.caste === "NT-C" && newData?.caste === "NT-A") {
    batch.student_category.ntaCount += 1;
    batch.student_category.ntcCount -= 1;
  } else if (oldData?.caste === "NT-C" && newData?.caste === "NT-B") {
    batch.student_category.ntbCount += 1;
    batch.student_category.ntcCount -= 1;
  } else if (oldData?.caste === "NT-C" && newData?.caste === "NT-D") {
    batch.student_category.ntdCount += 1;
    batch.student_category.ntcCount -= 1;
  } else if (oldData?.caste === "NT-C" && newData?.caste === "VJ") {
    batch.student_category.vjCount += 1;
    batch.student_category.ntcCount -= 1;
  } else {
  }
  await batch.save();
};

const ntd_function = async (oldData, newData, batch) => {
  if (oldData?.caste === "NT-D" && newData?.caste === "General") {
    batch.student_category.generalCount += 1;
    batch.student_category.ntdCount -= 1;
  } else if (oldData?.caste === "NT-D" && newData?.caste === "OBC") {
    batch.student_category.obcCount += 1;
    batch.student_category.ntdCount -= 1;
  } else if (oldData?.caste === "NT-D" && newData?.caste === "SC") {
    batch.student_category.scCount += 1;
    batch.student_category.ntdCount -= 1;
  } else if (oldData?.caste === "NT-D" && newData?.caste === "ST") {
    batch.student_category.stCount += 1;
    batch.student_category.ntdCount -= 1;
  } else if (oldData?.caste === "NT-D" && newData?.caste === "NT-A") {
    batch.student_category.ntaCount += 1;
    batch.student_category.ntdCount -= 1;
  } else if (oldData?.caste === "NT-D" && newData?.caste === "NT-B") {
    batch.student_category.ntbCount += 1;
    batch.student_category.ntdCount -= 1;
  } else if (oldData?.caste === "NT-D" && newData?.caste === "NT-C") {
    batch.student_category.ntcCount += 1;
    batch.student_category.ntdCount -= 1;
  } else if (oldData?.caste === "NT-D" && newData?.caste === "VJ") {
    batch.student_category.vjCount += 1;
    batch.student_category.ntdCount -= 1;
  } else {
  }
  await batch.save();
};

const vj_function = async (oldData, newData, batch) => {
  if (oldData?.caste === "VJ" && newData?.caste === "General") {
    batch.student_category.generalCount += 1;
    batch.student_category.vjCount -= 1;
  } else if (oldData?.caste === "VJ" && newData?.caste === "OBC") {
    batch.student_category.obcCount += 1;
    batch.student_category.vjCount -= 1;
  } else if (oldData?.caste === "VJ" && newData?.caste === "SC") {
    batch.student_category.scCount += 1;
    batch.student_category.vjCount -= 1;
  } else if (oldData?.caste === "VJ" && newData?.caste === "ST") {
    batch.student_category.stCount += 1;
    batch.student_category.vjCount -= 1;
  } else if (oldData?.caste === "VJ" && newData?.caste === "NT-A") {
    batch.student_category.ntaCount += 1;
    batch.student_category.vjCount -= 1;
  } else if (oldData?.caste === "VJ" && newData?.caste === "NT-B") {
    batch.student_category.ntbCount += 1;
    batch.student_category.vjCount -= 1;
  } else if (oldData?.caste === "VJ" && newData?.caste === "NT-C") {
    batch.student_category.ntcCount += 1;
    batch.student_category.vjCount -= 1;
  } else if (oldData?.caste === "VJ" && newData?.caste === "NT-D") {
    batch.student_category.ntdCount += 1;
    batch.student_category.vjCount -= 1;
  } else {
  }
  await batch.save();
};

exports.chart_category_student = async (sargs, flow, oldData, newData, cargs) => {
  try {
    if (flow === "Edit_Student") {
      const batch = await Batch.findById({ _id: sargs });
      const classes = await Class.findById({ _id: cargs})
      if (oldData?.gender === "Male" && newData?.gender === "Female") {
        batch.student_category.girlCount += 1;
        batch.student_category.boyCount -= 1;
        classes.girlCount += 1;
      } else if (oldData?.gender === "Female" && newData?.gender === "Male") {
        batch.student_category.boyCount += 1;
        batch.student_category.girlCount -= 1;
        classes.boyCount += 1;
      } else if (oldData?.gender === "Male" && newData?.gender === "Other") {
        batch.student_category.otherCount += 1;
        batch.student_category.boyCount -= 1;
        classes.otherCount += 1;
      } else if (oldData?.gender === "Female" && newData?.gender === "Other") {
        batch.student_category.otherCount += 1;
        batch.student_category.girlCount -= 1;
        classes.otherCount += 1;
      } else if (oldData?.gender === "Other" && newData?.gender === "Male") {
        batch.student_category.boyCount += 1;
        batch.student_category.otherCount -= 1;
        classes.boyCount += 1;
      } else if (oldData?.gender === "Other" && newData?.gender === "Female") {
        batch.student_category.girlCount += 1;
        batch.student_category.otherCount -= 1;
        classes.girlCount += 1;
      }
      await batch.save();
      if (oldData?.caste === "General") {
        await general_function(oldData, newData, batch);
      } else if (oldData?.caste === "OBC") {
        await obc_function(oldData, newData, batch);
      } else if (oldData?.caste === "SC") {
        await sc_function(oldData, newData, batch);
      } else if (oldData?.caste === "ST") {
        await st_function(oldData, newData, batch);
      } else if (oldData?.caste === "NT-A") {
        await nta_function(oldData, newData, batch);
      } else if (oldData?.caste === "NT-B") {
        await ntb_function(oldData, newData, batch);
      } else if (oldData?.caste === "NT-C") {
        await ntc_function(oldData, newData, batch);
      } else if (oldData?.caste === "NT-D") {
        await ntd_function(oldData, newData, batch);
      } else if (oldData?.caste === "VJ") {
        await vj_function(oldData, newData, batch);
      } 
      else{
        if (newData?.caste === "General") {
          batch.student_category.generalCount += 1;
        } else if (newData?.caste === "OBC") {
          batch.student_category.obcCount += 1;
        } else if (newData?.caste === "SC") {
          batch.student_category.scCount += 1;
        } else if (newData?.caste === "ST") {
          batch.student_category.stCount += 1;
        } else if (newData?.caste === "NT-A") {
          batch.student_category.ntaCount += 1;
        } else if (newData?.caste === "NT-B") {
          batch.student_category.ntbCount += 1;
        } else if (newData?.caste === "NT-C") {
          batch.student_category.ntcCount += 1;
        } else if (newData?.caste === "NT-D") {
          batch.student_category.ntdCount += 1;
        } else if (newData?.caste === "VJ") {
          batch.student_category.vjCount += 1;
        } else {
        }
      }
      await Promise.all([classes.save(), batch.save()]);
      oldData.gender = "";
      oldData.caste = "";
      newData.gender = "";
      newData.caste = "";
      console.log(batch.student_category);
    }
  } catch (e) {
    console.log(e);
  }
};

