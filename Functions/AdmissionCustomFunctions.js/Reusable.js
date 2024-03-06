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