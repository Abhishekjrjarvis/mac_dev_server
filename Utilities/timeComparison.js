exports.dateTimeSort = (first, second) => {
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
