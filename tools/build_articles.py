"""Builds shiftitsv1/data/help_articles.json (first set of Salis help articles)."""
import json
import sys


def ol(*steps):
	return "<ol>" + "".join(f"<li>{s}</li>" for s in steps) + "</ol>"


def note(t):
	return f"<p><b>ملحوظة:</b> {t}</p>"


def note_en(t):
	return f"<p><b>Note:</b> {t}</p>"


A = []


def art(aid, module, dt, title_ar, title_en, keywords, body_ar, body_en):
	A.append(dict(article_id=aid, module=module, related_doctype=dt, title_ar=title_ar, title_en=title_en,
				  keywords=keywords, body_ar=body_ar, body_en=body_en, published=1))


# ------------------------------------------------------------------ General
art("salis-navigation", "General", None, "التنقل في سالس", "Getting around Salis",
	"قائمة, منيو, شريط, اقسام, الرئيسيه, لوحه التحكم, navigation, menu, dashboard",
	"<p>كل حاجة في سالس بتوصلها من الشريط اللي فوق:</p>" + ol(
		"<b>لوحة التحكم</b>: الأرباح والخسائر والمبيعات والمشتريات والإنتاج، وعلى جنب قائمة البيانات الأساسية (العملاء، الأصناف، المخازن …).",
		"<b>المحاسبة / المشتريات / المبيعات / المخازن / التصنيع</b>: اضغط على الزرار تظهر قائمة الشاشات بتاعة القسم.",
		"<b>التقارير</b>: كل التقارير مقسمة حسب القسم.",
		"اسمك في آخر الشريط: منه تعمل تحديث للصفحة أو تسجيل خروج.",
		"زرار <b>المساعد</b>: يشرح الشاشة اللي إنت فيها، أو تكتب سؤالك في «اسأل».",
	),
	"<p>Everything in Salis starts from the top bar:</p>" + ol(
		"<b>Dashboard</b>: profit &amp; loss, sales, purchases and production, plus master data on the side.",
		"<b>Accounting / Buying / Selling / Stock / Manufacturing</b>: click a button to see that section's screens.",
		"<b>Reports</b>: all reports, grouped by section.",
		"Your name at the end of the bar: reload the page or log out.",
		"<b>Assistant</b>: explains the screen you are on, or type a question under «Ask».",
	))

art("find-document", "General", None, "البحث عن مستند", "Finding a document",
	"بحث, دور, الاقي, فلتر, تصفيه, قائمه, search, find, filter, list",
	ol(
		"افتح الشاشة من الشريط (مثلًا المبيعات ← فاتورة مبيعات)، هتظهر قائمة بكل المستندات.",
		"اكتب في الخانات اللي فوق القائمة: رقم المستند أو اسم العميل أو المورد.",
		"لفلاتر أكتر (تاريخ، حالة …) استخدم زرار <b>تصفية</b>.",
		"اضغط على أي سطر لفتح المستند.",
	),
	ol(
		"Open the screen from the top bar (e.g. Selling → Sales Invoice) to see the list.",
		"Type in the boxes above the list: document number, customer or supplier name.",
		"For more filters (date, status …) use the <b>Filter</b> button.",
		"Click a row to open the document.",
	))

art("print-document", "General", None, "طباعة مستند أو حفظه PDF", "Printing a document or saving a PDF",
	"طباعه, اطبع, بي دي اف, pdf, print, ورق",
	ol(
		"افتح المستند (فاتورة، أمر بيع …).",
		"اضغط على أيقونة <b>الطابعة</b> فوق.",
		"اختار شكل الطباعة (Print Format) لو فيه أكتر من واحد.",
		"اضغط <b>طباعة</b>، أو <b>PDF</b> لتنزيله ملف.",
	),
	ol(
		"Open the document (invoice, sales order …).",
		"Click the <b>printer</b> icon at the top.",
		"Pick the print format if there is more than one.",
		"Click <b>Print</b>, or <b>PDF</b> to download a file.",
	))

