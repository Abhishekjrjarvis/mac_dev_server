exports.fee_receipt_count_query = (ins, receipt, order) => {
    try {
        ins.invoice_count += 1;
        receipt.invoice_count = `${ins?.random_institute_code}-${
        new Date().getMonth() + 1
        }-${new Date().getFullYear()}-${ins?.invoice_count}`;
        order.payment_invoice_number = receipt?.invoice_count;
    }
    catch (e) {
        console.log(e)
    }
}


exports.fee_receipt_count_query_new = async (ins, receipt) => {
    try {
        ins.invoice_count += 1;
        receipt.invoice_count = `${ins?.random_institute_code}-${
        new Date().getMonth() + 1
            }-${new Date().getFullYear()}-${ins?.invoice_count}`;
        await Promise.all([ ins.save(), receipt.save()])
    }
    catch (e) {
        console.log(e)
    }
}

exports.form_no_query = (ins, student) => {
    try {
        ins.form_no_count += 1;
        student.form_no = `${ins?.random_institute_code}-${new Date().getFullYear()} / ${ins?.form_no_count}`;
    }
    catch (e) {
        console.log(e)
    }
}