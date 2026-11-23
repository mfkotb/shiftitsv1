frappe.ui.form.on('Sales Invoice', {
    before_save: function(frm) {
        console.log("Sales Invoice before_save");

        /* 1️⃣ Fetch Customer fields */
        if (frm.doc.customer) {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Customer",
                    name: frm.doc.customer
                },
                callback: function(r) {
                    if (!r.message) return;

                    const customer_doc = r.message;

                    if (!frm.doc.customer_types && customer_doc.customer_types) {
                        frm.set_value("customer_types", customer_doc.customer_types);
                    }

                    if (!frm.doc.tn_id && customer_doc.tax_id) {
                        frm.set_value("tn_id", customer_doc.tax_id);
                    }
                }
            });
        }

        /* 2️⃣ Fetch Account Arabic name from debit_to */
        if (frm.doc.debit_to && !frm.doc.custom_debit_to_ar) {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Account",
                    name: frm.doc.debit_to
                },
                callback: function(r) {
                    if (!r.message) return;

                    const account_doc = r.message;

                    if (account_doc.custom_account_name_in_arabic) {
                        frm.set_value(
                            "custom_debit_to_ar",
                            account_doc.custom_account_name_in_arabic
                        );
                    }
                }
            });
        }

        /* 3️⃣ Loop through Items */
        frm.doc.items.forEach((row) => {
            if (!row.item_code) return;

            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Item",
                    name: row.item_code
                },
                callback: function(r) {
                    if (!r.message) return;

                    const item_doc = r.message;

                    if (!row.item_type && item_doc.item_type) {
                        frappe.model.set_value(
                            row.doctype,
                            row.name,
                            "item_type",
                            item_doc.item_type
                        );
                    }

                    if (!row.code && item_doc.item_code) {
                        frappe.model.set_value(
                            row.doctype,
                            row.name,
                            "code",
                            item_doc.item_code
                        );
                    }
                }
            });
        });
    }
});
