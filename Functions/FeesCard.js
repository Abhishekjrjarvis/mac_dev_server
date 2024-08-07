const { add_all_installment_zero } = require("../helper/Installment");
const Admission = require("../models/Admission/Admission");
const NestedCard = require("../models/Admission/NestedCard");
const NewApplication = require("../models/Admission/NewApplication");
const RemainingList = require("../models/Admission/RemainingList");
const FeesStructure = require("../models/Finance/FeesStructure");
const Hostel = require("../models/Hostel/hostel");
const InstituteAdmin = require("../models/InstituteAdmin");
const Student = require("../models/Student");

exports.render_new_fees_card = async (sid, appId, struct, flow, re_ads, classes, obj) => {
    try {
      var student = await Student.findById({ _id: sid });
      var apply = await NewApplication.findById({ _id: appId });
      var admission = await Admission.findById({
        _id: `${apply?.admissionAdmin}`,
      });
      var institute = await InstituteAdmin.findById({
        _id: `${admission?.institute}`,
      });
      var structure = await FeesStructure.findById({ _id: struct });
      var new_remainFee = new RemainingList({
        appId: apply?._id,
        applicable_fee: structure?.total_admission_fees,
        institute: institute?._id,
      });
      new_remainFee.access_mode_card = "Installment_Wise";
      new_remainFee.already_made = true;
      var structure_card = {
        fee_structure: structure,
      };
      if (flow === "BATCH_PROMOTE") {
        new_remainFee.card_type = "Promote";
        new_remainFee.re_admission_flow =
              `${re_ads}` === "WITH_RE_ADMISSION" ? true : false;
        new_remainFee.re_admission_class =
          `${re_ads}` === "WITH_RE_ADMISSION" ? classes?._id : null;
      }
      else {
        new_remainFee.card_type = "Normal";
      }
      if(structure?.applicable_fees >= 0){
        var nest_card = new NestedCard({
            applicable_fee: structure?.applicable_fees,
        })
        nest_card.access_mode_card = "Installment_Wise";
        nest_card.parent_card = new_remainFee?._id
        new_remainFee.applicable_card = nest_card?._id
        nest_card.remaining_fee = structure?.applicable_fees;
        await add_all_installment_zero(
          apply,
          institute._id,
          nest_card,
          structure?.applicable_fees,
          structure_card
        );
        await nest_card.save()
      }
      if((structure?.total_admission_fees - structure?.applicable_fees) >= 0){
        var nest_card_gov = new NestedCard({
            applicable_fee: structure?.total_admission_fees - structure?.applicable_fees,
        })
        nest_card_gov.access_mode_card = "Installment_Wise";
        nest_card_gov.parent_card = new_remainFee?._id
        new_remainFee.government_card = nest_card_gov?._id
        nest_card_gov.remaining_fee = structure?.total_admission_fees - structure?.applicable_fees;
        if((structure?.total_admission_fees - structure?.applicable_fees) > 0){
            nest_card_gov.remaining_array.push({
            remainAmount: structure?.total_admission_fees - structure?.applicable_fees,
            appId: apply._id,
            instituteId: institute._id,
            installmentValue: "First Installment",
            isEnable: true,
            });
        }
        await nest_card_gov.save()
      }
      new_remainFee.fee_structure = structure?._id;
      new_remainFee.remaining_fee += structure?.applicable_fees;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      admission.remainingFee.push(student._id);
      student.admissionRemainFeeCount += structure?.total_admission_fees;
      apply.remainingFee += structure?.total_admission_fees;
      admission.remainingFeeCount += structure?.total_admission_fees;
    //   if(flow === "By_Admission_Admin_After_Docs_Collect"){
    //     student.offline_collect_admission_query.push(new_remainFee?._id)
      //   }
      admission.FeeCollectionApplication.push({
        student: student?._id,
        fee_remain: structure?.applicable_fees,
        payment_flow: new_remainFee?._id,
        app_card: new_remainFee?.applicable_card,
        gov_card: new_remainFee?.government_card,
        status_id: obj?.status_id,
        revert_request_status: obj?.revert_request_status,
        fee_struct: structure?._id,
        application: apply?._id,
      })
      if (structure?.applicable_fees <= 0) {
        admission.confirmedApplication_query.push({
          student: student._id,
          payment_status: "Zero Applicable Fees",
          install_type: "No Installment Required For Payment",
          fee_remain: structure?.applicable_fees,
          status_id: obj?.status_id,
          revert_request_status: obj?.revert_request_status,
          application: apply?._id
        })
      }
      for (let val of admission?.selectedApplication) {
        if (`${val?.student}` === `${student?._id}`) {
          admission.selectedApplication.pull(val?._id)
        }
      }
      await Promise.all([
        new_remainFee.save(),
        admission.save(),
        apply.save(),
        student.save(),
      ]);
      if (`${re_ads}` === "WITH_RE_ADMISSION") {
        admission.re_admission_list.push({
          student: student?._id,
          fee_struct: structure?._id,
          appId: apply?._id,
          app_card: new_remainFee?.applicable_card,
          gov_card: new_remainFee?.government_card,
        })
        admission.re_admission_list_count += 1
        await admission.save()
      }
      return {
        card: new_remainFee?._id,
        app_card: new_remainFee?.applicable_card ?? null,
        gov_card: new_remainFee?.government_card ?? null,
        fee_struct: structure?._id
      }
    } catch (e) {
      console.log(e);
    }
};
  

