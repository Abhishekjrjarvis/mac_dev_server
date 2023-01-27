const InstituteAdmin = require("../models/InstituteAdmin");

const general_function = async (oldData, newData, institute) => {
  if (oldData?.caste === "General" && newData?.caste === "OBC") {
    institute.staff_category.obcCount += 1;
    institute.staff_category.generalCount -= 1;
  } else if (oldData?.caste === "General" && newData?.caste === "SC") {
    institute.staff_category.scCount += 1;
    institute.staff_category.generalCount -= 1;
  } else if (oldData?.caste === "General" && newData?.caste === "ST") {
    institute.staff_category.stCount += 1;
    institute.staff_category.generalCount -= 1;
  } else if (oldData?.caste === "General" && newData?.caste === "NT-A") {
    institute.staff_category.ntaCount += 1;
    institute.staff_category.generalCount -= 1;
  } else if (oldData?.caste === "General" && newData?.caste === "NT-B") {
    institute.staff_category.ntbCount += 1;
    institute.staff_category.generalCount -= 1;
  } else if (oldData?.caste === "General" && newData?.caste === "NT-C") {
    institute.staff_category.ntcCount += 1;
    institute.staff_category.generalCount -= 1;
  } else if (oldData?.caste === "General" && newData?.caste === "NT-D") {
    institute.staff_category.ntdCount += 1;
    institute.staff_category.generalCount -= 1;
  } else if (oldData?.caste === "General" && newData?.caste === "VJ") {
    institute.staff_category.vjCount += 1;
    institute.staff_category.generalCount -= 1;
  } else {
  }
  await institute.save();
};

const obc_function = async (oldData, newData, institute) => {
  if (oldData?.caste === "OBC" && newData?.caste === "General") {
    institute.staff_category.generalCount += 1;
    institute.staff_category.obcCount -= 1;
  } else if (oldData?.caste === "OBC" && newData?.caste === "SC") {
    institute.staff_category.scCount += 1;
    institute.staff_category.obcCount -= 1;
  } else if (oldData?.caste === "OBC" && newData?.caste === "ST") {
    institute.staff_category.stCount += 1;
    institute.staff_category.obcCount -= 1;
  } else if (oldData?.caste === "OBC" && newData?.caste === "NT-A") {
    institute.staff_category.ntaCount += 1;
    institute.staff_category.obcCount -= 1;
  } else if (oldData?.caste === "OBC" && newData?.caste === "NT-B") {
    institute.staff_category.ntbCount += 1;
    institute.staff_category.obcCount -= 1;
  } else if (oldData?.caste === "OBC" && newData?.caste === "NT-C") {
    institute.staff_category.ntcCount += 1;
    institute.staff_category.obcCount -= 1;
  } else if (oldData?.caste === "OBC" && newData?.caste === "NT-D") {
    institute.staff_category.ntdCount += 1;
    institute.staff_category.obcCount -= 1;
  } else if (oldData?.caste === "OBC" && newData?.caste === "VJ") {
    institute.staff_category.vjCount += 1;
    institute.staff_category.obcCount -= 1;
  } else {
  }
  await institute.save();
};

const sc_function = async (oldData, newData, institute) => {
  if (oldData?.caste === "SC" && newData?.caste === "General") {
    institute.staff_category.generalCount += 1;
    institute.staff_category.scCount -= 1;
  } else if (oldData?.caste === "SC" && newData?.caste === "OBC") {
    institute.staff_category.obcCount += 1;
    institute.staff_category.scCount -= 1;
  } else if (oldData?.caste === "SC" && newData?.caste === "ST") {
    institute.staff_category.stCount += 1;
    institute.staff_category.scCount -= 1;
  } else if (oldData?.caste === "SC" && newData?.caste === "NT-A") {
    institute.staff_category.ntaCount += 1;
    institute.staff_category.scCount -= 1;
  } else if (oldData?.caste === "SC" && newData?.caste === "NT-B") {
    institute.staff_category.ntbCount += 1;
    institute.staff_category.scCount -= 1;
  } else if (oldData?.caste === "SC" && newData?.caste === "NT-C") {
    institute.staff_category.ntcCount += 1;
    institute.staff_category.scCount -= 1;
  } else if (oldData?.caste === "SC" && newData?.caste === "NT-D") {
    institute.staff_category.ntdCount += 1;
    institute.staff_category.scCount -= 1;
  } else if (oldData?.caste === "SC" && newData?.caste === "VJ") {
    institute.staff_category.vjCount += 1;
    institute.staff_category.scCount -= 1;
  } else {
  }
  await institute.save();
};

