const {
  check_poll_status,
  election_vote_day,
  election_result_day,
} = require("../Service/AutoRefreshBackend");
const { dueDateAlarm } = require("../Service/alarm");

exports.timerFunction = () => {
  // setInterval(async () => {
  //   await election_vote_day();
  // }, 30000);
  // setInterval(async () => {
  //   await election_result_day();
  // }, 30000);
  // setInterval(async () => {
  //   await participate_result_day();
  // }, 30000);
  // setInterval(async () => {
  //   await dueDateAlarm();
  // }, 86400000);
};