exports.render_new_fees_card_install = async (struct, new_remainFee) => {
  try {
    var structure = await FeesStructure.findById({ _id: struct });
    if(structure?.applicable_fees >= 0){
      var nest_card = new NestedCard({
          applicable_fee: structure?.applicable_fees,
      })
      nest_card.access_mode_card = "Installment_Wise";
      nest_card.parent_card = new_remainFee?._id
      new_remainFee.applicable_card = nest_card?._id
      nest_card.paid_fee = new_remainFee?.paid_fee
      nest_card.remaining_fee = new_remainFee?.paid_fee >= new_remainFee?.applicable_fee ? new_remainFee?.paid_fee - new_remainFee?.applicable_fee : new_remainFee?.applicable_fee - new_remainFee?.paid_fee;
      for (var ele of new_remainFee?.remaining_array) {
        nest_card.remaining_array.push(ele) 
      }
      await nest_card.save()
    }
    if((structure?.total_admission_fees - structure?.applicable_fees) >= 0){
      var nest_card_gov = new NestedCard({
          applicable_fee: structure?.total_admission_fees - structure?.applicable_fees,
      })
      nest_card_gov.access_mode_card = "Installment_Wise";
      nest_card_gov.parent_card = new_remainFee?._id
      new_remainFee.government_card = nest_card_gov?._id
      nest_card_gov.remaining_fee = structure?.total_admission_fees - structure?.applicable_fees;
      if((structure?.total_admission_fees - structure?.applicable_fees) > 0){
          nest_card_gov.remaining_array.push({
          remainAmount: structure?.total_admission_fees - structure?.applicable_fees,
          appId: new_remainFee?.appId,
          instituteId: new_remainFee?.institute,
          installmentValue: "First Installment",
          isEnable: true,
          });
      }
      await nest_card_gov.save()
    }
    await new_remainFee.save()
  } catch (e) {
    console.log(e);
  }
};

