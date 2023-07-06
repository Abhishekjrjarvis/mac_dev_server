const {
  check_poll_status,
  election_vote_day,
  election_result_day,
} = require("../Service/AutoRefreshBackend");
const {
  dueDateAlarm,
  renewal_request_alarm,
  quote_disappear,
  outstanding_reminder_disable_query,
} = require("../Service/alarm");
const {
  renderRealTimeDailyUpdate,
} = require("../controllers/DailyUpdate/dailyUpdateController");

exports.timerFunction = () => {
  setInterval(async () => {
    await election_vote_day();
  }, 86400000);
  setInterval(async () => {
    await election_result_day();
  }, 86400000);
  setInterval(async () => {
    await renewal_request_alarm();
  }, 86400000);
  setInterval(async () => {
    await quote_disappear();
  }, 86400000);
  setInterval(async () => {
    await outstanding_reminder_disable_query();
  }, 86400000);
  // setInterval(async () => {
  //   await renderRealTimeDailyUpdate();
  // }, 86400000);
};
