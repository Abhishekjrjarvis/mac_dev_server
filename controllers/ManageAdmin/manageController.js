const ManageAdmin = require("../../models/ManageAdmin/manageAdmin");
const User = require("../../models/User");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const Notification = require("../../models/notification");
const { uploadDocFile } = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

exports.renderAdministrator = async (req, res) => {
  try {
    const { user } = req.query;
    const access_user = await User.findById({ _id: user });
    const manage = new ManageAdmin({ ...req.body });
    manage.affiliation_admin = user._id;
    access_user.manage_admins.push(manage._id);
    manage.permission.push({
      role: "full_read_access",
      author: user._id,
    });
    if (req.file) {
      const results = await uploadDocFile(req.file);
      manage.photo = results.key;
      manage.photoId = "1";
    }
    await Promise.all([manage.save(), access_user.save()]);
    if (req.file) {
      await unlinkFile(req.file.path);
    }
    res
      .status(200)
      .send({ message: "You got the new responsibility 👍", status: true });
    const notify = new Notification({});
    notify.notifyContent = `Your got the designation of ${manage?.affiliation_name} as Afilliation Head`;
    notify.notifySender = manage._id;
    notify.notifyReceiever = user._id;
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByManageAdminPhoto = manage._id;
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      "New Affiliation",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    res.status(200).send({
      message: "There is a bug need to fixed immediately 😀",
      status: false,
    });
  }
};

exports.renderAdministratorQuery = async (req, res) => {
  try {
    const { mid } = req.params;
    if (!mid)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 😀",
        query: false,
      });
    const manage = await ManageAdmin.findById({ _id: mid });
    res
      .status(200)
      .send({ message: "Manage Admin with Roles 😀", query: true });
  } catch (e) {}
};
