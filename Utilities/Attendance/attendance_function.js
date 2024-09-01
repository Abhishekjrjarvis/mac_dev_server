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

exports.generate_custom_date_list = (from, to) => {
  let list = [];
  let f_month = from?.substr(3, 2);
  let f_year = from?.substr(6, 4);
  let f_day = from?.substr(0, 2);
  let t_month = to?.substr(3, 2);
  let t_year = to?.substr(6, 4);
  let t_day = to?.substr(0, 2);
  f_month = +f_month;
  t_month = +t_month;
  f_day = +f_day;
  t_day = +t_day;
  let iterate_query = 0;
  f_year = +f_year;
  t_year = +t_year;
  let year_diff = t_year - f_year;
  year_diff = year_diff >= 0 ? year_diff : year_diff * -1;
  if (!year_diff) {
    iterate_query = t_month - f_month;
  } else {
    let t_mod = t_month + 12 * year_diff;
    iterate_query = t_mod - f_month;
  }

  for (let j = 0; j <= iterate_query; j++) {
    if (f_month > 12) {
      f_month = 1;
      f_year += 1;
    }
    let m_current = f_month > 9 ? `${f_month}` : `0${f_month}`;
    let y_current = `${f_year}`;
    let daysInMonth = moment(
      `${y_current}-${m_current}`,
      "YYYY-MM"
    ).daysInMonth();

    let start_point = j === 0 ? f_day : 1;
    for (let i = start_point; i <= daysInMonth; i++) {
      if (j == iterate_query && i > t_day) {
        break;
      } else {
        if (i < 10) {
          let db = `0${i}/${m_current}/${y_current}`;
          list.push(db);
        } else {
          let dbt = `${i}/${m_current}/${y_current}`;
          list.push(dbt);
        }
      }
    }
    f_month += 1;
  }

  return list;
};
