/**
 * Salis desk customisations (ShiftITs).
 *
 * Works on Frappe v15 (/app) and v16 (/desk):
 *  - every desk URL is built with frappe.router.make_url, never hard-coded "/app/..."
 *  - one debounced MutationObserver + router "change" event replace the old endless setIntervals
 *  - everything that varies (modules, menus, hidden items) lives in SALIS_CONFIG below
 *
 * NOTE: hiding things in the browser is cosmetic only. Real restrictions must be done with
 * Role Permissions / Role Profiles / Module Profiles on the server.
 */
(() => {
	"use strict";

	// Desk only. (Website / login pages get CSS only — see hooks.py.)
	if (!window.frappe?.ui?.make_app_page || !frappe.router) return;

	const IMG = "/assets/shiftitsv1/images/";

	// =====================================================================
	// CONFIG — to add a module, add one entry to `modules`. Nothing else.
	// =====================================================================
	const SALIS_CONFIG = {
		landing_page: "home-page", // empty desk route goes here
		logo: IMG + "salis-logo.svg",
		brand: { en: "Salis", ar: "سالس" },

		modules: [
			{ key: "dashboard", title: "Dashboard", icon: "homepage.png", route: ["home-page"] },
			{
				key: "accounting",
				title: "Accounting",
				icon: "business.png",
				route: ["dashboard-view", "Accounts"],
				menu: [
					{ label: "Chart of Account", route: ["account", "view", "tree"] },
					{ label: "Payment Entry", route: ["payment-entry"] },
					{ label: "Journal Entry", route: ["journal-entry"] },
					{ label: "General Ledger", route: ["query-report", "General Ledger"] },
				],
			},
			{
				key: "buying",
				title: "Buying",
				icon: "coins.png",
				route: ["dashboard-view", "Buying"],
				menu: [
					{ label: "Purchase Order", route: ["purchase-order"] },
					{ label: "Purchase Receipt", route: ["purchase-receipt"] },
					{ label: "Purchase Invoice", route: ["purchase-invoice"] },
				],
			},
			{
				key: "selling",
				title: "Selling",
				icon: "money.png",
				route: ["dashboard-view", "Selling"],
				menu: [
					{ label: "Sales Order", route: ["sales-order"] },
					{ label: "Delivery Note", route: ["delivery-note"] },
					{ label: "Sales Invoice", route: ["sales-invoice"] },
					{ label: "POS Invoice", route: ["pos-invoice"] },
				],
			},
			{
				key: "stock",
				title: "Stock",
				icon: "ready-stock.png",
				route: ["dashboard-view", "Stock"],
				menu: [
					{ label: "Stock Entry", route: ["stock-entry"] },
					{ label: "Purchase Receipt", route: ["purchase-receipt"] },
					{ label: "Delivery Note", route: ["delivery-note"] },
					{ label: "Serial No", route: ["serial-no"] },
					{ label: "Batch", route: ["batch"] },
				],
			},
			{
				key: "manufacturing",
				title: "Manufacturing",
				icon: "factory.svg",
				route: ["dashboard-view", "Manufacturing"],
				menu: [
					{ label: "Bill of Materials", route: ["bom"] },
					{ label: "Work Order", route: ["work-order"] },
					{ label: "Job Card", route: ["job-card"] },
					{ label: "Production Plan", route: ["production-plan"] },
					{ label: "Workstation", route: ["workstation"] },
					{ label: "Operation", route: ["operation"] },
					{ label: "Manufacture Entries", route: ["stock-entry", { purpose: "Manufacture" }] },
				],
			},
			{ key: "reports", title: "Reports", icon: "business.png", route: ["reports"] },
		],

		// Workspaces (by URL slug) where the moved "action slot" sidebar is hidden.
		hide_action_slot_on: [
			"payables", "receivables", "financial-reports", "employee-lifecycle", "recruitment",
			"shift-&-attendance", "leaves", "expense-claims", "assets", "performance",
			"quality", "salary-payout", "tax-&-benefits", "projects", "support", "users",
			"website", "crm", "tools", "erpnext-settings", "integrations", "erpnext-integrations",
			"home", "accounting", "buying", "stock", "selling", "manufacturing", "hr", "build",
			"e-invoice-egypt", "payroll", "e-invoice",
		],

		// ---- non-Administrator only ----
		hidden_roles: [
			"Agriculture Manager", "Agriculture User", "Analytics", "Blogger", "Employee",
			"Expense Approver", "Fleet Manager", "Fulfillment User", "HR Manager", "HR User",
			"Interviewer", "Knowledge Base Contributor", "Knowledge Base Editor", "Leave Approver",
			"Link Manager", "Newsletter Manager", "Prepared Report User", "Projects Manager",
			"Projects User", "Quality Manager", "Report Manager", "Script Manager", "Support Team",
			"System Manager", "Translator", "Website Manager", "Workspace Manager",
			"Delivery Manager", "Delivery User", "Academics User",
		],
		hidden_modules: [
			"Assets", "Automation", "Bulk Transaction", "Communication", "CRM", "Custom", "Email",
			"ERPNext Integrations", "Geo", "HR", "Integrations", "Maintenance", "Payroll", "Portal",
			"Printing", "Projects", "Quality Management", "Regional", "Setup", "ShiftITsV1",
			"Social", "Support", "Telephony", "two_B", "Utilities", "Website", "Workflow",
		],
		// English labels of menu items / buttons to remove; the translated label is matched too.
		hidden_menu_labels: [
			"Supplier Quotation", "Quotation", "Material Request", "Transit Entry",
			"Expired Batches", "Fetch Timesheet", "Product Bundle", "Landed Cost Voucher",
			"Retention Stock Entry", "Asset", "Asset Movement", "Download Report",
			"Quality Inspection(s)", "Packing Slip",
		],
		hidden_selectors: [
			".dropdown-help",
			".dropdown-notifications",
			".input-group.search-bar",
			'#toolbar-user a.dropdown-item[href$="/user-profile"]',
			'#toolbar-user .dropdown-item[onclick*="setup_session_defaults"]',
			'#toolbar-user .dropdown-item[onclick*="view_website"]',
			'#toolbar-user .dropdown-item[onclick*="toggle_full_width"]',
			'#toolbar-user .dropdown-item[onclick*="apps"]',
		],
		report_inline_actions: ["Add Column", "Export", "Print"],

		footer: {
			email: "mfarouk@shiftits.com",
			phone: "+20 122 399 9209",
		},
	};

	// =====================================================================
	// Helpers
	// =====================================================================
	const is_admin = () => frappe.session.user === "Administrator";
	const is_rtl = () => (frappe.boot.lang || "en") === "ar";
	const esc = (s) => frappe.utils.escape_html(String(s ?? ""));

	/** Desk URL that works on /app (v15) and /desk (v16). */
	const desk_url = (route) => {
		const parts = route.filter((p) => typeof p !== "object");
		const query = route.find((p) => typeof p === "object");
		let url = frappe.router?.make_url
			? frappe.router.make_url(parts)
			: "/app/" + parts.map(encodeURIComponent).join("/");
		if (query) url += "?" + new URLSearchParams(query).toString();
		return url;
	};

	/** Current desk path without the /app or /desk prefix, e.g. "payables". */
	const desk_path = () =>
		decodeURIComponent(window.location.pathname.replace(/^\/(app|desk)\/?/, "")).toLowerCase();

	const route = () => frappe.get_route?.() || [];
	const is_form = (doctype) => route()[0] === "Form" && route()[1] === doctype;

	const hide = (el) => el && el.style.setProperty("display", "none", "important");
	const hide_all = (selector, root = document) => root.querySelectorAll(selector).forEach(hide);

	/** data-label values Frappe uses: encodeURIComponent of the (translated) label. */
	const data_labels = (labels) =>
		new Set(labels.flatMap((l) => [encodeURIComponent(l), encodeURIComponent(__(l))]));

	// =====================================================================
	// Rules — each runs on every (debounced) DOM change and route change.
	// Keep them idempotent and cheap.
	// =====================================================================
	const rules = [];
	const rule = (name, fn, { admin_too = false } = {}) => rules.push({ name, fn, admin_too });

	// ---------- Top bar: logo + module buttons + mega menus ----------
	function build_topbar() {
		const rtl = is_rtl();
		const bar = document.createElement("div");
		bar.className = "salis-topbar";
		bar.dir = rtl ? "rtl" : "ltr";

		const brand = rtl ? SALIS_CONFIG.brand.ar : SALIS_CONFIG.brand.en;
		let html = `
			<div class="custom-navbar-logo">
				<a href="${desk_url([SALIS_CONFIG.landing_page])}" class="navbar-logo-link">
					<img src="${encodeURI(SALIS_CONFIG.logo)}" alt="" class="navbar-logo">
					<span class="salis-brand">${esc(brand)}</span>
				</a>
			</div>
			<div class="custom-navbar-buttons">`;

		for (const mod of SALIS_CONFIG.modules) {
			const icon = mod.icon.startsWith("/") ? mod.icon : IMG + mod.icon;
			html += `
				<div class="salis-module ${mod.key}-wrapper" data-module="${esc(mod.key)}">
					<a href="${desk_url(mod.route)}" class="custom-navbar-btn">
						<span class="btn-icon-wrapper ${rtl ? "icon-right" : "icon-left"}">
							<img src="${icon}" alt="" class="btn-icon">
						</span>
						<span class="btn-text">${esc(__(mod.title))}</span>
					</a>`;
			if (mod.menu?.length) {
				html += `<div class="salis-mega-menu ${mod.key}-mega-menu"><ol class="sub-menu">`;
				mod.menu.forEach((item, i) => {
					const color = ["item--a", "item--b", "item--c"][i % 3];
					html += `<li class="menu-item ${color}">
						<a href="${desk_url(item.route)}"><span>${esc(__(item.label))}</span></a>
					</li>`;
				});
				html += `</ol></div>`;
			}
			html += `</div>`;
		}
		bar.innerHTML = html + `</div>`;
		return bar;
	}

	rule(
		"topbar",
		() => {
			if (document.querySelector(".salis-topbar")) return;
			// v15: the classic navbar exists -> put the bar inside it (original look).
			const v15_navbar = document.querySelector(".navbar .navbar-collapse");
			if (v15_navbar) {
				v15_navbar.insertAdjacentElement("afterbegin", build_topbar());
				return;
			}
			// v16: no top navbar any more -> our own bar above the page body.
			const body = document.querySelector(".main-section #body");
			if (body) body.insertAdjacentElement("beforebegin", build_topbar());
		},
		{ admin_too: true }
	);

	// Highlight the module whose button/menu links to the current page
	rule(
		"topbar-active",
		() => {
			const here = window.location.pathname;
			document.querySelectorAll(".salis-topbar .salis-module").forEach((m) => {
				const hit = [...m.querySelectorAll("a[href]")].some(
					(a) => a.pathname === here || (a.pathname.length > 6 && here.startsWith(a.pathname + "/"))
				);
				m.classList.toggle("active", hit);
			});
		},
		{ admin_too: true }
	);

	// ---------- v15 navbar tweaks (no-ops on v16) ----------
	rule(
		"navbar-tweaks",
		() => {
			const search = document.getElementById("navbar-search");
			if (search && search.placeholder !== __("Search")) search.placeholder = __("Search");

			const navbar_end = document.querySelector("header.navbar .navbar-collapse");
			const crumbs = document.querySelector("#navbar-breadcrumbs");
			if (navbar_end && crumbs && navbar_end.nextElementSibling !== crumbs) {
				navbar_end.insertAdjacentElement("afterend", crumbs);
			}
		},
		{ admin_too: true }
	);

	// ---------- Footer ----------
	rule(
		"footer",
		() => {
			if (document.getElementById("custom-footer")) return;
			const rtl = is_rtl();
			const f = SALIS_CONFIG.footer;
			const footer = document.createElement("footer");
			footer.id = "custom-footer";
			footer.innerHTML = `
				<div class="footer-bottom" dir="${rtl ? "rtl" : "ltr"}">
					<div class="contact-line">
						<a href="${desk_url([SALIS_CONFIG.landing_page])}" class="website-link">${rtl ? "سالس" : "Salis"}</a>
						<div class="contact-item"><div class="contact-icon">📞</div><span dir="ltr">${esc(f.phone)}</span></div>
						<div class="contact-item"><div class="contact-icon">✉️</div><span>${esc(f.email)}</span></div>
						<div class="copyright-line">© ${new Date().getFullYear()} ${rtl ? "جميع الحقوق محفوظة." : "All rights reserved."}</div>
					</div>
				</div>`;
			document.body.appendChild(footer);
		},
		{ admin_too: true }
	);

	// ---------- Labels before inputs ----------
	rule(
		"move-labels",
		() => {
			document.querySelectorAll(".frappe-control").forEach((control) => {
				const label = control.querySelector(":scope .control-label");
				const wrapper = control.querySelector(":scope .control-input-wrapper");
				if (label && wrapper && wrapper.previousElementSibling !== label) {
					wrapper.parentNode.insertBefore(label, wrapper);
				}
			});
		},
		{ admin_too: true }
	);

	// ---------- Hide moved action slot on some workspaces ----------
	rule(
		"action-slot",
		() => {
			if (SALIS_CONFIG.hide_action_slot_on.includes(desk_path())) {
				hide_all(".custom-action-slot");
			}
		},
		{ admin_too: true }
	);

	// ---------- Query report: show some menu items as buttons ----------
	rule(
		"report-inline-actions",
		() => {
			if (route()[0] !== "query-report") return;
			const group = document.querySelector(".page-actions .menu-btn-group");
			if (!group || group.querySelector(".visible-menu-buttons")) return;
			const items = group.querySelectorAll(".dropdown-menu a.dropdown-item");
			if (!items.length) return;

			const wanted = SALIS_CONFIG.report_inline_actions.flatMap((l) => [l, __(l)]);
			const box = document.createElement("div");
			box.className = "visible-menu-buttons";
			items.forEach((item) => {
				const text = item.textContent.trim();
				if (!wanted.includes(text)) return;
				const btn = document.createElement("button");
				btn.className = "btn btn-default btn-xs";
				btn.innerHTML = item.innerHTML;
				btn.title = text;
				btn.addEventListener("click", (e) => {
					e.preventDefault();
					item.click();
				});
				box.appendChild(btn);
				item.closest("li")?.classList.add("hidden");
			});
			if (box.children.length) group.insertBefore(box, group.querySelector(".dropdown-toggle"));
		},
		{ admin_too: true }
	);

	// ---------- Document Naming Settings: expand collapsed sections ----------
	rule(
		"naming-settings",
		() => {
			if (!is_form("Document Naming Settings")) return;
			document.querySelectorAll(".section-body.hide").forEach((el) => el.classList.remove("hide"));
		},
		{ admin_too: true }
	);

	// ---------- Non-admin: hide toolbar items / menu items ----------
	const hidden_labels = () => data_labels(SALIS_CONFIG.hidden_menu_labels);
	rule("hide-elements", () => {
		hide_all(SALIS_CONFIG.hidden_selectors.join(","));
		const labels = hidden_labels();
		document
			.querySelectorAll("a.dropdown-item[data-label], button[data-label]")
			.forEach((el) => labels.has(el.dataset.label) && hide(el));
	});

	rule("dashboard-menu", () => {
		if (route()[0] === "dashboard-view") hide_all(".standard-actions");
	});

	// ---------- Non-admin: User form ----------
	rule("user-form", () => {
		if (!is_form("User")) return;
		const roles = new Set(SALIS_CONFIG.hidden_roles);
		const modules = new Set(SALIS_CONFIG.hidden_modules);
		document.querySelectorAll(".checkbox.unit-checkbox input[data-unit]").forEach((input) => {
			const unit = input.dataset.unit;
			if (roles.has(unit) || modules.has(unit)) hide(input.closest(".checkbox.unit-checkbox"));
		});
		hide_all(
			[
				'.frappe-control[data-fieldname="role_profile_name"]',
				'.frappe-control[data-fieldname="module_profile"]',
				'[data-fieldname="navigation_settings_section"]',
				'[data-fieldname="list_settings_section"]',
				'[data-fieldname="form_settings_section"]',
				".bulk-select-options",
			].join(",")
		);
	});

	// =====================================================================
	// Engine
	// =====================================================================
	function run_rules() {
		const admin = is_admin();
		for (const r of rules) {
			if (admin && !r.admin_too) continue;
			try {
				r.fn();
			} catch (e) {
				console.warn(`[salis] rule "${r.name}" failed`, e);
			}
		}
	}

	let scheduled = false;
	function schedule() {
		if (scheduled) return;
		scheduled = true;
		requestAnimationFrame(() => {
			scheduled = false;
			run_rules();
		});
	}

	function redirect_empty_route() {
		const r = route();
		if (!r.length || !r[0]) frappe.set_route(SALIS_CONFIG.landing_page);
	}

	// Page actions -> left "action slot" (kept from v1; skips silently if layout differs)
	function move_page_actions(page_wrapper) {
		let tries = 0;
		const timer = setInterval(() => {
			const $w = $(page_wrapper);
			const $main = $w.find(".layout-main");
			const $side = $main.find(".layout-side-section");
			const $actions = $w.find(".page-actions");
			if (++tries > 50) return clearInterval(timer);
			if (!$actions.length || !$main.length || !$side.length) return;
			clearInterval(timer);
			if (!$actions.find("button").length || $main.find(".custom-action-slot").length) return;

			const $slot = $('<div class="custom-action-slot"></div>');
			$side.before($slot);
			$slot.css("min-height", `${$side.outerHeight()}px`);
			["primary-action", "custom-actions", "standard-actions"].forEach((cls) =>
				$slot.append($actions.find("." + cls).detach())
			);
			$slot.append($actions.find("button").detach());
			$slot.append($side.children());
			$side.remove();
			$actions.remove();
		}, 100);
	}

	const make_app_page = frappe.ui.make_app_page;
	frappe.ui.make_app_page = function (opts) {
		const page = make_app_page.call(this, opts);
		setTimeout(() => move_page_actions(opts.parent), 0);
		return page;
	};

	frappe.after_ajax(() => {
		if (!is_admin()) frappe.ui.keys?.off?.("ctrl+g");
		redirect_empty_route();
		run_rules();
		new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
	});

	frappe.router.on("change", () => {
		redirect_empty_route();
		schedule();
	});

	// exposed for debugging / other scripts
	window.salis = { config: SALIS_CONFIG, run_rules, desk_url };
})();
