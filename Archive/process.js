   // if (apply?.gstSlab > 0) {
    //   var business_data = new BusinessTC({});
    //   business_data.b_to_c_month = new Date().toISOString();
    //   business_data.b_to_c_i_slab = parseInt(apply?.gstSlab) / 2;
    //   business_data.b_to_c_s_slab = parseInt(apply?.gstSlab) / 2;
    //   business_data.finance = finance._id;
    //   business_data.b_to_c_name = "Admission Fees";
    //   finance.gst_format.b_to_c.push(business_data?._id);
    //   business_data.b_to_c_total_amount = price;
    //   await Promise.all([finance.save(), business_data.save()]);
    // }