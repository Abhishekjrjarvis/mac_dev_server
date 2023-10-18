exports.get_day_wise_sort = (arr) => {
  let with_schedule = [];
  for (let tt of arr) {
    if (tt?.from?.includes("Am")) {
      with_schedule.push({
        ...tt,
        compare: +`${tt?.from?.substring(0, 2) + tt?.from?.substring(3, 5)}`,
      });
    } else {
      with_schedule.push({
        ...tt,
        compare: +`${
          `${+tt?.from?.substring(0, 2) + 12}` + tt?.from?.substring(3, 5)
        }`,
      });
    }
  }
  with_schedule?.sort(function (a, b) {
    return a.compare - b.compare;
  });

  return with_schedule;
};
