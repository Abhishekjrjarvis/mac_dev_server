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
    } else if (percentage > 83.33 && percentage !== 100) {
      let range = (percentage - passing) / grade_system.grade_count;
      let g = [];
      let gd_revers = grade_system.grades;
      for (let i = 0; i < grade_system.grade_count - 1; i++) {
        let obj = {
          key: gd_revers.grades[5 - i].grade_symbol,
          value:
            i === 0
              ? [passing, passing + range - 1]
              : i === 5
              ? [passing + range * i, 100]
              : [passing + range * i, passing + range * (i + 1) - 1],
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
