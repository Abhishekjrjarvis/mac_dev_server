const Subject = require("../../models/Subject");
const Chapter = require("../../models/Academics/Chapter");
const ChapterTopic = require("../../models/Academics/ChapterTopic");
const SubjectUpdate = require("../../models/SubjectUpdate");
const { custom_date_time } = require("../../helper/dayTimer");
const AttendenceDate = require("../../models/AttendenceDate");

exports.renderOneSubjectAllChapterQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { search } = req.query;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var valid_subject = await Subject.findById({ _id: sid }).select("chapter");
    if (search) {
      var all_chapter = await Chapter.find({
        $and: [
          {
            _id: { $in: valid_subject?.chapter },
          },
        ],
        $or: [
          {
            chapter_name: { $regex: search, $options: "i" },
          },
        ],
      });
    } else {
      var all_chapter = await Chapter.find({
        _id: { $in: valid_subject?.chapter },
      })
        .limit(limit)
        .skip(skip);
    }
    if (all_chapter?.length > 0) {
      res.status(200).send({
        message: "Explore One Subject All Chapter",
        access: true,
        all_chapter: all_chapter,
      });
    } else {
      res.status(200).send({
        message: "You're lost in space",
        access: false,
        all_chapter: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneSubjectAllTopicQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    const { search } = req.query;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var valid_chapter = await Chapter.findById({ _id: cid }).select("topic");
    if (search) {
      var all_topic = await ChapterTopic.find({
        $and: [
          {
            _id: { $in: valid_chapter?.topic },
          },
        ],
        $or: [
          {
            topic_name: { $regex: search, $options: "i" },
          },
        ],
      });
    } else {
      var all_topic = await ChapterTopic.find({
        _id: { $in: valid_chapter?.topic },
      })
        .limit(limit)
        .skip(skip);
    }
    if (all_topic?.length > 0) {
      res.status(200).send({
        message: "Explore One Subject All Topics",
        access: true,
        all_topic: all_topic,
      });
    } else {
      res.status(200).send({
        message: "You're lost in space",
        access: false,
        all_topic: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderEditOneChapterTopicQuery = async (req, res) => {
  try {
    const { ctid } = req.params;
    if (!ctid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    await ChapterTopic.findByIdAndUpdate(ctid, req.body);
    res
      .status(200)
      .send({ message: "Explore Edited Topic Query", access: true });
    const valid_topic = await ChapterTopic.findById({ _id: ctid });
    valid_topic.topic_edited_status = "(Edited)";
    await valid_topic.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewOneChapterTopicQuery = async (sid, chapter_array) => {
  try {
    if (sid) {
      var valid_subject = await Subject.findById({ _id: sid });
      for (var val of chapter_array) {
        var new_chapter = new Chapter({
          chapter_name: val?.chapter_name,
        });
        for (var ref of val?.topic_array) {
          var new_topic = new ChapterTopic({
            topic_name: ref?.topic_name,
            topic_last_date: ref?.topic_last_date,
          });
          new_chapter.topic.push(new_topic?._id);
          new_chapter.topic_count += 1;
          new_topic.subject = valid_subject?._id;
          new_topic.chapter = new_chapter?._id;
          await new_topic.save();
        }
        valid_subject.chapter.push(new_chapter?._id);
        valid_subject.chapter_count += 1;
        await new_chapter.save();
      }
      await valid_subject.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAddNewLectureQuery = async (req, res) => {
  try {
    const { sid, subId } = req.params;
    const { arr, rec_status, extra_lecture } = req.body;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    var one_subject = await Subject.findById({ _id: subId });
    await SubjectUpdate.findByIdAndUpdate(sid, req.body);
    var valid_subject = await SubjectUpdate.findById({ _id: sid });

    res
      .status(200)
      .send({ message: "Explore New / Add Lecture Query", access: true });
    // var all_topic = await ChapterTopic.find({ _id: { $in: arr } });
    if (arr?.length > 0) {
      for (var val of arr) {
        if (valid_subject?.daily_topic_list?.includes(`${val?.topicId}`)) {
        } else {
          if (val?.current_status === "Completed") {
            var valid_date = custom_date_time(0);
            var valid_topic = await ChapterTopic.findById({
              _id: `${val?.topicId}`,
            });
            var subject = await Subject.findById({
              _id: `${valid_topic?.subject}`,
            });
            if (`${valid_topic?.topic_last_date}` < `${valid_date}`) {
              valid_topic.topic_completion_status = "Delayed Completed";
              valid_topic.topic_completion_date = new Date();
              subject.topic_count_bifurgate.delayed += 1;
            } else if (`${valid_topic?.topic_last_date}` > `${valid_date}`) {
              valid_topic.topic_completion_status = "Early Completed";
              valid_topic.topic_completion_date = new Date();
              subject.topic_count_bifurgate.early += 1;
            } else {
              valid_topic.topic_completion_status = "Timely Completed";
              valid_topic.topic_completion_date = new Date();
              subject.topic_count_bifurgate.timely += 1;
            }
            valid_topic.topic_current_status = "Completed";
            valid_subject.daily_topic.push({
              topic: valid_topic?._id,
              status: rec_status,
              current_status: valid_topic.topic_completion_status,
              extra_lecture: [...extra_lecture]
            });
            await Promise.all([valid_topic.save(), subject.save()]);
            if (`${rec_status}` === "Lecture") {
              one_subject.lecture_analytic.lecture_complete += 1;
            } else if (`${rec_status}` === "Practical") {
              one_subject.practical_analytic.practical_complete += 1;
            } else if (`${rec_status}` === "Tutorial") {
              one_subject.tutorial_analytic.tutorial_complete += 1;
            } else {
            }
          }
        }
        await valid_subject.save();
      }
    }

    await Promise.all([valid_subject.save(), one_subject.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.renderTopicStatusQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var valid_date = custom_date_time(0);
    var valid_topic = await ChapterTopic.findById({ _id: tid });
    var subject = await Subject.findById({ _id: `${valid_topic?.subject}` });
    if (`${valid_topic?.topic_last_date}` < `${valid_date}`) {
      valid_topic.topic_completion_status = "Delayed Completed";
      valid_topic.topic_completion_date = new Date();
      subject.topic_count_bifurgate.delayed += 1;
    } else if (`${valid_topic?.topic_last_date}` > `${valid_date}`) {
      valid_topic.topic_completion_status = "Early Completed";
      valid_topic.topic_completion_date = new Date();
      subject.topic_count_bifurgate.early += 1;
    } else {
      valid_topic.topic_completion_status = "Timely Completed";
      valid_topic.topic_completion_date = new Date();
      subject.topic_count_bifurgate.timely += 1;
    }
    valid_topic.topic_current_status = "Completed";
    await Promise.all([valid_topic.save(), subject.save()]);
    res
      .status(200)
      .send({ message: "Explore Topic Status Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneTopicProfileQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_topic = await ChapterTopic.findById({ _id: tid })
      .populate({
        path: "subject",
        select:
          "subjectName subjectStatus topic_count_bifurgate lecture_analytic practical_analytic tutorial_analytic",
      })
      .populate({
        path: "chapter",
        select: "chapter_name",
      });
    res.status(200).send({
      message: "Explore One Topic With regarding its chapter + subject",
      access: true,
      one_topic: one_topic,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneTopicDestroyQuery = async (req, res) => {
  try {
    const { tid, sid } = req.params;
    if (!tid && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var valid_topic = await ChapterTopic.findById({ _id: tid });
    var valid_chapter = await Chapter.findById({
      _id: `${valid_topic?.chapter}`,
    });

    valid_chapter.topic.pull(valid_topic?._id);
    if (valid_chapter?.topic_count > 0) {
      valid_chapter.topic_count -= 1;
    }

    await ChapterTopic.findByIdAndDelete(valid_topic?._id);
    res
      .status(200)
      .send({ message: "Deletion Operation Completed", access: true });

    var all_updates = await SubjectUpdate.find({ subject: sid });
    for (var ref of all_updates) {
      for (var val of ref?.daily_topic) {
        if (`${val?.topic}` === `${tid}`) {
          ref.daily_topic.pull(val?._id);
        }
      }
      await ref.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewChapterQuery = async(req, res) => {
  try{
    const { sid } = req.params
    if(!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})

    const one_subject = await Subject.findById({ _id: sid })
    const valid_chapter = new Chapter({...req?.body})

    one_subject.chapter.push(valid_chapter?._id)
    one_subject.chapter_count += 1

    valid_chapter.subject = one_subject?._id

    await Promise.all([ valid_chapter.save(), one_subject.save()])

    res.status(200).send({ message: "Explore New Chapter Query", access: true})
  }
  catch(e){
    console.log(e)
  }
}

exports.renderNewChapterTopicQuery = async(req, res) => {
  try{
    const { cid } = req.params
    if(!cid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})

    const chapter = await Chapter.findById({ _id: cid })
    const one_subject = await Subject.findById({ _id: `${chapter?.subject}` })
    const valid_topic = new ChapterTopic({ ...req.body})

    chapter.topic.push(valid_topic?._id)
    chapter.topic_count += 1

    valid_topic.chapter = chapter?._id
    valid_topic.subject = one_subject?._id

    await Promise.all([ chapter.save(), valid_topic.save()])
    res.status(200).send({ message: "Explore New Chapter Topic Query", access: true})

  }
  catch(e){
    console.log(e)
  }
}

exports.renderFilteredLectureQuery = async(req, res) => {
  try{
    const { sid } = req?.query
    const { date, flow } = req?.body
    const subject = await Subject.findById({ _id: sid })
    const attendance_all = await AttendenceDate.find({
      $and: [{ subject: subject?._id }, 
      { attendDate: { $eq: `${date}` }, }, 
      { attendence_type: `${flow}`}]
    });
    if(attendance_all?.length > 0){
      res.status(200).send({ message: "Explore All Available Attendence Query", access: true, attendance_all: attendance_all, count: attendance_all?.length})
    }
    else{
      res.status(200).send({ message: "No Available Attendence Query", access: false, attendance_all: [], count: 0})
    }
  }
  catch(e){
    console.log(e)
  }
}

exports.renderOneChapterDestroyQuery = async(req, res) => {
  try{
    const { cid } = req?.params
    if(!cid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})
    var valid_delete = false
    var one_chapter = await Chapter.findById({ _id: cid })
    var subject = await Subject.findById({ _id: `${one_chapter?.subject}`})

    for(var val of one_chapter?.topic){
      if(`${val?.topic_completion_date}` && `${val?.topic_completion_status}`){
        valid_delete = true
      }
    }

    if(valid_delete){
      res.status(200).send({ message: "Chapter Deletion Operation Aborted", access: false})
    }
    else{
      subject.chapter.pull(one_chapter?._id)
      if(subject?.chapter_count > 0){
        subject.chapter_count -= 1
      }
      await subject.save()
      await Chapter.findByIdAndDelete(cid)
      res.status(200).send({ message: "Explore All Chapter Deletion Operation Completed", access: true})
    }
  }
  catch(e){
    console.log(e)
  }
}