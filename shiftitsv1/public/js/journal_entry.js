// Only allow these Journal Entry voucher types in the form.
frappe.ui.form.on("Journal Entry", {
	setup(frm) {
		frm.set_df_property("voucher_type", "options", ["Journal Entry", "Opening Entry"].join("\n"));
	},
});
