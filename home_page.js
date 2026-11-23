frappe.pages['home-page'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: '',
        single_column: true
    });

    // Remove default header text
    $(wrapper).find('.page-head .title-text').remove();

    // Custom header
    const customHeader = `
        <div class="header full-header">
            <div class="logo-container">
                <div class="app-name">${__('Dashboard')}</div>
            </div>
            <div class="user-info">
                <div class="user-avatar">${frappe.session.user_fullname.substr(0, 2).toUpperCase()}</div>
                <div class="user-name">${frappe.session.user_fullname}</div>
            </div>
        </div>`;

    const $pageHead = $(wrapper).find('.page-head');
    $pageHead.empty().append(customHeader);

    // Main container
    let $container = $(page.body);
    $container.empty();

    // Layout HTML
     const html = `
        <div class="dashboard-body">
            <!-- Sidebar -->
           <div class="sidebar">
    <div class="menu">

        <div class="menu-item" onclick="frappe.set_route('app', 'company')">
            <i class="fas fa-building"></i><span>${__('Company')}</span>
        </div>

        <div class="menu-item" onclick="frappe.set_route('app', 'user')">
            <i class="fas fa-user"></i><span>${__('User')}</span>
        </div>

        <div class="menu-item" onclick="frappe.set_route('/app/account/view/tree')">
            <i class="fas fa-sitemap"></i><span>${__('Chart of Accounts')}</span>
        </div>

        <div class="menu-item" onclick="frappe.set_route('app', 'cost-center')">
            <i class="fas fa-project-diagram"></i><span>${__('Cost Center')}</span>
        </div>

        <div class="menu-item" onclick="frappe.set_route('app', 'pos-profile')">
            <i class="fas fa-shopping-cart"></i><span>${__('POS Profile')}</span>
        </div>


        <div class="menu-item" onclick="frappe.set_route('app', 'customer')">
            <i class="fas fa-user-tie"></i><span>${__('Customer')}</span>
        </div>

        <div class="menu-item" onclick="frappe.set_route('app', 'customer-group')">
            <i class="fas fa-users-cog"></i><span>${__('Customer Group')}</span>
        </div>

        <div class="menu-item" onclick="frappe.set_route('app', 'warehouse')">
                        <i class="fas fa-warehouse"></i><span>${__('Warehouse')}</span>
        </div>

        <div class="menu-item" onclick="frappe.set_route('app', 'supplier')">
            <i class="fas fa-truck"></i><span>${__('Supplier')}</span>
        </div>

        <div class="menu-item" onclick="frappe.set_route('app', 'supplier-group')">
            <i class="fas fa-people-carry"></i><span>${__('Supplier Group')}</span>
        </div>
        
        <div class="menu-item" onclick="frappe.set_route('app', 'item')">
            <i class="fas fa-box"></i><span>${__('Items')}</span>
        </div>

        <div class="menu-item" onclick="frappe.set_route('app', 'item-group')">
            <i class="fas fa-boxes"></i><span>${__('Item Group')}</span>
        </div>

        <div class="menu-item" onclick="frappe.set_route('app', 'uom')">
            <i class="fas fa-cube"></i><span>${__('UOM')}</span>
        </div>

        <div class="menu-item" onclick="frappe.set_route('app', 'sales-person')">
            <i class="fas fa-users"></i><span>${__('Sales Persons')}</span>
        </div>

    </div>
</div>


            <!-- Main Content -->
            <div class="main-content">
                <!-- Profit & Active Stats Row -->
                <div class="charts-row profit-row">
                    <div class="chart-section full-width" style="flex: 2;">
                        <h2>${__('Profit & Loss')}</h2>
                        <div id="pl-chart"></div>
                    </div>

                    <!-- Active Stats -->
                    <div class="chart-section stats-card" style="flex: 1;">
                        <h2>${__('Overview')}</h2>
                        <div class="stats-box" style="display: flex; justify-content: space-around; gap: 20px; flex-wrap: wrap;">
                            
                            <div class="stat-item">
                                <div class="stat-label">
                                    <i class="fas fa-users"></i>
                                    <h3>${__('Active Customers')}</h3>
                                </div>
                                <div id="active-customers" class="stat-value">0</div>
                            </div>

                            <div class="stat-item">
                                <div class="stat-label">
                                    <i class="fas fa-box"></i>
                                    <h3>${__('Active Items')}</h3>
                                </div>
                                <div id="active-items" class="stat-value">0</div>
                            </div>

                            <div class="stat-item">
                                <div class="stat-label">
                                    <i class="fas fa-truck"></i>
                                    <h3>${__('Active Suppliers')}</h3>
                                </div>
                                <div id="active-suppliers" class="stat-value">0</div>
                            </div>

                        </div>
                    </div>


                </div>

                <!-- Two charts in one row -->
                <div class="charts-row two-charts">
                    <div class="chart-section">
                        <h2>${__('Sales Order Trends')}</h2>
                        <div id="sales-chart"></div>
                    </div>
                    <div class="chart-section">
                        <h2>${__('Purchase Receipt Trends')}</h2>
                        <div id="purchase-chart"></div>
                    </div>
                </div>
            </div>
        </div>`;
    $container.append(html);
        // Active Customers
        frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Customer", filters: { disabled: 0 } },
            callback: function(r) {
                $("#active-customers").text(r.message);
            }
        });

        // Active Items
        frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Item", filters: { disabled: 0 } },
            callback: function(r) {
                $("#active-items").text(r.message);
            }
        });

        // Active Suppliers
        frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Supplier", filters: { disabled: 0 } },
            callback: function(r) {
                $("#active-suppliers").text(r.message);
            }
        });

    // Get dynamic fiscal year (e.g., 2025-2026)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const fiscalStartYear = currentMonth >= 7 ? currentYear : currentYear - 1;
    const fiscalEndYear = fiscalStartYear + 1;
    const fiscalYear = `${fiscalStartYear}-${fiscalEndYear}`;

    // Get latest Fiscal Year Doc
    frappe.db.get_list("Fiscal Year", {
        fields: ["name", "year_start_date", "year_end_date"],
        order_by: "year_end_date desc",
        limit: 1
    }).then(fiscal_years => {
        if (!fiscal_years || fiscal_years.length === 0) {
            $("#pl-chart").html("<div>" + __("No Fiscal Year found") + "</div>");
            return;
        }

        let fy = fiscal_years[0];
        let period_start_date = fy.year_start_date;
        let period_end_date = fy.year_end_date;

        // ---------------- PROFIT & LOSS ----------------
        let report_filters = {
            company: frappe.defaults.get_default("company"),
            from_fiscal_year: fy.name,
            to_fiscal_year: fy.name,
            fiscal_year: fy.name,
            filter_based_on: "Posting Date",
            period_start_date: period_start_date,
            period_end_date: period_end_date,
            periodicity: "Monthly",
            accumulated_values: 0,
            presentation_currency: "",
        };

        frappe.call({
            method: "frappe.desk.query_report.run",
            args: {
                report_name: "Profit and Loss Statement",
                filters: report_filters
            },
            callback: function(r) {
                if (!r || !r.message) {
                    $("#pl-chart").html("<div>" + __("Failed to load report") + "</div>");
                    return;
                }

                if (r.message.chart) {
                    try {
                        new frappe.Chart("#pl-chart", {
                            title: __("Profit & Loss") + ` (${period_start_date} → ${period_end_date})`,
                            data: r.message.chart.data,
                            type: r.message.chart.type || 'bar',
                            height: 300,
                            colors: ['#f97316', '#1e3a8a'],
                        });
                        return;
                    } catch (e) {
                        console.error("Error rendering chart", e);
                    }
                }
            }
        });

        // ---------------- SALES ORDER TRENDS ----------------
        frappe.call({
            method: "frappe.desk.query_report.run",
            args: {
                report_name: "Sales Order Trends",
                filters: {
                    company: frappe.defaults.get_default("company"),
                    fiscal_year: fiscalYear,
                    period: "Monthly",
                    based_on: "Item",
                    group_by: "Customer",
                    show_values_in: "Amount"
                }
            },
            callback: function(r) {
                if (r && r.message && r.message.chart) {
                    try {
                        new frappe.Chart("#sales-chart", {
                            title: __("Sales Order Trends") + ` (${fiscalYear})`,
                            data: r.message.chart.data,
                            type: r.message.chart.type || 'line',
                            height: 300,
                            colors: ['#f97316', '#1e3a8a'],
                        });
                    } catch (e) {
                        console.error("Error rendering Sales chart", e);
                    }
                } else {
                    $("#sales-chart").html("<div>" + __("No chart data available") + "</div>");
                }
            }
        });

        // ---------------- PURCHASE RECEIPT TRENDS ----------------
        frappe.call({
            method: "frappe.desk.query_report.run",
            args: {
                report_name: "Purchase Order Trends", // ✅ safer, avoids Posting Date KeyError
                filters: {
                    company: frappe.defaults.get_default("company"),
            fiscal_year: fiscalYear,
            period: "Monthly",
            based_on: "Item",
            group_by: "Supplier",
            show_values_in: "Amount"
                }
            },
            callback: function(r) {
                if (r && r.message && r.message.chart) {
                    try {
                        new frappe.Chart("#purchase-chart", {
                            title: __("Purchase Order Trends") + ` (${fiscalYear})`,
                            data: r.message.chart.data,
                            type: r.message.chart.type || 'line',
                            height: 300,
                            colors: ['#f97316', '#1e3a8a'],
                        });
                    } catch (e) {
                        console.error("Error rendering Purchase chart", e);
                    }
                } else {
                    $("#purchase-chart").html("<div>" + __("No chart data available") + "</div>");
                }
            }
        });
    });

    // ---------- CSS ----------
    const style = `<style>
        .page-head {
            padding: 0 !important;
            background: #fff !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            position: sticky;
            top: var(--navbar-height);
            z-index: 10;
        }
        .full-header {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 30px;
            background: #fff;
            box-shadow: 10px 0 8px #e6e6e6;
        }
        .app-name {
            font-size: 20px;
            font-weight: bold;
            color: #1e3a8a;
        }
        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .user-avatar {
            width: 40px; height: 40px; border-radius: 50%;
            background: #f97316; color: white;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold;
        }
        .user-name { font-size: 14px; color: #1e3a8a; }
        .dashboard-body {
            display: flex;
            background: #f9fafb;
            min-height: calc(100vh - var(--navbar-height));
            overflow: hidden;
        }
        .sidebar {
            width: 200px;
            background: #ffffffff;
            padding: 20px 0;
            flex-shrink: 0;
            color: #1e3a8a;
            box-shadow: 10px 0 8px #e6e6e6;
            }
        .menu-item {
            padding: 12px 20px;
            display: flex; align-items: center;
            color: #1e3a8a ;
            cursor: pointer;
            transition: all 0.3s; gap: 5px;
        }
        .menu-item:hover {
            background-color: #f97316;
            color: #fff; border-left: 3px solid #fff;
        }
        .main-content { flex: 1; padding: 30px; overflow-y: auto; }
        .chart-section {
            background: white; border-radius: 12px; padding: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            text-align: center;
        }
        .charts-row {
            display: flex; gap: 20px; margin-bottom: 30px;
            flex-wrap: wrap;
        }

    .charts-row.two-charts {
        display: flex;
        gap: 20px;
        width: 100%;
        justify-content: space-between;
        align-items: stretch;
        flex-wrap: wrap;
    }
    .charts-row.two-charts .chart-section {
        flex: 1;
        min-width: 48%;
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        text-align: center;
    }
    .chart-section h2 {
        font-size: 20px;
        margin-bottom: 20px;
        color: #1e3a8a;
    }
    .chart-container {
        width: 100%;
        height: 300px;
    }

    .stats-card .stat-item {
        margin: 20px 0;
    }
        .stat-label {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .stat-label i {
            color: #1e3a8a;
            font-size: 18px;
        }

        .stat-item h3 {
            margin: 0;
            font-size: 16px;
            color: #555;
        }

        .stat-value {
            margin-top: 5px;
            font-size: 22px;
            font-weight: bold;
            color: #1e3a8a;
        }

    </style>`;
    $('head').append(style);
    $('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">').appendTo("head");

    // Menu active state
    $container.find('.menu-item').on('click', function () {
        $('.menu-item').removeClass('active');
        $(this).addClass('active');
    });
};