art("cancel-amend", "General", None, "تعديل مستند بعد اعتماده (إلغاء وتعديل)", "Changing a submitted document (Cancel & Amend)",
	"تعديل, الغاء, غلط, خطا, معتمد, صحح, cancel, amend, edit submitted, mistake",
	"<p>المستند المعتمد (Submitted) ما ينفعش يتعدّل مباشرة. عشان تصححه:</p>" + ol(
		"افتح المستند واضغط <b>إلغاء</b> (Cancel) وأكّد.",
		"لو ظهرت رسالة إن فيه مستندات مربوطة بيه (زي سند قبض)، ألغيها هي الأول.",
		"بعد الإلغاء اضغط <b>تعديل</b> (Amend): هتتعمل نسخة جديدة من نفس المستند.",
		"صحّح البيانات، احفظ، واعتمد.",
	),
	"<p>A submitted document cannot be edited directly. To correct it:</p>" + ol(
		"Open it, click <b>Cancel</b> and confirm.",
		"If linked documents exist (e.g. a payment), cancel those first.",
		"Click <b>Amend</b> to create a new copy.",
		"Correct it, save and submit.",
	))

art("export-report", "General", None, "تصدير تقرير لإكسيل", "Exporting a report to Excel",
	"اكسيل, اكسل, تصدير, تنزيل, excel, export, download, xlsx",
	ol(
		"افتح <b>التقارير</b> من الشريط واختار التقرير.",
		"اختار الفلاتر (الشركة، من تاريخ، إلى تاريخ …).",
		"اضغط <b>Export</b> واختار Excel.",
	),
	ol(
		"Open <b>Reports</b> from the top bar and pick the report.",
		"Set the filters (company, from/to date …).",
		"Click <b>Export</b> and choose Excel.",
	))

# ------------------------------------------------------------------ Selling
art("create-customer", "Selling", "Customer", "إضافة عميل جديد", "Adding a customer",
	"عميل, عملاء, زبون, customer, client, رقم ضريبي",
	ol(
		"من لوحة التحكم اختار <b>العميل</b> من القائمة الجانبية، واضغط <b>+ إضافة</b>.",
		"اكتب اسم العميل، واختار النوع (شركة / فرد) ومجموعة العملاء.",
		"لو هتعمل له فاتورة إلكترونية، اكتب <b>الرقم الضريبي</b>.",
		"احفظ (Ctrl+S).",
	),
	ol(
		"From the dashboard pick <b>Customer</b> in the side menu and click <b>+ Add</b>.",
		"Enter the name, type (company / individual) and customer group.",
		"For e-invoices, fill in the <b>Tax ID</b>.",
		"Save (Ctrl+S).",
	))

art("create-item", "Selling", "Item", "إضافة صنف جديد", "Adding an item",
	"صنف, اصناف, منتج, سلعه, خدمه, item, product, service",
	ol(
		"من لوحة التحكم اختار <b>الأصناف</b>، واضغط <b>+ إضافة</b>.",
		"اكتب كود الصنف واسمه، واختار مجموعة الأصناف ووحدة القياس.",
		"لو الصنف بيتخزن في مخزن سيب <b>Maintain Stock</b> مفعّل؛ لو خدمة شيله.",
		"اكتب سعر البيع الأساسي (Standard Selling Rate) لو عايز.",
		"احفظ.",
	),
	ol(
		"From the dashboard pick <b>Items</b> and click <b>+ Add</b>.",
		"Enter item code and name, item group and unit of measure.",
		"Keep <b>Maintain Stock</b> on for stocked goods; turn it off for services.",
		"Optionally set the Standard Selling Rate.",
		"Save.",
	))

