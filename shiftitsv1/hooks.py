app_name = "shiftitsv1"
app_title = "Salis"
app_publisher = "Shift ITs"
app_description = "Salis — simplified ERPNext desk by Shift ITs"
app_email = "hagarmahoud05@gmail.com"
app_license = "mit"
app_logo_url = "/assets/shiftitsv1/images/salis-logo.png"
app_home = "/desk/home-page"

required_apps = ["frappe/erpnext"]

# v16: the Desktop screen builds app icons from this hook.
add_to_apps_screen = [
	{
		"name": app_name,
		"logo": app_logo_url,
		"title": app_title,
		"route": app_home,
	}
]

# Desk assets
app_include_css = [
	"/assets/shiftitsv1/css/shift.css",
	"/assets/shiftitsv1/css/salis_assistant.css",
]
app_include_js = [
	"/assets/shiftitsv1/js/shift.js",
	"/assets/shiftitsv1/js/salis_assistant.js",
]

# Website / login page: CSS only (shift.js needs the desk and must not run here)
web_include_css = "/assets/shiftitsv1/css/shift.css"

# "/" -> Salis dashboard. (/app/* is redirected to /desk/* by Frappe v16 itself.)
website_redirects = [
	{"source": "/", "target": app_home},
]

# Make sure fields that our custom fields fetch from exist (see install.py)
after_install = "shiftitsv1.install.after_install"
after_migrate = ["shiftitsv1.install.after_migrate"]

# Server-side fill of Arabic account names / e-invoice fields (replaces the old before_save JS)
doc_events = {
	dt: {"validate": "shiftitsv1.events.fill_empty_fetch_from"}
	for dt in ("Sales Invoice", "POS Invoice", "Purchase Invoice", "Payment Entry", "Journal Entry")
}

doctype_js = {
	"Stock Entry": "public/js/stock_entry.js",
	"Journal Entry": "public/js/journal_entry.js",
}
