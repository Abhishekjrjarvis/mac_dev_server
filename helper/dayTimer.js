const moment = require("moment");

exports.custom_date_time = (arg) => {
  const date = new Date(new Date());
  date.setDate(date.getDate() + arg);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }
  const date_pattern = `${year}-${month}-${day}`;
  return date_pattern;
};

exports.user_date_of_birth = async (user) => {
  try {
    const date = new Date();
    var p_date = date.getDate();
    var p_month = date.getMonth() + 1;
    var p_year = date.getFullYear();
    if (p_month < 10) {
      p_month = `0${p_month}`;
    }
    if (p_date < 10) {
      p_date = `0${p_date}`;
    }
    var month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var b_date = user.userDateOfBirth.slice(8, 10);
    var b_month = user.userDateOfBirth.slice(5, 7);
    var b_year = user.userDateOfBirth.slice(0, 4);
    if (b_date > p_date) {
      p_date = p_date + month[b_month - 1];
      p_month = p_month - 1;
    }
    if (b_month > p_month) {
      p_year = p_year - 1;
      p_month = p_month + 12;
    }
    var get_cal_year = p_year - b_year;
    if (get_cal_year > 13) {
      user.ageRestrict = "No";
    } else {
      user.ageRestrict = "Yes";
    }
    await user.save();
  } catch {}
};

exports.age_calc = (dobs) => {
  var date_of_birth = new Date(dobs);
  var date_year = date_of_birth.getYear();
  var date_month = date_of_birth.getMonth();
  var date_day = date_of_birth.getDate();

  var now = new Date();
  var currentYear = now.getYear();
  var currentMonth = now.getMonth();
  var currentDate = now.getDate();
  var age = {};
  yearAge = currentYear - date_year;
  if (currentMonth >= date_month) var monthAge = currentMonth - date_month;
  else {
    yearAge--;
    var monthAge = 12 + currentMonth - date_month;
  }
  if (currentDate >= date_day) var dateAge = currentDate - date_day;
  else {
    monthAge--;
    var dateAge = 31 + currentDate - date_day;

    if (monthAge < 0) {
      monthAge = 11;
      yearAge--;
    }
  }
  age = {
    years: Math.abs(yearAge),
    months: Math.abs(monthAge),
    days: Math.abs(dateAge),
  };

  return age;
};

exports.auto_election_timer = (arg) => {
  const date = new Date(new Date());
  date.setDate(date.getDate() + arg);
  return date;
};

exports.notify_attendence_provider = (value) => {
  const replaceIndexValue = value.replace("/", "-");
  const replaceSecondIndexValue = replaceIndexValue.replace("/", "-");
  const reverseYear = `${replaceSecondIndexValue.substring(6, 10)}`;
  const reverseMonth = `${replaceSecondIndexValue.substring(3, 5)}`;
  const reverseDay = `${replaceSecondIndexValue.substring(0, 2)}`;
  const reverseReplaceSecondIndexValue = `${reverseYear}-${reverseMonth}-${reverseDay}`;
  const day =
    new Date().getDate() < 10
      ? `0${new Date().getDate()}`
      : new Date().getDate();
  const month =
    new Date().getMonth() + 1 < 10
      ? `0${new Date().getMonth() + 1}`
      : new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  if (`${day}-${month}-${year}` === `${replaceSecondIndexValue}`) {
    return "today";
  } else {
    return `on ${moment(new Date(reverseReplaceSecondIndexValue)).format(
      "LL"
    )}`;
  }
};

exports.replace_query = (value) => {
  const replaceIndexValue = value.replace("/", "-");
  const replaceSecondIndexValue = replaceIndexValue.replace("/", "-");
  const reverseYear = `${replaceSecondIndexValue.substring(6, 10)}`;
  const reverseMonth = `${replaceSecondIndexValue.substring(3, 5)}`;
  const reverseDay = `${replaceSecondIndexValue.substring(0, 2)}`;
  const reverseReplaceSecondIndexValue = `${reverseYear}-${reverseMonth}-${reverseDay}`;
  return reverseReplaceSecondIndexValue;
};

// console.log(replace_query(""))

exports.date_renew = async (s_date, type, d_set) => {
  if (type === "End") {
    s_date.setDate(s_date.getDate() + d_set.end_date);
  } else if (type === "Select") {
    s_date.setDate(s_date.getDate() + d_set.select_date);
  } else if (type === "Compaign") {
    s_date.setDate(s_date.getDate() + d_set.campaign_date);
  } else if (type === "Compaign_Last") {
    s_date.setDate(s_date.getDate() + d_set.campaign_last_date);
  } else if (type === "Vote") {
    s_date.setDate(s_date.getDate() + d_set.vote_date);
  } else if (type === "Result") {
    s_date.setDate(s_date.getDate() + d_set.result_date);
  } else {
  }
  return new Date(s_date).toISOString();
};

exports.generate_date = (cal) => {
  const hours =
    new Date().getHours() > 10
      ? new Date().getHours()
      : `0${new Date().getHours()}`;
  const minutes =
    new Date().getMinutes() > 10
      ? new Date().getMinutes()
      : `0${new Date().getMinutes()}`;
  const seconds =
    new Date().getSeconds() > 10
      ? new Date().getSeconds()
      : `0${new Date().getSeconds()}`;
  var start_date_format = `${cal}T${hours}:${minutes}:${seconds}.${new Date().getMilliseconds()}Z`;
  return start_date_format;
};

exports.custom_date_time_reverse = (arg) => {
  const date = new Date(new Date());
  date.setDate(date.getDate() - arg);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }
  const date_pattern = `${year}-${month}-${day}`;
  return date_pattern;
};

exports.custom_month_reverse = (arg) => {
  const date = new Date(new Date());
  date.setMonth(date.getMonth() - arg);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }
  const date_pattern = `${year}-${month}-${day}`;
  return date_pattern;
};

exports.custom_month_query = (arg) => {
  const date = new Date(new Date());
  date.setMonth(date.getMonth() + arg);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }
  const date_pattern = `${year}-${month}-${day}`;
  return date_pattern;
};

exports.custom_month_query_hostel = (arg, start) => {
  const date = new Date(`${start}`);
  date.setMonth(date.getMonth() + arg);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }
  const date_pattern = `${year}-${month}-${day}`;
  return date_pattern;
};

exports.custom_year_payroll_query = (arg) => {
  const date = new Date(new Date());
  date.setFullYear(date.getFullYear() + arg);
  var year = date.getFullYear();
  const date_pattern = `${year}`;
  return date_pattern;
};

exports.custom_month_payroll_query = (arg) => {
  const date = new Date(new Date());
  date.setMonth(date.getMonth() + arg);
  var month = date.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }
  const date_pattern = `${month}`;
  return date_pattern;
};

exports.custom_year_reverse = (arg) => {
  const date = new Date(new Date());
  date.setFullYear(date.getFullYear() - arg);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }
  const date_pattern = `${year}-${month}-${day}`;
  return date_pattern;
};

exports.day_difference = async (ms) => {
  if (ms) {
    var val = ms / 86400000;
    return val;
  }
};

exports.ms_calc = async (old_date, new_date) => {
  const date1 = new Date(`${new_date}`);
  const date2 = new Date(`${old_date}`);
  const diffTime = date2 - date1;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
