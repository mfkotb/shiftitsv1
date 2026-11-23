frappe.ui.form.on('Purchase Invoice', {
	before_save: function(frm) {
        console.log("Purchase Invoice before_save");
		        /* 2️⃣ Fetch Account Arabic name from debit_to */
        if (frm.doc.credit_to && !frm.doc.custom_credit_to_ar) {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Account",
                    name: frm.doc.credit_to
                },
                callback: function(r) {
                    if (!r.message) return;

                    const account_doc = r.message;

                    if (account_doc.custom_account_name_in_arabic) {
                        frm.set_value(
                            "custom_credit_to_ar",
                            account_doc.custom_account_name_in_arabic
                        );
                    }
                }
            });
        }
	}
})