const st_function = async (oldData, newData, institute) => {
  if (oldData?.caste === "ST" && newData?.caste === "General") {
    institute.staff_category.generalCount += 1;
    institute.staff_category.stCount -= 1;
  } else if (oldData?.caste === "ST" && newData?.caste === "OBC") {
    institute.staff_category.obcCount += 1;
    institute.staff_category.stCount -= 1;
  } else if (oldData?.caste === "ST" && newData?.caste === "SC") {
    institute.staff_category.scCount += 1;
    institute.staff_category.stCount -= 1;
  } else if (oldData?.caste === "ST" && newData?.caste === "NT-A") {
    institute.staff_category.ntaCount += 1;
    institute.staff_category.stCount -= 1;
  } else if (oldData?.caste === "ST" && newData?.caste === "NT-B") {
    institute.staff_category.ntbCount += 1;
    institute.staff_category.stCount -= 1;
  } else if (oldData?.caste === "ST" && newData?.caste === "NT-C") {
    institute.staff_category.ntcCount += 1;
    institute.staff_category.stCount -= 1;
  } else if (oldData?.caste === "ST" && newData?.caste === "NT-D") {
    institute.staff_category.ntdCount += 1;
    institute.staff_category.stCount -= 1;
  } else if (oldData?.caste === "ST" && newData?.caste === "VJ") {
    institute.staff_category.vjCount += 1;
    institute.staff_category.stCount -= 1;
  } else {
  }
  await institute.save();
};

const nta_function = async (oldData, newData, institute) => {
  if (oldData?.caste === "NT-A" && newData?.caste === "General") {
    institute.staff_category.generalCount += 1;
    institute.staff_category.ntaCount -= 1;
  } else if (oldData?.caste === "NT-A" && newData?.caste === "OBC") {
    institute.staff_category.obcCount += 1;
    institute.staff_category.ntaCount -= 1;
  } else if (oldData?.caste === "NT-A" && newData?.caste === "SC") {
    institute.staff_category.scCount += 1;
    institute.staff_category.ntaCount -= 1;
  } else if (oldData?.caste === "NT-A" && newData?.caste === "ST") {
    institute.staff_category.stCount += 1;
    institute.staff_category.ntaCount -= 1;
  } else if (oldData?.caste === "NT-A" && newData?.caste === "NT-B") {
    institute.staff_category.ntbCount += 1;
    institute.staff_category.ntaCount -= 1;
  } else if (oldData?.caste === "NT-A" && newData?.caste === "NT-C") {
    institute.staff_category.ntcCount += 1;
    institute.staff_category.ntaCount -= 1;
  } else if (oldData?.caste === "NT-A" && newData?.caste === "NT-D") {
    institute.staff_category.ntdCount += 1;
    institute.staff_category.ntaCount -= 1;
  } else if (oldData?.caste === "NT-A" && newData?.caste === "VJ") {
    institute.staff_category.vjCount += 1;
    institute.staff_category.ntaCount -= 1;
  } else {
  }
  await institute.save();
};

const ntb_function = async (oldData, newData, institute) => {
  if (oldData?.caste === "NT-B" && newData?.caste === "General") {
    institute.staff_category.generalCount += 1;
    institute.staff_category.ntbCount -= 1;
  } else if (oldData?.caste === "NT-B" && newData?.caste === "OBC") {
    institute.staff_category.obcCount += 1;
    institute.staff_category.ntbCount -= 1;
  } else if (oldData?.caste === "NT-B" && newData?.caste === "SC") {
    institute.staff_category.scCount += 1;
    institute.staff_category.ntbCount -= 1;
  } else if (oldData?.caste === "NT-B" && newData?.caste === "ST") {
    institute.staff_category.stCount += 1;
    institute.staff_category.ntbCount -= 1;
  } else if (oldData?.caste === "NT-B" && newData?.caste === "NT-A") {
    institute.staff_category.ntaCount += 1;
    institute.staff_category.ntbCount -= 1;
  } else if (oldData?.caste === "NT-B" && newData?.caste === "NT-C") {
    institute.staff_category.ntcCount += 1;
    institute.staff_category.ntbCount -= 1;
  } else if (oldData?.caste === "NT-B" && newData?.caste === "NT-D") {
    institute.staff_category.ntdCount += 1;
    institute.staff_category.ntbCount -= 1;
  } else if (oldData?.caste === "NT-B" && newData?.caste === "VJ") {
    institute.staff_category.vjCount += 1;
    institute.staff_category.ntbCount -= 1;
  } else {
  }
  await institute.save();
};

