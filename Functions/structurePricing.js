exports.structure_pricing_query = async (new_struct, month) => {
  try {
    if (new_struct?.total_installments) {
      new_struct.one_installments.fees = new_struct.one_installments.fees
        ? Math.round(new_struct.one_installments.fees / month)
        : new_struct.one_installments.fees;
      new_struct.two_installments.fees = new_struct.two_installments.fees
        ? Math.round(new_struct.two_installments.fees / month)
        : new_struct.two_installments.fees;
      new_struct.three_installments.fees = new_struct.three_installments.fees
        ? Math.round(new_struct.three_installments.fees / month)
        : new_struct.three_installments.fees;
      new_struct.four_installments.fees = new_struct.four_installments.fees
        ? Math.round(new_struct.four_installments.fees / month)
        : new_struct.four_installments.fees;
      new_struct.five_installments.fees = new_struct.five_installments.fees
        ? Math.round(new_struct.five_installments.fees / month)
        : new_struct.five_installments.fees;
      new_struct.six_installments.fees = new_struct.six_installments.fees
        ? Math.round(new_struct.six_installments.fees / month)
        : new_struct.six_installments.fees;
      new_struct.seven_installments.fees = new_struct.seven_installments.fees
        ? Math.round(new_struct.seven_installments.fees / month)
        : new_struct.seven_installments.fees;
      new_struct.eight_installments.fees = new_struct.eight_installments.fees
        ? Math.round(new_struct.eight_installments.fees / month)
        : new_struct.eight_installments.fees;
      new_struct.nine_installments.fees = new_struct.nine_installments.fees
        ? Math.round(new_struct.nine_installments.fees / month)
        : new_struct.nine_installments.fees;
      new_struct.ten_installments.fees = new_struct.ten_installments.fees
        ? Math.round(new_struct.ten_installments.fees / month)
        : new_struct.ten_installments.fees;
      new_struct.eleven_installments.fees = new_struct.eleven_installments.fees
        ? Math.round(new_struct.eleven_installments.fees / month)
        : new_struct.eleven_installments.fees;
      new_struct.tweleve_installments.fees = new_struct.tweleve_installments
        .fees
        ? Math.round(new_struct.tweleve_installments.fees / month)
        : new_struct.tweleve_installments.fees;
    }
    new_struct.total_admission_fees = new_struct.total_admission_fees
      ? Math.round(new_struct.total_admission_fees / month)
      : new_struct.total_admission_fees;
    new_struct.applicable_fees = new_struct.applicable_fees
      ? Math.round(new_struct.applicable_fees / month)
      : new_struct.applicable_fees;

    if (new_struct?.fees_heads?.length > 0) {
      for (var ref of new_struct?.fees_heads) {
        ref.head_amount = ref.head_amount
          ? Math.round(ref.head_amount / month)
          : ref.head_amount;
      }
    } else {
    }
    await new_struct.save();
  } catch (e) {
    console.log(e);
  }
};
