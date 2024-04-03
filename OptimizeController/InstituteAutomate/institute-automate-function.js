// const institute_type = {};
// let institute_type = "Engineering";
// let affiliated_with = "SPPU";
// let department_type = "Complete Department";
// let stream_type = "Computer Science";

const Department = require("../../models/Department");
const Class = require("../../models/Class");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Batch = require("../../models/Batch");
const Subject = require("../../models/Subject");
const SubjectMaster = require("../../models/SubjectMaster");
const ClassMaster = require("../../models/ClassMaster");
const Attainment = require("../../models/Marks/Attainment");
const Chapter = require("../../models/Academics/Chapter");
const ChapterTopic = require("../../models/Academics/ChapterTopic");
const AttendanceTeachingPlanHistory = require("../../models/InstituteAutomate/AttendanceTeachingPlanHistory");
const AutomateChapterTopic = require("../../models/InstituteAutomate/AutomateChapterTopic");
const AutomateChapter = require("../../models/InstituteAutomate/AutomateChapter");
const StreamType = require("../../models/InstituteAutomate/StreamType");
const AutomateSubjectMaster = require("../../models/InstituteAutomate/AutomateSubjectMaster");
const { universal_random_password } = require("../../Custom/universalId");
const moment = require("moment");

// testing done
exports.create_department_po = async (departmentId, poList = []) => {
  try {
    let attinment_id = [];
    let iterationCount = poList?.length;
    for (let i = 0; i < iterationCount; i++) {
      let po = poList[i];
      const attainment = new Attainment({
        attainment_name: po?.attainment_name,
        attainment_type: po?.attainment_type,
        attainment_description: po?.attainment_description,
        department: departmentId,
      });
      attinment_id.push(attainment?._id);
      await attainment.save();
    }
    return { attinment_id };
  } catch (e) {
    console.log(e);
  }
};

// testing done
const create_subject_master_co = async (subjectMasterId, coList = []) => {
  try {
    let attinment_id = [];
    let iterationCount = coList?.length;
    for (let i = 0; i < iterationCount; i++) {
      let co = coList[i];
      const attainment = new Attainment({
        attainment_name: co?.attainment_name,
        attainment_type: co?.attainment_type,
        attainment_description: co?.attainment_description,
        attainment_code: co?.attainment_code,
        attainment_target: co?.attainment_target,
        subject_master: subjectMasterId,
      });
      attinment_id.push(attainment?._id);
      await attainment.save();
    }
    return { attinment_id };
  } catch (e) {
    console.log(e);
  }
};