art("create-sales-order", "Selling", "Sales Order", "عمل أمر بيع", "Creating a sales order",
	"امر بيع, طلب, اوردر, order, sales order",
	ol(
		"من الشريط: <b>المبيعات ← أمر البيع</b>، واضغط <b>+ إضافة</b>.",
		"اختار العميل وتاريخ التسليم.",
		"في جدول الأصناف: اختار الصنف والكمية والسعر.",
		"احفظ، وبعدها اضغط <b>اعتماد</b> (Submit).",
		"من الأمر المعتمد تقدر تعمل إذن تسليم أو فاتورة من زرار <b>إنشاء</b>.",
	),
	ol(
		"Top bar: <b>Selling → Sales Order</b>, then <b>+ Add</b>.",
		"Pick the customer and delivery date.",
		"In the items table enter item, quantity and rate.",
		"Save, then <b>Submit</b>.",
		"From the submitted order, use <b>Create</b> to make a delivery note or invoice.",
	))

art("create-delivery-note", "Selling", "Delivery Note", "تسليم بضاعة للعميل (إذن تسليم)", "Delivering goods (Delivery Note)",
	"تسليم, اذن تسليم, صرف بضاعه, شحن, delivery, deliver, ship",
	ol(
		"افتح أمر البيع المعتمد.",
		"اضغط <b>إنشاء ← إذن التسليم</b> (Create → Delivery Note).",
		"راجع الكميات والمخزن اللي هتطلع منه البضاعة.",
		"احفظ واعتمد: الكمية هتتخصم من المخزن.",
	),
	ol(
		"Open the submitted sales order.",
		"Click <b>Create → Delivery Note</b>.",
		"Check quantities and the source warehouse.",
		"Save and submit: stock is reduced.",
	))

art("create-sales-invoice", "Selling", "Sales Invoice", "عمل فاتورة مبيعات", "Creating a sales invoice",
	"فاتوره, فاتورة مبيعات, بيع, invoice, sales invoice, bill",
	ol(
		"من أمر بيع أو إذن تسليم معتمد: <b>إنشاء ← فاتورة مبيعات</b>. أو مباشرة من <b>المبيعات ← فاتورة مبيعات ← + إضافة</b>.",
		"اختار العميل، وراجع الأصناف والكميات والأسعار.",
		"احفظ، وبعدها <b>اعتماد</b>.",
		"لتحصيل الفلوس: من الفاتورة المعتمدة <b>إنشاء ← دفع</b> (Payment).",
	) + note("لو ظهرت رسالة إن اسم الحساب بالعربي مطلوب، افتح حساب المدينين في شجرة الحسابات واكتب له «اسم الحساب بالعربي»."),
	ol(
		"From a submitted sales order or delivery note: <b>Create → Sales Invoice</b>. Or <b>Selling → Sales Invoice → + Add</b>.",
		"Pick the customer and check items, quantities and rates.",
		"Save, then <b>Submit</b>.",
		"To collect payment: <b>Create → Payment</b> on the submitted invoice.",
	) + note_en("If you are told the Arabic account name is required, open the receivable account in the chart of accounts and fill in «Account Name in Arabic»."))

art("sales-return", "Selling", "Sales Invoice", "مرتجع مبيعات (إشعار دائن)", "Sales return (credit note)",
	"مرتجع, ارجاع, ارجع, رجع, رجوع, ترجيع, ارجاع بضاعه من عميل, العميل رجع بضاعه, اشعار دائن, return, credit note, refund",
	ol(
		"افتح فاتورة المبيعات المعتمدة اللي فيها الأصناف المرتجعة.",
		"اضغط <b>إنشاء ← مرتجع / إشعار دائن</b> (Return / Credit Note).",
		"هتتعمل فاتورة بكميات بالسالب؛ عدّل الكميات للمرتجع فعلًا.",
		"احفظ واعتمد.",
	),
	ol(
		"Open the submitted sales invoice.",
		"Click <b>Create → Return / Credit Note</b>.",
		"A new invoice with negative quantities is created; adjust to what was returned.",
		"Save and submit.",
	))

