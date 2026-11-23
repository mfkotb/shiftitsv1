import frappe


def fill_empty_fetch_from(doc, method=None):
	"""Fill empty custom `fetch_from` fields (parent and child rows) on validate.

	Frappe fetches these when the link field is validated, which happens *before*
	the controller's validate. Links that ERPNext sets during validate (e.g.
	Sales Invoice `debit_to`, Purchase Invoice `credit_to`) therefore never get
	their Arabic account name fetched on the server — the form only worked because
	the browser fetched it. This makes saves via API / Data Import / Desk identical.
	"""
	for d in [doc, *doc.get_all_children()]:
		for df in d.meta.get("fields", {"is_custom_field": 1}):
			if not df.fetch_from or "." not in df.fetch_from or d.get(df.fieldname):
				continue
			link_field, source_field = df.fetch_from.split(".", 1)
			link_df = d.meta.get_field(link_field)
			link_value = d.get(link_field)
			if not link_value or not link_df or link_df.fieldtype != "Link":
				continue
			value = frappe.db.get_value(link_df.options, link_value, source_field)
			if value:
				d.set(df.fieldname, value)

		# Old client script filled the e-invoice item code with the Item Code when the
		# Item had no code of its own; keep that behaviour.
		if d.doctype in ("Sales Invoice Item", "POS Invoice Item") and d.get("item_code"):
			if d.meta.has_field("code") and not d.get("code"):
				d.code = d.item_code
