// Limit the Stock Entry Types users can pick.
// Manufacturing types were added with the Manufacturing section.
frappe.ui.form.on("Stock Entry", {
	setup(frm) {
		const allowed = [
			"Material Issue",
			"Material Receipt",
			"Material Transfer",
			"Material Transfer for Manufacture",
			"Material Consumption for Manufacture",
			"Manufacture",
			"Repack",
		];
		frm.set_query("stock_entry_type", () => ({
			filters: [["name", "in", allowed]],
		}));
	},
});
