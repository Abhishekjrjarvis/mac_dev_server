const Poll = require('../models/Question/Poll')

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