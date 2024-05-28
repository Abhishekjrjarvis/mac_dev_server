const Admission = require("../../models/Admission/Admission");
const NewApplication = require("../../models/Admission/NewApplication");
const SubjectGroup = require("../../models/Admission/Optional/SubjectGroup");
const SubjectGroupSelect = require("../../models/Admission/Optional/SubjectGroupSelect");
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
        if (`${nums?.section_key}` === "documents") {
          for (let ele of nums?.form_checklist) {
            if (`${ele?.form_checklist_enable}` === "true") {
              nums?.form_checklist?.pull(ele?._id)
            }
          }
        }
        if (`${nums?.section_key}` === "social_reservation_information_section") {
          for (let ele of nums?.form_checklist) {
            if (`${ele?.form_checklist_enable}` === "true") {
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
    student.studentFatherName = student?.studentMiddleName ?? student?.studentFatherName
    if (student?.student_form_flow?.flow === "INSTITUTE") {
      var head_array = []
      var head_arrays = []
      var obj = {}
      var nest_obj = {}
      var nest_objs = {}
      var app_date = `${new Date()?.getDate()}-${new Date()?.getMonth() + 1}-${new Date()?.getFullYear()}`
      const all_check = await InstituteStudentForm.findOne({ institute: student?.student_form_flow?.did })
      .select("form_section")
      .populate({
        path: "form_section",
        populate: {
          path: "form_checklist",
          populate: {
            path: "nested_form_checklist",
            populate: {
              path: "nested_form_checklist_nested"
            }
          }
        }
      })
      .populate({
        path: "institute",
        select: "insName"
      })
      var custom = []
      var customs = []
      for (var val of all_check?.form_section) {
        if (val?.section_key === "academic_details") {
          if (val?.section_visibilty == true) {
            for (var ele of val?.form_checklist) {
              var list = student?.student_dynamic_field?.filter((dna) => {
                if (dna?.key === ele?.form_checklist_key) {
                  nest_objs[`${dna?.key}`] = dna?.value
                }
              })
              if (student[`${ele?.form_checklist_key}`] === "Yes" || nest_objs[`${ele?.form_checklist_key}`]) {
                if (ele?.form_checklist_visibility == true) {
                  for (let ads of ele?.nested_form_checklist) {
                    if (student[`${ads?.form_checklist_key}`] === "Yes") {
                      for (let ad of ads?.nested_form_checklist_nested) {
                        customs.push({
                          form_checklist_name: ad?.form_checklist_name,
                          form_checklist_key: ad?.form_checklist_key,
                          form_checklist_visibility: ad?.form_checklist_visibility,
                          form_checklist_placeholder: ad?.form_checklist_placeholder,
                          form_checklist_lable: ad?.form_checklist_lable,
                          form_checklist_typo: ad?.form_checklist_typo,
                          form_checklist_typo_option_pl: ad?.form_checklist_typo_option_pl,
                          form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                          value: student[`${ad?.form_checklist_key}`] ?? nest_obj[`${ad?.form_checklist_key}`]
                        })
                      }
                    }
                    var list = student?.student_dynamic_field?.filter((dna) => {
                      if (dna?.key === ads?.form_checklist_key) {
                        nest_obj[`${dna?.key}`] = dna?.value
                      }
                    })
                      custom.push({
                        form_checklist_name: ads?.form_checklist_name,
                        form_checklist_key: ads?.form_checklist_key,
                        form_checklist_visibility: ads?.form_checklist_visibility,
                        form_checklist_placeholder: ads?.form_checklist_placeholder,
                        form_checklist_lable: ads?.form_checklist_lable,
                        form_checklist_typo: ads?.form_checklist_typo,
                        form_checklist_typo_option_pl: ads?.form_checklist_typo_option_pl,
                        form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                        nested_form_checklist_nested: [...customs],
                        value: student[`${ads?.form_checklist_key}`] ?? nest_obj[`${ads?.form_checklist_key}`]
                      })
                    customs = []
                    if (student[`${ads?.form_checklist_key}`] === "No") { 
                      custom = []
                    }
                  }
                }
                head_array.push({
                  form_checklist_name: ele?.form_checklist_name,
                  form_checklist_key: ele?.form_checklist_key,
                  form_checklist_visibility: ele?.form_checklist_visibility,
                  form_checklist_placeholder: ele?.form_checklist_placeholder,
                  form_checklist_lable: ele?.form_checklist_lable,
                  form_checklist_typo: ele?.form_checklist_typo,
                  form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                  form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                  nested_form_checklist: [...custom],
                  value: student[`${ele?.form_checklist_key}`] ?? nest_objs[`${ele?.form_checklist_key}`]
                })
                custom = []
              }
            }
            obj[`fields`] = [...head_array]
            head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
            obj = {}
            head_array = []
          }
        }
        else {
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
                    var name3 = name1?.replace("@INSTITUTE_NAME", `${all_check?.application?.admissionAdmin?.institute?.insName}`)
                    var name4 = name3?.replace("@PARENTS_NAME", `${student?.studentParentsName}`)
                    var name2 = name4?.replace("@DATE", app_date)
                    // var name2 = name3?.replace("@DATE", student?.student_undertakings_date)
                  }
                  else if (ele?.form_checklist_key === "student_anti_ragging") {
                    var name1 = val?.section_value?.replace("@STUDENT_NAME", `${student?.studentFirstName} ${student?.studentMiddleName ?? ""} ${student?.studentLastName}`)
                    var name3 = name1?.replace("@INSTITUTE_NAME", `${all_check?.application?.admissionAdmin?.institute?.insName}`)
                    var name4 = name3?.replace("@PARENTS_NAME", `${student?.studentParentsName}`)
                    var name2 = name4?.replace("@DATE", app_date)
                  }
                  head_array.push({
                    form_checklist_name: ele?.form_checklist_name,
                    form_checklist_key: ele?.form_checklist_key,
                    form_checklist_visibility: ele?.form_checklist_visibility,
                    form_checklist_placeholder: ele?.form_checklist_placeholder,
                    form_checklist_lable: ele?.form_checklist_lable,
                    form_checklist_typo: ele?.form_checklist_typo,
                    form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                    form_common_key: ele?.form_common_key,
                    form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                    value: (ele?.form_checklist_key === "student_undertakings" || ele?.form_checklist_key === "student_anti_ragging") ? name2 ?? "" : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                    // value: name2 ? name2 : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                  })
                  name2 = ""
                }
              }
            }
            obj[`fields`] = [...head_array]
            head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
            obj = {}
            head_array = []
          }
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
      var nest_objs = {}
      var app_date = `${new Date()?.getDate()}-${new Date()?.getMonth() + 1}-${new Date()?.getFullYear()}`
      const all_check = await DepartmentStudentForm.findOne({ department: student?.student_form_flow?.did })
      .select("form_section")
      .populate({
        path: "form_section",
        populate: {
          path: "form_checklist",
          populate: {
            path: "nested_form_checklist",
            populate: {
              path: "nested_form_checklist_nested"
            }
          }
        }
      })
      .populate({
        path: "department",
        select: "institute",
        populate: {
          path: "institute",
          select: "insName"
        }
      })
      var custom = []
      var customs = []
      for (var val of all_check?.form_section) {
        if (val?.section_key === "academic_details") {
          if (val?.section_visibilty == true) {
            for (var ele of val?.form_checklist) {
              var list = student?.student_dynamic_field?.filter((dna) => {
                if (dna?.key === ele?.form_checklist_key) {
                  nest_objs[`${dna?.key}`] = dna?.value
                }
              })
              if (student[`${ele?.form_checklist_key}`] === "Yes" || nest_objs[`${ele?.form_checklist_key}`]) {
                if (ele?.form_checklist_visibility == true) {
                  for (let ads of ele?.nested_form_checklist) {
                    if (student[`${ads?.form_checklist_key}`] === "Yes") {
                      for (let ad of ads?.nested_form_checklist_nested) {
                        customs.push({
                          form_checklist_name: ad?.form_checklist_name,
                          form_checklist_key: ad?.form_checklist_key,
                          form_checklist_visibility: ad?.form_checklist_visibility,
                          form_checklist_placeholder: ad?.form_checklist_placeholder,
                          form_checklist_lable: ad?.form_checklist_lable,
                          form_checklist_typo: ad?.form_checklist_typo,
                          form_checklist_typo_option_pl: ad?.form_checklist_typo_option_pl,
                          form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                          value: student[`${ad?.form_checklist_key}`] ?? nest_obj[`${ad?.form_checklist_key}`]
                        })
                      }
                    }
                    var list = student?.student_dynamic_field?.filter((dna) => {
                      if (dna?.key === ads?.form_checklist_key) {
                        nest_obj[`${dna?.key}`] = dna?.value
                      }
                    })
                      custom.push({
                        form_checklist_name: ads?.form_checklist_name,
                        form_checklist_key: ads?.form_checklist_key,
                        form_checklist_visibility: ads?.form_checklist_visibility,
                        form_checklist_placeholder: ads?.form_checklist_placeholder,
                        form_checklist_lable: ads?.form_checklist_lable,
                        form_checklist_typo: ads?.form_checklist_typo,
                        form_checklist_typo_option_pl: ads?.form_checklist_typo_option_pl,
                        form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                        nested_form_checklist_nested: [...customs],
                        value: student[`${ads?.form_checklist_key}`] ?? nest_obj[`${ads?.form_checklist_key}`]
                      })
                    customs = []
                    if (student[`${ads?.form_checklist_key}`] === "No") { 
                      custom = []
                    }
                  }
                }
                head_array.push({
                  form_checklist_name: ele?.form_checklist_name,
                  form_checklist_key: ele?.form_checklist_key,
                  form_checklist_visibility: ele?.form_checklist_visibility,
                  form_checklist_placeholder: ele?.form_checklist_placeholder,
                  form_checklist_lable: ele?.form_checklist_lable,
                  form_checklist_typo: ele?.form_checklist_typo,
                  form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                  form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                  nested_form_checklist: [...custom],
                  value: student[`${ele?.form_checklist_key}`] ?? nest_objs[`${ele?.form_checklist_key}`]
                })
                custom = []
              }
            }
            obj[`fields`] = [...head_array]
            head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
            obj = {}
            head_array = []
          }
        }
        else {
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
                    var name3 = name1?.replace("@INSTITUTE_NAME", `${all_check?.application?.admissionAdmin?.institute?.insName}`)
                    var name4 = name3?.replace("@PARENTS_NAME", `${student?.studentParentsName}`)
                    var name2 = name4?.replace("@DATE", app_date)
                  }
                  else if (ele?.form_checklist_key === "student_anti_ragging") {
                    var name1 = val?.section_value?.replace("@STUDENT_NAME", `${student?.studentFirstName} ${student?.studentMiddleName ?? ""} ${student?.studentLastName}`)
                    var name3 = name1?.replace("@INSTITUTE_NAME", `${all_check?.application?.admissionAdmin?.institute?.insName}`)
                    var name4 = name3?.replace("@PARENTS_NAME", `${student?.studentParentsName}`)
                    var name2 = name4?.replace("@DATE", app_date)
                  }
                  head_array.push({
                    form_checklist_name: ele?.form_checklist_name,
                    form_checklist_key: ele?.form_checklist_key,
                    form_checklist_visibility: ele?.form_checklist_visibility,
                    form_checklist_placeholder: ele?.form_checklist_placeholder,
                    form_checklist_lable: ele?.form_checklist_lable,
                    form_checklist_typo: ele?.form_checklist_typo,
                    form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                    form_common_key: ele?.form_common_key,
                    form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                    value: (ele?.form_checklist_key === "student_undertakings" || ele?.form_checklist_key === "student_anti_ragging") ? name2 ?? "" : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                    // value: name2 ? name2 : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                  })
                  name2 = ""
                }
              }
            }
            obj[`fields`] = [...head_array]
            head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
            obj = {}
            head_array = []
          }
        }
      }
      head_arrays?.splice(0, 1)
      res.status(200).send({ message: "Explore One Student Department Dynamic Form Query", access: true, result: [...head_arrays]})
    }
    else if (student?.student_form_flow?.flow === "APPLICATION") {
      var head_array = []
      var head_arrays = []
      var obj = {}
      var nest_obj = {}
      var nest_objs = {}
      var app_date = `${new Date()?.getDate()}-${new Date()?.getMonth() + 1}-${new Date()?.getFullYear()}`
      var app_name = await NewApplication.findById({ _id: student?.student_form_flow?.did })
      .select("applicationName")
      const all_check = await InstituteApplicationForm.findOne({ application: student?.student_form_flow?.did })
      .select("form_section")
      .populate({
        path: "form_section",
        populate: {
          path: "form_checklist",
          populate: {
            path: "nested_form_checklist",
            populate: {
              path: "nested_form_checklist_nested"
            }
          }
        }
      })
      .populate({
        path: "application",
        select: "admissionAdmin",
        populate: {
          path: "admissionAdmin",
          select: "institute",
          populate: {
            path: "institute",
            select: "insName"
          }
        }
      })
      var custom = []
      var customs = []
      for (var val of all_check?.form_section) {
        if (val?.section_key === "academic_details") {
          if (val?.section_visibilty == true) {
            for (var ele of val?.form_checklist) {
              var list = student?.student_dynamic_field?.filter((dna) => {
                if (dna?.key === ele?.form_checklist_key) {
                  nest_objs[`${dna?.key}`] = dna?.value
                }
              })
              if (student[`${ele?.form_checklist_key}`] === "Yes" || nest_objs[`${ele?.form_checklist_key}`]) {
                if (ele?.form_checklist_visibility == true) {
                  for (let ads of ele?.nested_form_checklist) {
                    if (student[`${ads?.form_checklist_key}`] === "Yes") {
                      for (let ad of ads?.nested_form_checklist_nested) {
                        customs.push({
                          form_checklist_name: ad?.form_checklist_name,
                          form_checklist_key: ad?.form_checklist_key,
                          form_checklist_visibility: ad?.form_checklist_visibility,
                          form_checklist_placeholder: ad?.form_checklist_placeholder,
                          form_checklist_lable: ad?.form_checklist_lable,
                          form_checklist_typo: ad?.form_checklist_typo,
                          form_checklist_typo_option_pl: ad?.form_checklist_typo_option_pl,
                          form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                          value: student[`${ad?.form_checklist_key}`] ?? nest_obj[`${ad?.form_checklist_key}`]
                        })
                      }
                    }
                    var list = student?.student_dynamic_field?.filter((dna) => {
                      if (dna?.key === ads?.form_checklist_key) {
                        nest_obj[`${dna?.key}`] = dna?.value
                      }
                    })
                      custom.push({
                        form_checklist_name: ads?.form_checklist_name,
                        form_checklist_key: ads?.form_checklist_key,
                        form_checklist_visibility: ads?.form_checklist_visibility,
                        form_checklist_placeholder: ads?.form_checklist_placeholder,
                        form_checklist_lable: ads?.form_checklist_lable,
                        form_checklist_typo: ads?.form_checklist_typo,
                        form_checklist_typo_option_pl: ads?.form_checklist_typo_option_pl,
                        form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                        nested_form_checklist_nested: [...customs],
                        value: student[`${ads?.form_checklist_key}`] ?? nest_obj[`${ads?.form_checklist_key}`]
                      })
                    customs = []
                    if (student[`${ads?.form_checklist_key}`] === "No") { 
                      custom = []
                    }
                  }
                }
                head_array.push({
                  form_checklist_name: ele?.form_checklist_name,
                  form_checklist_key: ele?.form_checklist_key,
                  form_checklist_visibility: ele?.form_checklist_visibility,
                  form_checklist_placeholder: ele?.form_checklist_placeholder,
                  form_checklist_lable: ele?.form_checklist_lable,
                  form_checklist_typo: ele?.form_checklist_typo,
                  form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                  form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                  nested_form_checklist: [...custom],
                  value: student[`${ele?.form_checklist_key}`] ?? nest_objs[`${ele?.form_checklist_key}`]
                })
                custom = []
              }
            }
            obj[`fields`] = [...head_array]
            head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
            obj = {}
            head_array = []
          }
        }
        else {
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
                    var name3 = name1?.replace("@INSTITUTE_NAME", `${all_check?.application?.admissionAdmin?.institute?.insName}`)
                    var name4 = name3?.replace("@PARENTS_NAME", `${student?.studentParentsName}`)
                    var name5 = name4?.replace("@APPLICATION_NAME", `${app_name?.applicationName}`)
                    var name2 = name5?.replace("@DATE", app_date)
                  }
                  else if (ele?.form_checklist_key === "student_anti_ragging") {
                    var name1 = val?.section_value?.replace("@STUDENT_NAME", `${student?.studentFirstName} ${student?.studentMiddleName ?? ""} ${student?.studentLastName}`)
                    var name3 = name1?.replace("@INSTITUTE_NAME", `${all_check?.application?.admissionAdmin?.institute?.insName}`)
                    var name4 = name3?.replace("@PARENTS_NAME", `${student?.studentParentsName}`)
                    var name5 = name4?.replace("@APPLICATION_NAME", `${app_name?.applicationName}`)
                    var name2 = name5?.replace("@DATE", app_date)
                  }
                  head_array.push({
                    form_checklist_name: ele?.form_checklist_name,
                    form_checklist_key: ele?.form_checklist_key,
                    form_checklist_visibility: ele?.form_checklist_visibility,
                    form_checklist_placeholder: ele?.form_checklist_placeholder,
                    form_checklist_lable: ele?.form_checklist_lable,
                    form_checklist_typo: ele?.form_checklist_typo,
                    form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                    form_common_key: ele?.form_common_key,
                    form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                    value: (ele?.form_checklist_key === "student_undertakings" || ele?.form_checklist_key === "student_anti_ragging") ? name2 ?? "" : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                      // name2 ? name2 : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                  })
                  name2 = ""
                }
              }
            }
            obj[`fields`] = [...head_array]
            head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
            obj = {}
            head_array = []
          }
        }
      }
      head_arrays?.splice(0, 1)
      res.status(200).send({ message: "Explore One Student Application Dynamic Form Query", access: true, result: [...head_arrays]})
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
    student.studentFatherName = student?.studentMiddleName ?? student?.studentFatherName
    if (student?.student_form_flow?.flow === "INSTITUTE") {
      var head_array = []
      var head_arrays = []
      var obj = {}
      var nest_obj = {}
      var nest_objs = {}
      var app_date = `${new Date()?.getDate()}-${new Date()?.getMonth() + 1}-${new Date()?.getFullYear()}`
      const all_check = await InstituteStudentForm.findOne({ institute: student?.student_form_flow?.did })
      .select("form_section")
      .populate({
        path: "form_section",
        populate: {
          path: "form_checklist",
          populate: {
            path: "nested_form_checklist",
            populate: {
              path: "nested_form_checklist_nested"
            }
          }
        }
      })
      .populate({
        path: "institute",
        select: "insName"
      })
      var custom = []
      var customs = []
      for (var val of all_check?.form_section) {
        if (val?.section_key === "academic_details") {
          if (val?.section_visibilty == true) {
            for (var ele of val?.form_checklist) {
              var list = student?.student_dynamic_field?.filter((dna) => {
                if (dna?.key === ele?.form_checklist_key) {
                  nest_objs[`${dna?.key}`] = dna?.value
                }
              })
              if (student[`${ele?.form_checklist_key}`] === "Yes" || nest_objs[`${ele?.form_checklist_key}`]) {
                if (ele?.form_checklist_visibility == true) {
                  for (let ads of ele?.nested_form_checklist) {
                    if (student[`${ads?.form_checklist_key}`] === "Yes") {
                      for (let ad of ads?.nested_form_checklist_nested) {
                        customs.push({
                          form_checklist_name: ad?.form_checklist_name,
                          form_checklist_key: ad?.form_checklist_key,
                          form_checklist_visibility: ad?.form_checklist_visibility,
                          form_checklist_placeholder: ad?.form_checklist_placeholder,
                          form_checklist_lable: ad?.form_checklist_lable,
                          form_checklist_typo: ad?.form_checklist_typo,
                          form_checklist_typo_option_pl: ad?.form_checklist_typo_option_pl,
                          form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                          value: student[`${ad?.form_checklist_key}`] ?? nest_obj[`${ad?.form_checklist_key}`]
                        })
                      }
                    }
                    var list = student?.student_dynamic_field?.filter((dna) => {
                      if (dna?.key === ads?.form_checklist_key) {
                        nest_obj[`${dna?.key}`] = dna?.value
                      }
                    })
                      custom.push({
                        form_checklist_name: ads?.form_checklist_name,
                        form_checklist_key: ads?.form_checklist_key,
                        form_checklist_visibility: ads?.form_checklist_visibility,
                        form_checklist_placeholder: ads?.form_checklist_placeholder,
                        form_checklist_lable: ads?.form_checklist_lable,
                        form_checklist_typo: ads?.form_checklist_typo,
                        form_checklist_typo_option_pl: ads?.form_checklist_typo_option_pl,
                        form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                        nested_form_checklist_nested: [...customs],
                        value: student[`${ads?.form_checklist_key}`] ?? nest_obj[`${ads?.form_checklist_key}`]
                      })
                    customs = []
                    if (student[`${ads?.form_checklist_key}`] === "No") { 
                      custom = []
                    }
                  }
                }
                head_array.push({
                  form_checklist_name: ele?.form_checklist_name,
                  form_checklist_key: ele?.form_checklist_key,
                  form_checklist_visibility: ele?.form_checklist_visibility,
                  form_checklist_placeholder: ele?.form_checklist_placeholder,
                  form_checklist_lable: ele?.form_checklist_lable,
                  form_checklist_typo: ele?.form_checklist_typo,
                  form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                  form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                  nested_form_checklist: [...custom],
                  value: student[`${ele?.form_checklist_key}`] ?? nest_objs[`${ele?.form_checklist_key}`]
                })
                custom = []
              }
            }
            obj[`fields`] = [...head_array]
            head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
            obj = {}
            head_array = []
          }
        }
        else {
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
                    var name3 = name1?.replace("@INSTITUTE_NAME", `${all_check?.application?.admissionAdmin?.institute?.insName}`)
                    var name4 = name3?.replace("@PARENTS_NAME", `${student?.studentParentsName}`)
                    var name2 = name4?.replace("@DATE", app_date)
                  }
                  else if (ele?.form_checklist_key === "student_anti_ragging") {
                    var name1 = val?.section_value?.replace("@STUDENT_NAME", `${student?.studentFirstName} ${student?.studentMiddleName ?? ""} ${student?.studentLastName}`)
                    var name3 = name1?.replace("@INSTITUTE_NAME", `${all_check?.application?.admissionAdmin?.institute?.insName}`)
                    var name4 = name3?.replace("@PARENTS_NAME", `${student?.studentParentsName}`)
                    var name2 = name4?.replace("@DATE", app_date)
                  }
                  head_array.push({
                    form_checklist_name: ele?.form_checklist_name,
                    form_checklist_key: ele?.form_checklist_key,
                    form_checklist_visibility: ele?.form_checklist_visibility,
                    form_checklist_placeholder: ele?.form_checklist_placeholder,
                    form_checklist_lable: ele?.form_checklist_lable,
                    form_checklist_typo: ele?.form_checklist_typo,
                    form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                    form_common_key: ele?.form_common_key,
                    form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                    value: (ele?.form_checklist_key === "student_undertakings" || ele?.form_checklist_key === "student_anti_ragging") ? name2 ?? "" : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                    // value: name2 ? name2 : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                  })
                  name2 = ""
                }
              }
            }
            obj[`fields`] = [...head_array]
            head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
            obj = {}
            head_array = []
          }
        }
      }
      res.status(200).send({ message: "Explore One Student Institute Dynamic Form Query", access: true, result: [...head_arrays]})
    }
    else if (student?.student_form_flow?.flow === "DEPARTMENT") {
      var head_array = []
      var head_arrays = []
      var obj = {}
      var nest_obj = {}
      var nest_objs = {}
      var app_date = `${new Date()?.getDate()}-${new Date()?.getMonth() + 1}-${new Date()?.getFullYear()}`
      const all_check = await DepartmentStudentForm.findOne({ department: student?.student_form_flow?.did })
      .select("form_section")
      .populate({
        path: "form_section",
        populate: {
          path: "form_checklist",
          populate: {
            path: "nested_form_checklist",
            populate: {
              path: "nested_form_checklist_nested"
            }
          }
        }
      })
      .populate({
        path: "department",
        select: "institute",
        populate: {
          path: "institute",
          select: "insName"
        }
      })
      var custom = []
      var customs = []
      for (var val of all_check?.form_section) {
        if (val?.section_key === "academic_details") {
          if (val?.section_visibilty == true) {
            for (var ele of val?.form_checklist) {
              var list = student?.student_dynamic_field?.filter((dna) => {
                if (dna?.key === ele?.form_checklist_key) {
                  nest_objs[`${dna?.key}`] = dna?.value
                }
              })
              if (student[`${ele?.form_checklist_key}`] === "Yes" || nest_objs[`${ele?.form_checklist_key}`]) {
                if (ele?.form_checklist_visibility == true) {
                  for (let ads of ele?.nested_form_checklist) {
                    if (student[`${ads?.form_checklist_key}`] === "Yes") {
                      for (let ad of ads?.nested_form_checklist_nested) {
                        customs.push({
                          form_checklist_name: ad?.form_checklist_name,
                          form_checklist_key: ad?.form_checklist_key,
                          form_checklist_visibility: ad?.form_checklist_visibility,
                          form_checklist_placeholder: ad?.form_checklist_placeholder,
                          form_checklist_lable: ad?.form_checklist_lable,
                          form_checklist_typo: ad?.form_checklist_typo,
                          form_checklist_typo_option_pl: ad?.form_checklist_typo_option_pl,
                          form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                          value: student[`${ad?.form_checklist_key}`] ?? nest_obj[`${ad?.form_checklist_key}`]
                        })
                      }
                    }
                    var list = student?.student_dynamic_field?.filter((dna) => {
                      if (dna?.key === ads?.form_checklist_key) {
                        nest_obj[`${dna?.key}`] = dna?.value
                      }
                    })
                      custom.push({
                        form_checklist_name: ads?.form_checklist_name,
                        form_checklist_key: ads?.form_checklist_key,
                        form_checklist_visibility: ads?.form_checklist_visibility,
                        form_checklist_placeholder: ads?.form_checklist_placeholder,
                        form_checklist_lable: ads?.form_checklist_lable,
                        form_checklist_typo: ads?.form_checklist_typo,
                        form_checklist_typo_option_pl: ads?.form_checklist_typo_option_pl,
                        form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                        nested_form_checklist_nested: [...customs],
                        value: student[`${ads?.form_checklist_key}`] ?? nest_obj[`${ads?.form_checklist_key}`]
                      })
                    customs = []
                    if (student[`${ads?.form_checklist_key}`] === "No") { 
                      custom = []
                    }
                  }
                }
                head_array.push({
                  form_checklist_name: ele?.form_checklist_name,
                  form_checklist_key: ele?.form_checklist_key,
                  form_checklist_visibility: ele?.form_checklist_visibility,
                  form_checklist_placeholder: ele?.form_checklist_placeholder,
                  form_checklist_lable: ele?.form_checklist_lable,
                  form_checklist_typo: ele?.form_checklist_typo,
                  form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                  form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                  nested_form_checklist: [...custom],
                  value: student[`${ele?.form_checklist_key}`] ?? nest_objs[`${ele?.form_checklist_key}`]
                })
                custom = []
              }
            }
            obj[`fields`] = [...head_array]
            head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
            obj = {}
            head_array = []
          }
        }
        else {
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
                    var name3 = name1?.replace("@INSTITUTE_NAME", `${all_check?.application?.admissionAdmin?.institute?.insName}`)
                    var name4 = name3?.replace("@PARENTS_NAME", `${student?.studentParentsName}`)
                    var name2 = name4?.replace("@DATE", app_date)
                  }
                  else if (ele?.form_checklist_key === "student_anti_ragging") {
                    var name1 = val?.section_value?.replace("@STUDENT_NAME", `${student?.studentFirstName} ${student?.studentMiddleName ?? ""} ${student?.studentLastName}`)
                    var name3 = name1?.replace("@INSTITUTE_NAME", `${all_check?.application?.admissionAdmin?.institute?.insName}`)
                    var name4 = name3?.replace("@PARENTS_NAME", `${student?.studentParentsName}`)
                    var name2 = name4?.replace("@DATE", app_date)
                  }
                  head_array.push({
                    form_checklist_name: ele?.form_checklist_name,
                    form_checklist_key: ele?.form_checklist_key,
                    form_checklist_visibility: ele?.form_checklist_visibility,
                    form_checklist_placeholder: ele?.form_checklist_placeholder,
                    form_checklist_lable: ele?.form_checklist_lable,
                    form_checklist_typo: ele?.form_checklist_typo,
                    form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                    form_common_key: ele?.form_common_key,
                    form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                    value: (ele?.form_checklist_key === "student_undertakings" || ele?.form_checklist_key === "student_anti_ragging") ? name2 ?? "" : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                    // value: name2 ? name2 : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                  })
                  name2 = ""
                }
              }
            }
            obj[`fields`] = [...head_array]
            head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
            obj = {}
            head_array = []
          }
        }
      }
      res.status(200).send({ message: "Explore One Student Department Dynamic Form Query", access: true, result: [...head_arrays]})
    }
    else if (student?.student_form_flow?.flow === "APPLICATION") {
      var head_array = []
      var head_arrays = []
      var obj = {}
      var nest_obj = {}
      var nest_objs = {}
      var app_date = `${new Date()?.getDate()}-${new Date()?.getMonth() + 1}-${new Date()?.getFullYear()}`
      var app_name = await NewApplication.findById({ _id: student?.student_form_flow?.did })
      .select("applicationName")
      const all_check = await InstituteApplicationForm.findOne({ application: student?.student_form_flow?.did })
      .select("form_section")
      .populate({
        path: "form_section",
        populate: {
          path: "form_checklist",
          populate: {
            path: "nested_form_checklist",
            populate: {
              path: "nested_form_checklist_nested"
            }
          }
        }
      })
      .populate({
        path: "application",
        select: "admissionAdmin",
        populate: {
          path: "admissionAdmin",
          select: "institute",
          populate: {
            path: "institute",
            select: "insName"
          }
        }
      })
      var custom = []
      var customs = []
      for (var val of all_check?.form_section) {
        if (val?.section_key === "academic_details") {
          if (val?.section_visibilty == true) {
            for (var ele of val?.form_checklist) {
              var list = student?.student_dynamic_field?.filter((dna) => {
                if (dna?.key === ele?.form_checklist_key) {
                  nest_objs[`${dna?.key}`] = dna?.value
                }
              })
              if (student[`${ele?.form_checklist_key}`] === "Yes" || nest_objs[`${ele?.form_checklist_key}`]) {
                if (ele?.form_checklist_visibility == true) {
                  for (let ads of ele?.nested_form_checklist) {
                    if (student[`${ads?.form_checklist_key}`] === "Yes") {
                      for (let ad of ads?.nested_form_checklist_nested) {
                        customs.push({
                          form_checklist_name: ad?.form_checklist_name,
                          form_checklist_key: ad?.form_checklist_key,
                          form_checklist_visibility: ad?.form_checklist_visibility,
                          form_checklist_placeholder: ad?.form_checklist_placeholder,
                          form_checklist_lable: ad?.form_checklist_lable,
                          form_checklist_typo: ad?.form_checklist_typo,
                          form_checklist_typo_option_pl: ad?.form_checklist_typo_option_pl,
                          form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                          value: student[`${ad?.form_checklist_key}`] ?? nest_obj[`${ad?.form_checklist_key}`]
                        })
                      }
                    }
                    var list = student?.student_dynamic_field?.filter((dna) => {
                      if (dna?.key === ads?.form_checklist_key) {
                        nest_obj[`${dna?.key}`] = dna?.value
                      }
                    })
                      custom.push({
                        form_checklist_name: ads?.form_checklist_name,
                        form_checklist_key: ads?.form_checklist_key,
                        form_checklist_visibility: ads?.form_checklist_visibility,
                        form_checklist_placeholder: ads?.form_checklist_placeholder,
                        form_checklist_lable: ads?.form_checklist_lable,
                        form_checklist_typo: ads?.form_checklist_typo,
                        form_checklist_typo_option_pl: ads?.form_checklist_typo_option_pl,
                        form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                        nested_form_checklist_nested: [...customs],
                        value: student[`${ads?.form_checklist_key}`] ?? nest_obj[`${ads?.form_checklist_key}`]
                      })
                    customs = []
                    if (student[`${ads?.form_checklist_key}`] === "No") { 
                      custom = []
                    }
                  }
                }
                head_array.push({
                  form_checklist_name: ele?.form_checklist_name,
                  form_checklist_key: ele?.form_checklist_key,
                  form_checklist_visibility: ele?.form_checklist_visibility,
                  form_checklist_placeholder: ele?.form_checklist_placeholder,
                  form_checklist_lable: ele?.form_checklist_lable,
                  form_checklist_typo: ele?.form_checklist_typo,
                  form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                  form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                  nested_form_checklist: [...custom],
                  value: student[`${ele?.form_checklist_key}`] ?? nest_objs[`${ele?.form_checklist_key}`]
                })
                custom = []
              }
            }
            obj[`fields`] = [...head_array]
            head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
            obj = {}
            head_array = []
          }
        }
        else {
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
                    var name3 = name1?.replace("@INSTITUTE_NAME", `${all_check?.application?.admissionAdmin?.institute?.insName}`)
                    var name4 = name3?.replace("@PARENTS_NAME", `${student?.studentParentsName}`)
                    var name5 = name4?.replace("@APPLICATION_NAME", `${app_name?.applicationName}`)
                    var name2 = name5?.replace("@DATE", app_date)
                  }
                  else if (ele?.form_checklist_key === "student_anti_ragging") {
                    var name1 = val?.section_value?.replace("@STUDENT_NAME", `${student?.studentFirstName} ${student?.studentMiddleName ?? ""} ${student?.studentLastName}`)
                    var name3 = name1?.replace("@INSTITUTE_NAME", `${all_check?.application?.admissionAdmin?.institute?.insName}`)
                    var name4 = name3?.replace("@PARENTS_NAME", `${student?.studentParentsName}`)
                    var name5 = name4?.replace("@APPLICATION_NAME", `${app_name?.applicationName}`)
                    var name2 = name5?.replace("@DATE", app_date)
                  }
                  head_array.push({
                    form_checklist_name: ele?.form_checklist_name,
                    form_checklist_key: ele?.form_checklist_key,
                    form_checklist_visibility: ele?.form_checklist_visibility,
                    form_checklist_placeholder: ele?.form_checklist_placeholder,
                    form_checklist_lable: ele?.form_checklist_lable,
                    form_checklist_typo: ele?.form_checklist_typo,
                    form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                    form_common_key: ele?.form_common_key,
                    form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                    value: (ele?.form_checklist_key === "student_undertakings" || ele?.form_checklist_key === "student_anti_ragging") ? name2 ?? "" : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                    // value: name2 ? name2 : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                  })
                  name2 = ""
                }
              }
            }
            obj[`fields`] = [...head_array]
            head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
            obj = {}
            head_array = []
          }
        }
      }
      res.status(200).send({ message: "Explore One Student Application Dynamic Form Query", access: true, result: [...head_arrays]})
    }
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_dynamic_form_subject_list_query = async (req, res) => {
  try {
    const { sid } = req?.params
    if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var student = await Student.findById({ _id: sid })
      .populate({
        path: "student_optional_subject",
        select: "subjectName"
      })
      student.studentFatherName = student?.studentMiddleName ?? student?.studentFatherName
    if (student?.student_form_flow?.flow === "APPLICATION") {
      var head_array = []
      var head_arrays = []
      var obj = {}
      var nest_obj = {}
      var nest_objs = {}
      var app_date = `${new Date()?.getDate()}-${new Date()?.getMonth() + 1}-${new Date()?.getFullYear()}`
      var app_name = await NewApplication.findById({ _id: student?.student_form_flow?.did })
      .select("applicationName")
      const all_check = await InstituteApplicationForm.findOne({ application: student?.student_form_flow?.did })
      .select("form_section")
      .populate({
        path: "form_section",
        populate: {
          path: "form_checklist",
          populate: {
            path: "nested_form_checklist",
            populate: {
              path: "nested_form_checklist_nested"
            }
          }
        }
      })
      .populate({
        path: "application",
        select: "admissionAdmin",
        populate: {
          path: "admissionAdmin",
          select: "institute",
          populate: {
            path: "institute",
            select: "insName"
          }
        }
      })
      var custom = []
      var customs = []
      for (var val of all_check?.form_section) {
        if (val?.section_key === "academic_details") {
          if (val?.section_visibilty == true) {
            for (var ele of val?.form_checklist) {
              var list = student?.student_dynamic_field?.filter((dna) => {
                if (dna?.key === ele?.form_checklist_key) {
                  nest_objs[`${dna?.key}`] = dna?.value
                }
              })
              if (student[`${ele?.form_checklist_key}`] === "Yes" || nest_objs[`${ele?.form_checklist_key}`]) {
                if (ele?.form_checklist_visibility == true) {
                  for (let ads of ele?.nested_form_checklist) {
                    if (student[`${ads?.form_checklist_key}`] === "Yes") {
                      for (let ad of ads?.nested_form_checklist_nested) {
                        customs.push({
                          form_checklist_name: ad?.form_checklist_name,
                          form_checklist_key: ad?.form_checklist_key,
                          form_checklist_visibility: ad?.form_checklist_visibility,
                          form_checklist_placeholder: ad?.form_checklist_placeholder,
                          form_checklist_lable: ad?.form_checklist_lable,
                          form_checklist_typo: ad?.form_checklist_typo,
                          form_checklist_typo_option_pl: ad?.form_checklist_typo_option_pl,
                          form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                          value: student[`${ad?.form_checklist_key}`] ?? nest_obj[`${ad?.form_checklist_key}`]
                        })
                      }
                    }
                    var list = student?.student_dynamic_field?.filter((dna) => {
                      if (dna?.key === ads?.form_checklist_key) {
                        nest_obj[`${dna?.key}`] = dna?.value
                      }
                    })
                      custom.push({
                        form_checklist_name: ads?.form_checklist_name,
                        form_checklist_key: ads?.form_checklist_key,
                        form_checklist_visibility: ads?.form_checklist_visibility,
                        form_checklist_placeholder: ads?.form_checklist_placeholder,
                        form_checklist_lable: ads?.form_checklist_lable,
                        form_checklist_typo: ads?.form_checklist_typo,
                        form_checklist_typo_option_pl: ads?.form_checklist_typo_option_pl,
                        form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                        nested_form_checklist_nested: [...customs],
                        value: student[`${ads?.form_checklist_key}`] ?? nest_obj[`${ads?.form_checklist_key}`]
                      })
                    customs = []
                    if (student[`${ads?.form_checklist_key}`] === "No") { 
                      custom = []
                    }
                  }
                }
                head_array.push({
                  form_checklist_name: ele?.form_checklist_name,
                  form_checklist_key: ele?.form_checklist_key,
                  form_checklist_visibility: ele?.form_checklist_visibility,
                  form_checklist_placeholder: ele?.form_checklist_placeholder,
                  form_checklist_lable: ele?.form_checklist_lable,
                  form_checklist_typo: ele?.form_checklist_typo,
                  form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                  form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                  nested_form_checklist: [...custom],
                  value: student[`${ele?.form_checklist_key}`] ?? nest_objs[`${ele?.form_checklist_key}`]
                })
                custom = []
              }
            }
            obj[`fields`] = [...head_array]
            head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
            obj = {}
            head_array = []
          }
        }
        else {
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
                    var name3 = name1?.replace("@INSTITUTE_NAME", `${all_check?.application?.admissionAdmin?.institute?.insName}`)
                    var name4 = name3?.replace("@PARENTS_NAME", `${student?.studentParentsName}`)
                    var name5 = name4?.replace("@APPLICATION_NAME", `${app_name?.applicationName}`)
                    var name2 = name5?.replace("@DATE", app_date)
                  }
                  else if (ele?.form_checklist_key === "student_anti_ragging") {
                    var name1 = val?.section_value?.replace("@STUDENT_NAME", `${student?.studentFirstName} ${student?.studentMiddleName ?? ""} ${student?.studentLastName}`)
                    var name3 = name1?.replace("@INSTITUTE_NAME", `${all_check?.application?.admissionAdmin?.institute?.insName}`)
                    var name4 = name3?.replace("@PARENTS_NAME", `${student?.studentParentsName}`)
                    var name5 = name4?.replace("@APPLICATION_NAME", `${app_name?.applicationName}`)
                    var name2 = name5?.replace("@DATE", app_date)
                  }
                  head_array.push({
                    form_checklist_name: ele?.form_checklist_name,
                    form_checklist_key: ele?.form_checklist_key,
                    form_checklist_visibility: ele?.form_checklist_visibility,
                    form_checklist_placeholder: ele?.form_checklist_placeholder,
                    form_checklist_lable: ele?.form_checklist_lable,
                    form_checklist_typo: ele?.form_checklist_typo,
                    form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
                    form_common_key: ele?.form_common_key,
                    form_checklist_required: (val?.section_key === "documents" || val?.section_key === "social_reservation_information_section") ? false : true,
                    value: (ele?.form_checklist_key === "student_undertakings" || ele?.form_checklist_key === "student_anti_ragging") ? name2 ?? "" : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                    // value: name2 ? name2 : student[`${ele?.form_checklist_key}`] ?? nest_obj[`${ele?.form_checklist_key}`]
                  })
                  name2 = ""
                }
              }
            }
            obj[`fields`] = [...head_array]
            head_arrays.push({ ...obj, key: val?.section_name, static_key: val?.section_key })
            obj = {}
            head_array = []
          }
        }
      }
      head_arrays?.splice(0, 1)
      var n = []
      var objs = {}
      for (let ele of student?.student_optional_subject) {
        n.push({
          value: `${ele?.subjectName}`
        })
      }
      objs[`fields`] = [...n]
      head_arrays.push({ ...objs, key: "Selected Subjects", static_key: "selected_subjects" })
      res.status(200).send({ message: "Explore One Student Application Dynamic Form Query", access: true, result: [...head_arrays]})
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
    const { flow, did, aid, apk } = req?.query
    if (!flow && !did) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    if (apk === "WEB") {
      if (flow === "INSTITUTE") {
        const ins_form = await InstituteStudentForm.findOne({ institute: did })
          .select("form_section")
          .populate({
            path: "form_section",
            populate: {
              path: "form_checklist",
              populate: {
                path: "nested_form_checklist",
                populate: {
                  path: "nested_form_checklist_nested"
                }
              }
            }
          })
    
        var all_section = ins_form?.form_section?.filter((val) => {
          if (val?.section_visibilty) return val
        })
        for (var ele of all_section) {
          for (var stu of ele?.form_checklist) {
              ele.form_checklist = ele?.form_checklist?.filter((qwe) => {
                if (qwe?.form_checklist_visibility) {
                  return qwe
                }
                else {
                  return null
                }
              })
            stu.form_checklist_required = (ele?.section_key === "documents" || ele?.section_key === "social_reservation_information_section") ? false : true
          }
        }
        res.status(200).send({ message: "Institute Form Query", access: true, ins_form: all_section })
      }
      else if (flow === "DEPARTMENT") {
        const depart_form = await DepartmentStudentForm.findOne({ department: did })
          .select("form_section")
          .populate({
            path: "form_section",
            populate: {
              path: "form_checklist",
              populate: {
                path: "nested_form_checklist",
                populate: {
                  path: "nested_form_checklist_nested"
                }
              }
            }
          })
    
        var all_section = depart_form?.form_section?.filter((val) => {
          if (val?.section_visibilty) return val
        })

        for (var ele of all_section) {
          for (var stu of ele?.form_checklist) {
              ele.form_checklist = ele?.form_checklist?.filter((qwe) => {
                if (qwe?.form_checklist_visibility) {
                  return qwe
                }
                else {
                  return null
                }
              })
            stu.form_checklist_required = (ele?.section_key === "documents" || ele?.section_key === "social_reservation_information_section") ? false : true
          }
        }
        res.status(200).send({ message: "Department Form Query", access: true, depart_form: all_section })
      }
      else if (flow === "APPLICATION") {
        const app = await NewApplication.findById({ _id: did })
          .select("subject_selected_group")
        const app_form = await InstituteApplicationForm.findOne({ application: did })
          .select("form_section")
          .populate({
            path: "form_section",
            populate: {
              path: "form_checklist",
              populate: {
                path: "nested_form_checklist",
                populate: {
                  path: "nested_form_checklist_nested"
                }
              }
            }
          })
    
        var all_section = app_form?.form_section?.filter((val) => {
          if (val?.section_visibilty) return val
        })

        for (var ele of all_section) {
          for (var stu of ele?.form_checklist) {
              ele.form_checklist = ele?.form_checklist?.filter((qwe) => {
                if (qwe?.form_checklist_visibility) {
                  return qwe
                }
                else {
                  return null
                }
              })
            stu.form_checklist_required = (ele?.section_key === "documents" || ele?.section_key === "social_reservation_information_section") ? false : true
          }
        }
        var all_subjects = await SubjectGroup.find({ _id: { $in: app?.subject_selected_group} })
        .populate({
          path: "subject_group_select",
          populate: {
            path: "compulsory_subject",
            select: "subjectName",
          }
        })
        .populate({
          path: "subject_group_select",
          populate: {
            path: "optional_subject",
            populate: {
            path: "optional_subject_options optional_subject_options_or.options",
            select: "subjectName",
          }
          }
        })
        .populate({
          path: "subject_group_select",
          populate: {
            path: "fixed_subject",
            populate: {
            path: "fixed_subject_options",
            select: "subjectName",
          }
          }
        })
        var nums_subject = []
        var nums_select = []
        var nums_group = []
        for (var ele of all_subjects) {
          for (var val of ele?.subject_group_select) {
            for (var set of val?.compulsory_subject) {
              nums_select.push(
                {
                  form_checklist_name: `${set?.subjectName}`,
                  form_checklist_key: "subject_criteria",
                  form_checklist_visibility: true,
                  form_checklist_placeholder: `${set?.subjectName}`,
                  form_checklist_lable: "",
                  form_checklist_typo: "TEXT",
                  form_checklist_sample: `${set?.subjectName}`,
                  form_checklist_subjectId: `${set?._id}`,
                  form_checklist_typo_option_pl: []
                })
            }
            for (var set of val?.optional_subject) {
              nums_select.push(
                {
                  form_checklist_name: `${set?.optional_subject_name}`,
                  form_checklist_key: "subject_criteria",
                  form_checklist_visibility: true,
                  form_checklist_placeholder: `${set?.optional_subject_name}`,
                  form_checklist_lable: `${set?.optional_subject_name}`,
                  form_checklist_typo: "SELECT",
                  form_checklist_typo_option_pl: [
                     ...set?.optional_subject_options
                  ],
                  form_checklist_typo_option_pl_optional: [...set?.optional_subject_options_or],
                  form_checklist_rule: set?.optional_subject_rule,
                  form_checklist_rule_max: set?.optional_subject_rule_max
              })
            }
            for (var set of val?.fixed_subject) {
              nums_select.push(
                {
                  form_checklist_name: `${set?.fixed_subject_name}`,
                  form_checklist_key: "subject_criteria",
                  form_checklist_visibility: true,
                  form_checklist_placeholder: `${set?.fixed_subject_name}`,
                  form_checklist_lable: `${set?.fixed_subject_name}`,
                  form_checklist_typo: "SELECT_GROUP",
                  form_checklist_typo_option_pl: [
                     ...set?.fixed_subject_options
                  ],
                  form_checklist_rule: set?.fixed_subject_rule,
                  form_checklist_rule_max: set?.fixed_subject_rule_max
              })
            }
            nums_group.push(
              {
                nested_section_name: `${val?.group_name}`,
                nested_section_visibilty: true,
                nested_section_key: "subject_criteria",
                nested_form_checklist: [...nums_select],
                nested_section_typo: "CHECKBOX"
              }
            )
            nums_select = []
          }
          nums_subject.push({
            section_name: `${ele?.subject_group_name}`,
            section_visibilty: true,
            section_key: "subject_criteria",
            section_group: ele?.no_of_group,
            nested_section: [...nums_group]
          })
        }
        if (app?.subject_selected_group?.length > 0) {
          all_section.push(...nums_subject) 
        }
        res.status(200).send({ message: "Application Form Query", access: true, app_form: all_section })
      }
    }
    else {
      if (flow === "INSTITUTE") {
        const ins_form = await InstituteStudentForm.findOne({ institute: did })
          .select("form_section")
          .populate({
            path: "form_section",
            populate: {
              path: "form_checklist",
              populate: {
                path: "nested_form_checklist",
                populate: {
                  path: "nested_form_checklist_nested"
                }
              }
            }
          })
    
        var all_section = ins_form?.form_section?.filter((val) => {
          if (val?.section_visibilty) return val
        })
        all_section[1].form_checklist.unshift(...all_section?.[0]?.form_checklist)
        for (var ele of all_section) {
          for (var stu of ele?.form_checklist) {
              ele.form_checklist = ele?.form_checklist?.filter((qwe) => {
                if (qwe?.form_checklist_visibility) {
                  return qwe
                }
                else {
                  return null
                }
              })
            stu.form_checklist_required = (ele?.section_key === "documents" || ele?.section_key === "social_reservation_information_section") ? false : true
          }
        }
        all_section.splice(0, 1)
        res.status(200).send({ message: "Institute Form Query", access: true, ins_form: all_section })
      }
      else if (flow === "DEPARTMENT") {
        const depart_form = await DepartmentStudentForm.findOne({ department: did })
          .select("form_section")
          .populate({
            path: "form_section",
            populate: {
              path: "form_checklist",
              populate: {
                path: "nested_form_checklist",
                populate: {
                  path: "nested_form_checklist_nested"
                }
              }
            }
          })
    
        var all_section = depart_form?.form_section?.filter((val) => {
          if (val?.section_visibilty) return val
        })
        all_section[1].form_checklist.unshift(...all_section?.[0]?.form_checklist)
        for (var ele of all_section) {
          for (var stu of ele?.form_checklist) {
              ele.form_checklist = ele?.form_checklist?.filter((qwe) => {
                if (qwe?.form_checklist_visibility) {
                  return qwe
                }
                else {
                  return null
                }
              })
            stu.form_checklist_required = (ele?.section_key === "documents" || ele?.section_key === "social_reservation_information_section") ? false : true
          }
        }
        all_section.splice(0, 1)
        res.status(200).send({ message: "Department Form Query", access: true, depart_form: all_section })
      }
      else if (flow === "APPLICATION") {
        const app = await NewApplication.findById({ _id: did })
          .select("subject_selected_group")
        const app_form = await InstituteApplicationForm.findOne({ application: did })
          .select("form_section")
          .populate({
            path: "form_section",
            populate: {
              path: "form_checklist",
              populate: {
                path: "nested_form_checklist",
                populate: {
                  path: "nested_form_checklist_nested"
                }
              }
            }
          })
    
        var all_section = app_form?.form_section?.filter((val) => {
          if (val?.section_visibilty) return val
        })
        all_section[1].form_checklist.unshift(...all_section?.[0]?.form_checklist)
        for (var ele of all_section) {
          for (var stu of ele?.form_checklist) {
        
              ele.form_checklist = ele?.form_checklist?.filter((qwe) => {
                if (qwe?.form_checklist_visibility) {
                  return qwe
                }
                else {
                  return null
                }
              })
            stu.form_checklist_required = (ele?.section_key === "documents" || ele?.section_key === "social_reservation_information_section") ? false : true
          }
        }
        all_section.splice(0, 1)
        var all_subjects = await SubjectGroup.find({ _id: { $in: app?.subject_selected_group} })
        .populate({
          path: "subject_group_select",
          populate: {
            path: "compulsory_subject",
            select: "subjectName",
          }
        })
        .populate({
          path: "subject_group_select",
          populate: {
            path: "optional_subject",
            populate: {
            path: "optional_subject_options optional_subject_options_or.options",
            select: "subjectName",
          }
          }
        })
        .populate({
          path: "subject_group_select",
          populate: {
            path: "fixed_subject",
            populate: {
            path: "fixed_subject_options",
            select: "subjectName",
          }
          }
        })
        var nums_subject = []
        var nums_select = []
        var nums_group = []
        for (var ele of all_subjects) {
          for (var val of ele?.subject_group_select) {
            for (var set of val?.compulsory_subject) {
              nums_select.push(
                {
                  form_checklist_name: `${set?.subjectName}`,
                  form_checklist_key: "subject_criteria",
                  form_checklist_visibility: true,
                  form_checklist_placeholder: `${set?.subjectName}`,
                  form_checklist_lable: "",
                  form_checklist_typo: "TEXT",
                  form_checklist_sample: `${set?.subjectName}`,
                  form_checklist_subjectId: `${set?._id}`,
                  form_checklist_typo_option_pl: []
                })
            }
            for (var set of val?.optional_subject) {
              nums_select.push(
                {
                  form_checklist_name: `${set?.optional_subject_name}`,
                  form_checklist_key: "subject_criteria",
                  form_checklist_visibility: true,
                  form_checklist_placeholder: `${set?.optional_subject_name}`,
                  form_checklist_lable: `${set?.optional_subject_name}`,
                  form_checklist_typo: "SELECT",
                  form_checklist_typo_option_pl: [
                     ...set?.optional_subject_options
                  ],
                  form_checklist_typo_option_pl_optional: [...set?.optional_subject_options_or],
                  form_checklist_rule: set?.optional_subject_rule,
                  form_checklist_rule_max: set?.optional_subject_rule_max
              })
            }
            for (var set of val?.fixed_subject) {
              nums_select.push(
                {
                  form_checklist_name: `${set?.fixed_subject_name}`,
                  form_checklist_key: "subject_criteria",
                  form_checklist_visibility: true,
                  form_checklist_placeholder: `${set?.fixed_subject_name}`,
                  form_checklist_lable: `${set?.fixed_subject_name}`,
                  form_checklist_typo: "SELECT_GROUP",
                  form_checklist_typo_option_pl: [
                     ...set?.fixed_subject_options
                  ],
                  form_checklist_rule: set?.fixed_subject_rule,
                  form_checklist_rule_max: set?.fixed_subject_rule_max
              })
            }
            nums_group.push(
              {
                nested_section_name: `${val?.group_name}`,
                nested_section_visibilty: true,
                nested_section_key: "subject_criteria",
                nested_form_checklist: [...nums_select],
                nested_section_typo: "CHECKBOX"
              }
            )
            nums_select = []
          }
          nums_subject.push({
            section_name: `${ele?.subject_group_name}`,
            section_visibilty: true,
            section_key: "subject_criteria",
            section_group: ele?.no_of_group,
            nested_section: [...nums_group]
          })
        }
        if (app?.subject_selected_group?.length > 0) {
          all_section.push(...nums_subject) 
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
    const { flow, did, fsid, content, key } = req?.body
    if (!flow && !did) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    if (flow === "INSTITUTE") {
      const ins_form = await InstituteStudentForm.findOne({ institute: did })
      const ins = await InstituteAdmin.findById({ _id: did })
        .select("depart admissionDepart")
      for (var val of ins_form?.form_section) {
        if (`${val?._id}` === `${fsid}`) {
          val.section_pdf = content
          val.section_value = content
        }
      }
      await ins_form.save()
      res.status(200).send({ message: "Institute Form Query", access: true })
      var all_app = await NewApplication.find({ admissionAdmin: ins?.admissionDepart?.[0] })
      var all_depart = await DepartmentStudentForm.find({ department: { $in: ins?.depart } })
      if (key === "antiragging_affidavit") {
        for (let ele of all_depart) {
          for (var val of ele?.form_section) {
            if (`${val?.section_key}` === `antiragging_affidavit`) {
              val.section_pdf = content
              val.section_value = content
            }
          }
          await ele.save()
        }
        var all_app_form = await InstituteApplicationForm.find({ application: { $in: all_app}})
        for (let ele of all_app_form) {
          for (var val of ele?.form_section) {
            if (`${val?.section_key}` === `antiragging_affidavit`) {
              val.section_pdf = content
              val.section_value = content
            }
          }
          await ele.save()
        } 
      }
      else if (key === "undertakings") {
          for (let ele of all_depart) {
            for (var val of ele?.form_section) {
              if (`${val?.section_key}` === `undertakings`) {
                val.section_pdf = content
                val.section_value = content
              }
            }
            await ele.save()
          }
          var all_app_form = await InstituteApplicationForm.find({ application: { $in: all_app}})
          for (let ele of all_app_form) {
            for (var val of ele?.form_section) {
              if (`${val?.section_key}` === `undertakings`) {
                val.section_pdf = content
                val.section_value = content
              }
            }
            await ele.save()
          } 
      }
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



