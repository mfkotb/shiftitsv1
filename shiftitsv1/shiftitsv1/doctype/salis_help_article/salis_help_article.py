# Copyright (c) 2026, Shift ITs and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class SalisHelpArticle(Document):
	def validate(self):
		self.article_id = frappe.scrub(self.article_id.strip()).replace("_", "-")
		if self.keywords:
			self.keywords = ", ".join(
				k.strip() for k in self.keywords.replace("،", ",").split(",") if k.strip()
			)
