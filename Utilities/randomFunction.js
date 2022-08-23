function get_random(list) {
  //   console.log(list);
  return list[Math.floor(Math.random() * list.length)];
}

exports.random_list_generator = (list) => {
  const newList = [];
  for (let i of list) {
    // const me = ;
    newList.push(get_random(list));
  }
  console.log(list);
  return newList;
};

exports.suffle_search_list = (list1, list2) => {
  const globalList = [];
  const listUser = list1;
  const listInstitute = list2;
  const fun = () => {
    while (listUser.length !== 0 || listInstitute.length !== 0) {
      const me = Math.floor(Math.random() * 6);
      const me1 = Math.floor(Math.random() * 2);
      if (me1 === 1) {
        if (listUser[me]) {
          globalList.push(listUser[me]);
          listUser.splice(me, 1);
        }
      } else {
        if (listInstitute[me]) {
          globalList.push(listInstitute[me]);
          listInstitute.splice(me, 1);
        }
      }
    }
  };
  fun();
  return globalList;
};
// const circleFilter =
//   tagUser.userFollowersList &&
//   tagUser.userFollowersList.filter((user) => {
//     if (
//       user.username.toLowerCase().includes(req.query.search.trim()) ||
//       user.userLegalName.toLowerCase().includes(req.query.search.trim())
//     ) {
//       return user;
//     } else {
//       return "";
//     }
//   });
// const userPagination = (circleFilter) => {
//   const endIndex = dropItem + itemPerPage;
//   const user = circleFilter.slice(dropItem, endIndex);
//   return user;
// };
// const tagList = userPagination(circleFilter);
