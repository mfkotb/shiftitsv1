frappe.ui.form.on('Stock Entry', {
    onload: function(frm) {
        // Restrict stock entry type
        frm.set_query('stock_entry_type', function() {
            return {
                filters: [
                    ['name', 'in', ['Material Issue', 'Material Receipt', 'Material Transfer']]
                ]
            };
        });
    }
});