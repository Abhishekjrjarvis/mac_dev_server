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

const payment_modal_activate = () =>{
    var r_date = new Date();
    var r_l_date = new Date(r_date);
    r_l_date.setDate(r_l_date.getDate() + 125);
    var r_l_day = r_l_date.getDate();
    var r_l_month = r_l_date.getMonth() + 1;
    var r_l_year = r_l_date.getFullYear();
    if(r_l_day <= 9){
        r_l_day = `0${r_l_day}`
    }
    if (r_l_month < 10) {
    r_l_month = `0${r_l_month}`;
    }
    var rDate = `${r_l_year}-${r_l_month}-${r_l_day}`;
    return rDate
}

module.exports = payment_modal_activate