exports.render_new_hostel_fees_card = async (sid, appId, struct, flow, re_ads, classes, obj) => {
  try {
    var student = await Student.findById({ _id: sid });
    var apply = await NewApplication.findById({ _id: appId });
    var admission = await Hostel.findById({
      _id: `${apply?.hostelAdmin}`,
    });
    var institute = await InstituteAdmin.findById({
      _id: `${admission?.institute}`,
    });
    var structure = await FeesStructure.findById({ _id: struct });
    var new_remainFee = new RemainingList({
      appId: apply?._id,
      applicable_fee: structure?.total_admission_fees,
      remaining_flow: "Hostel Application",
      institute: institute?._id,
    });
    new_remainFee.access_mode_card = "Installment_Wise";
    new_remainFee.already_made = true;
    var structure_card = {
      fee_structure: structure,
    };
    if (flow === "BATCH_PROMOTE") {
      new_remainFee.card_type = "Promote";
      new_remainFee.re_admission_flow =
            `${re_ads}` === "WITH_RE_ADMISSION" ? true : false;
      new_remainFee.re_admission_class =
        `${re_ads}` === "WITH_RE_ADMISSION" ? classes?._id : null;
    }
    else {
      new_remainFee.card_type = "Normal";
    }
    if(structure?.applicable_fees >= 0){
      var nest_card = new NestedCard({
          applicable_fee: structure?.applicable_fees,
      })
      nest_card.access_mode_card = "Installment_Wise";
      nest_card.parent_card = new_remainFee?._id
      new_remainFee.applicable_card = nest_card?._id
      nest_card.remaining_fee = structure?.applicable_fees;
      await add_all_installment_zero(
        apply,
        institute._id,
        nest_card,
        structure?.applicable_fees,
        structure_card
      );
      await nest_card.save()
    }
    if((structure?.total_admission_fees - structure?.applicable_fees) >= 0){
      var nest_card_gov = new NestedCard({
          applicable_fee: structure?.total_admission_fees - structure?.applicable_fees,
      })
      nest_card_gov.access_mode_card = "Installment_Wise";
      nest_card_gov.parent_card = new_remainFee?._id
      new_remainFee.government_card = nest_card_gov?._id
      nest_card_gov.remaining_fee = structure?.total_admission_fees - structure?.applicable_fees;
      if((structure?.total_admission_fees - structure?.applicable_fees) > 0){
          nest_card_gov.remaining_array.push({
          remainAmount: structure?.total_admission_fees - structure?.applicable_fees,
          appId: apply._id,
          instituteId: institute._id,
          installmentValue: "First Installment",
          isEnable: true,
          });
      }
      await nest_card_gov.save()
    }
    new_remainFee.fee_structure = structure?._id;
    new_remainFee.remaining_fee += structure?.applicable_fees;
    student.remainingFeeList.push(new_remainFee?._id);
    student.remainingFeeList_count += 1;
    new_remainFee.student = student?._id;
    admission.remainingFee.push(student._id);
    student.admissionRemainFeeCount += structure?.total_admission_fees;
    apply.remainingFee += structure?.total_admission_fees;
    admission.remainingFeeCount += structure?.total_admission_fees;
  //   if(flow === "By_Admission_Admin_After_Docs_Collect"){
  //     student.offline_collect_admission_query.push(new_remainFee?._id)
    //   }
    admission.FeeCollectionApplication.push({
      student: student?._id,
      fee_remain: structure?.applicable_fees,
      payment_flow: new_remainFee?._id,
      app_card: new_remainFee?.applicable_card,
      gov_card: new_remainFee?.government_card,
      status_id: obj?.status_id,
      revert_request_status: obj?.revert_request_status,
      fee_struct: structure?._id,
      application: apply?._id,
    })
    if (structure?.applicable_fees <= 0) {
      admission.confirmedApplication_query.push({
        student: student._id,
        payment_status: "Zero Applicable Fees",
        install_type: "No Installment Required For Payment",
        fee_remain: structure?.applicable_fees,
        status_id: obj?.status_id,
        revert_request_status: obj?.revert_request_status,
        application: apply?._id
      })
    }
    for (let val of admission?.selectedApplication) {
      if (`${val?.student}` === `${student?._id}`) {
        admission.selectedApplication.pull(val?._id)
      }
    }
    await Promise.all([
      new_remainFee.save(),
      admission.save(),
      apply.save(),
      student.save(),
    ]);
    if (`${re_ads}` === "WITH_RE_ADMISSION") {
      admission.re_admission_list.push({
        student: student?._id,
        fee_struct: structure?._id,
        appId: apply?._id,
        app_card: new_remainFee?.applicable_card,
        gov_card: new_remainFee?.government_card,
      })
      admission.re_admission_list_count += 1
      await admission.save()
    }
    return {
      card: new_remainFee?._id,
      app_card: new_remainFee?.applicable_card ?? null,
      gov_card: new_remainFee?.government_card ?? null,
      fee_struct: structure?._id
    }
  } catch (e) {
    console.log(e);
  }
};