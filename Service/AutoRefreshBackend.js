const Poll = require('../models/Question/Poll')
const InstituteAdmin = require('../models/InstituteAdmin')

exports.check_poll_status = async(req, res) => {
    var r_date = new Date();
    var hrs = r_date.getHours()
    var min = r_date.getMinutes()
    var day = r_date.getDate();
    var month = r_date.getMonth() + 1;
    year = r_date.getFullYear();
    if (month < 10) {
        month = `0${month}`;
    }
    if(min <= 9){
        min = `0${min}`
    }
    if(min <= 9){
        min = `0${r_date.getMinutes()}`
    }
    if(day <=9){
        day=`0${day}`
    }
    const poll = await Poll.find({ duration_date: `${year}-${month}-${day}T${hrs}:${min}`})
    if(poll.length >=1 ){
        poll.forEach(async (pl) => {
            pl.poll_status = 'Closed'
            await pl.save()
        })
        // console.log('Poll Closed')
    }
    else{
        // console.log('No Poll Close')
    }
}


exports.payment_modal_initiated = async(req, res) =>{
    var v_date = new Date()
    var v_day = v_date.getDate()
    var v_month = v_date.getMonth() + 1
    var v_year = v_date.getFullYear()
    if(v_day < 10){
        v_day = `0${v_day}`
    }
    if(v_month < 10){
        v_month = `0${v_month}`
    }
    var date_format = `${v_year}-${v_month}-${v_day}`
    try{
        const institute = await InstituteAdmin.find({ modal_activate: `${date_format}`})
        if(institute.length >= 1){
            institute.forEach(async (ele) => {
                ele.accessFeature = 'Locked'
                ele.activateStatus = 'Not Activated'
                await ele.save()
            })
        }
        else{
            
        }
    }
    catch{

    }
}
