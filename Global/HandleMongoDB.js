exports.promise_all_query = async (query_arr) => {
    if (query_arr?.length > 0) {
        for (var query of query_arr) {
            query.save().then((data)=>{
                console.log("Data Saved")
            }).catch((e)=>{
                console.log("Data Save Error", e)
            })
        }
    }
}