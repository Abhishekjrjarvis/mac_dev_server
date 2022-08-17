const end_poll = (val) => {
    var r_date = new Date();
    var r_l_date = new Date(r_date);
    r_l_date.setDate(r_l_date.getDate() + val);
    var r_l_day = r_l_date.getDate();
    var r_l_month = r_l_date.getMonth() + 1;
    var r_l_year = r_l_date.getFullYear();
    var r_l_hrs = r_l_date.getHours()
    var r_l_min = r_l_date.getMinutes()
    if (r_l_month < 10) {
    r_l_month = `0${r_l_month}`;
    }
    if(r_l_min <= 9){
        r_l_min = `0${r_l_min}`
    }
    return `${r_l_year}-${r_l_month}-${r_l_day}T${r_l_hrs}:${r_l_min}`;
}

module.exports = end_poll