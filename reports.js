frappe.pages['reports'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __('Reports'),
        single_column: true
    });

    let $container = $(page.body);
    $container.empty();

    // --- Inject custom styles ---
    const style = `
        <style>
            /* Tabs */
            .nav-tabs {
                justify-content: center;
                border-bottom: none;
            }
            .nav-tabs .nav-link {
                color: #1e3a8a !important;
                font-weight: 600;
                font-size: 28px;
                border: none;
            }
            .nav-tabs .nav-link.active {
                color: #f97316 !important;
                border-bottom: 3px solid #f97316 !important;
            }

            /* Tile layout */
            .tiles-container {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 25px;
                justify-items: center;
                margin-top: 30px;
                padding: 0 40px;
            }

            .tile {
                background: white;
                border-radius: 12px;
                padding: 25px 15px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
                text-align: center;
                color: #1e3a8a;
                width: 200px;
                text-decoration: none !important;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 80px;
            }

            .tile:hover {
                transform: translateY(-5px);
                box-shadow: 0 6px 18px rgba(0,0,0,0.15);
                background: #f97316;
                color: #fff;
            }

            .tile-title {
                font-size: 16px;
                font-weight: 600;
                color: #1e3a8a;
                text-decoration: none !important;
            }

            .tile:hover .tile-title {
                color: #fff;
            }
        </style>
    `;
    $('head').append(style);

    // Reports grouped by module
