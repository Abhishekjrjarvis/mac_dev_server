const Department = require("../../models/Department");
const DepartmentStudentForm = require("../../models/Form/DepartmentStudentForm");
const FormChecklist = require("../../models/Form/FormChecklist");
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
    await ifs.save()
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
      const all_check = await InstituteStudentForm.findOne({ institute: student?.student_form_flow?.did })
      .select("form_section")
      .populate({
      path: "form_section.form_checklist"
      })
      for (var val of all_check?.form_section) {
        for (var ele of val?.form_checklist) {
          var list = student?.student_dynamic_field?.filter((dna) => {
            if(dna?.key[`${ele?.form_checklist_key}`]) return dna?.value
          })
          head_array.push({
            form_checklist_name: ele?.form_checklist_name,
            form_checklist_key: ele?.form_checklist_key,
            form_checklist_visibility: ele?.form_checklist_visibility,
            form_checklist_placeholder: ele?.form_checklist_placeholder,
            form_checklist_lable: ele?.form_checklist_lable,
            form_checklist_typo: ele?.form_checklist_typo,
            form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
            form_checklist_required: ele?.form_checklist_required,
            value: student[`${ele?.form_checklist_key}`] ?? list[0] 
          })
        }
        obj[`fields`] = [...head_array]
        head_arrays.push({ ...obj, key: val?.section_name })
        obj = {}
        head_array = []
      }
      res.status(200).send({ message: "Explore One Student Institute Dynamic Form Query", access: true, result: [...head_arrays]})
    }
    else if (student?.student_form_flow?.flow === "DEPARTMENT") {
      var head_array = []
      var head_arrays = []
      var obj = {}
      const all_check = await DepartmentStudentForm.findOne({ department: student?.student_form_flow?.did })
      .select("form_section")
      .populate({
      path: "form_section.form_checklist"
      })
      for (var val of all_check?.form_section) {
        for (var ele of val?.form_checklist) {
          var list = student?.student_dynamic_field?.filter((dna) => {
            if(dna?.key[`${ele?.form_checklist_key}`]) return dna?.value
          })
          head_array.push({
            form_checklist_name: ele?.form_checklist_name,
            form_checklist_key: ele?.form_checklist_key,
            form_checklist_visibility: ele?.form_checklist_visibility,
            form_checklist_placeholder: ele?.form_checklist_placeholder,
            form_checklist_lable: ele?.form_checklist_lable,
            form_checklist_typo: ele?.form_checklist_typo,
            form_checklist_typo_option_pl: ele?.form_checklist_typo_option_pl,
            form_checklist_required: ele?.form_checklist_required,
            value: student[`${ele?.form_checklist_key}`] ?? list[0] 
          })
        }
        obj[`fields`] = [...head_array]
        head_arrays.push({ ...obj, key: val?.section_name })
        obj = {}
        head_array = []
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



