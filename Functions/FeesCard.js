const { add_all_installment_zero } = require("../helper/Installment");
const Admission = require("../models/Admission/Admission");
const NestedCard = require("../models/Admission/NestedCard");
const NewApplication = require("../models/Admission/NewApplication");
const RemainingList = require("../models/Admission/RemainingList");
const FeesStructure = require("../models/Finance/FeesStructure");
const InstituteAdmin = require("../models/InstituteAdmin");
const Student = require("../models/Student");

exports.render_new_fees_card = async (sid, appId, struct) => {
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
      new_remainFee.card_type = "Normal";
      new_remainFee.already_made = true;
      var structure_card = {
        fee_structure: structure,
      };
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
        nest_card_gov.remaining_array.push({
          remainAmount: structure?.total_admission_fees - structure?.applicable_fees,
          appId: apply._id,
          instituteId: institute._id,
          installmentValue: "Government Installment",
          isEnable: true,
        });
        await nest_card_gov.save()
      }
      new_remainFee.fee_structure = structure?._id;
      new_remainFee.remaining_fee += structure?.total_admission_fees;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      admission.remainingFee.push(student._id);
      student.admissionRemainFeeCount += structure?.total_admission_fees;
      apply.remainingFee += structure?.total_admission_fees;
      admission.remainingFeeCount += structure?.total_admission_fees;
      await Promise.all([
        new_remainFee.save(),
        admission.save(),
        apply.save(),
        student.save(),
      ]);
    } catch (e) {
      console.log(e);
    }
  };