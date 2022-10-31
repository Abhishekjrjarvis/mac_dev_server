const Poll = require('../models/Question/Poll')
const InstituteAdmin = require('../models/InstituteAdmin')
const User = require('../models/User');
const { shuffleArray } = require('../Utilities/Shuffle');

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

const distanceRecommend = (lat1, lon1, lat2, lon2, distanceId, expand) => {
    var p = 0.017453292519943295;
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    var euc_dis = 12742 * Math.asin(Math.sqrt(a)); 
    if(euc_dis <= expand){
        return distanceId
    }
}

const distanceCal = (lat1, lon1, lat2, lon2) => {
    var p = 0.017453292519943295;
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
    
    return (12742 * Math.asin(Math.sqrt(a))); 
}

const compareDistance = (rec_1, rec_2) => {
    return rec_1 - rec_2;
}

const remove_redundancy_recommend = (re1, uf1, uc1) => {
    const found_re1 = re1.filter(r=> uf1.includes(r))
    const found_re2 = re1.filter(r=> uc1.includes(r))
    var remove_Ids_re1 = re1?.splice(`${found_re1}`, 1)
    var remove_Ids_re2 = remove_Ids_re1?.splice(`${found_re2}`, 1)
    return remove_Ids_re2
}

exports.recommendedAllIns = async(req, res) =>{
    try{
        var recommend = []
        const { uid } = req.params
        const { expand_search } = req.query
        const expand = expand_search ? expand_search : 2
        var user = await User.findById({_id: uid})
        .select('user_latitude user_longitude userInstituteFollowing userFollowers userCircle')

        const ins = await InstituteAdmin.find({})
        .select('ins_latitude ins_longitude')
        if(ins?.length > 0){
            ins.forEach((rec) => {
                // if(user?.userInstituteFollowing?.includes(rec?._id)) return
                recommend.push(distanceRecommend(user?.user_latitude, user?.user_longitude, rec?.ins_latitude, rec?.ins_longitude, rec?._id, expand)) 
            })
        }
        recommend = recommend.sort(compareDistance)
        var refresh_recommend = recommend.filter(recomm => recomm != null);
        if(refresh_recommend?.length > 0){
            const recommend_ins = await InstituteAdmin.find({_id: { $in: refresh_recommend}})
            .select('insName name photoId insProfilePhoto isUniversal followersCount one_line_about coverId joinedUserList insEmail insAddress ins_latitude ins_longitude insProfileCoverPhoto')
            .populate({
                path: "displayPersonList",
                select: "displayTitle createdAt",
                populate: {
                  path: "displayUser",
                  select: "userLegalName username photoId profilePhoto",
                },
            })
            .lean()
            .exec()
            
            var refresh_recommend_user = []
            recommend_ins?.forEach((recommend) => {
                if(recommend?.joinedUserList.includes(user?._id)) return
                refresh_recommend_user.push(...recommend?.joinedUserList)
            })

            refresh_recommend_user?.splice(`${user?._id}`, 1)
            var valid_recommend_user = remove_redundancy_recommend(refresh_recommend_user, user?.userFollowers, user?.userCircle)
            const recommend_user = await User.find({_id: { $in: valid_recommend_user}})
            .select('userLegalName username followerCount photoId profilePhoto one_line_about')
            .lean()
            .exec()

            var rec_user = []
            recommend_ins?.forEach((rem_rec_red) =>{
                if(user?.userInstituteFollowing?.includes(rem_rec_red?._id)) return
                var data_cal = distanceCal(user?.user_latitude, user?.user_longitude, rem_rec_red?.ins_latitude, rem_rec_red?.ins_longitude)
                rem_rec_red.ins_distance = data_cal.toFixed(2)
                rec_user.push(rem_rec_red)
            })
            shuffleArray(rec_user)
            res.status(200).send({ message: 'Recommended Institute for follow and Joined', recommend_ins_array: rec_user, recommend: true, refresh_recommend_user: recommend_user})
        }
        else{
            res.status(404).send({ message: 'No Recommendation / Suggestion', recommend_ins_array: [], recommend: false})
        }
        
    }
    catch(e){
        console.log(e)
    }
}
