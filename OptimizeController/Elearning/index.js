const InstituteAdmin = require("../../models/InstituteAdmin");
const User = require("../../models/User");
const ELearning = require("../../models/ELearning");
const Playlist = require("../../models/Playlist");
const Video = require("../../models/Video");
const Resource = require("../../models/Resource");
const Topic = require("../../models/Topic");
const VideoComment = require("../../models/VideoComment");
const ResourcesKey = require("../../models/ResourcesKey");
const { getVideoDurationInSeconds } = require("get-video-duration");
const { deleteFile, uploadFile } = require("../../S3Configuration");

exports.getInstituteElearning = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id }).populate(
      "elearning"
    );
    res.status(200).send({ message: "data is fetched", institute });
  } catch (err) {
    console.log(err.message);
  }
};

exports.postInstituteElearning = async (req, res) => {
  try {
    const insId = req.params.id;
    const { sid } = req.body;
    const institute = await InstituteAdmin.findById({ _id: insId });
    const staff = await Staff.findById({ _id: sid });
    const elearning = new ELearning({
      elearningHead: sid,
      institute: insId,
      photoId: "1",
      coverId: "2",
    });
    institute.elearningActivate = "Activated";
    institute.elearning = elearning._id;
    staff.elearning.push(elearning._id);
    await Promise.all([institute.save(), staff.save(), elearning.save()]);
    res.status(200).send({ message: "E Learning is successfully is updated" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getInstituteElearningInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const elearning = await ELearning.findById({
      _id: institute.elearning,
    })
      .populate("elearningHead")
      .populate("playlist");
    res
      .status(200)
      .send({ message: "E Learning is successfully is updated", elearning });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getAllPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.find({}).populate({
      path: "topic",
      populate: {
        path: "video",
      },
    });
    res.status(200).send({ message: "fetched all details", playlist });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getElearning = async (req, res) => {
  try {
    const { eid } = req.params;
    const elearning = await ELearning.findById({ _id: eid }).populate({
      path: "institute",
      populate: {
        path: "classRooms",
      },
    });
    res
      .status(200)
      .send({ message: "E Learning is successfully is updated", elearning });
  } catch (err) {
    console.log(err.message);
  }
};

exports.postElearning = async (req, res) => {
  try {
    const { eid } = req.params;
    const {
      emailId,
      phoneNumber,
      vision,
      mission,
      about,
      award,
      achievement,
      activities,
    } = req.body;
    const elearning = await ELearning.findById({
      _id: eid,
    });
    elearning.emailId = emailId;
    elearning.phoneNumber = phoneNumber;
    elearning.vision = vision;
    elearning.mission = mission;
    elearning.about = about;
    elearning.award = award;
    elearning.achievement = achievement;
    elearning.activities = activities;
    await elearning.save();
    res
      .status(200)
      .send({ message: "E Learning is successfully is updated", elearning });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getElearningPlaylist = async (req, res) => {
  try {
    const { eid } = req.params;
    const elearning = await ELearning.findById({ _id: eid }).populate({
      path: "playlist",
    });
    res.status(200).send({ message: "All playlist is fetched", elearning });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getElearningPlaylistCreate = async (req, res) => {
  try {
    const { eid } = req.params;
    const file = req.file;
    const width = 300;
    const height = 160;
    const results = await uploadFile(file, width, height);
    const playlist = new Playlist(req.body);
    const elearning = await ELearning.findById({ _id: eid });
    const classMe = await Class.findById({ _id: req.body.class });
    elearning.playlist.push(playlist._id);
    classMe.playlist.push(playlist._id);
    playlist.photo = results.key;
    playlist.elearning = eid;
    await classMe.save();
    await elearning.save();
    await playlist.save();
    await unlinkFile(file.path);
    res
      .status(200)
      .send({ message: "playlist is created successfully", playlist });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getPlaylist = async (req, res) => {
  try {
    const { pid } = req.params;
    const playlist = await Playlist.findById({ _id: pid })
      .populate({
        path: "elearning",
        populate: {
          path: "institute",
          populate: {
            path: "classRooms",
          },
        },
      })
      .populate({
        path: "class",
      })
      .populate({
        path: "elearning",
        populate: {
          path: "institute",
          populate: {
            path: "financeDepart",
          },
        },
      });
    res.status(200).send({ message: "Single playlist is fetched", playlist });
  } catch (err) {
    console.log(err.message);
  }
};
exports.patchPlaylist = async (req, res) => {
  try {
    const { pid } = req.params;
    const playlist = await Playlist.findByIdAndUpdate(pid, req.body);
    playlist.save();
    res.status(201).send({ message: "Edited Successfull" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.putPlaylist = async (req, res) => {
  try {
    const { pid } = req.params;
    const file = req.file;
    const playlist = await Playlist.findByIdAndUpdate(pid, req.body);
    if (playlist.photo) {
      await deleteFile(playlist.photo);
    }
    const width = 300;
    const height = 160;
    const results = await uploadFile(file, width, height);
    playlist.photo = results.key;
    await playlist.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Edited Successfull" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const { pid } = req.params;
    const playlist = await Playlist.findById({ _id: pid });
    const elearning = await ELearning.findById({ _id: playlist.elearning });
    elearning.playlist.pull(pid);
    for (let cls of playlist.class) {
      const clas = await Class.findById({ _id: cls });
      clas.playlist.pull(pid);
      await clas.save();
    }
    for (let join of playlist.joinNow) {
      const user = await User.findById({ _id: join });
      user.playlistJoin.pull(pid);
      await user.save();
    }
    for (let top of playlist.topic) {
      const topic = await Topic.findById({ _id: top });
      for (let vid of topic.video) {
        const video = await Video.findById({ _id: vid });
        for (let reso of video.resource) {
          const resource = await Resource.findById({ _id: reso });
          for (let keys of resource.resourceKeys) {
            const resKey = await ResourcesKey.findById({ _id: keys });
            if (resKey.resourceKey) {
              await deleteFile(resKey.resourceKey);
            }
            await ResourcesKey.deleteOne({ _id: keys });
          }
          await Resource.deleteOne({ _id: reso });
        }

        for (let vlik of video.userLike) {
          const user = await User.findById({ _id: vlik });
          user.videoLike.pull(vid);
        }
        for (let vsav of video.userSave) {
          const user = await User.findById({ _id: vsav });
          user.userSave.pull(vid);
        }
        for (let ucom of video.userComment) {
          await VideoComment.deleteOne({ _id: ucom });
        }

        if (video.video) {
          await deleteFile(video.video);
        }
        await Video.deleteOne({ _id: vid });
      }

      await Topic.deleteOne({ _id: top });
    }

    if (playlist.photo) {
      await deleteFile(playlist.photo);
    }
    await Playlist.deleteOne({ _id: pid });
    // await Playlist.findByIdAndDelete({ _id: pid });
    await elearning.save();
    res.status(201).send({ message: "playlist is deleted:" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.getPlaylistTopic = async (req, res) => {
  try {
    const { pid } = req.params;
    const playlist = await Playlist.findById({ _id: pid }).populate({
      path: "topic",
      populate: {
        path: "video",
      },
    });

    res.status(200).send({ message: "playlist is fetched ", playlist });
  } catch (err) {
    console.log(err.message);
  }
};
exports.postPlaylistTopic = async (req, res) => {
  try {
    const { pid } = req.params;
    const topic = new Topic(req.body);
    const playlist = await Playlist.findById({ _id: pid });
    playlist.topic.push(topic._id);
    topic.playlist = pid;
    await topic.save();
    await playlist.save();
    res.status(200).send({ message: "topic is Created " });
  } catch (err) {
    console.log(err.message);
  }
};

exports.postTopicUpload = async (req, res) => {
  try {
    const { tid } = req.params;
    const file = req.file;
    const fileStream = fs.createReadStream(file.path);
    const videoTime = await getVideoDurationInSeconds(fileStream);
    const time = new Date(videoTime * 1000).toISOString().slice(116);
    const timeInHour = videoTime / 3600;
    const results = await uploadVideo(file);
    const { name, price, access } = req.body;
    const topic = await Topic.findById({ _id: tid }).populate({
      path: "playlist",
    });
    const playlist = await Playlist.findById({ _id: topic.playlist._id });
    const videoName =
      topic.playlist.name + " | " + topic.topicName + " | " + name;
    const videoKey = results.Key;
    const video = new Video({
      name: videoName,
      videoName: file.originalname,
      access: access,
      video: videoKey,
      price: price,
      topic: tid,
      videoTime: time,
      fileName: name,
    });
    topic.video.push(video._id);
    playlist.time = playlist.time + timeInHour;
    playlist.lecture = playlist.lecture + 1;
    await playlist.save();
    await topic.save();
    await video.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "video is uploaded " });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getOneVideo = async (req, res) => {
  try {
    const { vid } = req.params;
    const video = await Video.findById({ _id: vid }).populate({
      path: "resource",
      populate: {
        path: "resourceKeys",
      },
    });
    res.status(200).send({ message: "video fetched", video });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchOneVideo = async (req, res) => {
  try {
    const { vid } = req.params;
    const video = await Video.findByIdAndUpdate(vid, req.body.formData);
    await video.save();
  } catch (err) {
    console.log(err.message);
  }
};

exports.putOneVideo = async (req, res) => {
  try {
    const { vid } = req.params;
    const file = req.file;
    const video = await Video.findById({ _id: vid });
    const fileStream = fs.createReadStream(file.path);
    const videoTime = await getVideoDurationInSeconds(fileStream);
    const time = new Date(videoTime * 1000).toISOString().slice(116);
    video.videoTime = time;
    video.videoName = file.originalname;
    video.name = req.body.name;
    video.price = req.body.price;
    video.access = req.body.access;
    video.fileName = req.body.name;
    await deleteFile(video.video);
    const results = await uploadVideo(file);
    video.video = results.Key;
    await video.save();
    res.status(201).send({ message: "video updated successfully" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.deleteOneVideo = async (req, res) => {
  try {
    const { vid } = req.params;
    const video = await Video.findById({ _id: vid });
    const topic = await Topic.findById({ _id: video.topic });
    topic.video.pull(vid);
    for (let like of video.userLike) {
      const user = await User.findById({ _id: like });
      user.videoLike.pull(vid);
      await user.save();
    }

    for (let sav of video.userSave) {
      const user = await User.findById({ _id: sav });
      user.videoSave.pull(vid);
      await user.save();
    }

    for (let sav of video.userComment) {
      await VideoComment.deleteOne({ _id: sav });
    }
    await deleteFile(video.video);
    await topic.save();
    await Video.deleteOne({ _id: vid });
    res.status(201).send({ message: "video is deleted" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getOnePlaylist = async (req, res) => {
  try {
    const { pid } = req.params;
    const playlist = await Playlist.findById({ _id: pid }).populate({
      path: "video",
    });
    res.status(200).send({ message: "all video is fetched", playlist });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(201).send({ message: "data is fetched", user });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getVideoComment = async (req, res) => {
  try {
    const { vid } = req.params;
    const comment = await Video.findById({ _id: vid })
      .populate({
        path: "userComment",
        populate: {
          path: "user",
        },
      })
      .populate({
        path: "userComment",
        populate: {
          path: "video",
        },
      });
    res.status(200).send({ message: "comment is fetched", comment });
  } catch (err) {
    console.log(err.message);
  }
};

exports.postVideoComment = async (req, res) => {
  try {
    const { id, vid } = req.params;
    const comment = new VideoComment(req.body);
    const video = await Video.findById({ _id: vid });
    video.userComment.push(comment._id);
    comment.user = id;
    comment.video = vid;
    await video.save();
    await comment.save();
    res.status(200).send({ message: "commented" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getVideoAllLike = async (req, res) => {
  try {
    const { vid } = req.params;
    const like = await Video.findById({ _id: vid });
    res.status(200).send({ message: "all liked fetched", like });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchVideoLike = async (req, res) => {
  try {
    const { vid } = req.params;
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    const video = await Video.findById({ _id: vid });
    video.userLike.push(id);
    user.videoLike.push(vid);
    await user.save();
    await video.save();
    res.status(200).send({ message: "Like video" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchVideoUnLike = async (req, res) => {
  try {
    const { id, vid } = req.params;
    const video = await Video.findById({ _id: vid });
    const user = await User.findById({ _id: id });
    user.videoLike.pull(vid);
    video.userLike.pull(id);
    await user.save();
    await video.save();
    res.status(200).send({ message: "unLike video" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getVideoAllBookmark = async (req, res) => {
  try {
    const { vid } = req.params;
    const bookmark = await Video.findById({ _id: vid });
    res.status(200).send({ message: "all saved fetched", bookmark });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchVideoBookmark = async (req, res) => {
  try {
    const { id, vid } = req.params;
    const user = await User.findById({ _id: id });
    const video = await Video.findById({ _id: vid });
    video.userSave.push(id);
    user.videoSave.push(vid);
    await user.save();
    await video.save();
    res.status(200).send({ message: "Save video" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchVideoUnBookmark = async (req, res) => {
  try {
    const { id, vid } = req.params;
    // console.log(id, vid);
    const video = await Video.findById({ _id: vid });
    const user = await User.findById({ _id: id });
    user.videoSave.pull(vid);
    video.userSave.pull(id);
    // console.log(video.userSave);
    await user.save();
    await video.save();
    res.status(200).send({ message: "unSave video" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getVideoWatch = async (req, res) => {
  try {
    const { id, vid } = req.params;
    const user = await User.findById({ _id: id });
    user.watchLater.push(vid);
    await user.save();
    res.status(201).send({ message: "video gone to watch later" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getUserSide = async (req, res) => {
  try {
    const { id } = req.params;
    const userSide = await User.findById({ _id: id })
      .populate({
        path: "videoLike",
        populate: {
          path: "topic",
          populate: {
            path: "playlist",
          },
        },
      })
      .populate({
        path: "watchLater",
        populate: {
          path: "topic",
          populate: {
            path: "playlist",
          },
        },
      })
      .populate({
        path: "videoSave",
        populate: {
          path: "topic",
          populate: {
            path: "playlist",
          },
        },
      })
      .populate({
        path: "playlistJoin",
      });
    res.status(200).send({ message: "all detail fetched", userSide });
  } catch (err) {
    console.log(err.message);
  }
};