art("receive-payment", "Selling", "Payment Entry", "تحصيل فلوس من عميل (سند قبض)", "Receiving a payment from a customer",
	"تحصيل, قبض, سند قبض, دفع العميل, فلوس, نقديه, payment, receive, receipt, collect",
	ol(
		"افتح فاتورة المبيعات المعتمدة واضغط <b>إنشاء ← دفع</b>. أو من <b>المحاسبة ← سند قبض / صرف</b> واختار نوع الدفع <b>Receive</b>.",
		"اختار حساب الخزنة أو البنك اللي الفلوس دخلت فيه (Account Paid To).",
		"اكتب المبلغ المدفوع، ورقم وتاريخ المرجع لو بنك أو شيك.",
		"احفظ واعتمد: الفاتورة هتتعلّم إنها مدفوعة.",
	),
	ol(
		"On the submitted sales invoice click <b>Create → Payment</b>, or <b>Accounting → Payment Entry</b> with type <b>Receive</b>.",
		"Pick the cash or bank account (Account Paid To).",
		"Enter the amount, and reference no./date for bank or cheque.",
		"Save and submit: the invoice is marked paid.",
	))

# ------------------------------------------------------------------ Buying
art("create-supplier", "Buying", "Supplier", "إضافة مورد جديد", "Adding a supplier",
	"مورد, موردين, supplier, vendor",
	ol(
		"من لوحة التحكم اختار <b>المورد</b>، واضغط <b>+ إضافة</b>.",
		"اكتب اسم المورد واختار مجموعة الموردين.",
		"احفظ.",
	),
	ol("From the dashboard pick <b>Supplier</b>, click <b>+ Add</b>.", "Enter the name and supplier group.", "Save."))

art("create-purchase-order", "Buying", "Purchase Order", "عمل أمر شراء", "Creating a purchase order",
	"امر شراء, طلب شراء, شراء, purchase order, po, buy",
	ol(
		"من الشريط: <b>المشتريات ← أمر الشراء ← + إضافة</b>.",
		"اختار المورد وتاريخ الاستلام المطلوب.",
		"أضف الأصناف والكميات والأسعار.",
		"احفظ واعتمد.",
		"لما البضاعة توصل: <b>إنشاء ← استلام المشتريات</b>.",
	),
	ol(
		"Top bar: <b>Buying → Purchase Order → + Add</b>.",
		"Pick the supplier and required-by date.",
		"Add items, quantities and rates.",
		"Save and submit.",
		"When goods arrive: <b>Create → Purchase Receipt</b>.",
	))

art("create-purchase-receipt", "Buying", "Purchase Receipt", "استلام بضاعة من مورد", "Receiving goods from a supplier",
	"استلام, ايصال استلام, وصول بضاعه, دخول مخزن, receipt, receive goods, grn",
	ol(
		"افتح أمر الشراء المعتمد واضغط <b>إنشاء ← استلام المشتريات</b> (Purchase Receipt).",
		"راجع الكميات المستلمة فعلًا والمخزن اللي هتدخل فيه.",
		"احفظ واعتمد: الكمية هتزيد في المخزن.",
	),
	ol(
		"Open the submitted purchase order, click <b>Create → Purchase Receipt</b>.",
		"Check received quantities and the target warehouse.",
		"Save and submit: stock increases.",
	))

art("create-purchase-invoice", "Buying", "Purchase Invoice", "تسجيل فاتورة مورد (فاتورة شراء)", "Recording a supplier invoice",
	"فاتوره شراء, فاتوره مورد, مشتريات, purchase invoice, supplier invoice, bill",
	ol(
		"من أمر الشراء أو استلام المشتريات: <b>إنشاء ← فاتورة شراء</b>. أو <b>المشتريات ← فاتورة شراء ← + إضافة</b>.",
		"اكتب رقم فاتورة المورد وتاريخها.",
		"راجع الأصناف والأسعار والضرائب.",
		"احفظ واعتمد. للسداد: <b>إنشاء ← دفع</b>.",
	),
	ol(
		"From a purchase order or receipt: <b>Create → Purchase Invoice</b>, or <b>Buying → Purchase Invoice → + Add</b>.",
		"Enter the supplier's invoice number and date.",
		"Check items, rates and taxes.",
		"Save and submit. To pay: <b>Create → Payment</b>.",
	))

