exports.dateTimeComparison = (first, second) => {
  const year = +first.substr(1, 4) === +second.substr(6, 4);
  const yearGreater = +first.substr(1, 4) > +second.substr(6, 4);
  const month = +first.substr(6, 2) === +second.substr(3, 2);
  const monthGreate = +first.substr(6, 2) > +second.substr(3, 2);
  const day = +first.substr(9, 2) === +second.substr(0, 2);
  const dayGreater = +first.substr(9, 2) > +second.substr(0, 2);
  const hour = +first.substr(12, 2) === +second.substr(11, 2);
  const hourGreater = +first.substr(12, 2) > +second.substr(11, 2);
  const minute = +first.substr(15, 2) === +second.substr(14, 2);
  const minuteGreater = +first.substr(15, 2) > +second.substr(14, 2);
  const secondTime = +first.substr(18, 2) === +second.substr(17, 2);
  const secondTimeGreater = +first.substr(18, 2) > +second.substr(17, 2);

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
        else return false;
      else return false;
    else return false;
  else return false;
};

exports.timeComparison = (first, second) => {
  // console.log(first);
  // console.log(second);
  const hour = +first.substr(12, 2) === +second.substr(0, 2);
  const hourGreater = +first.substr(12, 2) > +second.substr(0, 2);
  const minute = +first.substr(15, 2) === +second.substr(3, 2);
  const minuteGreater = +first.substr(15, 2) > +second.substr(3, 2);
  const secondTime = +first.substr(18, 2) === +second.substr(6, 2);
  const secondTimeGreater = +first.substr(18, 2) > +second.substr(6, 2);
  if (hourGreater) return true;
  else if (hour)
    if (minuteGreater) return true;
    else if (minute)
      if (secondTimeGreater) return true;
      else if (secondTime) return true;
      else return false;
    else return false;
  else return false;
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

exports.getOnlyTime = () => {
  const actualTime = new Date();
  const hour = actualTime.getHours();
  const minute = actualTime.getMinutes();
  const second = actualTime.getSeconds();
  const hourC = hour > 9 ? hour : `0${hour}`;
  const minuteC = minute > 9 ? minute : `0${minute}`;
  const secondC = second > 9 ? second : `0${second}`;
  return `${hourC}:${minuteC}:${secondC}`;
};

exports.getOnlyTimeCompare = (arg1) => {
  let actualTime = new Date();
  actualTime.setHours(actualTime.getHours() + 5);
  actualTime.setMinutes(actualTime.setMinutes() + 30);
  const hour = actualTime.getHours();

  let arg1Hour = 0;
  let arg1Minute = +arg1.slice(3, 5);
  if (arg1.slice(-2) === "Am") {
    arg1Hour = +arg1.slice(0, 2);
  } else {
    arg1Hour = +arg1.slice(0, 2) + 12;
  }

  if (arg1Hour >= hour) {
    if (arg1Minute <= actualTime.setMinutes()) {
      return "Half Present";
    } else {
      return "Present";
    }
  } else {
    return "Half Present";
  }
};

exports.offStaffTimetableTimeCompare = (arg1, arg2, arg3, arg4) => {
  let arg1Hour = 0;
  let arg1Minute = +arg1.slice(3, 5);
  if (arg1.slice(-2) === "Am") {
    arg1Hour = +arg1.slice(0, 2);
  } else {
    arg1Hour = +arg1.slice(0, 2) + 12;
  }
  let arg2Hour = 0;
  let arg2Minute = +arg2.slice(3, 5);
  if (arg2.slice(-2) === "Am") {
    arg2Hour = +arg2.slice(0, 2);
  } else {
    arg2Hour = +arg2.slice(0, 2) + 12;
  }

  let arg3Hour = 0;
  let arg3Minute = +arg3.slice(3, 5);
  if (arg3.slice(-2) === "Am") {
    arg3Hour = +arg3.slice(0, 2);
  } else {
    arg3Hour = +arg3.slice(0, 2) + 12;
  }

  // let arg4Hour = 0;
  // // let arg4Minute = +arg4.slice(3, 5);
  // if (arg4.slice(-2) === "Am") {
  //   arg4Hour = +arg4.slice(0, 2);
  // } else {
  //   arg4Hour = +arg4.slice(0, 2) + 12;
  // }
  if (arg1Hour <= arg3Hour && arg3Hour <= arg2Hour) {
    if (arg3Minute + 10 >= arg2Minute) return false;
    // console.log("nothing", arg3Minute, arg2Minute);
    else return true;
    // console.log("hi", arg1, arg3, arg2);
  } else {
    if (arg3Minute - 10 === arg1Minute) return false;

    // console.log("nothing", arg3Minute, arg1Minute);
  }
};

exports.staffSideFromTimeComparison = (arg1, arg2) => {
  let arg1Minute = 0;
  if (arg1.slice(-2) === "Am") {
    arg1Minute = +arg1.slice(0, 2) * 60 + +arg1.slice(3, 5);
  } else {
    arg1Minute = (+arg1.slice(0, 2) + 12) * 60 + +arg1.slice(3, 5);
  }
  let arg2Minute = 0;
  if (arg1.slice(-2) === "Am") {
    arg2Minute = +arg2.slice(0, 2) * 60 + +arg2.slice(3, 5);
  } else {
    arg2Minute = (+arg2.slice(0, 2) + 12) * 60 + +arg2.slice(3, 5);
  }
  if (arg1Minute > arg2Minute) return true;
  else return false;
};
