import frappe

# Custom fields in this app fetch values from these source fields (`fetch_from`).
# On sites where they come from elsewhere (e.g. an e-invoice app or a manual
# customization) they already exist and are left untouched. On a fresh site they
# are missing, and saving a Sales Invoice / Payment Entry fails with
# "Unknown column ..." — so create plain Data fields for the missing ones.
FETCH_SOURCE_FIELDS = {
	"Account": [
		{
			"fieldname": "custom_account_name_in_arabic",
			"label": "Account Name in Arabic",
			"insert_after": "account_name",
		},
	],
	"Customer": [
		{"fieldname": "customer_types", "label": "Customer Types", "insert_after": "customer_type"},
	],
	"Item": [
		{"fieldname": "code", "label": "Code", "insert_after": "item_name"},
		{"fieldname": "item_type", "label": "Item Type", "insert_after": "code"},
	],
	"Item Tax Template": [
		{"fieldname": "type", "label": "Type", "insert_after": "title"},
	],
}


def ensure_fetch_source_fields():
	from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

	missing = {}
	for doctype, fields in FETCH_SOURCE_FIELDS.items():
		meta = frappe.get_meta(doctype)
		todo = [dict(f, fieldtype="Data") for f in fields if not meta.has_field(f["fieldname"])]
		if todo:
			missing[doctype] = todo

	if missing:
		create_custom_fields(missing, update=False)

	# Sales Invoice Item.tax_uom defaults to "EA" (e-invoice unit code)
	if not frappe.db.exists("UOM", "EA"):
		frappe.get_doc({"doctype": "UOM", "uom_name": "EA"}).insert(ignore_permissions=True)


def seed_help_articles():
	"""Insert the bundled help articles that don't exist yet. Never overwrites edits."""
	import json
	import os

	if not frappe.db.table_exists("Salis Help Article"):
		return
	path = os.path.join(os.path.dirname(__file__), "data", "help_articles.json")
	with open(path, encoding="utf-8") as f:
		articles = json.load(f)
	for a in articles:
		if frappe.db.exists("Salis Help Article", a["article_id"]):
			continue
		if a.get("related_doctype") and not frappe.db.exists("DocType", a["related_doctype"]):
			a["related_doctype"] = None
		frappe.get_doc({"doctype": "Salis Help Article", **a}).insert(ignore_permissions=True)


def after_install():
	ensure_fetch_source_fields()
	seed_help_articles()


def after_migrate():
	ensure_fetch_source_fields()
	seed_help_articles()
