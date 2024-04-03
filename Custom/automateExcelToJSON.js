const xlsx = require("xlsx");

const read_file_convert_json_format = async (file) => {
  try {
    // const data = await grab_file.arrayBuffer();
    const r_query = xlsx.read(file.Body);
    const r_sheet = r_query.Sheets[r_query.SheetNames?.[0]];
    const r_sheet_json = xlsx.utils.sheet_to_json(r_sheet, { raw: false });
    return { r_sheet_json };
  } catch (e) {
    console.log(e);
  }
};
exports.getj_institute_type_query = async (file) => {
  try {
    const { r_sheet_json } = await read_file_convert_json_format(file);
    const data_query = [];
    let sheet_row = r_sheet_json?.length;
    if (sheet_row > 0) {
      for (let i = 0; i < sheet_row; i++) {
        let row = r_sheet_json[i];
        data_query.push({
          name: row?.Name,
        });
      }
    }
    return { data_query };
  } catch (e) {
    console.log(e);
  }
};

exports.getj_university_query = async (file) => {
  try {
    const { r_sheet_json } = await read_file_convert_json_format(file);
    const data_query = [];
    let sheet_row = r_sheet_json?.length;
    if (sheet_row > 0) {
      for (let i = 0; i < sheet_row; i++) {
        let row = r_sheet_json[i];
        data_query.push({
          name: row?.Name,
        });
      }
    }
    return { data_query };
  } catch (e) {
    console.log(e);
  }
};

exports.getj_department_type_query = async (file) => {
  try {
    const { r_sheet_json } = await read_file_convert_json_format(file);
    const data_query = [];
    let sheet_row = r_sheet_json?.length;
    if (sheet_row > 0) {
      for (let i = 0; i < sheet_row; i++) {
        let row = r_sheet_json[i];
        data_query.push({
          name: row?.Name,
        });
      }
    }
    return { data_query };
  } catch (e) {
    console.log(e);
  }
};

exports.getj_stream_type_query = async (file) => {
  try {
    const { r_sheet_json } = await read_file_convert_json_format(file);
    const data_query = [];
    let sheet_row = r_sheet_json?.length;
    if (sheet_row > 0) {
      for (let i = 0; i < sheet_row; i++) {
        let row = r_sheet_json[i];
        data_query.push({
          institute_type: row?.Institute,
          affiliated_with: row?.Affiliated,
          name: row?.Stream,
          departmentType: row?.DepartmentType,
        });
      }
    }
    return { data_query };
  } catch (e) {
    console.log(e);
  }
};

exports.getj_stream_class_master_query = async (file) => {
  try {
    const { r_sheet_json } = await read_file_convert_json_format(file);
    const data_query = [];
    let sheet_row = r_sheet_json?.length;
    if (sheet_row > 0) {
      for (let i = 0; i < sheet_row; i++) {
        let row = r_sheet_json[i];
        data_query.push({
          name: row?.Name,
        });
      }
    }
    return { data_query };
  } catch (e) {
    console.log(e);
  }
};

exports.getj_stream_subject_master_query = async (file) => {
  try {
    const { r_sheet_json } = await read_file_convert_json_format(file);
    const data_query = [];
    let sheet_row = r_sheet_json?.length;
    if (sheet_row > 0) {
      for (let i = 0; i < sheet_row; i++) {
        let row = r_sheet_json[i];
        data_query.push({
          className: row?.ClassName,
          subjectName: row?.Subject,
          subjectType: row?.Type,
          is_practical: row?.Practical,
        });
      }
    }
    return { data_query };
  } catch (e) {
    console.log(e);
  }
};

exports.getj_stream_subject_master_teaching_plan_query = async (file) => {
  try {
    const { r_sheet_json } = await read_file_convert_json_format(file);
    const data_query = [];
    let sheet_row = r_sheet_json?.length;
    if (sheet_row > 0) {
      for (let i = 0; i < sheet_row; i++) {
        let row = r_sheet_json[i];
        data_query.push({
          teachingType: row?.Type,
          chapter_name: row?.Topic,
          chapter_link: row?.TopicLink,
          topic_name: row?.SubTopic,
          topic_last_date: row?.PlanningDate,
          course_outcome: row?.CourseOutcome,
          learning_outcome: row?.LearningOutcome,
          hours: row?.Hours,
          minutes: row?.Minutes,
          planning_date: row?.PlanningDate,
          topic_link: row?.SubTopicLink,
        });
      }
    }
    return { data_query };
  } catch (e) {
    console.log(e);
  }
};

exports.getj_department_po_query = async (file) => {
  try {
    const { r_sheet_json } = await read_file_convert_json_format(file);
    const data_query = [];
    let sheet_row = r_sheet_json?.length;
    if (sheet_row > 0) {
      for (let i = 0; i < sheet_row; i++) {
        let row = r_sheet_json[i];
        data_query.push({
          attainment_name: row?.Name,
          attainment_description: row?.Description,
        });
      }
    }
    return { data_query };
  } catch (e) {
    console.log(e);
  }
};

exports.getj_subject_master_co_query = async (file) => {
  try {
    const { r_sheet_json } = await read_file_convert_json_format(file);
    const data_query = [];
    let sheet_row = r_sheet_json?.length;
    if (sheet_row > 0) {
      for (let i = 0; i < sheet_row; i++) {
        let row = r_sheet_json[i];
        data_query.push({
          attainment_name: row?.Name,
          attainment_description: row?.Description ?? "",
          attainment_target: row?.Target ?? 0,
          attainment_code: row?.Code ?? "",
        });
      }
    }
    return { data_query };
  } catch (e) {
    console.log(e);
  }
};

exports.getj_department_holiday_query = async (file) => {
  try {
    const { r_sheet_json } = await read_file_convert_json_format(file);
    const data_query = [];
    let sheet_row = r_sheet_json?.length;
    if (sheet_row > 0) {
      for (let i = 0; i < sheet_row; i++) {
        let row = r_sheet_json[i];
        data_query.push({
          holiday_dates: row?.Dates,
          reason: row?.Reason,
          description: row?.Description,
        });
      }
    }
    return { data_query };
  } catch (e) {
    console.log(e);
  }
};

