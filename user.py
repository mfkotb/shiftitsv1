# shiftitsv1/overrides/user.py

# import frappe
# from frappe.core.doctype.user.user import User as FrappeUser

# import frappe
# from frappe.core.doctype.user.user import User as FrappeUser

# class CustomUser(FrappeUser):
#     def before_save(self):
#         # If not a new user, do nothing
#         if not self.is_new():
#             return

#         # Show in console
#         print("Creating new user...")

#         # Strip all modules by default
#         self.set("modules", [])
#         self.set("block_modules", [])




# import frappe
# from frappe.core.doctype.user.user import User as FrappeUser

# class CustomUser(FrappeUser):
#     def after_insert(self):
#         # Only set default modules when creating a new user
#         if not self.get("modules"):
#             default_modules = [
#                 "Accounts", "Buying", "Contacts", "Core", "Desk", "Selling", "Stock"
#             ]

#             for module in default_modules:
#                 self.append("modules", {"module": module})

# import frappe
# from frappe.core.doctype.user.user import User as FrappeUser

# class CustomUser(FrappeUser):
#     def before_save(self):


#         # 1. Define the allowed modules
#         allowed_modules = [
#             "Accounts", "Buying", "Contacts", "Core", "Desk", "Selling", "Stock"
#         ]

#         # 2. Block all modules not in allowed list
#         all_modules = frappe.get_all("Module Def", pluck="name")
#         blocked = [m for m in all_modules if m not in allowed_modules]

#         self.set("block_modules", [])
#         for module in blocked:
#             self.append("block_modules", {"module": module})

        # # 3. Define roles to assign (permissions)
        # required_roles = [
        #     "Stock Manager", "Stock User", "Sales User", "Sales Master Manager",
        #     "Sales Manager", "Purchase Manager", "Purchase Master Manager",
        #     "Purchase User", "Maintenance User", "Maintenance Manager",
        #     "Item Manager", "Inbox User", "Dashboard Manager", "Customer",
        #     "Auditor", "Accounts Manager", "Accounts User",
        #     "Agriculture Manager", "Agriculture User"
        # ]

        # # 4. Assign roles if not already assigned
        # existing_roles = {role.role for role in self.roles}
        # for role in required_roles:
        #     if role not in existing_roles:
        #         self.append("roles", {"role": role})