const ntc_function = async (oldData, newData, institute) => {
  if (oldData?.caste === "NT-C" && newData?.caste === "General") {
    institute.staff_category.generalCount += 1;
    institute.staff_category.ntcCount -= 1;
  } else if (oldData?.caste === "NT-C" && newData?.caste === "OBC") {
    institute.staff_category.obcCount += 1;
    institute.staff_category.ntcCount -= 1;
  } else if (oldData?.caste === "NT-C" && newData?.caste === "SC") {
    institute.staff_category.scCount += 1;
    institute.staff_category.ntcCount -= 1;
  } else if (oldData?.caste === "NT-C" && newData?.caste === "ST") {
    institute.staff_category.stCount += 1;
    institute.staff_category.ntcCount -= 1;
  } else if (oldData?.caste === "NT-C" && newData?.caste === "NT-A") {
    institute.staff_category.ntaCount += 1;
    institute.staff_category.ntcCount -= 1;
  } else if (oldData?.caste === "NT-C" && newData?.caste === "NT-B") {
    institute.staff_category.ntbCount += 1;
    institute.staff_category.ntcCount -= 1;
  } else if (oldData?.caste === "NT-C" && newData?.caste === "NT-D") {
    institute.staff_category.ntdCount += 1;
    institute.staff_category.ntcCount -= 1;
  } else if (oldData?.caste === "NT-C" && newData?.caste === "VJ") {
    institute.staff_category.vjCount += 1;
    institute.staff_category.ntcCount -= 1;
  } else {
  }
  await institute.save();
};

const ntd_function = async (oldData, newData, institute) => {
  if (oldData?.caste === "NT-D" && newData?.caste === "General") {
    institute.staff_category.generalCount += 1;
    institute.staff_category.ntdCount -= 1;
  } else if (oldData?.caste === "NT-D" && newData?.caste === "OBC") {
    institute.staff_category.obcCount += 1;
    institute.staff_category.ntdCount -= 1;
  } else if (oldData?.caste === "NT-D" && newData?.caste === "SC") {
    institute.staff_category.scCount += 1;
    institute.staff_category.ntdCount -= 1;
  } else if (oldData?.caste === "NT-D" && newData?.caste === "ST") {
    institute.staff_category.stCount += 1;
    institute.staff_category.ntdCount -= 1;
  } else if (oldData?.caste === "NT-D" && newData?.caste === "NT-A") {
    institute.staff_category.ntaCount += 1;
    institute.staff_category.ntdCount -= 1;
  } else if (oldData?.caste === "NT-D" && newData?.caste === "NT-B") {
    institute.staff_category.ntbCount += 1;
    institute.staff_category.ntdCount -= 1;
  } else if (oldData?.caste === "NT-D" && newData?.caste === "NT-C") {
    institute.staff_category.ntcCount += 1;
    institute.staff_category.ntdCount -= 1;
  } else if (oldData?.caste === "NT-D" && newData?.caste === "VJ") {
    institute.staff_category.vjCount += 1;
    institute.staff_category.ntdCount -= 1;
  } else {
  }
  await institute.save();
};

const vj_function = async (oldData, newData, institute) => {
  if (oldData?.caste === "VJ" && newData?.caste === "General") {
    institute.staff_category.generalCount += 1;
    institute.staff_category.vjCount -= 1;
  } else if (oldData?.caste === "VJ" && newData?.caste === "OBC") {
    institute.staff_category.obcCount += 1;
    institute.staff_category.vjCount -= 1;
  } else if (oldData?.caste === "VJ" && newData?.caste === "SC") {
    institute.staff_category.scCount += 1;
    institute.staff_category.vjCount -= 1;
  } else if (oldData?.caste === "VJ" && newData?.caste === "ST") {
    institute.staff_category.stCount += 1;
    institute.staff_category.vjCount -= 1;
  } else if (oldData?.caste === "VJ" && newData?.caste === "NT-A") {
    institute.staff_category.ntaCount += 1;
    institute.staff_category.vjCount -= 1;
  } else if (oldData?.caste === "VJ" && newData?.caste === "NT-B") {
    institute.staff_category.ntbCount += 1;
    institute.staff_category.vjCount -= 1;
  } else if (oldData?.caste === "VJ" && newData?.caste === "NT-C") {
    institute.staff_category.ntcCount += 1;
    institute.staff_category.vjCount -= 1;
  } else if (oldData?.caste === "VJ" && newData?.caste === "NT-D") {
    institute.staff_category.ntdCount += 1;
    institute.staff_category.vjCount -= 1;
  } else {
  }
  await institute.save();
};

