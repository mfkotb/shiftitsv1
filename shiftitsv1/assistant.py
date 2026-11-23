# ruff: noqa: RUF001  (Arabic letters are intended)
"""Salis assistant: explains screens from the system's own metadata and searches
help articles. No external AI service — everything runs on this site."""

import math
import re

import frappe
from frappe import _
from frappe.utils import strip_html

# Doctypes offered as "screens" in search results (the ones Salis shows to customers).
SALIS_SCREENS = [
	"Customer",
	"Supplier",
	"Item",
	"Item Group",
	"Customer Group",
	"Supplier Group",
	"UOM",
	"Warehouse",
	"Company",
	"Cost Center",
	"Account",
	"Sales Person",
	"POS Profile",
	"Sales Order",
	"Delivery Note",
	"Sales Invoice",
	"POS Invoice",
	"Purchase Order",
	"Purchase Receipt",
	"Purchase Invoice",
	"Payment Entry",
	"Journal Entry",
	"Stock Entry",
	"Serial No",
	"Batch",
	"BOM",
	"Work Order",
	"Job Card",
	"Production Plan",
	"Workstation",
	"Operation",
]

AR_STOPWORDS = {
	"ازاي",
	"ازاى",
	"كيف",
	"كيفيه",
	"ايه",
	"اي",
	"ما",
	"ماذا",
	"هل",
	"في",
	"فى",
	"من",
	"على",
	"علي",
	"الى",
	"الي",
	"عن",
	"مع",
	"او",
	"ثم",
	"انا",
	"احنا",
	"عايز",
	"عاوز",
	"اريد",
	"ممكن",
	"لو",
	"اللي",
	"الذي",
	"التي",
	"دي",
	"ده",
	"هو",
	"هي",
	"اعمل",
	"اعملها",
	"بعمل",
	"يعني",
	"طريقه",
	"خطوات",
	"شرح",
	"عمل",
	"اضيف",
	"جديد",
	"جديده",
}
EN_STOPWORDS = {
	"how",
	"do",
	"i",
	"to",
	"a",
	"an",
	"the",
	"in",
	"on",
	"of",
	"for",
	"and",
	"or",
	"is",
	"are",
	"what",
	"can",
	"my",
	"make",
	"create",
	"new",
	"add",
	"with",
	"from",
	"it",
	"this",
	"that",
	"where",
	"which",
	"please",
}
# Arabic broken plurals → singular (light stemming can't handle these)
AR_PLURALS = {
	"فواتير": "فاتوره",
	"اوامر": "امر",
	"مخازن": "مخزن",
	"اصناف": "صنف",
	"عملاء": "عميل",
	"قيود": "قيد",
	"تقارير": "تقرير",
	"مستندات": "مستند",
	"بضايع": "بضاعه",
	"خامات": "خام",
	"منتجات": "منتج",
	"حسابات": "حساب",
	"مدفوعات": "دفع",
	"مرتجعات": "مرتجع",
	"طلبات": "طلب",
}
_TASHKEEL = re.compile(r"[ً-ْـ]")
_AR_PREFIXES = ("وال", "بال", "كال", "فال", "لل", "ال")
_AR_SUFFIXES = ("ات", "ون", "ين", "ها", "هم")


def normalize(text: str) -> list[str]:
	"""Lower-case, unify Arabic letter forms, drop stopwords and light-stem each word."""
	text = strip_html(text or "").lower()
	text = _TASHKEEL.sub("", text)
	for a, b in (
		("أ", "ا"),
		("إ", "ا"),
		("آ", "ا"),
		("ٱ", "ا"),
		("ة", "ه"),
		("ى", "ي"),
		("ؤ", "و"),
		("ئ", "ي"),
	):
		text = text.replace(a, b)
	tokens = []
	for w in re.findall(r"\w+", text):
		w = AR_PLURALS.get(w, w)
		if w in AR_STOPWORDS or w in EN_STOPWORDS or len(w) < 2:
			continue
		if re.match(r"[؀-ۿ]", w):
			for p in _AR_PREFIXES:
				if w.startswith(p) and len(w) - len(p) >= 3:
					w = w[len(p) :]
					break
			for s in _AR_SUFFIXES:
				if w.endswith(s) and len(w) - len(s) >= 3:
					w = w[: -len(s)]
					break
			w = AR_PLURALS.get(w, w)
			if w in AR_STOPWORDS:
				continue
		elif len(w) > 3 and w.endswith("s"):
			w = w[:-1]
		tokens.append(w)
	return tokens