art("pay-supplier", "Buying", "Payment Entry", "سداد فلوس لمورد (سند صرف)", "Paying a supplier",
	"سداد, صرف, سند صرف, ادفع, دفع للمورد, pay, payment, supplier payment",
	ol(
		"افتح فاتورة الشراء المعتمدة واضغط <b>إنشاء ← دفع</b>. أو <b>المحاسبة ← سند قبض / صرف</b> بنوع <b>Pay</b>.",
		"اختار حساب الخزنة أو البنك اللي هيتدفع منه (Account Paid From).",
		"اكتب المبلغ، واحفظ واعتمد.",
	),
	ol(
		"On the submitted purchase invoice click <b>Create → Payment</b>, or <b>Accounting → Payment Entry</b> with type <b>Pay</b>.",
		"Pick the cash or bank account (Account Paid From).",
		"Enter the amount, save and submit.",
	))

# ------------------------------------------------------------------ Stock
art("stock-receipt-issue", "Stock", "Stock Entry", "إضافة أو صرف بضاعة من المخزن", "Adding or issuing stock",
	"اضافه مخزون, صرف, رصيد افتتاحي, تسويه, stock entry, material receipt, material issue, opening stock",
	ol(
		"من الشريط: <b>المخازن ← قيد مخزون ← + إضافة</b>.",
		"اختار النوع: <b>Material Receipt</b> لإضافة بضاعة (مثلًا الرصيد الافتتاحي)، أو <b>Material Issue</b> لصرف بضاعة (استهلاك داخلي، هالك …).",
		"في الأصناف: الصنف والكمية والمخزن. في الإضافة اكتب سعر التكلفة (Basic Rate).",
		"احفظ واعتمد.",
	),
	ol(
		"Top bar: <b>Stock → Stock Entry → + Add</b>.",
		"Type <b>Material Receipt</b> to add stock (e.g. opening stock) or <b>Material Issue</b> to issue it.",
		"Items: item, quantity and warehouse. For receipts enter the cost (Basic Rate).",
		"Save and submit.",
	))

art("stock-transfer", "Stock", "Stock Entry", "تحويل بضاعة بين المخازن", "Moving stock between warehouses",
	"تحويل, نقل, انقل, حول, مخزن لمخزن, transfer, move stock, warehouse",
	ol(
		"<b>المخازن ← قيد مخزون ← + إضافة</b>، واختار النوع <b>Material Transfer</b>.",
		"اختار المخزن المصدر (من) والمخزن الهدف (إلى).",
		"أضف الأصناف والكميات، واحفظ واعتمد.",
	),
	ol(
		"<b>Stock → Stock Entry → + Add</b>, type <b>Material Transfer</b>.",
		"Pick source and target warehouses.",
		"Add items and quantities, save and submit.",
	))

art("check-stock", "Stock", None, "معرفة رصيد المخزن", "Checking stock balance",
	"رصيد, كميه, جرد, متاح, stock balance, quantity, inventory, available",
	ol(
		"افتح <b>التقارير ← المخازن ← رصيد المخزون</b> (Stock Balance).",
		"اختار الشركة والفترة، ولو عايز صنف أو مخزن معيّن اختاره.",
		"التقرير بيوضح الرصيد الافتتاحي والوارد والمنصرف والرصيد الحالي وقيمته.",
	),
	ol(
		"Open <b>Reports → Stock → Stock Balance</b>.",
		"Pick company and period; optionally an item or warehouse.",
		"It shows opening, in, out and closing quantity and value.",
	))

