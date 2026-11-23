
import frappe
from frappe import _


@frappe.whitelist()
def get_profit_from_gl(year):
    income = frappe.db.sql("""
        SELECT SUM(credit - debit)
        FROM `tabGL Entry`
        WHERE account_type = 'Income' AND YEAR(posting_date) = %s
    """, year)[0][0] or 0

    expense = frappe.db.sql("""
        SELECT SUM(debit - credit)
        FROM `tabGL Entry`
        WHERE account_type = 'Expense' AND YEAR(posting_date) = %s
    """, year)[0][0] or 0

    return {
        "income": income,
        "expense": expense,
        "profit": income - expense
    }
