exports.dateTimeComparison = (first, second) => {
  const year = +first.substr(0, 4) === +second.substr(0, 4);
  const yearGreater = +first.substr(0, 4) > +second.substr(0, 4);
  const month = +first.substr(5, 2) === +second.substr(5, 2);
  const monthGreate = +first.substr(5, 2) > +second.substr(5, 2);
  const day = +first.substr(8, 2) === +second.substr(8, 2);
  const dayGreater = +first.substr(8, 2) > +second.substr(8, 2);
  const hour = +first.substr(11, 2) === +second.substr(11, 2);
  const hourGreater = +first.substr(11, 2) > +second.substr(11, 2);
  const minute = +first.substr(14, 2) === +second.substr(14, 2);
  const minuteGreater = +first.substr(14, 2) > +second.substr(14, 2);
  const secondTime = +first.substr(17, 2) === +second.substr(17, 2);
  const secondTimeGreater = +first.substr(17, 2) > +second.substr(17, 2);

  if (yearGreater) return true;
  else if (year)
    if (monthGreate) return true;
    else if (month)
      if (dayGreater) return true;
      else if (day)
        if (hourGreater) return true;
        else if (hour)
          if (minuteGreater) return true;
          else if (minute)
            if (secondTimeGreater) return true;
            else if (secondTime) return true;
            else return false;
          else return false;
        else false;
      else return false;
    else return false;
  else return false;
};

exports.timeComparison = (first, second) => {
  const hour = +first.substr(11, 2) === +second.substr(0, 2);
  const hourGreater = +first.substr(11, 2) > +second.substr(0, 2);
  const minute = +first.substr(14, 2) === +second.substr(3, 2);
  const minuteGreater = +first.substr(14, 2) > +second.substr(3, 2);
  const secondTime = +first.substr(17, 2) === +second.substr(6, 2);
  const secondTimeGreater = +first.substr(17, 2) > +second.substr(6, 2);
  if (hourGreater) return true;
  else if (hour)
    if (minuteGreater) return true;
    else if (minute)
      if (secondTimeGreater) return true;
      else if (secondTime) return true;
      else return false;
    else return false;
  else false;
};

exports.todayDate = async () => {
  const currentDate = new Date();
  const currentDateLocalFormat = currentDate.toISOString().split("-");
  const day =
    +currentDateLocalFormat[2].split("T")[0] > 9
      ? +currentDateLocalFormat[2].split("T")[0]
      : `0${+currentDateLocalFormat[2].split("T")[0]}`;
  const month =
    +currentDateLocalFormat[1] > 9
      ? +currentDateLocalFormat[1]
      : `0${+currentDateLocalFormat[1]}`;
  const year = +currentDateLocalFormat[0];
  return `${day}/${month}/${year}`;
};

exports.classCodeFunction = async () => {
  const c_1 = Math.floor(Math.random() * 9) + 1;
  const c_2 = Math.floor(Math.random() * 9) + 1;
  const c_3 = Math.floor(Math.random() * 9) + 1;
  const c_4 = Math.floor(Math.random() * 9) + 1;
  var r_class_code = `${c_1}${c_2}${c_3}${c_4}`;
  return r_class_code;
};
