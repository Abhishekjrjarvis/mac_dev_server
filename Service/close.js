exports.end_poll = (val) => {
  var r_date = new Date();
  var r_l_date = new Date(r_date);
  r_l_date.setDate(r_l_date.getDate() + val);
  var r_l_day = r_l_date.getDate();
  var r_l_month = r_l_date.getMonth() + 1;
  var r_l_year = r_l_date.getFullYear();
  var r_l_hrs = r_l_date.getHours();
  var r_l_min = r_l_date.getMinutes();
  if (r_l_month < 10) {
    r_l_month = `0${r_l_month}`;
  }
  if (r_l_min <= 9) {
    r_l_min = `0${r_l_min}`;
  }
  if (r_l_day <= 9) {
    r_l_day = `0${r_l_day}`;
  }
  return `${r_l_year}-${r_l_month}-${r_l_day}T${r_l_hrs}:${r_l_min}`;
};

exports.randomSixCode = () => {
  const r_1 = Math.floor(Math.random() * 9) + 1;
  const r_2 = Math.floor(Math.random() * 9) + 1;
  const r_3 = Math.floor(Math.random() * 9) + 1;
  const r_4 = Math.floor(Math.random() * 9) + 1;
  const r_5 = Math.floor(Math.random() * 9) + 1;
  const r_6 = Math.floor(Math.random() * 9) + 1;
  const pattern = `${r_1}${r_2}${r_3}${r_4}${r_5}${r_6}`;
  return pattern;
};

exports.randomFourCode = async () => {
  const r_1 = Math.floor(Math.random() * 9) + 1;
  const r_2 = Math.floor(Math.random() * 9) + 1;
  const r_3 = Math.floor(Math.random() * 9) + 1;
  const r_4 = Math.floor(Math.random() * 9) + 1;
  const r_5 = Math.floor(Math.random() * 9) + 1;
  const r_6 = Math.floor(Math.random() * 9) + 1;
  const pattern = `${r_1}${r_2}${r_3}${r_4}${r_5}${r_6}`;
  return pattern;
};

exports.dailyUpdateTimer = async () => {
  const day =
    new Date().getDate() < 10
      ? `0${new Date().getDate()}`
      : new Date().getDate();
  const month =
    new Date().getMonth() + 1 < 10
      ? `0${new Date().getMonth() + 1}`
      : new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  var r_date = new Date();
  var r_l_date = new Date(r_date);
  r_l_date.setDate(r_l_date.getDate() + 1);
  const nextDay =
    r_l_date.getDate() < 10 ? `0${r_l_date.getDate()}` : r_l_date.getDate();
  const nextMonth =
    r_l_date.getMonth() + 1 < 10
      ? `0${r_l_date.getMonth() + 1}`
      : r_l_date.getMonth() + 1;
  const nextYear = r_l_date.getFullYear();
  const today = {
    day: day,
    month: month,
    year: year,
  };
  const next = {
    nextDay: nextDay,
    nextMonth: nextMonth,
    nextYear: nextYear,
  };
  const combined = {
    today: today,
    next: next,
  };
  return combined;
};
