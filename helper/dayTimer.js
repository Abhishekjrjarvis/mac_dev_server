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
