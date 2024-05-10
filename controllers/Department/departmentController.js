const Department = require("../../models/Department");
const DepartmentStudentForm = require("../../models/Form/DepartmentStudentForm");
const FormChecklist = require("../../models/Form/FormChecklist");
const InstituteApplicationForm = require("../../models/Form/InstituteApplicationForm");
const InstituteStudentForm = require("../../models/Form/InstituteStudentForm");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Student = require("../../models/Student");

exports.renderStudentFormQuery = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var valid_depart = await Department.findById(did).select(
      "studentFormSetting ug_undertakings_admission pg_undertakings_admission student_form_setting"
    )
    .populate({
      path: "student_form_setting"
  });
    res.status(200).send({
      message: "Explore Department Student form setting details Query",
      studentFormSetting: valid_depart?.studentFormSetting,
      ug_undertakings_admission: valid_depart?.ug_undertakings_admission,
      pg_undertakings_admission: valid_depart?.pg_undertakings_admission,
      new_student_form_setting: valid_depart?.student_form_setting
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFormUpdateQuery = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    await Department.findByIdAndUpdate(did, req.body);
    res.status(200).send({
      message: "Explore Department Student form updated successfully 👏",
    });
  } catch (e) {
    console.log(e);
  }
};


exports.getDepartmentTabManageQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const { flow } = req.query;
    if (!did) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    if (flow === "Department") {
      const department = await Department.findById(did);
      const inst = await InstituteAdmin.findById(department.institute).select(
        "department_tab_manage"
      );
      res.status(200).send({
        message: "Department Tab Manage toggle",
        tab_manage: inst?.department_tab_manage,
      });
    } else {
      const inst = await InstituteAdmin.findById(did).select(
        "department_tab_manage"
      );
      res.status(200).send({
        message: "Department Tab Manage toggle",
        tab_manage: inst?.department_tab_manage,
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.updateDepartmentTabManageQuery = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    await InstituteAdmin.findByIdAndUpdate(did, req.body);
    res.status(200).send({
      message: "Department Tab Manage toggle updated",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_shuffle_student_form_section_query = async (req, res) => {
  try {
    const { fcid } = req?.params
    const { shuffle_arr } = req?.body
    if (!fcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    if (shuffle_arr?.length > 0) {
      var dfs = await DepartmentStudentForm.findById({ _id: fcid })
      dfs.form_section = []
      await dfs.save()
      for(var val of shuffle_arr){
        dfs.form_section.push(val)
      }
      await dfs.save()
      res.status(200).send({ message: "Explore Form Section Shuffling Query", access: true})
      }
    else{
      res.status(200).send({ message: "No Form Section Shuffling Query", access: false})
    }
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_student_form_section_query = async (req, res) => {
  try {
    const { fcid } = req?.params
    if (!fcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var dfs = await DepartmentStudentForm.findById({ _id: fcid })
      .select("form_section")
      .populate({
      path: "form_section.form_checklist"
      })
      dfs?.form_section?.splice(0, 1)
      for (let nums of dfs?.form_section) {
        if (`${nums?.section_key}` === "undertakings" || `${nums?.section_key}` === "antiragging_affidavit") {
          nums.form_checklist = []
        }
        if (`${nums?.section_key}` === "contactDetails") {
          for (let ele of nums?.form_checklist) {
            if (`${ele?.form_checklist_typo}` === "Same As") {
              nums?.form_checklist?.pull(ele?._id)
            }
          }
        }
      }
    res.status(200).send({ message: "Explore One Department Student Form Section Query", access: true, section: dfs?.form_section})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_student_form_section_enable_query = async (req, res) => {
  try {
    const { did } = req?.params
    if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var depart = await Department.findById({ _id: did })
    .select("student_form_setting")
    var dfs = await DepartmentStudentForm.findById({ _id: `${depart?.student_form_setting}` })
      .select("form_section")
      .populate({
      path: "form_section.form_checklist"
      })
    
    var all_section = dfs?.form_section?.filter((val) => {
      if(val?.section_visibilty) return val
    })

    for (var ele of all_section) {
      for (var stu of ele?.form_checklist) {
        if (stu?.form_checklist_visibility) {
          
        }
        else {
          ele?.form_checklist?.pull(stu?._id)
        }
      }
    }
    res.status(200).send({ message: "Explore One Department Student Form Section Enable Query", access: true, section: all_section})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_new_student_form_section_query = async (req, res) => {
  try {
    const { fcid } = req?.params
    const { form } = req?.body
    if (!fcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var dfs = await DepartmentStudentForm.findById({ _id: fcid })
    for (var val of form) {
      dfs.form_section.push({
        section_name: val?.section_name,
        section_visibilty: val?.section_visibilty,
        section_key: val?.section_key,
      })
    }
    await dfs.save()
    res.status(200).send({ message: "Explore One Department Form Section Query", access: true })
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_new_student_form_checklist_query = async (req, res) => {
  try {
    const { fcid } = req?.params
    const { checklist, fsid } = req?.body
    if (!fcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var dfs = await DepartmentStudentForm.findById({ _id: fcid })
    for (var val of dfs?.form_section) {
      if (`${val?._id}` === `${fsid}`) {
        for (var ele of checklist) {
          var fc = new FormChecklist({
            form_checklist_name: ele?.form_checklist_name,
            form_checklist_key: ele?.form_checklist_key,
            form_checklist_visibility: ele?.form_checklist_visibility,
            form_checklist_placeholder: ele?.form_checklist_placeholder,
            form_checklist_lable: ele?.form_checklist_lable,
            form_checklist_typo: ele?.form_checklist_typo,
            form_checklist_typo_option_pl: [...ele?.form_checklist_typo_option_pl],
            form_checklist_required: ele?.form_checklist_required,
            form_checklist_key_status: "DYNAMIC"
          })
          if (ele?.form_checklist_typo_option_pl && ele?.form_checklist_typo_option_pl?.length > 0) {
            ele.form_checklist_typo_option_pl = [...ele?.form_checklist_typo_option_pl]
          }
          fc.department_form = dfs?._id
          fc.form_section = val?._id
          val.form_checklist.push(fc?._id)
          await fc.save()
        }
      }
    }
    await dfs.save()
    res.status(200).send({ message: "Explore One Department Form Section Nested Checklist Query", access: true }) 
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_dynamic_form_query = async (req, res) => {
  try {
    const { sid } = req?.params
    if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var student = await Student.findById({ _id: sid })
    if (student?.student_form_flow?.flow === "INSTITUTE") {
      var head_array = []
      var head_arrays = []
      var obj = {}
      var nest_obj = {}
      const all_check = await InstituteStudentForm.findOne({ institute: student?.student_form_flow?.did })
      .select("form_section")
      .populate({
      path: "form_section.form_checklist"
      })
      .populate({
        path: "institute",
        select: "insName"
        })
      for (var val of all_check?.form_section) {
        if (val?.section_visibilty == true) {
          for (var ele of val?.form_checklist) {
            if (ele?.form_checklist_visibility == true) {
              var list = student?.student_dynamic_field?.filter((dna) => {
                if (dna?.key === ele?.form_checklist_key) {
                  nest_obj[`${dna?.key}`] = dna?.value
                }
              })
              if (ele?.form_checklist_typo === "Same As") {
              }
              else {
                if (ele?.form_checklist_key === "student_undertakings") {
                  var name1 = val?.section_value?.replace("@STUDENT_NAME", `${student?.studentFirstName} ${student?.studentMiddleName ?? ""} ${student?.studentLastName}`)
                  var name2 = name1?.replace("@INSTITUTE_NAME", `${all_check?.institute?.insName}`)
                }
                else if (ele?.form_checklist_key === "student_anti_ragging") {
                  var name2 = val?.section_value
                }
                head_array.push({
                  form_checklist_name: ele?.form_checklist_name,
                  form_checklist_key: ele?.form_checklist_key,
                  form_checklist_visibility: ele?.form_checklist_visibility,
                  form_checklist_placeholder: ele?.form_checklist_placeholder,
                  form_checklist_lable: ele?.form_checklist_lable,
                  form_checklist_typo: ele?.form_checklist_typo,
                  form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                  form_checklist_required: val?.section_key === "documents" ? false : true,
                  value: name2 ? name2 : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                })
              }
            }
          }
          obj[`fields`] = [...head_array]
          head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
          obj = {}
          head_array = []
        }
      }
      head_arrays?.splice(0, 1)
      res.status(200).send({ message: "Explore One Student Institute Dynamic Form Query", access: true, result: [...head_arrays]})
    }
    else if (student?.student_form_flow?.flow === "DEPARTMENT") {
      var head_array = []
      var head_arrays = []
      var obj = {}
      var nest_obj = {}
      const all_check = await DepartmentStudentForm.findOne({ department: student?.student_form_flow?.did })
      .select("form_section")
      .populate({
      path: "form_section.form_checklist"
      })
      .populate({
        path: "department",
        select: "institute",
        populate: "institute",
        select: "insName"
        })
      for (var val of all_check?.form_section) {
        if (val?.section_visibilty == true) {
          for (var ele of val?.form_checklist) {
            if (ele?.form_checklist_visibility == true) {
              var list = student?.student_dynamic_field?.filter((dna) => {
                if (dna?.key === ele?.form_checklist_key) {
                  nest_obj[`${dna?.key}`] = dna?.value
                }
              })
              if (ele?.form_checklist_typo === "Same As") {
              }
              else {
                if (ele?.form_checklist_key === "student_undertakings") {
                  var name1 = val?.section_value?.replace("@STUDENT_NAME", `${student?.studentFirstName} ${student?.studentMiddleName ?? ""} ${student?.studentLastName}`)
                  var name2 = name1?.replace("@INSTITUTE_NAME", `${all_check?.department?.institute?.insName}`)
                }
                else if (ele?.form_checklist_key === "student_anti_ragging") {
                  var name2 = val?.section_value
                }
                head_array.push({
                  form_checklist_name: ele?.form_checklist_name,
                  form_checklist_key: ele?.form_checklist_key,
                  form_checklist_visibility: ele?.form_checklist_visibility,
                  form_checklist_placeholder: ele?.form_checklist_placeholder,
                  form_checklist_lable: ele?.form_checklist_lable,
                  form_checklist_typo: ele?.form_checklist_typo,
                  form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                  form_checklist_required: val?.section_key === "documents" ? false : true,
                  value: name2 ? name2 : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                })
              }
            }
          }
          obj[`fields`] = [...head_array]
          head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
          obj = {}
          head_array = []
        }
      }
      head_arrays?.splice(0, 1)
      res.status(200).send({ message: "Explore One Student Department Dynamic Form Query", access: true, result: [...head_arrays]})
    }
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_dynamic_form_query_photo = async (req, res) => {
  try {
    const { sid } = req?.params
    if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var student = await Student.findById({ _id: sid })
    if (student?.student_form_flow?.flow === "INSTITUTE") {
      var head_array = []
      var head_arrays = []
      var obj = {}
      var nest_obj = {}
      const all_check = await InstituteStudentForm.findOne({ institute: student?.student_form_flow?.did })
      .select("form_section")
      .populate({
      path: "form_section.form_checklist"
      })
      .populate({
        path: "institute",
        select: "insName"
        })
      for (var val of all_check?.form_section) {
        if (val?.section_visibilty == true) {
          for (var ele of val?.form_checklist) {
            if (ele?.form_checklist_visibility == true) {
              var list = student?.student_dynamic_field?.filter((dna) => {
                if (dna?.key === ele?.form_checklist_key) {
                  nest_obj[`${dna?.key}`] = dna?.value
                }
              })
              if (ele?.form_checklist_typo === "Same As") {
              }
              else {
                if (ele?.form_checklist_key === "student_undertakings") {
                  var name1 = val?.section_value?.replace("@STUDENT_NAME", `${student?.studentFirstName} ${student?.studentMiddleName ?? ""} ${student?.studentLastName}`)
                  var name2 = name1?.replace("@INSTITUTE_NAME", `${all_check?.institute?.insName}`)
                }
                else if (ele?.form_checklist_key === "student_anti_ragging") {
                  var name2 = val?.section_value
                }
                head_array.push({
                  form_checklist_name: ele?.form_checklist_name,
                  form_checklist_key: ele?.form_checklist_key,
                  form_checklist_visibility: ele?.form_checklist_visibility,
                  form_checklist_placeholder: ele?.form_checklist_placeholder,
                  form_checklist_lable: ele?.form_checklist_lable,
                  form_checklist_typo: ele?.form_checklist_typo,
                  form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                  form_checklist_required: val?.section_key === "documents" ? false : true,
                  value: name2 ? name2 : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                })
              }
            }
          }
          obj[`fields`] = [...head_array]
          head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
          obj = {}
          head_array = []
        }
      }
      res.status(200).send({ message: "Explore One Student Institute Dynamic Form Query", access: true, result: [...head_arrays]})
    }
    else if (student?.student_form_flow?.flow === "DEPARTMENT") {
      var head_array = []
      var head_arrays = []
      var obj = {}
      var nest_obj = {}
      const all_check = await DepartmentStudentForm.findOne({ department: student?.student_form_flow?.did })
      .select("form_section")
      .populate({
      path: "form_section.form_checklist"
      })
      .populate({
        path: "department",
        select: "institute",
        populate: "institute",
        select: "insName"
        })
      for (var val of all_check?.form_section) {
        if (val?.section_visibilty == true) {
          for (var ele of val?.form_checklist) {
            if (ele?.form_checklist_visibility == true) {
              var list = student?.student_dynamic_field?.filter((dna) => {
                if (dna?.key === ele?.form_checklist_key) {
                  nest_obj[`${dna?.key}`] = dna?.value
                }
              })
              if (ele?.form_checklist_typo === "Same As") {
              }
              else {
                if (ele?.form_checklist_key === "student_undertakings") {
                  var name1 = val?.section_value?.replace("@STUDENT_NAME", `${student?.studentFirstName} ${student?.studentMiddleName ?? ""} ${student?.studentLastName}`)
                  var name2 = name1?.replace("@INSTITUTE_NAME", `${all_check?.department?.institute?.insName}`)
                }
                else if (ele?.form_checklist_key === "student_anti_ragging") {
                  var name2 = val?.section_value
                }
                head_array.push({
                  form_checklist_name: ele?.form_checklist_name,
                  form_checklist_key: ele?.form_checklist_key,
                  form_checklist_visibility: ele?.form_checklist_visibility,
                  form_checklist_placeholder: ele?.form_checklist_placeholder,
                  form_checklist_lable: ele?.form_checklist_lable,
                  form_checklist_typo: ele?.form_checklist_typo,
                  form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                  form_checklist_required: val?.section_key === "documents" ? false : true,
                  value: name2 ? name2 : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                })
              }
            }
          }
          obj[`fields`] = [...head_array]
          head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
          obj = {}
          head_array = []
        }
      }
      res.status(200).send({ message: "Explore One Student Department Dynamic Form Query", access: true, result: [...head_arrays]})
    }
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_edit_student_form_section_query = async (req, res) => {
  try {
    const { fcid } = req?.params
    const { fsid, section_name, section_key, section_visibilty } = req?.body
    if (!fcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var dfs = await DepartmentStudentForm.findById({ _id: fcid })
    for (var val of dfs?.form_section) {
      if (`${val?._id}` === `${fsid}`) {
        val.section_name = section_name ? section_name : val?.section_name
        val.section_key = section_key ? section_key : val?.section_key
        val.section_visibilty = section_visibilty
      }
    }
    await dfs.save()
    res.status(200).send({ message: "Edit One Form Section + Nested Checklist Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_edit_student_form_section_checklist_query = async (req, res) => {
  try {
    const { fcid } = req?.params
    const { checkID, fsid, form_checklist_visibility } = req?.body
    if (!fcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var dfs = await DepartmentStudentForm.findById({ _id: fcid })
    .select("form_section")
      .populate({
      path: "form_section.form_checklist"
      })
    for (var val of dfs?.form_section) {
      if (`${val?._id}` === `${fsid}`) {
          for (var ele of val?.form_checklist) {
            if (`${ele?._id}` === `${checkID}`) {
              ele.form_checklist_visibility = form_checklist_visibility,
                await ele.save()
            }
          }
        }
    }
    await dfs.save()
    res.status(200).send({ message: "Edit One Form Section + Nested Checklist Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_dynamic_form_details_query = async (req, res) => {
  try {
    const { flow, did, apk } = req?.query
    if (!flow && !did) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    if (apk === "WEB") {
      if (flow === "INSTITUTE") {
        const ins_form = await InstituteStudentForm.findOne({ institute: did })
          .select("form_section")
          .populate({
            path: "form_section.form_checklist"
          })
    
        var all_section = ins_form?.form_section?.filter((val) => {
          if (val?.section_visibilty) return val
        })
        for (var ele of all_section) {
          for (var stu of ele?.form_checklist) {
            if (stu?.form_checklist_typo === "Same As") {
            
            }
            else {
              ele.form_checklist = ele?.form_checklist?.filter((qwe) => {
                if (qwe?.form_checklist_visibility) {
                  return qwe
                }
                else {
                  return null
                }
              })
            }
            stu.form_checklist_required = ele?.section_key === "documents" ? false : true
          }
        }
        res.status(200).send({ message: "Institute Form Query", access: true, ins_form: all_section })
      }
      else if (flow === "DEPARTMENT") {
        const depart_form = await DepartmentStudentForm.findOne({ department: did })
          .select("form_section")
          .populate({
            path: "form_section.form_checklist"
          })
    
        var all_section = depart_form?.form_section?.filter((val) => {
          if (val?.section_visibilty) return val
        })

        for (var ele of all_section) {
          for (var stu of ele?.form_checklist) {
        
            if (stu?.form_checklist_typo === "Same As") {
            
            }
            else {
              ele.form_checklist = ele?.form_checklist?.filter((qwe) => {
                if (qwe?.form_checklist_visibility) {
                  return qwe
                }
                else {
                  return null
                }
              })
            }
            stu.form_checklist_required = ele?.section_key === "documents" ? false : true
          }
        }
        res.status(200).send({ message: "Department Form Query", access: true, depart_form: all_section })
      }
      else if (flow === "APPLICATION") {
        const app_form = await InstituteApplicationForm.findOne({ application: did })
          .select("form_section")
          .populate({
            path: "form_section.form_checklist"
          })
    
        var all_section = app_form?.form_section?.filter((val) => {
          if (val?.section_visibilty) return val
        })

        for (var ele of all_section) {
          for (var stu of ele?.form_checklist) {
        
            if (stu?.form_checklist_typo === "Same As") {
            
            }
            else {
              ele.form_checklist = ele?.form_checklist?.filter((qwe) => {
                if (qwe?.form_checklist_visibility) {
                  return qwe
                }
                else {
                  return null
                }
              })
            }
            stu.form_checklist_required = ele?.section_key === "documents" ? false : true
          }
        }
        res.status(200).send({ message: "Application Form Query", access: true, app_form: all_section })
      }
    }
    else {
      if (flow === "INSTITUTE") {
        const ins_form = await InstituteStudentForm.findOne({ institute: did })
          .select("form_section")
          .populate({
            path: "form_section.form_checklist"
          })
    
        var all_section = ins_form?.form_section?.filter((val) => {
          if (val?.section_visibilty) return val
        })
        all_section[1].form_checklist.push(...all_section?.[0]?.form_checklist)
        for (var ele of all_section) {
          for (var stu of ele?.form_checklist) {
            if (stu?.form_checklist_typo === "Same As") {
            
            }
            else {
              ele.form_checklist = ele?.form_checklist?.filter((qwe) => {
                if (qwe?.form_checklist_visibility) {
                  return qwe
                }
                else {
                  return null
                }
              })
            }
            stu.form_checklist_required = ele?.section_key === "documents" ? false : true
          }
        }
        all_section.splice(0, 1)
        res.status(200).send({ message: "Institute Form Query", access: true, ins_form: all_section })
      }
      else if (flow === "DEPARTMENT") {
        const depart_form = await DepartmentStudentForm.findOne({ department: did })
          .select("form_section")
          .populate({
            path: "form_section.form_checklist"
          })
    
        var all_section = depart_form?.form_section?.filter((val) => {
          if (val?.section_visibilty) return val
        })
        all_section[1].form_checklist.push(...all_section?.[0]?.form_checklist)
        for (var ele of all_section) {
          for (var stu of ele?.form_checklist) {
        
            if (stu?.form_checklist_typo === "Same As") {
            
            }
            else {
              ele.form_checklist = ele?.form_checklist?.filter((qwe) => {
                if (qwe?.form_checklist_visibility) {
                  return qwe
                }
                else {
                  return null
                }
              })
            }
            stu.form_checklist_required = ele?.section_key === "documents" ? false : true
          }
        }
        all_section.splice(0, 1)
        res.status(200).send({ message: "Department Form Query", access: true, depart_form: all_section })
      }
      else if (flow === "APPLICATION") {
        const app_form = await InstituteApplicationForm.findOne({ application: did })
          .select("form_section")
          .populate({
            path: "form_section.form_checklist"
          })
    
        var all_section = app_form?.form_section?.filter((val) => {
          if (val?.section_visibilty) return val
        })

        for (var ele of all_section) {
          for (var stu of ele?.form_checklist) {
        
            if (stu?.form_checklist_typo === "Same As") {
            
            }
            else {
              ele.form_checklist = ele?.form_checklist?.filter((qwe) => {
                if (qwe?.form_checklist_visibility) {
                  return qwe
                }
                else {
                  return null
                }
              })
            }
            stu.form_checklist_required = ele?.section_key === "documents" ? false : true
          }
        }
        res.status(200).send({ message: "Application Form Query", access: true, app_form: all_section })
      }
    }
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_add_textarea_field_query = async (req, res) => {
  try {
    const { flow, did, fsid, content } = req?.body
    if (!flow && !did) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    if (flow === "INSTITUTE") {
      const ins_form = await InstituteStudentForm.findOne({ institute: did })
      for (var val of ins_form?.form_section) {
        if (`${val?._id}` === `${fsid}`) {
          val.section_pdf = content
          val.section_value = content
        }
      }
      await ins_form.save()
      res.status(200).send({ message: "Institute Form Query", access: true})
    }
    else if (flow === "DEPARTMENT") {
      const depart_form = await DepartmentStudentForm.findOne({ department: did })
      for (var val of depart_form?.form_section) {
        if (`${val?._id}` === `${fsid}`) {
          val.section_pdf = content
          val.section_value = content
        }
      }
      await depart_form.save()
      res.status(200).send({ message: "Department Form Query", access: true})
    }
    else if (flow === "APPLICATION") {
      const app_form = await InstituteApplicationForm.findOne({ application: did })
      for (var val of app_form?.form_section) {
        if (`${val?._id}` === `${fsid}`) {
          val.section_pdf = content
          val.section_value = content
        }
      }
      await app_form.save()
      res.status(200).send({ message: "Application Form Query", access: true})
    }
  }
  catch (e) {
    console.log(e)
  }
}



