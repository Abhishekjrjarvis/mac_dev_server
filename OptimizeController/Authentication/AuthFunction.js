// const usernameGenerator = () => {
//     const upperCase = ["A", "B", "C", "D", "E", "F", "G", "H","Z"]
//     const lowerCase = ["i", "j", "k", "l", "m", "n", "o", "p", "W"]
//     const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8"]
//     const exp = [".", "_"]
//     var u_1 = Math.floor(Math.random() * 9)
//     var u_2 = Math.floor(Math.random() * 9)
//     var u_3 = Math.floor(Math.random() * 9)
//     var u_4 = Math.floor(Math.random() * 9)
//     var u_5 = Math.floor(Math.random() * 9)
//     var u_6 = Math.floor(Math.random() * 2)
//     var u_7 = Math.floor(Math.random() * 2)
//     var u_8 = Math.floor(Math.random() * 9)
//     var userExp = `qQ${lowerCase[u_1]}${upperCase[u_2]}${digits[u_3]}${upperCase[u_4]}${exp[u_6]}${digits[u_5]}${lowerCase[u_8]}${exp[u_7]}`
//     return userExp
// }

exports.payment_modal_activate = () => {
  var r_date = new Date();
  var r_l_date = new Date(r_date);
  r_l_date.setDate(r_l_date.getDate() + 125);
  var r_l_day = r_l_date.getDate();
  var r_l_month = r_l_date.getMonth() + 1;
  var r_l_year = r_l_date.getFullYear();
  if (r_l_day <= 9) {
    r_l_day = `0${r_l_day}`;
  }
  if (r_l_month < 10) {
    r_l_month = `0${r_l_month}`;
  }
  var rDate = `${r_l_year}-${r_l_month}-${r_l_day}`;
  return rDate;
};

exports.check_username_edit_query = () => {
  var u_date = new Date();
  var u_l_date = new Date(u_date);
  u_l_date.setDate(u_l_date.getDate() + 45);
  var u_l_day = u_l_date.getDate();
  var u_l_month = u_l_date.getMonth() + 1;
  var u_l_year = u_l_date.getFullYear();
  if (u_l_day <= 9) {
    u_l_day = `0${u_l_day}`;
  }
  if (u_l_month < 10) {
    u_l_month = `0${u_l_month}`;
  }
  var uDate = `${u_l_year}-${u_l_month}-${u_l_day}`;
  return uDate;
};