const reportsByModule = {
    [frappe._("Accounting")]: [
        { label: frappe._("General and Payment Ledger Comparison"), href: "/app/query-report/General and Payment Ledger Comparison" },
        { label: frappe._("Supplier Ledger Summary"), href: "/app/query-report/Supplier Ledger Summary" },
        { label: frappe._("Customer Ledger Summary"), href: "/app/query-report/Customer Ledger Summary" },
        { label: frappe._("Accounts Payable Summary"), href: "/app/query-report/Accounts Payable Summary" },
        { label: frappe._("Accounts Receivable Summary"), href: "/app/query-report/Accounts Receivable Summary" },
        // { label: frappe._("Cheques and Deposits Incorrectly cleared"), href: "/app/query-report/Cheques and Deposits Incorrectly cleared" },
        { label: frappe._("Gross Profit"), href: "/app/query-report/Gross Profit" },
        { label: frappe._("Gross and Net Profit Report"), href: "/app/query-report/Gross and Net Profit Report" },
        // { label: frappe._("Voucher-wise Balance"), href: "/app/query-report/Voucher-wise Balance" },
        // { label: frappe._("Asset Depreciation Ledger"), href: "/app/query-report/Asset Depreciation Ledger" },
        // { label: frappe._("Deferred Revenue and Expense"), href: "/app/query-report/Deferred Revenue and Expense" },
        { label: frappe._("Inactive Sales Items"), href: "/app/query-report/Inactive Sales Items" },
        { label: frappe._("Delivered Items To Be Billed"), href: "/app/query-report/Delivered Items To Be Billed" },
        { label: frappe._("Received Items To Be Billed"), href: "/app/query-report/Received Items To Be Billed" },
        { label: frappe._("Billed Items To Be Received"), href: "/app/query-report/Billed Items To Be Received" },
        { label: frappe._("Sales Payment Summary"), href: "/app/query-report/Sales Payment Summary" }
    ],
    [frappe._("Buying")]: [
        { label: frappe._("Item-wise Purchase History"), href: "/app/query-report/Item-wise Purchase History" },
        { label: frappe._("Subcontract Order Summary"), href: "/app/query-report/Subcontract Order Summary" },
        { label: frappe._("Purchase Order Analysis"), href: "/app/query-report/Purchase Order Analysis" },
        { label: frappe._("Subcontracted Raw Materials To Be Transferred"), href: "/app/query-report/Subcontracted Raw Materials To Be Transferred" },
        { label: frappe._("Subcontracted Item To Be Received"), href: "/app/query-report/Subcontracted Item To Be Received" },
        { label: frappe._("Purchase Analytics"), href: "/app/query-report/Purchase Analytics" },
        { label: frappe._("Purchase Order Trends"), href: "/app/query-report/Purchase Order Trends" },
        { label: frappe._("Supplier Quotation Comparison"), href: "/app/query-report/Supplier Quotation Comparison" }
    ],
    [frappe._("Selling")]: [
        { label: frappe._("Sales Person-wise Transaction Summary"), href: "/app/query-report/Sales Person-wise Transaction Summary" },
        { label: frappe._("Payment Terms Status for Sales Order"), href: "/app/query-report/Payment Terms Status for Sales Order" },
        { label: frappe._("Pending SO Items For Purchase Request"), href: "/app/query-report/Pending SO Items For Purchase Request" },
        { label: frappe._("Item-wise Sales History"), href: "/app/query-report/Item-wise Sales History" },
        { label: frappe._("Available Stock for Packing Items"), href: "/app/query-report/Available Stock for Packing Items" },
        // { label: frappe._("Lost Quotations"), href: "/app/query-report/Lost Quotations" },
        { label: frappe._("Quotation Trends"), href: "/app/query-report/Quotation Trends" },
        { label: frappe._("Sales Order Trends"), href: "/app/query-report/Sales Order Trends" },
        { label: frappe._("Territory-wise Sales"), href: "/app/query-report/Territory-wise Sales" },
        // { label: frappe._("Territory Target Variance Based On Item Group"), href: "/app/query-report/Territory Target Variance Based On Item Group" },
        { label: frappe._("Sales Person Target Variance Based On Item Group"), href: "/app/query-report/Sales Person Target Variance Based On Item Group" },
        // { label: frappe._("Sales Partner Transaction Summary"), href: "/app/query-report/Sales Partner Transaction Summary" },
        // { label: frappe._("Sales Partner Commission Summary"), href: "/app/query-report/Sales Partner Commission Summary" },
        { label: frappe._("Inactive Customers"), href: "/app/query-report/Inactive Customers" },
        { label: frappe._("Customer-wise Item Price"), href: "/app/query-report/Customer-wise Item Price" },
        { label: frappe._("Customers Without Any Sales Transactions"), href: "/app/query-report/Customers Without Any Sales Transactions" }
    ],

        [frappe._("Stock")]: [
        { label: frappe._("Stock Ledger Variance"), href: "/app/query-report/Stock Ledger Variance" },
        { label: frappe._("Stock Balance"), href: "/app//query-report/Stock Balance" },
        { label: frappe._("Item Prices"), href: "/app/query-report/Item Prices" },
        { label: frappe._("Items To Be Requested"), href: "/app/query-report/Items To Be Requested" },
        { label: frappe._("Requested Items To Be Transferred"), href: "/app/query-report/Requested Items To Be Transferred" },
        { label: frappe._("Serial and Batch Summary"), href: "/app/query-report/Serial and Batch Summary" },
        { label: frappe._("Batch-Wise Balance History"), href: "/app/query-report/Batch-Wise Balance History" },
        { label: frappe._("Batch Item Expiry Status"), href: "/app/query-report/Batch Item Expiry Status" }
    ]
};

    
    let $tabs = $('<ul class="nav nav-tabs" role="tablist"></ul>');
    let $tabContent = $('<div class="tab-content mt-4"></div>');

    let first = true;
    Object.keys(reportsByModule).forEach((module, i) => {
        const tabId = `tab-${i}`;

        // Tab header
        let $tab = $(`
            <li class="nav-item">
                <button class="nav-link ${first ? 'active' : ''}" 
                        data-bs-toggle="tab"
                        data-bs-target="#${tabId}"
                        type="button" 
                        role="tab"
                        style="cursor:pointer;">
                    ${module}
                </button>
            </li>
        `);
        $tabs.append($tab);

        // Tab content
        let $tabPane = $(`<div class="tab-pane fade ${first ? 'show active' : ''}" id="${tabId}" role="tabpanel"></div>`);
        let $tilesContainer = $('<div class="tiles-container"></div>');

        reportsByModule[module].forEach(report => {
            let $tile = $(`
                <a href="${report.href}" class="tile">
                    <div class="tile-title">${report.label}</div>
                </a>
            `);
            $tilesContainer.append($tile);
        });

        $tabPane.append($tilesContainer);
        $tabContent.append($tabPane);
        first = false;
    });

    $container.append($tabs);
    $container.append($tabContent);

    // Manual tab switching
    $tabs.find('.nav-link').on('click', function() {
        const target = $(this).data('bs-target');
        $tabs.find('.nav-link').removeClass('active');
        $(this).addClass('active');
        $tabContent.find('.tab-pane').removeClass('show active');
        $(target).addClass('show active');
    });
};