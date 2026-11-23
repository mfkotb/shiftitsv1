// Salis dashboard. Styles live in home_page.css (loaded by Frappe, scoped to this page).

frappe.pages["home-page"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({ parent: wrapper, title: "", single_column: true });
	new SalisHomePage(page, wrapper);
};

class SalisHomePage {
	// Left menu: [label, icon, route]
	static MENU = [
		["Company", "fa-building", ["company"]],
		["User", "fa-user", ["user"]],
		["Chart of Accounts", "fa-sitemap", ["account", "view", "tree"]],
		["Cost Center", "fa-project-diagram", ["cost-center"]],
		["POS Profile", "fa-shopping-cart", ["pos-profile"]],
		["Customer", "fa-user-tie", ["customer"]],
		["Customer Group", "fa-users-cog", ["customer-group"]],
		["Warehouse", "fa-warehouse", ["warehouse"]],
		["Supplier", "fa-truck", ["supplier"]],
		["Supplier Group", "fa-people-carry", ["supplier-group"]],
		["Items", "fa-box", ["item"]],
		["Item Group", "fa-boxes", ["item-group"]],
		["UOM", "fa-cube", ["uom"]],
		["Sales Persons", "fa-users", ["sales-person"]],
		// Manufacturing
		["Bill of Materials", "fa-list-alt", ["bom"]],
		["Workstation", "fa-industry", ["workstation"]],
	];

	// Overview counters: [label, icon, doctype, filters]
	static STATS = [
		["Active Customers", "fa-users", "Customer", { disabled: 0 }],
		["Active Items", "fa-box", "Item", { disabled: 0 }],
		["Active Suppliers", "fa-truck", "Supplier", { disabled: 0 }],
		["Work Orders In Process", "fa-industry", "Work Order", { status: "In Process", docstatus: 1 }],
	];

	static COLORS = ["#f97316", "#1e3a8a"];

	constructor(page, wrapper) {
		this.page = page;
		this.$wrapper = $(wrapper);
		this.company = frappe.defaults.get_default("company");
		load_font_awesome();
		this.render_body();
		this.load_stats();
		this.load_charts();
	}

	render_body() {
		const menu = SalisHomePage.MENU.map(
			([label, icon, route], i) => `
				<div class="menu-item" data-idx="${i}">
					<i class="fas ${icon}"></i><span>${__(label)}</span>
				</div>`
		).join("");

		const stats = SalisHomePage.STATS.map(
			([label, icon], i) => `
				<div class="stat-item">
					<div class="stat-label"><i class="fas ${icon}"></i><h3>${__(label)}</h3></div>
					<div class="stat-value" data-stat="${i}">…</div>
				</div>`
		).join("");

		const chart = (id, title) => `
			<div class="chart-section">
				<h2>${__(title)}</h2>
				<div data-chart="${id}"></div>
			</div>`;

		$(this.page.body).html(`
			<div class="dashboard-body">
				<div class="sidebar"><div class="menu">${menu}</div></div>
				<div class="main-content">
					<div class="charts-row profit-row">
						<div class="chart-section full-width" style="flex: 2;">
							<h2>${__("Profit & Loss")}</h2>
							<div data-chart="pl"></div>
						</div>
						<div class="chart-section stats-card" style="flex: 1;">
							<h2>${__("Overview")}</h2>
							<div class="stats-box">${stats}</div>
						</div>
					</div>
					<div class="charts-row two-charts">
						${chart("sales", "Sales Order Trends")}
						${chart("purchase", "Purchase Order Trends")}
					</div>
					<div class="charts-row two-charts">
						${chart("production", "Production Analytics")}
					</div>
				</div>
			</div>`);

		$(this.page.body).on("click", ".menu-item", function () {
			$(this).addClass("active").siblings().removeClass("active");
			frappe.set_route(...SalisHomePage.MENU[$(this).data("idx")][2]);
		});
	}

	$chart(id) {
		return $(this.page.body).find(`[data-chart="${id}"]`);
	}

	load_stats() {
		SalisHomePage.STATS.forEach(([, , doctype, filters], i) => {
			frappe.db
				.count(doctype, { filters })
				.then((n) => $(this.page.body).find(`[data-stat="${i}"]`).text(n))
				.catch(() => $(this.page.body).find(`[data-stat="${i}"]`).text("-"));
		});
	}

	async load_charts() {
		// Fiscal year that contains today (falls back to the latest one).
		const today = frappe.datetime.get_today();
		let fy = await frappe.db.get_list("Fiscal Year", {
			fields: ["name", "year_start_date", "year_end_date"],
			filters: { year_start_date: ["<=", today], year_end_date: [">=", today], disabled: 0 },
			limit: 1,
		});
		if (!fy.length) {
			fy = await frappe.db.get_list("Fiscal Year", {
				fields: ["name", "year_start_date", "year_end_date"],
				order_by: "year_end_date desc",
				limit: 1,
			});
		}
		if (!fy.length) {
			this.$chart("pl").html(`<div>${__("No Fiscal Year found")}</div>`);
			return;
		}
		fy = fy[0];

		this.report_chart("pl", "Profit and Loss Statement", "bar", {
			company: this.company,
			filter_based_on: "Fiscal Year",
			from_fiscal_year: fy.name,
			to_fiscal_year: fy.name,
			period_start_date: fy.year_start_date,
			period_end_date: fy.year_end_date,
			periodicity: "Monthly",
			accumulated_values: 0,
		});

		const trends = { company: this.company, fiscal_year: fy.name, period: "Monthly", based_on: "Item" };
		this.report_chart("sales", "Sales Order Trends", "line", { ...trends, group_by: "Customer" });
		this.report_chart("purchase", "Purchase Order Trends", "line", { ...trends, group_by: "Supplier" });

		this.report_chart("production", "Production Analytics", "bar", {
			company: this.company,
			from_date: fy.year_start_date,
			to_date: fy.year_end_date,
			range: "Monthly",
		});
	}

	report_chart(id, report_name, type, filters) {
		const $el = this.$chart(id);
		frappe
			.xcall("frappe.desk.query_report.run", { report_name, filters })
			.then((res) => {
				if (!res?.chart?.data) {
					$el.html(`<div class="text-muted">${__("No chart data available")}</div>`);
					return;
				}
				new frappe.Chart($el[0], {
					data: res.chart.data,
					type: res.chart.type || type,
					height: 300,
					colors: SalisHomePage.COLORS,
				});
			})
			.catch(() => $el.html(`<div class="text-muted">${__("Failed to load report")}</div>`));
	}
}

function load_font_awesome() {
	// Frappe no longer ships Font Awesome; load it once.
	if (document.getElementById("salis-fa")) return;
	$('<link id="salis-fa" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">').appendTo("head");
}
