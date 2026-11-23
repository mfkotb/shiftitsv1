# مراجعة كود shiftitsv1 (Salis)

الفرع: `v16-refactor` — كل التعديلات المذكورة هنا موجودة فيه.

## 1) مشاكل حرجة (كانت هتمنع التطبيق يشتغل أو تكسره)

| # | المشكلة | الأثر | اللي اتعمل |
|---|---|---|---|
| 1 | الريبو مرفوع **مسطّح** (كل الملفات في الجذر، `__init__ (1).py`… `download (10)`) | `bench get-app` مش هيلاقي `shiftitsv1/hooks.py` → التطبيق **مش قابل للتثبيت** من الريبو | أعدت بناء هيكل تطبيق Frappe كامل (بـ `git mv` عشان التاريخ يفضل) |
| 2 | `api.py`: الاستعلام بيقرأ `account_type` من `tabGL Entry` | العمود ده **مش موجود** في GL Entry → خطأ SQL. كمان بيجمع كل الشركات والقيود الملغاة، ومن غير صلاحيات | اتكتب بـ `frappe.qb` + join على Account بـ `root_type` + فلتر شركة و `is_cancelled` + فحص صلاحية |
| 3 | `shift.js` كان متضاف في `web_include_js` | على صفحة الـ login مفيش `frappe.router` → `TypeError` في الـ console | الـ JS للديسك بس؛ تنسيق صفحة الدخول اتنقل CSS |
| 4 | `removeHomeSidebar()` بتتنادى ومش متعرّفة | `ReferenceError` لما تفتح `/app/home` | اتشالت |
| 5 | تقرير الأرباح في الداشبورد: `filter_based_on: "Posting Date"` | قيمة مش مسموحة (المسموح Fiscal Year / Date Range) | اتصلحت |
| 6 | تقارير Trends بتاخد سنة مالية محسوبة يوليو–يونيو (`2025-2026`) | لو السنة المالية ميلادية (زي مصر) الاسم مش موجود → الرسم فاضي | بتاخد السنة المالية الفعلية اللي فيها تاريخ اليوم |

## 2) جودة الكود

- **حوالي 12 `setInterval` شغالين للأبد** (كل 300–500ms) + `MutationObserver` على `body` كله ما بيتقفلش، وكل route change بيضيف observer جديد → تسريب ذاكرة وبطء مع الوقت.
  → اتبدلوا بـ **observer واحد + debounce** و "قواعد" (rules) صغيرة بتتنفذ مرة لكل تغيير.
- **روابط `/app/...` مكتوبة يدوي** في كل مكان → اتبدلت بـ `frappe.router.make_url` (بتطلع `/app` في v15 و `/desk` في v16).
- **إضافة موديول كانت محتاجة تعديل 3 أماكن** (JS + CSS بأسماء كلاسات خاصة بكل موديول + قائمة الإخفاء). دلوقتي سطر واحد في `SALIS_CONFIG.modules`.
- **النصوص العربي متشفرة URL يدوي** (`%D8%A7…`) → دلوقتي الكود بيحسب `encodeURIComponent(__(label))` تلقائي.
- **`before_save` في Sales/Purchase Invoice و Payment Entry** بتعمل `frappe.call` غير متزامن → الحفظ بيخلص قبل ما القيمة توصل (الفورم يرجع "Not Saved")، وفي Sales Invoice طلب لكل صنف. والحقول دي أصلًا عليها `fetch_from` والسيرفر بيملاها وقت الحفظ. → **الملفات اتشالت**.
  ⚠️ حقل `code` في Sales Invoice Item: الـ JS كان بيحط `item_code` لو فاضي، بينما الـ `fetch_from` بتاعه `item.code`. اتأكد إن ده المطلوب للفاتورة الإلكترونية.
- **ستايلات الصفحات بتتضاف لـ `<head>` مع كل فتح** وبعضها عام (`.page-head`, `.nav-tabs`, `.tile`) بيأثر على كل الديسك → اتنقلت لـ `home_page.css` / `reports.css` ومقيدة بـ `[data-page-route]`.
- `onclick="frappe.set_route(...)"` جوه HTML → event delegation.
- ملفات ميتة اتشالت: `user.py` (كله comments)، `desktop.py`، `docs.py`، `sales_invoice.py` فاضي، `stock-market.png` مش مستخدم (سايبه).
- `console.log` في الفورمات اتشالت.
- صفحة التقارير بتخفي التقارير اللي المستخدم ملوش صلاحية يفتحها.
- رابط `Stock Balance` كان فيه `//`.

## 3) ملاحظة أمان مهمة

