frappe.ui.form.on('Payment Entry', {
	before_save: function(frm) {
        console.log("Payment Entry before_save");
		        /* 2️⃣ Fetch Account Arabic name from debit_to */
        if (frm.doc.paid_from && !frm.doc.custom_account_name_in_arabic) {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Account",
                    name: frm.doc.paid_from
                },
                callback: function(r) {
                    if (!r.message) return;

                    const account_doc = r.message;

                    if (account_doc.custom_account_name_in_arabic) {
                        frm.set_value(
                            "custom_account_name_in_arabic",
                            account_doc.custom_account_name_in_arabic
                        );
                    }
                }
            });
        }
        if (frm.doc.paid_to && !frm.doc.custom_account_name_in_arabic_copy) {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Account",
                    name: frm.doc.paid_to
                },
                callback: function(r) {
                    if (!r.message) return;

                    const account_doc = r.message;

                    if (account_doc.custom_account_name_in_arabic) {
                        frm.set_value(
                            "custom_account_name_in_arabic_copy",
                            account_doc.custom_account_name_in_arabic
                        );
                    }
                }
            });
        }
	}
})