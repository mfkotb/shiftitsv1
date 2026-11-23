frappe.ui.form.on('Journal Entry', {
    onload(frm) {
        console.log("Journal Entry loaded");

        frm.set_df_property(
            'voucher_type',
            'options',
            ['Journal Entry', 'Opening Entry'].join('\n')
        );

        frm.refresh_field('voucher_type');
    }
});
