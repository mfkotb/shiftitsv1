// Reports launcher. Styles live in reports.css (scoped to this page).
// To add a report: add its exact report name to a list below. To add a tab: add a key.

const SALIS_REPORTS = {
	Accounting: [
		"General and Payment Ledger Comparison",
		"Supplier Ledger Summary",
		"Customer Ledger Summary",
		"Accounts Payable Summary",
		"Accounts Receivable Summary",
		"Gross Profit",
		"Gross and Net Profit Report",
		"Inactive Sales Items",
		"Delivered Items To Be Billed",
		"Received Items To Be Billed",
		"Billed Items To Be Received",
		"Sales Payment Summary",
	],
	Buying: [
		"Item-wise Purchase History",
		"Subcontract Order Summary",
		"Purchase Order Analysis",
		"Subcontracted Raw Materials To Be Transferred",
		"Subcontracted Item To Be Received",
		"Purchase Analytics",
		"Purchase Order Trends",
		"Supplier Quotation Comparison",
	],
	Selling: [
		"Sales Person-wise Transaction Summary",
		"Payment Terms Status for Sales Order",
		"Pending SO Items For Purchase Request",
		"Item-wise Sales History",
		"Available Stock for Packing Items",
		"Quotation Trends",
		"Sales Order Trends",
		"Territory-wise Sales",
		"Sales Person Target Variance Based On Item Group",
		"Inactive Customers",
		"Customer-wise Item Price",
		"Customers Without Any Sales Transactions",
	],
	Stock: [
		"Stock Ledger Variance",
		"Stock Balance",
		"Item Prices",
		"Items To Be Requested",
		"Requested Items To Be Transferred",
		"Serial and Batch Summary",
		"Batch-Wise Balance History",
		"Batch Item Expiry Status",
	],
	Manufacturing: [
		"Work Order Summary",
		"Production Analytics",
		"Production Planning Report",
		"Work Order Stock Report",
		"BOM Explorer",
		"BOM Stock Analysis",
		"BOM Operations Time",
		"Job Card Summary",
		"Downtime Analysis",
		"Process Loss Report",
	],
};

frappe.pages["reports"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({ parent: wrapper, title: __("Reports"), single_column: true });
	const esc = frappe.utils.escape_html;
	const modules = Object.keys(SALIS_REPORTS);
	// Reports this user may open: v16 -> boot.allowed_reports, v15 -> boot.user.all_reports
	const allowed = frappe.boot.allowed_reports || frappe.boot.user?.all_reports;
	const can_open = (r) => !allowed || r in allowed;

	const tabs = modules
		.map(
			(m, i) => `<li class="nav-item">
				<button class="nav-link ${i ? "" : "active"}" type="button" data-tab="${i}">${esc(__(m))}</button>
			</li>`
		)
		.join("");

	const panes = modules
		.map((m, i) => {
			const tiles = SALIS_REPORTS[m]
				.filter(can_open)
				.map(
					(r) => `<a href="${frappe.router.make_url(["query-report", r])}" class="tile">
						<div class="tile-title">${esc(__(r))}</div>
					</a>`
				)
				.join("");
			return `<div class="tab-pane fade ${i ? "" : "show active"}" data-pane="${i}">
				<div class="tiles-container">${tiles}</div>
			</div>`;
		})
		.join("");

	const $body = $(page.body).html(`
		<ul class="nav nav-tabs" role="tablist">${tabs}</ul>
		<div class="tab-content mt-4">${panes}</div>`);

	$body.on("click", ".nav-link", function () {
		const i = $(this).data("tab");
		$body.find(".nav-link").removeClass("active");
		$(this).addClass("active");
		$body.find(".tab-pane").removeClass("show active");
		$body.find(`[data-pane="${i}"]`).addClass("show active");
	});
};