كل "الإخفاء" (الأدوار، الموديولات، Download Report، البحث…) **شكلي فقط في المتصفح**. أي مستخدم يقدر يفتح الرابط مباشرة أو ينادي الـ API.
الصح: **Role Profile + Module Profile + Role Permission Manager** (و Report → Roles). خليت الإخفاء زي ما هو كتجميل، لكن لازم الصلاحيات تتظبط على السيرفر.

## 4) التوافق مع V16

| البند | الوضع في v16 | اللي اتعمل |
|---|---|---|
| Python / Node | 3.14 / 24 | CI و `pyproject` اتحدثوا، و CI بيثبت ERPNext version-16 |
| الـ navbar | **اتشال تقريبًا** (فاضل announcement بس، والقوائم راحت الـ sidebar) → حقن الأزرار في `.navbar-collapse` مش هيشتغل | لو لقى navbar (v15) بيحط الشريط جواه زي الأول؛ لو مفيش (v16) بيعمل شريط خاص بيه فوق `#body` |
| `/app` → `/desk` | v16 بيعمل redirect | كل الروابط بـ `make_url`، وقواعد CSS لإخفاء الروابط بقت للمسارين |
| `website_route_rules` `/` → `/app/home-page` | `www/app.py` مش موجود في v16 | اتبدلت بـ `website_redirects` لـ `/desk/home-page` (**اختبرها على السيرفر**) |
| Desktop icons | v16 بيبني أيقونات التطبيقات من `add_to_apps_screen` | اتضاف |
| Override `frappe.router.render` | كانت بتلغي صفحة Desktop بالكامل وبتعدّل دالة داخلية | اتشالت؛ بدالها redirect بسيط لما الـ route فاضي |
| Customizations (`custom/*.json`) | 14 Property Setter على حقول **اتشالت** في v16 (`totals`, `section_break2`, `apply_tds`, `subscription_section`…) | اتشالوا من الملفات |
| Property Setters من نوع `field_order` | مجمّدة على ترتيب v15 → حقول v16 الجديدة (`item_wise_tax_details`, `tax_withholding_entries`…) هتتحط في آخر الفورم | **محتاج إعادة ترتيب يدوي** من Customize Form على v16 ثم Export Customizations |
| Custom fields `insert_after` على حقول مش موجودة | Sales Invoice (`totals`, `section_break2`)، POS Invoice (`campaign`, `source`)، Purchase Invoice/Receipt (`base_tax_withholding_net_total`)، SI Item (`subtype`) | هتتحط في الآخر — راجعها مع الخطوة اللي فوق |

اتأكدت من كل أسماء التقارير المستخدمة إنها موجودة في ERPNext version-16 (`BOM Stock Report` مثلًا مش موجود، البديل `BOM Stock Analysis`).

**الطريقة "الرسمية" في v16** للتنقل هي Workspace Sidebar + Desktop Icons. الشريط الحالي شغال كحل سريع، لكن على المدى الطويل الأفضل تعمل Workspace Sidebar لكل موديول وتصدّره مع التطبيق.

## 5) قسم التصنيع (Manufacturing)

بنفس الأسلوب:
- **زرار في الشريط** + قائمة: Bill of Materials, Work Order, Job Card, Production Plan, Workstation, Operation, Manufacture Entries (`stock-entry?purpose=Manufacture`)
- **تاب في صفحة التقارير**: Work Order Summary, Production Analytics, Production Planning Report, Work Order Stock Report, BOM Explorer, BOM Stock Analysis, BOM Operations Time, Job Card Summary, Downtime Analysis, Process Loss Report
- **الداشبورد**: عدّاد "Work Orders In Process" + رسم Production Analytics + BOM و Workstation في القائمة الجانبية
- **Stock Entry**: أنواع Material Transfer for Manufacture / Material Consumption for Manufacture / Manufacture / Repack بقت متاحة
- **اتشال من قوائم الإخفاء**: موديول Manufacturing، أدوار Manufacturing Manager/User، workspace `/manufacturing`، زرار "Bill of Materials"
- أيقونة `factory.svg` جديدة + ترجمات عربي

⚠️ `Material Request` لسه مخفي من القوائم (زي ما كان)، وده بيستخدم من Work Order / Production Plan لطلب الخامات. لو محتاجه شيله من `hidden_menu_labels`.

## 6) اختبار بعد التثبيت

