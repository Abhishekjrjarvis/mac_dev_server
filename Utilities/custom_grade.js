exports.grade_calculate = (percentage, grade_system, passing = 0, marks) => {
  if (grade_system?.grade_type === "Slab based") {
    let g = [];
    for (let i = 0; i < grade_system.grade_count - 1; i++) {
      let obj = {
        key: grade_system.grades[i].grade_symbol,
        value: [
          grade_system.grades[i].start_range,
          grade_system.grades[i].end_range,
        ],
      };
      g.push(obj);
    }
    let gr = "F";
    for (let obj of g) {
      if (obj.value[0] <= marks && marks <= obj.value[1]) {
        gr = obj.key;
      }
    }
    return gr;
  } else {
    if (percentage === 100) {
      let range = (percentage - passing) / grade_system.grade_count;
      let g = [];
      for (let i = 0; i < grade_system.grade_count - 1; i++) {
        let obj = {
          key: grade_system.grades[i].grade_symbol,
          value:
            i === 0
              ? [100 - range * (i + 1), 100]
              : [100 - range * (i + 1), 99 - range * i],
        };
        g.push(obj);
      }
      let gr = "F";
      for (let obj of g) {
        if (obj.value[0] <= marks && marks <= obj.value[1]) {
          gr = obj.key;
        }
      }
      return gr;
    } else if (percentage > 83.33 && percentage < 100) {
      let range = (percentage - passing) / grade_system.grade_count;
      let g = [];
      let gd_revers = grade_system.grades;
      for (let i = 0; i <= grade_system.grade_count - 1; i++) {
        let obj = {
          key: gd_revers[5 - i].grade_symbol,
          value:
            i === 0
              ? [passing, passing + range - 1]
              : i === 5
              ? // ? [passing + range * i, 100]
                // : [passing + range * i, passing + range * (i + 1) - 1],
                [83.33, 100]
              : [
                  passing + range * i,
                  gd_revers[5 - i].grade_symbol === "A"
                    ? passing + range * (i + 1) - 1 >= 83.33
                      ? 83
                      : // : passing + range * (i + 1) - 1
                        83
                    : passing + range * (i + 1) - 1,
                ],
        };
        g.push(obj);
      }
      let gr = "F";
      for (let obj of g) {
        if (obj.value[0] <= marks && marks <= obj.value[1]) {
          gr = obj.key;
        }
      }
      return gr;
    } else {
      let range = Math.ceil(
        (percentage - passing) / (grade_system.grade_count - 1)
      );
      let g = [];
      let gd_revers = grade_system.grades;
      for (let i = 0; i < grade_system.grade_count - 1; i++) {
        let obj = {
          key: gd_revers[5 - i].grade_symbol,
          value:
            i === 0
              ? [passing, passing + range - 1]
              : i === 4
              ? [passing + range * i, 100]
              : [passing + range * i, passing + range * (i + 1) - 1],
        };
        g.push(obj);
      }

      let gr = "F";
      for (let obj of g) {
        if (obj.value[0] <= marks && marks <= obj.value[1]) {
          // console.log(obj);
          gr = obj.key;
        }
      }
      return gr;
    }
  }
};

const grade_equivalent = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 0,
};
exports.grade_point = (symbol) => {
  return grade_equivalent[symbol];
};

exports.grade_symbol = (gp) => {
  if (gp === 10) return "S";
  else if (gp === 9) return "A";
  else if (gp === 8) return "B";
  else if (gp === 7) return "C";
  else if (gp === 6) return "D";
  else if (gp === 5) return "E";
  else if (gp < 5) return "F";
  else return "";
};
exports.grade_point_with_credit = (gp, credit) => {
  return gp * credit;
};

exports.spi_calculate = (gpc = [], credits = []) => {
  let gpc_total = 0;
  let credit_total = 0;

  if (Array.isArray(gpc)) {
    gpc_total = gpc.reduce((acc, current) => (acc += current));
  }
  if (Array.isArray(credits)) {
    credit_total = credits.reduce((acc, current) => (acc += current));
  }

  return gpc_total / credit_total;
};
exports.cspi_calculate = (spi = [], semester = 1) => {
  let spi_total = 0;
  if (Array.isArray(spi)) {
    spi_total = spi.reduce((acc, current) => (acc += current));
  }

  return spi_total / semester;
};