def _lang_is_ar() -> bool:
	return (frappe.local.lang or "en").startswith("ar")


def _pick(doc, field: str) -> str:
	ar, en = doc.get(f"{field}_ar"), doc.get(f"{field}_en")
	return (ar or en or "") if _lang_is_ar() else (en or ar or "")


def _match_score(query: list[str], words: list[str], weights: dict | None = None) -> float:
	"""Per query word: 1 for an exact match, 0.5 for a prefix match (فاتور ~ فاتوره),
	multiplied by the word's weight (rare words count more)."""
	score = 0.0
	ws = set(words)
	for q in query:
		w = (weights or {}).get(q, 1.0)
		if q in ws:
			score += w
		elif len(q) >= 3 and any(x.startswith(q) or q.startswith(x) for x in ws if len(x) >= 3):
			score += 0.5 * w
	return score


@frappe.whitelist()
def search(q: str) -> dict:
	query = normalize(q)
	if not query:
		return {"articles": [], "screens": []}

	rows = frappe.get_all(
		"Salis Help Article",
		filters={"published": 1},
		fields=[
			"name",
			"module",
			"related_doctype",
			"title_ar",
			"title_en",
			"keywords",
			"body_ar",
			"body_en",
		],
	)
	docs = [
		(
			a,
			normalize(f"{a.title_ar} {a.title_en}"),
			normalize(a.keywords),
			normalize(f"{a.body_ar} {a.body_en}"),
		)
		for a in rows
	]
	# rare words weigh more: "مرتجع" beats "فاتوره", which is in many articles
	n = max(len(docs), 1)
	weights = {}
	for q in set(query):
		df = sum(1 for _a, t, k, b in docs if q in t or q in k or q in b)
		weights[q] = math.log((n + 1) / (df + 1)) + 0.5

	articles = []
	for a, title, kw, body in docs:
		score = (
			3 * _match_score(query, title, weights)
			+ 2.5 * _match_score(query, kw, weights)
			+ 1 * _match_score(query, body, weights)
		)
		# prefer articles that cover more of the question's words
		allw = set(title) | set(kw) | set(body)
		covered = sum(1 for q in set(query) if _match_score([q], allw) > 0) / len(set(query))
		score *= (0.5 + 0.5 * covered) ** 2
		if score >= 1:
			body = " ".join(strip_html(re.sub(r"</(li|p)>", " </\\1>", _pick(a, "body"))).split())
			articles.append(
				{
					"name": a.name,
					"title": _pick(a, "title"),
					"module": _(a.module),
					"related_doctype": a.related_doctype,
					"snippet": (body[:140] + "…") if len(body) > 140 else body,
					"score": score,
				}
			)
	articles.sort(key=lambda x: -x["score"])

	screens = []
	for dt in SALIS_SCREENS:
		if not frappe.has_permission(dt, "read"):
			continue
		# the screen name (Arabic or English) was typed in the question
		best = 0.0
		for label in {_(dt), dt}:
			words = normalize(label)
			if words and _match_score(words, query) >= len(words) - 0.5:
				best = max(best, _match_score(query, words))
		if best:
			screens.append({"doctype": dt, "label": _(dt), "score": best})
	screens.sort(key=lambda x: -x["score"])

	return {"articles": articles[:6], "screens": screens[:3]}


@frappe.whitelist()
def get_article(name: str) -> dict:
	a = frappe.get_doc("Salis Help Article", name)
	if not a.published:
		frappe.throw(_("Not found"))
	return {
		"name": a.name,
		"title": _pick(a, "title"),
		"body": _pick(a, "body"),
		"module": _(a.module),
		"related_doctype": a.related_doctype,
	}


def _visible(df) -> bool:
	return not df.hidden and df.fieldtype not in ("Column Break", "HTML", "Button", "Fold", "Heading")


# Required fields the user never has to fill: set automatically by the system.
AUTO_FIELDS = {
	"naming_series",
	"company",
	"currency",
	"conversion_rate",
	"plc_conversion_rate",
	"price_list_currency",
	"selling_price_list",
	"buying_price_list",
	"apply_discount_on",
	"posting_date",
	"posting_time",
	"transaction_date",
	"status",
	"title",
	"item_name",
	"description",
	"uom",
	"stock_uom",
	"conversion_factor",
	"income_account",
	"expense_account",
	"cost_center",
	"base_rate",
	"base_amount",
	"amount",
	"party_type",
	"paid_from_account_currency",
	"paid_to_account_currency",
	"source_exchange_rate",
	"target_exchange_rate",
	"debit_to",
	"credit_to",
	"posting_datetime",
}


