import frappe
from frappe.query_builder.functions import Sum
from frappe.utils import flt, get_first_day, get_last_day, getdate


@frappe.whitelist()
def get_profit_from_gl(year: int, company: str | None = None) -> dict:
	"""Income, expense and profit for a calendar year, straight from the GL.

	GL Entry has no `account_type` column, so the account's `root_type` is used instead.
	Cancelled entries are excluded.
	"""
	frappe.has_permission("GL Entry", "read", throw=True)

	year = int(year)
	company = company or frappe.defaults.get_user_default("company")
	from_date = get_first_day(getdate(f"{year}-01-01"))
	to_date = get_last_day(getdate(f"{year}-12-01"))

	gle = frappe.qb.DocType("GL Entry")
	acc = frappe.qb.DocType("Account")
	rows = (
		frappe.qb.from_(gle)
		.join(acc)
		.on(acc.name == gle.account)
		.select(acc.root_type, Sum(gle.credit - gle.debit).as_("balance"))
		.where(
			(gle.company == company)
			& (gle.is_cancelled == 0)
			& (gle.posting_date.between(from_date, to_date))
			& (acc.root_type.isin(["Income", "Expense"]))
		)
		.groupby(acc.root_type)
	).run(as_dict=True)

	balance = {r.root_type: flt(r.balance) for r in rows}
	income = balance.get("Income", 0.0)
	expense = 0.0 - balance.get("Expense", 0.0)
	return {"income": income, "expense": expense, "profit": income - expense}