# ------------------------------------------------------------------ Accounting
art("journal-entry", "Accounting", "Journal Entry", "عمل قيد يومية", "Making a journal entry",
	"قيد, قيد يوميه, مدين, دائن, journal entry, debit, credit",
	ol(
		"<b>المحاسبة ← القيود اليومية ← + إضافة</b>.",
		"اختار تاريخ القيد.",
		"في جدول الحسابات: كل سطر فيه حساب ومبلغ مدين أو دائن.",
		"لازم إجمالي المدين يساوي إجمالي الدائن.",
		"احفظ واعتمد.",
	),
	ol(
		"<b>Accounting → Journal Entry → + Add</b>.",
		"Pick the posting date.",
		"Accounts table: each row has an account and a debit or credit amount.",
		"Total debit must equal total credit.",
		"Save and submit.",
	))

art("opening-entry", "Accounting", "Journal Entry", "قيد الأرصدة الافتتاحية", "Opening balances entry",
	"افتتاحي, رصيد افتتاحي, اول المده, opening, opening balance",
	ol(
		"<b>المحاسبة ← القيود اليومية ← + إضافة</b>.",
		"اختار نوع القيد <b>Opening Entry</b>.",
		"أضف أرصدة الحسابات (مدين / دائن) بتاريخ بداية السنة المالية.",
		"احفظ واعتمد.",
	) + note("أرصدة البضاعة الافتتاحية بتتسجل من قيد مخزون (Material Receipt)، مش من هنا."),
	ol(
		"<b>Accounting → Journal Entry → + Add</b>.",
		"Choose type <b>Opening Entry</b>.",
		"Enter account balances (debit / credit) dated at the start of the fiscal year.",
		"Save and submit.",
	) + note_en("Opening stock is entered with a Stock Entry (Material Receipt), not here."))

art("add-account", "Accounting", "Account", "إضافة حساب في شجرة الحسابات", "Adding an account to the chart of accounts",
	"حساب جديد, شجره الحسابات, دليل الحسابات, account, chart of accounts",
	ol(
		"افتح <b>المحاسبة ← شجرة الحسابات</b>.",
		"اضغط على الحساب الرئيسي (المجموعة) اللي الحساب الجديد هيبقى تحته، واختار <b>Add Child</b>.",
		"اكتب اسم الحساب، وفعّل <b>Is Group</b> لو هيبقى تحته حسابات.",
		"اكتب <b>اسم الحساب بالعربي</b> (بيظهر في الفواتير والسندات).",
		"اضغط <b>Create New</b>.",
	),
	ol(
		"Open <b>Accounting → Chart of Accounts</b>.",
		"Click the parent group and choose <b>Add Child</b>.",
		"Enter the name; tick <b>Is Group</b> if it will hold sub-accounts.",
		"Fill in <b>Account Name in Arabic</b> (shown on invoices and payments).",
		"Click <b>Create New</b>.",
	))

art("general-ledger", "Accounting", None, "كشف حساب (دفتر الأستاذ)", "Account statement (General Ledger)",
	"كشف حساب, دفتر الاستاذ, حركه حساب, رصيد عميل, رصيد مورد, general ledger, statement, ledger",
	ol(
		"<b>المحاسبة ← دفتر الأستاذ العام</b> (General Ledger).",
		"اختار الشركة والفترة.",
		"لكشف حساب معيّن اختار <b>Account</b>؛ لكشف عميل أو مورد اختار Party Type و Party.",
		"للطباعة أو الإكسيل استخدم Print أو Export.",
	),
	ol(
		"<b>Accounting → General Ledger</b>.",
		"Pick company and period.",
		"Filter by <b>Account</b>, or by Party Type and Party for a customer/supplier statement.",
		"Use Print or Export.",
	))

