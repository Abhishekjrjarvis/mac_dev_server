const Subject = require("../../models/Subject");
const Chapter = require("../../models/Academics/Chapter");

exports.renderOneSubjectAllTopicQuery = async (req, res) => {
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
    var valid_subject = await Subject.findById({ _id: sid }).select("topic");
    if (search) {
      var all_topic = await Chapter.find({
        $and: [
          {
            _id: { $in: valid_subject?.topic },
          },
        ],
        $or: [
          {
            topic_name: { $regex: search, $options: "i" },
          },
        ],
      });
    } else {
      var all_topic = await Chapter.find({ _id: { $in: valid_subject?.topic } })
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
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });
    await Chapter.findByIdAndUpdate(ctid, req.body);
    res
      .status(200)
      .send({ message: "Explore Edited Topic Query", access: true });
    const valid_topic = await Chapter.findById({ _id: ctid });
    valid_topic.topic_edited_status = "(Edited)";
    await valid_topic.save();
  } catch (e) {
    console.log(e);
  }
};