```bash
bench --site SITE migrate && bench build --app shiftitsv1 && bench restart
```
1. افتح `/` و `/desk` كمستخدم عادي → لازم يروح للداشبورد.
2. الشريط ظاهر فوق، وقائمة التصنيع بتفتح عند الـ hover.
3. اعمل Sales Invoice واحفظها → الحقول العربي (`custom_debit_to_ar`…) اتملت ومفيش "Not Saved".
4. افتح Customize Form لـ Sales Invoice و Purchase Invoice وشوف ترتيب الحقول الجديدة.

## 7) نتيجة الاختبار على سيرفر v16 حقيقي

اتعمل bench تجريبي: Frappe 16.60.2 + ERPNext 16.60.0 (Python 3.14, Node 24, MariaDB 10.11).

**عدّى:** `install-app` و `migrate` من غير أخطاء — 97 custom field و 510 property setter اتعملهم sync — الصفحتين والفوتر — 306+ ترجمة عربي اتحمّلت — تحويل `/` للداشبورد — فاتورة مبيعات اتعملت واتعتمدت — `get_profit_from_gl` رجّع الإيراد صح — تقارير الداشبورد الأربعة رجّعت رسوم — الـ 50 تقرير في صفحة التقارير موجودين — الشريط والقوائم والتصنيع بالعربي والإنجليزي.

**مشاكل ظهرت في الاختبار واتصلحت:**
1. **أي صفحة كانت بتتحوّل للداشبورد** — الـ route بيكون فاضي لحظة تحميل الديسك. التحويل بقى للرابط `/desk` أو `/app` بس.
2. **الفوتر كان بيكسر تخطيط v16** (الـ body في v16 بقى flex أفقي) → بيتحط في مكان `<footer>` بتاع الديسك.
3. **تمييز الموديول الحالي** ما كانش بيشتغل لأن روابط v16 فيها قسم زيادة (`/desk/manufacturing/work-order`).
4. **حفظ Sales Invoice كان بيقع على أي موقع جديد** (`Unknown column 'customer_types'`): الحقول بتعمل `fetch_from` من حقول مش جاية مع التطبيق (`Account.custom_account_name_in_arabic`, `Customer.customer_types`, `Item.code`, `Item.item_type`, `Item Tax Template.type`). → `install.py` بيعملهم كـ Data **لو مش موجودين بس** (لو موجودين عندك من تطبيق تاني ما بيتلمسوش). وكمان UOM `EA` (القيمة الافتراضية لـ Tax UOM).
5. **`fetch_from` غلط في Sales Invoice Item**: `item.code` و `item.item_type` — مفيش حقل اسمه `item`، الصح `item_code`. ده كان سبب وجود الـ JS القديم أصلًا.
6. **`custom_debit_to_ar` إجباري ومش بيتملى من السيرفر**: `debit_to` بيتحدد أثناء الـ validate، بعد مرحلة الـ fetch. → `events.py` بيملى أي حقل مخصص فاضي عليه `fetch_from` (للفواتير والسندات والقيود)، وبيحط `item_code` في `code` لو الصنف ملوش كود (زي السلوك القديم).
7. **الحقول كانت مضغوطة في الأقسام اللي فيها 4–5 أعمدة** بسبب الـ labels جنب الحقول → في الأعمدة الضيقة الـ label بقى فوق الحقل.

**لسه:** الحقول الإجبارية `custom_debit_to_ar` و `code` معناها إن أي حساب مدينين لازم يكون ليه اسم عربي، وإلا الفاتورة مش هتتحفظ — ده قرار تصميم عندكم، مش خطأ.

## 8) إخفاء النظام الأصلي عن العميل

Salis نسخة مصغّرة للشركات الصغيرة، فالمستخدم العادي (أي حد غير Administrator) ما يشوفش أي حاجة من واجهة Frappe/ERPNext الأصلية. كله متحكم فيه من `hide_system_sidebar` في `SALIS_CONFIG`:
- منيو النظام الجانبية (الـ dock والقائمة) مخفية، واسم المستخدم وتسجيل الخروج في الشريط بتاعنا
- صفحة الـ Desktop وكل الـ workspaces (Accounting, Invoicing, Selling, Build …) وصفحات `dashboard-view` بتتحوّل للوحة تحكم سالس
- زرار الـ Desktop وروابط الـ workspaces بتتشال من مسار الصفحة (breadcrumb)
- اختصار البحث (Ctrl+K / Ctrl+G) مقفول
- زراير الأقسام في الشريط بتفتح القايمة بتاعتها بدل صفحة `dashboard-view` بتاعة النظام (اللي كانت كمان بتطلّع Permission Error)

ده كله إخفاء في الواجهة. الحماية الحقيقية لسه لازم تتعمل بالصلاحيات (Role / Module Profiles).