# ------------------------------------------------------------------ Manufacturing
art("create-bom", "Manufacturing", "BOM", "عمل قائمة مواد (BOM)", "Creating a bill of materials",
	"قائمه مواد, مكونات, خامات, تركيبه, bom, bill of materials, recipe, components",
	ol(
		"<b>التصنيع ← قائمة المواد ← + إضافة</b>.",
		"اختار الصنف النهائي اللي هيتصنّع، والكمية (عادة 1).",
		"في جدول الأصناف: الخامات وكمية كل خامة.",
		"لو فيه مراحل تشغيل فعّل <b>With Operations</b> وأضف العمليات ومحطات العمل.",
		"احفظ واعتمد. القائمة المعتمدة والافتراضية هي اللي بتتستخدم في أوامر العمل.",
	),
	ol(
		"<b>Manufacturing → Bill of Materials → + Add</b>.",
		"Pick the finished item and quantity (usually 1).",
		"Items table: raw materials and quantities.",
		"For production steps tick <b>With Operations</b> and add operations/workstations.",
		"Save and submit. The submitted default BOM is used by work orders.",
	))

art("work-order", "Manufacturing", "Work Order", "تصنيع منتج (أمر عمل)", "Manufacturing a product (Work Order)",
	"امر عمل, تصنيع, انتاج, تشغيله, work order, production, manufacture, produce",
	ol(
		"<b>التصنيع ← أمر العمل ← + إضافة</b>.",
		"اختار الصنف المطلوب تصنيعه والكمية؛ قائمة المواد بتتختار لوحدها.",
		"اختار مخزن تحت التشغيل (WIP) ومخزن المنتج التام.",
		"احفظ واعتمد.",
		"اضغط <b>Start</b> لتحويل الخامات لمخزن التشغيل، واعتمد القيد اللي بيتعمل.",
		"بعد ما الإنتاج يخلص اضغط <b>Finish</b>، واعتمد قيد التصنيع: الخامات بتتخصم والمنتج التام بيدخل المخزن.",
	),
	ol(
		"<b>Manufacturing → Work Order → + Add</b>.",
		"Pick the item and quantity; the BOM is filled in.",
		"Choose the work-in-progress and finished goods warehouses.",
		"Save and submit.",
		"Click <b>Start</b> to move materials to WIP and submit that entry.",
		"When done click <b>Finish</b> and submit the manufacture entry: materials are consumed and the product is added to stock.",
	))

art("job-card", "Manufacturing", "Job Card", "بطاقة العمل", "Job cards",
	"بطاقه عمل, وقت, عمليه, تشغيل, job card, time log, operation",
	"<p>بطاقات العمل بتتعمل لوحدها من أمر العمل لما قائمة المواد يكون فيها عمليات.</p>" + ol(
		"<b>التصنيع ← بطاقة العمل</b> وافتح البطاقة.",
		"سجّل الوقت (Time Logs) والكمية المنتهية.",
		"احفظ واعتمد لما العملية تخلص.",
	),
	"<p>Job cards are created from a work order when its BOM has operations.</p>" + ol(
		"<b>Manufacturing → Job Card</b> and open the card.",
		"Log time and completed quantity.",
		"Save and submit when the operation is done.",
	))

art("production-plan", "Manufacturing", "Production Plan", "خطة الإنتاج", "Production plan",
	"خطه انتاج, تخطيط, plan, production plan, planning",
	ol(
		"<b>التصنيع ← خطة الإنتاج ← + إضافة</b>.",
		"اجلب أوامر البيع اللي محتاجة تصنيع، أو أضف الأصناف يدويًا.",
		"راجع الكميات المطلوب تصنيعها، واحفظ واعتمد.",
		"من زرار <b>إنشاء</b> اعمل أوامر العمل.",
	),
	ol(
		"<b>Manufacturing → Production Plan → + Add</b>.",
		"Get the sales orders that need production, or add items manually.",
		"Check planned quantities, save and submit.",
		"Use <b>Create</b> to make the work orders.",
	))

seen = set()
for a in A:
	assert a["article_id"] not in seen, a["article_id"]
	seen.add(a["article_id"])
json.dump(A, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(A), "articles")
