const moment = require("moment");
// hh:mm a
// H
// m
// s

exports.attendance_today_date = (
  type = "yyyy-MM-DD",
  timeType = "hh:mm:ss a"
) => {
  let d = new Date();
  d.setHours(d.getHours() + 5);
  d.setMinutes(d.getMinutes() + 30);
  let d_m = moment(d);
  let t_h = d_m.get("hours");
  let t_m = d_m.get("minutes");
  let t_s = d_m.get("seconds");
  return {
    m_date: d_m.format(type),
    m_time: d_m.format(timeType),
    t_time: `${t_h}:${t_m}:${t_s}`,
  };
};