def _user_fills(df) -> bool:
	"""Required and actually typed in by the user (not defaulted / fetched / automatic)."""
	return bool(
		df.reqd
		and df.label
		and _visible(df)
		and not df.read_only
		and not df.fetch_from
		and not df.default
		and df.fieldname not in AUTO_FIELDS
		and df.fieldtype not in ("Table", "Table MultiSelect")
	)


@frappe.whitelist()
def get_screen_help(doctype: str | None = None, report: str | None = None, page: str | None = None) -> dict:
	"""Describe the current screen using only what the system knows about it."""
	if report:
		return _report_help(report)
	if page:
		return _page_help(page)
	if not doctype or not frappe.db.exists("DocType", doctype):
		return {"title": _("Salis"), "summary": _("Open a screen to see an explanation of it here.")}
	if not frappe.has_permission(doctype, "read"):
		frappe.throw(_("Not permitted"), frappe.PermissionError)

	meta = frappe.get_meta(doctype)
	fields = [df for df in meta.fields if _visible(df)]

	required = [_(df.label) for df in fields if _user_fills(df)]
	sections = []
	for df in fields:
		if df.fieldtype in ("Tab Break", "Section Break") and df.label and _(df.label) not in sections:
			sections.append(_(df.label))

	tables = []
	for df in fields:
		if df.fieldtype in ("Table", "Table MultiSelect") and df.options:
			child = frappe.get_meta(df.options)
			# what the user types per row = the editable grid columns
			cols = [
				_(c.label)
				for c in child.fields
				if c.in_list_view and c.label and _visible(c) and not c.read_only
			]
			if df.reqd or df.fieldname in ("items", "accounts"):  # skip optional tables (taxes, pricing …)
				tables.append(
					{"label": _(df.label or df.options), "required": cols, "mandatory": bool(df.reqd)}
				)

	related = []
	try:
		for group in meta.get_dashboard_data().get("transactions") or []:
			for dt in group.get("items") or []:
				if (
					dt != doctype
					and dt in SALIS_SCREENS
					and frappe.has_permission(dt, "read")
					and _(dt) not in related
				):
					related.append(_(dt))
	except Exception:
		pass

	steps = []
	if meta.is_submittable:
		steps = [
			_("Fill in the required fields and save (Ctrl+S)."),
			_("Check the document, then click Submit to confirm it. A submitted document cannot be edited."),
			_("To correct a submitted document: Cancel it, then Amend to create a corrected copy."),
		]
	elif not meta.issingle:
		steps = [_("Fill in the required fields and save (Ctrl+S).")]

	return {
		"title": _(doctype),
		"summary": _(meta.description) if meta.description else "",
		"required": required,
		"sections": sections[:12],
		"tables": tables,
		"submittable": bool(meta.is_submittable),
		"steps": steps,
		"related": related[:10],
		"articles": _articles_for(doctype),
	}


def _report_help(report: str) -> dict:
	if not frappe.db.exists("Report", report):
		return {"title": _(report)}
	r = frappe.get_cached_doc("Report", report)
	return {
		"title": _(report),
		"summary": _("Report"),
		"steps": [
			_("Set the filters at the top (company, dates …); the report refreshes automatically."),
			_("Use Export to download it as Excel, or Print to print it."),
			_("Add Column lets you show more columns."),
		],
		"articles": _articles_for(r.ref_doctype) if r.ref_doctype else [],
	}


def _page_help(page: str) -> dict:
	if page == "home-page":
		return {
			"title": _("Dashboard"),
			"summary": _("Profit & loss, sales, purchases and production for the current fiscal year."),
			"steps": [
				_("Use the menu on the side to open master data (customers, items, warehouses …)."),
				_("Use the buttons at the top to reach each section's screens."),
			],
			"articles": [],
		}
	if page == "reports":
		return {
			"title": _("Reports"),
			"summary": _("All Salis reports, grouped by section. Pick a tab, then click a report."),
			"articles": [],
		}
	return {"title": _(page)}


def _articles_for(doctype: str) -> list[dict]:
	return [
		{"name": a.name, "title": _pick(a, "title")}
		for a in frappe.get_all(
			"Salis Help Article",
			filters={"published": 1, "related_doctype": doctype},
			fields=["name", "title_ar", "title_en"],
			order_by="creation asc",
		)
	]