//when department create is initiate then create subject master and class master // testing done
exports.create_master_query = async (departmentId, instituteId, streamId) => {
  try {
    const stream_type = await StreamType.findById(streamId);

    let cls_master_list = [];
    let subject_master_list = [];

    let cls_master = stream_type.cls_master;
    let cls_iteration_count = cls_master?.length;

    for (let i = 0; i < cls_iteration_count; i++) {
      let ct = cls_master[i];
      const cls = new ClassMaster({
        className: ct?.name,
        institute: instituteId,
        department: departmentId,
      });
      cls_master_list.push(cls?._id);
      await cls.save();
    }
    if (stream_type?.subject_master?.length > 0) {
      const automate_subject_master = await AutomateSubjectMaster.find({
        _id: { $in: stream_type?.subject_master },
      });

      let subject_iteration_count = automate_subject_master?.length;
      for (let i = 0; i < subject_iteration_count; i++) {
        let sub = automate_subject_master[i];
        const subject_master = new SubjectMaster({
          subjectName: sub?.subjectName,
          institute: instituteId,
          department: departmentId,
          subjectType: sub?.subjectType,
          automate_subject_master: sub?._id,
          is_practical: sub?.is_practical,
        });
        subject_master_list.push(subject_master?._id);
        if (sub?.co?.length > 0) {
          const { attinment_id } = await create_subject_master_co(
            subject_master?._id,
            sub?.co
          );
          subject_master.co_attainment = attinment_id;
          subject_master.co_attainment_count = attinment_id?.length;
        }
        await subject_master.save();
      }
    }
    if (cls_master_list?.length > 0 || subject_master_list?.length > 0) {
      const department = await Department.findById(departmentId);
      if (department?._id) {
        department.departmentClassMasters.push(...cls_master_list);
        department.classMasterCount += cls_master_list?.length;
        department.departmentSubjectMasters.push(...subject_master_list);
        department.subjectMasterCount += subject_master_list?.length;
        await department.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

// when create class then create class Internal Batch // testing done
exports.create_cls_batch_query = async (clsId, count) => {
  try {
    let batch_list = [];
    for (let i = 0; i < count; i++) {
      const batch = new Batch({
        batchName: `Batch ${i + 1}`,
        class_batch_select: clsId,
      });
      batch_list.push(batch?._id);
      await batch.save();
    }
    return { batch_list };
  } catch (e) {
    console.log(e);
  }
};

// when create class then create subject teaching plan // testing done
const create_subject_teaching_plan_query = async (subjectId, t_plan = []) => {
  try {
    const c_list = [];

    const teaching_plan = await AutomateChapter.find({
      _id: { $in: t_plan },
    });
    for (let i = 0; i < teaching_plan?.length; i++) {
      let tp = teaching_plan[i];
      const new_chapter = new Chapter({
        chapter_name: tp?.chapter_name,
        chapter_link: tp?.chapter_link,
        subject: subjectId,
      });

      const teaching_plan_topic = await AutomateChapterTopic.find({
        _id: { $in: tp?.topic },
      });

      for (let j = 0; j < teaching_plan_topic?.length; j++) {
        let val = teaching_plan_topic[j];
        const topic = new ChapterTopic({
          topic_name: val?.topic_name,
          topic_last_date: val?.planning_date,
          execution_date: val?.execution_date,
          course_outcome: val?.course_outcome,
          learning_outcome: val?.learning_outcome,
          timing: {
            hours: val?.timing?.hours,
            minutes: val?.timing?.minutes,
          },
          subject: subjectId,
          chapter: new_chapter?._id,
          topic_link: val?.topic_link,
          topic_last_date_format: val?.planning_date,
          planning_date: val?.planning_date,
        });
        new_chapter.topic.push(topic?._id);
        new_chapter.topic_count += 1;
        // console.log("topic", topic);
        await topic.save();
      }
      await new_chapter.save();
      // console.log("new_chapter", new_chapter);

      c_list.push(new_chapter?._id);
    }
    return {
      c_list,
    };
  } catch (e) {
    console.log(e);
  }
};

// when create class then create subject // testing done
const create_subject_query = async (
  s_obj,
  smid,
  subjectType,
  subject_category,
  batchId,
  clsId
) => {
  try {
    const code = universal_random_password();

    const subject = new Subject({
      subjectTitle: "Subject Teacher",
      subjectName: s_obj?.subjectName,
      subjectMasterName: smid,
      subjectOptional: subjectType,
      subject_category: subject_category,
      batch: batchId,
      class: clsId,
      member_module_unique: `${code}`,
    });

    let t_plan =
      subject_category === "Tutorial"
        ? s_obj?.teaching_plan?.tutorial
        : s_obj?.teaching_plan?.theory;
    let { c_list } = await create_subject_teaching_plan_query(
      subject?._id,
      t_plan
    );
    subject.chapter = c_list;
    subject.chapter_count += c_list?.length;
    await subject.save();
    return subject?._id;
  } catch (e) {
    console.log(e);
  }
};

// when create class then create subject batch wise // testing done
const create_subject_cls_batch_query = async (
  s_obj,
  smid,
  subjectType,
  subject_category,
  batchId,
  clsBatchId,
  clsId
) => {
  try {
    const code = universal_random_password();
    const subject = new Subject({
      subjectTitle: "Subject Teacher",
      subjectName: s_obj?.subjectName,
      subjectMasterName: smid,
      subjectOptional: subjectType,
      subject_category: subject_category,
      batch: batchId,
      selected_batch_query: clsBatchId,
      class: clsId,
      member_module_unique: `${code}`,
    });
    let { c_list } = await create_subject_teaching_plan_query(
      subject?._id,
      s_obj?.teaching_plan?.practical
    );
    subject.chapter = c_list;
    subject.chapter_count += c_list?.length;
    await subject.save();
    return subject?._id;
  } catch (e) {
    console.log(e);
  }
};

// when create class then create subject and teaching plan // testing done
exports.create_cls_subject_query = async (streamId, clsId, batchId) => {
  try {
    let subject_list = [];

    const cls = await Class.findById(clsId).populate({
      path: "multiple_batches",
    });

    const automate_subject_master = await AutomateSubjectMaster.find({
      $and: [
        {
          stream_type: { $eq: streamId },
        },
        {
          className: { $eq: `${cls?.className}` },
        },
      ],
    });
    let subject_iteration_count = automate_subject_master?.length;

    for (let i = 0; i < subject_iteration_count; i++) {
      let s_obj = automate_subject_master[i];
      let s_create = [];
      const subject_master = await SubjectMaster.findOne({
        automate_subject_master: { $eq: `${s_obj?._id}` },
      });

      if (subject_master?._id) {
        let theory_sub = await create_subject_query(
          s_obj,
          subject_master?._id,
          subject_master?.subjectType,
          "Theory",
          batchId,
          clsId
        );
        subject_list.push(theory_sub?._id);
        s_create.push(theory_sub?._id);
        let tutorial_sub = await create_subject_query(
          s_obj,
          subject_master?._id,
          subject_master?.subjectType,
          "Tutorial",
          batchId,
          clsId
        );
        subject_list.push(tutorial_sub?._id);
        s_create.push(tutorial_sub?._id);

        if (subject_master?.is_practical) {
          for (let bt of cls?.multiple_batches ?? []) {
            let batch_subject = await create_subject_cls_batch_query(
              s_obj,
              subject_master?._id,
              subject_master?.subjectType,
              "Practical",
              batchId,
              bt?._id,
              clsId
            );
            subject_list.push(batch_subject?._id);
            s_create.push(batch_subject?._id);
          }
        }
        subject_master.subjects.push(...s_create);
        subject_master.subjectCount += s_create?.length;
        await subject_master.save();
      }
    }
    if (subject_list?.length > 0) {
      cls.subject.push(...subject_list);
      cls.subjectCount += subject_list?.length;
      await cls.save();
    }
  } catch (e) {
    console.log(e);
  }
};

// when create holiday by excel then format required // testing done
exports.holiday_date_split_query = (combine_dates) => {
  try {
    let split_date = [];
    if (combine_dates?.includes("-")) {
      split_date = combine_dates?.split("-");
    } else if (combine_dates?.includes(" ")) {
      split_date = combine_dates?.split(" ");
    } else if (combine_dates?.includes(",")) {
      split_date = combine_dates?.split(",");
    } else {
    }

    let result = [];
    for (let st of split_date) {
      result.push(st?.trim());
    }
    return result;
  } catch (e) {
    console.log(e);
  }
};

// testing done wit two condition
exports.in_week_one_class_timetable_subject_leacture_query = async (
  timetable_list = [],
  is_one_subject,
  subjectId
) => {
  try {
    let subject_list = {};
    if (is_one_subject) {
      for (let i = 0; i < timetable_list?.length; i++) {
        let tl = timetable_list[i];
        for (let j = 0; j < tl?.schedule?.length; j++) {
          let sched = tl?.schedule[j];
          if (`${sched?.subject}` === `${subjectId}` && tl?.day) {
            if (subject_list[sched.subject]) {
              if (subject_list[sched.subject][tl?.day]) {
                subject_list[sched.subject][tl?.day] = {
                  lecture_count:
                    subject_list[sched.subject][tl?.day].lecture_count + 1,
                };
              } else {
                subject_list[sched.subject][tl?.day] = {
                  lecture_count: 1,
                };
              }
            } else {
              subject_list[sched.subject] = {};
              subject_list[sched.subject][tl?.day] = {
                lecture_count: 1,
              };
            }
          }
          // if (`${sched?.subject}` === `${subjectId}` && tl?.day) {
          //   if (subject_list[sched.subject][tl?.day]) {
          //     subject_list[sched.subject][tl?.day] = {
          //       lecture_count:
          //         subject_list[sched.subject][tl?.day].lecture_count + 1,
          //     };
          //   } else {
          //     subject_list[sched.subject][tl?.day] = {
          //       lecture_count: 1,
          //     };
          //   }
          // }
        }
      }
    } else {
      for (let i = 0; i < timetable_list?.length; i++) {
        let tl = timetable_list[i];
        for (let j = 0; j < tl?.schedule?.length; j++) {
          let sched = tl?.schedule[j];
          if (sched?.subject && tl?.day) {
            if (subject_list[sched.subject]) {
              if (subject_list[sched.subject][tl?.day]) {
                subject_list[sched.subject][tl?.day] = {
                  lecture_count:
                    subject_list[sched.subject][tl?.day].lecture_count + 1,
                };
              } else {
                subject_list[sched.subject][tl?.day] = {
                  lecture_count: 1,
                };
              }
            } else {
              subject_list[sched.subject] = {};
              subject_list[sched.subject][tl?.day] = {
                lecture_count: 1,
              };
            }
          }
        }
      }
    }
    return { subject_list };
  } catch (e) {
    console.log(e);
  }
};

// testing done
const week_name = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// testing done
const one_subject_dates_according_timetable_query = async (
  start_date,
  days_obj,
  total_dates_count,
  holiday_dates
) => {
  try {
    // let academic_start_date = "2024-03-01";
    let timetable_academic_dates = [];
    let t_lecture = 0;
    // for (let i = 0; i < total_dates_count; i++) {
    for (let i = 0; i < 1000; i++) {
      let dt = new Date(start_date);
      dt.setDate(dt.getDate() + i);
      if (holiday_dates?.includes(moment(dt).format("DD/MM/yyyy"))) {
      } else {
        let day = week_name[dt.getDay()];
        if (days_obj[day]) {
          for (let j = 0; j < days_obj[day]; j++) {
            timetable_academic_dates.push(dt);
          }
          t_lecture += 1;
        }
      }
      if (t_lecture === total_dates_count) {
        break;
      }
    }
    return { timetable_academic_dates };
  } catch (e) {
    console.log(e);
  }
};

// testing done
const one_subject_teaching_plan_query = async (
  startdate,
  subjectId,
  days_obj,
  holiday_dates
) => {
  try {
    const subject = await Subject.findById(subjectId);
    const topics = await ChapterTopic.find({
      chapter: { $in: subject?.chapter ?? [] },
    });
    let total_topics = topics?.length ?? 0;
    const { timetable_academic_dates } =
      await one_subject_dates_according_timetable_query(
        startdate,
        days_obj,
        total_topics,
        holiday_dates
      );
    for (let i = 0; i < total_topics; i++) {
      let top = topics[i];
      top.topic_last_date = moment(timetable_academic_dates[i])?.format(
        "DD/MM/yyyy"
      );
      top.topic_last_date_format = timetable_academic_dates[i];
      await top.save();
    }
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.in_one_class_subjects_teaching_mapping_query = async (
  startdate,
  list = {},
  holiday_dates = []
) => {
  try {
    for (let obj in list) {
      let sb = list[obj];
      let day_lecture_count = {};
      for (let dy in sb) {
        let dt = sb[dy];
        day_lecture_count[dy] = dt["lecture_count"];
      }
      await one_subject_teaching_plan_query(
        startdate,
        obj,
        day_lecture_count,
        holiday_dates
      );
    }
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.one_department_holiday_date_query = async (holiday = []) => {
  try {
    let holiday_dates = [];
    for (let hol of holiday) {
      if (hol?.dDate?.length > 0) holiday_dates.push(...hol?.dDate);
    }
    return { holiday_dates };
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.in_one_subjects_teaching_mapping_query = async (
  startdate,
  list = {},
  subjectId = "",
  holiday_dates = []
) => {
  try {
    let sb = list[subjectId];
    let day_lecture_count = {};
    for (let dy in sb) {
      let dt = sb[dy];
      day_lecture_count[dy] = dt["lecture_count"];
    }
    await one_subject_teaching_plan_query(
      startdate,
      subjectId,
      day_lecture_count,
      holiday_dates
    );
  } catch (e) {
    console.log(e);
  }
};

// testing done
const minimum_date_in_list_query = async (d_list = []) => {
  try {
    let rt = "";
    for (let i = 0; i < d_list?.length; i++) {
      dt = d_list[i];
      if (rt) {
        let y1 = dt?.substring(6, 10);
        let y2 = rt?.substring(6, 10);
        let m1 = dt?.substring(3, 5);
        let m2 = rt?.substring(3, 5);
        let d1 = dt?.substring(0, 2);
        let d2 = rt?.substring(0, 2);
        if (+y1 <= +y2) {
          if (+m1 <= m2) {
            if (+d1 < +d2) {
              rt = dt;
            }
          } else {
            rt = dt;
          }
        }
      } else {
        rt = dt;
      }
    }
    st = rt?.split("/");
    return `${st[2]}-${st[1]}-${st[0]}`;
  } catch (e) {
    console.log(e);
  }
};

// testing done
const add_holiday_one_subject_teaching_plan_query = async (
  subjectId,
  current_holiday_dates,
  args_holiday_dates,
  timetables
) => {
  try {
    // here tor find minimum holiday date
    let ft = await minimum_date_in_list_query(current_holiday_dates);
    const gte_Date = new Date(ft);
    const subject = await Subject.findById(subjectId);
    const topics = await ChapterTopic.find({
      $and: [
        {
          chapter: { $in: subject?.chapter ?? [] },
        },
        {
          topic_last_date_format: { $gte: gte_Date },
        },
      ],
    });

    let total_topics = topics?.length ?? 0;
    let increase_date_count = 0;
    let start_index = 0;
    for (let i = 0; i < total_topics; i++) {
      let current_topic = topics[i];
      let next_topic = "";
      for (let j = 1; j < total_topics; j++) {
        let tp = topics[i + j];
        if (
          current_holiday_dates?.includes(
            `${moment(tp?.topic_last_date_format)?.format("DD/MM/yyyy")}`
          )
        ) {
        } else {
          next_topic = tp;
          break;
        }
      }
      if (current_topic && next_topic) {
        current_topic.topic_last_date = next_topic.topic_last_date;
        current_topic.topic_last_date_format =
          next_topic.topic_last_date_format;
        await top.save();
      } else {
        if (!start_index) start_index = i;
        increase_date_count += 1;
      }
    }

    if (increase_date_count > 0) {
      const { holiday_dates } = await exports.one_department_holiday_date_query(
        [...args_holiday_dates, { dDate: current_holiday_dates }]
      );
      // for global
      // const { holiday_dates } = await exports.one_department_holiday_date_query(
      //   args_holiday_dates
      // );
      const { subject_list } =
        await exports.in_week_one_class_timetable_subject_leacture_query(
          timetables,
          true,
          subjectId
        );
      let sb = subject_list[subjectId];
      let day_lecture_count = {};
      for (let dy in sb) {
        let dt = sb[dy];
        day_lecture_count[dy] = dt["lecture_count"];
      }

      const { timetable_academic_dates } =
        await one_subject_dates_according_timetable_query(
          moment(topics[start_index]?.topic_last_date_format)?.format(
            "yyyy-MM-DD"
          ),
          day_lecture_count,
          increase_date_count,
          holiday_dates
        );
      for (let i = 0; i < increase_date_count; i++) {
        let top = topics[i + start_index];
        top.topic_last_date = moment(timetable_academic_dates[i])?.format(
          "DD/MM/yyyy"
        );
        top.topic_last_date_format = timetable_academic_dates[i];
        await top.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

// testing done
const remove_holiday_one_subject_teaching_plan_query = async (
  subjectId,
  current_holiday_dates,
  args_holiday_dates,
  timetables
) => {
  try {
    // here tor find minimum holiday date
    let ft = await minimum_date_in_list_query(current_holiday_dates);
    const gte_Date = new Date(ft);
    const subject = await Subject.findById(subjectId);
    const topics = await ChapterTopic.find({
      $and: [
        {
          chapter: { $in: subject?.chapter ?? [] },
        },
        {
          topic_last_date_format: { $gte: gte_Date },
        },
      ],
    });

    const { holiday_dates } = await exports.one_department_holiday_date_query(
      args_holiday_dates
    );

    const { subject_list } =
      await exports.in_week_one_class_timetable_subject_leacture_query(
        timetables,
        true,
        subjectId
      );
    let sb = subject_list[subjectId];
    let day_lecture_count = {};
    for (let dy in sb) {
      let dt = sb[dy];
      day_lecture_count[dy] = dt["lecture_count"];
    }

    let total_topics = topics?.length ?? 0;
    if (total_topics) {
      const { timetable_academic_dates } =
        await one_subject_dates_according_timetable_query(
          moment(gte_Date)?.format("yyyy-MM-DD"),
          day_lecture_count,
          total_topics,
          holiday_dates
        );

      for (let i = 0; i < total_topics; i++) {
        let top = topics[i];
        top.topic_last_date = moment(timetable_academic_dates[i])?.format(
          "DD/MM/yyyy"
        );
        top.topic_last_date_format = timetable_academic_dates[i];
        await top.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.holiday_changes_in_one_class_subjects_teaching_mapping_query = async (
  flow,
  subjectIds = [],
  current_holiday_dates = [],
  args_holiday_dates,
  timetables
) => {
  try {
    if (flow === "Add Holiday") {
      for (let i = 0; i < subjectIds?.length; i++) {
        let obj = subjectIds[i];
        await add_holiday_one_subject_teaching_plan_query(
          obj,
          current_holiday_dates,
          args_holiday_dates,
          timetables
        );
      }
    } else {
      for (let i = 0; i < subjectIds?.length; i++) {
        let obj = subjectIds[i];
        await remove_holiday_one_subject_teaching_plan_query(
          obj,
          current_holiday_dates,
          args_holiday_dates,
          timetables
        );
      }
    }
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.not_take_attendance_one_subject_teaching_plan_query = async (
  last_attendance_date = "",
  current_attendance_date = "",
  subject_list = {},
  subjectId = "",
  holiday_dates = [],
  chpaterId = []
) => {
  try {
    const topic_reschedule = [];
    // here also take an history of only two absent dated.
    const gte_Date = new Date(last_attendance_date);
    const topics = await ChapterTopic.find({
      $and: [
        {
          chapter: { $in: chpaterId },
        },
        {
          topic_last_date_format: { $gte: gte_Date },
        },
      ],
    });
    let total_topics = topics?.length ?? 0;

    let sb = subject_list[subjectId];
    let day_lecture_count = {};
    for (let dy in sb) {
      let dt = sb[dy];
      day_lecture_count[dy] = dt["lecture_count"];
    }

    let c_date = new Date(current_attendance_date);
    const { timetable_academic_dates } =
      await one_subject_dates_according_timetable_query(
        moment(c_date)?.format("yyyy-MM-DD"),
        day_lecture_count,
        total_topics,
        holiday_dates
      );

    for (let i = 0; i < total_topics; i++) {
      let top = topics[i];
      if (
        moment(timetable_academic_dates[i])?.format("DD/MM/yyyy") ===
        top?.topic_last_date
      ) {
      } else {
        topic_reschedule.push({
          topic: top?._id,
          previous_date: top?.topic_last_date_format,
          next_date: timetable_academic_dates[i],
        });
        top.topic_last_date = moment(timetable_academic_dates[i])?.format(
          "DD/MM/yyyy"
        );
        top.topic_last_date_format = timetable_academic_dates[i];
        await top.save();
      }
    }
    var plan_history = "";
    if (topic_reschedule?.length > 0) {
      plan_history = new AttendanceTeachingPlanHistory({
        subject: subjectId,
        topic_reschedule: topic_reschedule,
      });
      await plan_history.save();
    }
    return plan_history?._id;
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.more_lecture_in_same_day_one_subject_teaching_plan_query = async (
  schedule_date = [],
  chpaterId = [],
  topicId = [],
  current_date = ""
) => {
  try {
    // here also for many lecture schedule list date
    let ft = await minimum_date_in_list_query(schedule_date);
    const gte_Date = new Date(ft);

    const topics = await ChapterTopic.find({
      $and: [
        {
          chapter: { $in: chpaterId },
        },
        {
          topic_last_date_format: { $gte: gte_Date },
        },
      ],
    });
    let total_topics = topics?.length ?? 0;
    let break_jump = 0;

    for (let i = 0; i < total_topics; i++) {
      let current_topic = topics[i];
      if (topicId?.includes(`${current_topic?._id}`)) {
        let d = current_topic.topic_last_date;
        let d_format = current_topic.topic_last_date_format;
        let d1 = "";
        let d_format1 = "";
        for (let j = i + 1; j < total_topics; j++) {
          let c_t = topics[j];
          d1 = c_t?.topic_last_date;
          d_format1 = c_t?.topic_last_date_format;
          c_t.topic_last_date = d;
          c_t.topic_last_date_format = d_format;
          await c_t.save();
          d = d1;
          d_format = d_format1;
        }
        let dt = new Date(current_date);
        current_topic.topic_last_date = moment(dt)?.format("DD/MM/yyyy");
        current_topic.topic_last_date_format = dt;
        await current_topic.save();
        break_jump += 1;
      }
      if (break_jump === topicId?.length) {
        break;
      }
    }
  } catch (e) {
    console.log(e);
  }
};

// testing done
const add_automate_chapter_topic_query = async (
  data,
  subjectMasterId,
  chapterId,
  topicType
) => {
  try {
    const automate_topic = new AutomateChapterTopic({
      topic_name: data?.topic_name,
      topic_last_date: data?.planning_date,
      course_outcome: data?.course_outcome,
      learning_outcome: data?.learning_outcome,
      timing: {
        hours: data?.hours,
        minutes: data?.minutes,
      },
      planning_date: data?.planning_date,
      topic_type: topicType,
      automate_chapter: chapterId,
      automate_subject_master: subjectMasterId,
      topic_link: data?.topic_link,
    });
    await automate_topic.save();
    // console.log("automate_topic", automate_topic);
    return automate_topic?._id;
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.add_automate_chapter_query = async (
  data,
  subjectMasterId,
  chapterType
) => {
  try {
    var automate_chpater = null;
    automate_chpater = await AutomateChapter.findOne({
      $and: [
        { automate_subject_master: { $eq: `${subjectMasterId}` } },
        { chapter_name: { $eq: `${data?.chapter_name}` } },
        { chapter_type: { $eq: `${chapterType}` } },
      ],
    });

    if (automate_chpater?._id) {
      const topicId = await add_automate_chapter_topic_query(
        data,
        subjectMasterId,
        automate_chpater?._id,
        chapterType
      );
      automate_chpater.topic?.push(topicId);
      automate_chpater.topic_count += 1;
      await automate_chpater.save();
      // console.log("automate_chpater", automate_chpater);

      return "";
    } else {
      automate_chpater = new AutomateChapter({
        chapter_name: data?.chapter_name,
        automate_subject_master: subjectMasterId,
        chapter_type: chapterType,
        chapter_link: data?.chapter_link,
      });
      const topicId = await add_automate_chapter_topic_query(
        data,
        subjectMasterId,
        automate_chpater?._id,
        chapterType
      );
      automate_chpater.topic?.push(topicId);
      automate_chpater.topic_count += 1;
      await automate_chpater.save();
      // console.log("automate_chpater", automate_chpater);

      return automate_chpater?._id;
    }
  } catch (e) {
    console.log(e);
  }
};