exports.chart_category = async (args, flow, oldData, newData) => {
  try {
    if (flow === "Edit_Staff") {
      const institute = await InstituteAdmin.findById({ _id: args });
      if (oldData?.gender === "Male" && newData?.gender === "Female") {
        institute.staff_category.girlCount += 1;
        institute.staff_category.boyCount -= 1;
      } else if (oldData?.gender === "Female" && newData?.gender === "Male") {
        institute.staff_category.boyCount += 1;
        institute.staff_category.girlCount -= 1;
      } else if (oldData?.gender === "Male" && newData?.gender === "Other") {
        institute.staff_category.otherCount += 1;
        institute.staff_category.boyCount -= 1;
      } else if (oldData?.gender === "Female" && newData?.gender === "Other") {
        institute.staff_category.otherCount += 1;
        institute.staff_category.girlCount -= 1;
      } else if (oldData?.gender === "Other" && newData?.gender === "Male") {
        institute.staff_category.boyCount += 1;
        institute.staff_category.otherCount -= 1;
      } else if (oldData?.gender === "Other" && newData?.gender === "Female") {
        institute.staff_category.girlCount += 1;
        institute.staff_category.otherCount -= 1;
      }
      await institute.save();
      if (oldData?.caste === "General") {
        await general_function(oldData, newData, institute);
      } else if (oldData?.caste === "OBC") {
        await obc_function(oldData, newData, institute);
      } else if (oldData?.caste === "SC") {
        await sc_function(oldData, newData, institute);
      } else if (oldData?.caste === "ST") {
        await st_function(oldData, newData, institute);
      } else if (oldData?.caste === "NT-A") {
        await nta_function(oldData, newData, institute);
      } else if (oldData?.caste === "NT-B") {
        await ntb_function(oldData, newData, institute);
      } else if (oldData?.caste === "NT-C") {
        await ntc_function(oldData, newData, institute);
      } else if (oldData?.caste === "NT-D") {
        await ntd_function(oldData, newData, institute);
      } else if (oldData?.caste === "VJ") {
        await vj_function(oldData, newData, institute);
      } 
      else{
        if (newData?.caste === "General") {
          institute.staff_category.generalCount += 1;
        } else if (newData?.caste === "OBC") {
          institute.staff_category.obcCount += 1;
        } else if (newData?.caste === "SC") {
          institute.staff_category.scCount += 1;
        } else if (newData?.caste === "ST") {
          institute.staff_category.stCount += 1;
        } else if (newData?.caste === "NT-A") {
          institute.staff_category.ntaCount += 1;
        } else if (newData?.caste === "NT-B") {
          institute.staff_category.ntbCount += 1;
        } else if (newData?.caste === "NT-C") {
          institute.staff_category.ntcCount += 1;
        } else if (newData?.caste === "NT-D") {
          institute.staff_category.ntdCount += 1;
        } else if (newData?.caste === "VJ") {
          institute.staff_category.vjCount += 1;
        } else {
        }
      }
      await institute.save()
      oldData.gender = "";
      oldData.caste = "";
      newData.gender = "";
      newData.caste = "";
      console.log(institute.staff_category);
    }
  } catch (e) {
    console.log(e);
  }
};

// const pattern_critieria = [
//   {
//     key: "Male",
//     count: 1,
//     altKey: {
//       key: "Female",
//       count: -1,
//     },
//     altKey2: {
//       key: "Other",
//       count: -1,
//     },
//   },
//   {
//     key: "Female",
//     count: 1,
//     altKey: {
//       key: "Male",
//       count: -1,
//     },
//     altKey2: {
//       key: "Other",
//       count: -1,
//     },
//   },
//   {
//     key: "Other",
//     count: 1,
//     altKey: {
//       key: "Female",
//       count: -1,
//     },
//     altKey2: {
//       key: "Male",
//       count: -1,
//     },
//   },
// ];

// exports.gender_checker = (OG, NG) => {
//   if (OG && NG) {
//     for (var check of pattern_critieria) {
//       if (check.key === NG) {
//         return {
//           status: true,
//           format: check.key,
//           count: check.count,
//           altKey:
//             check.altKey.key === OG
//               ? check.altKey
//               : check.altKey2.key === OG
//               ? check.altKey2
//               : {},
//         };
//       }
//     }
//   } else {
//     return {
//       status: false
//     }
//   }
// };


// exports.update_staff_chart = async(sargs, old_data, new_data) => {
//   try{
//     const institute = await InstituteAdmin.findById({_id: sargs})
//     const valid = gender_checker(old_data, new_data)
//     if(valid?.status){
//       if(valid?.format === "")
//       institute.staff_category
//     }
//   }
//   catch(e){
//     console.log(e)
//   }
// }