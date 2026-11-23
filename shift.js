

//  replace search word 
function updateSearchPlaceholder() {
let attempts = 0;
const maxAttempts = 10;

const tryUpdate = () => {
  const searchInput = document.getElementById('navbar-search');
  if (searchInput) {
    searchInput.placeholder = 'Search';
  } else if (attempts < maxAttempts) {
    attempts++;
    setTimeout(tryUpdate, 300);
  }
};

tryUpdate();
}


// ========================
// Add Module Submenu
// ========================
function addModuleSubmenu(moduleName, items) {
  const check = setInterval(() => {
    const navbarButtons = document.querySelector(
      '.custom-navbar-buttons.d-flex.align-items-center.gap-3.ml-3'
    );
    if (!navbarButtons) return;

    if (!moduleName) {
      clearInterval(check);
      return;
    }

    const safeTranslate = (txt) =>
      (typeof __ === "function" && txt ? __(txt) || txt : txt);

    const translated = safeTranslate(moduleName);
    if (!translated) {
      return; // skip until translation is available
    }

    const moduleBtn = Array.from(navbarButtons.querySelectorAll('a, button, div'))
      .find(el => el.textContent.trim().toLowerCase() === translated.toLowerCase());

    if (!moduleBtn) return;

    clearInterval(check);



    // Wrap the module button
    const wrapper = document.createElement('div');
    wrapper.classList.add(`${moduleName.toLowerCase()}-wrapper`);
    moduleBtn.parentNode.insertBefore(wrapper, moduleBtn);
    wrapper.appendChild(moduleBtn);

    // Create mega menu
    const megaMenu = document.createElement('div');
    megaMenu.classList.add(`${moduleName.toLowerCase()}-mega-menu`);

    // Build submenu list items
    let listHTML = '<ol class="sub-menu">';
    items.forEach((item, index) => {
      const colorClass = ['item--a', 'item--b', 'item--c'][index % 3];
      listHTML += `
        <li class="menu-item ${colorClass}">
          <a href="${item.href}"><span>${safeTranslate(item.label)}</span></a>
        </li>
      `;
    });
    listHTML += '</ol>';

    megaMenu.innerHTML = listHTML;
    wrapper.appendChild(megaMenu);
  }, 300);
}


// --- Add for each module ---
addModuleSubmenu("Accounting", [
  { label: "Chart of Account", href: "/app/account/view/tree" },
  { label: "Payment Entry", href: "/app/payment-entry" },
  { label: "Journal Entry", href: "/app/journal-entry" },
  { label: "General Ledger", href: "/app/query-report/General Ledger" },
]);

addModuleSubmenu("Buying", [
  { label: "Purchase Order", href: "/app/purchase-order" },
  { label: "Purchase Receipt", href: "/app/purchase-receipt" },
  { label: "Purchase Invoice", href: "/app/purchase-invoice" }
]);

addModuleSubmenu("Selling", [
  { label: "Sales Order", href: "/app/sales-order" },
  { label: "Delivery Note", href: "/app/delivery-note" },
  { label: "Sales Invoice", href: "/app/sales-invoice" },
  { label: "POS Invoice", href: "/app/pos-invoice" }
]);

addModuleSubmenu("Stock", [
  { label: "Stock Entry", href: "/app/stock-entry" },
  { label: "Purchase Receipt", href: "/app/purchase-receipt" },
  { label: "Delivery Note", href: "/app/delivery-note" },
  { label: "Serial No", href: "/app/serial-no" },
  { label: "Batch", href: "/app/batch" }
]);

// ========================
// Inject Navbar Buttons
// ========================
 function injectCustomButtonsIntoNavbar() {
    const tryInject = setInterval(() => {
      const navbarEnd = document.querySelector(".collapse.navbar-collapse.justify-content-end");
      if (!navbarEnd) return;

      // Prevent duplicates
      if (document.querySelector(".custom-navbar-logo") || document.querySelector(".custom-navbar-buttons")) {
        clearInterval(tryInject);
        return;
      }

      const lang = frappe.boot.lang || "en";
const rtl = lang === "ar";

// --- 🔸 Add Custom Logo ---
const logoContainer = document.createElement("div");
logoContainer.className = "custom-navbar-logo mr-3";

// Choose logo based on language
const logoSrc = rtl
  ? "/assets/shiftitsv1/images/Salis ar.png" // Arabic logo
  : "/assets/shiftitsv1/images/Salis.png";    // English logo

logoContainer.innerHTML = `
  <a href="/app/home-page" class="navbar-logo-link">
    <img src="${logoSrc}" alt="Salis Logo"
         class="navbar-logo"
         style="height:100px; object-fit:contain; margin-left: 40px;">
  </a>
`;

      // Insert logo at the far left (start of the navbar collapse)
      navbarEnd.insertAdjacentElement("afterbegin", logoContainer);

      // --- 🔸 Add Custom Buttons ---
      const container = document.createElement("div");
      container.className = "custom-navbar-buttons d-flex align-items-center gap-3 ml-3";
      container.style.direction = rtl ? "rtl" : "ltr";

      const modules = [
        { title: "Dashboard", icon: "/assets/shiftitsv1/images/homepage.png", link: "/app/home-page" },
        { title: "Accounting", icon: "/assets/shiftitsv1/images/business.png", link: "/app/dashboard-view/Accounts" },
        { title: "Buying", icon: "/assets/shiftitsv1/images/coins.png", link: "/app/dashboard-view/Buying" },
        { title: "Selling", icon: "/assets/shiftitsv1/images/money.png", link: "/app/dashboard-view/Selling" },
        { title: "Stock", icon: "/assets/shiftitsv1/images/ready-stock.png", link: "/app/dashboard-view/Stock" },
        { title: "Reports", icon: "/assets/shiftitsv1/images/business.png", link: "/app/reports" }
      ];

      modules.forEach(mod => {
        const btn = document.createElement("a");
        btn.href = mod.link;
        btn.className = "custom-navbar-btn";
        btn.innerHTML = `
          <span class="btn-icon-wrapper ${rtl ? "icon-right" : "icon-left"}">
            <img src="${mod.icon}" alt="${__(mod.title)}" class="btn-icon">
          </span>
          <span class="btn-text">${__(mod.title)}</span>
        `;
        container.appendChild(btn);
      });

      // Insert buttons after logo, before other navbar items (like notifications)
      const firstNavItem = navbarEnd.querySelector("ul.navbar-nav");
      navbarEnd.insertBefore(container, firstNavItem);
      clearInterval(tryInject);
    }, 300);
  }



function overrideRouterRender() {
	const waitForRouter = setInterval(() => {
		if (frappe.router && frappe.router.render) {

			frappe.router.render = function () {
				if (this.current_route && this.current_route[0]) {
					this.render_page();
				

				} else {
					frappe.set_route(['app', 'home-page']);
				}
			};

			clearInterval(waitForRouter);
		}
	}, 100);
}


frappe.after_ajax(() => {

  injectCustomButtonsIntoNavbar();
  updateSearchPlaceholder();
  addModuleSubmenu();
  if (window.location.pathname === '/app/home') {
    removeHomeSidebar();
  }
  overrideRouterRender();

	const route = frappe.router?.current_route || [];
	const fullRouteStr = route.join('/');

	const isBlankRoute =
		(!route[0] || (route[0] === 'app' && !route[1])) &&
		!fullRouteStr.includes('home-page') &&
		!fullRouteStr.includes('report') &&
		!fullRouteStr.includes('Form') &&
		!fullRouteStr.includes('view') &&
		!fullRouteStr.includes('List');

	const alreadyRedirected = sessionStorage.getItem('already_redirected_homepage');

	if (isBlankRoute && !alreadyRedirected) {

		sessionStorage.setItem('already_redirected_homepage', '1');
		frappe.set_route('app/home-page');
	}

});
  
(function () {
  const originalMakeAppPage = frappe.ui.make_app_page;

  frappe.ui.make_app_page = function (opts) {
    const page = originalMakeAppPage.call(this, opts);
    setTimeout(() => {
      movePageActionsToSidebarGap();
    }, 0);
    return page;
  };

  function movePageActionsToSidebarGap() {
    const route = frappe.get_route_str();
    let tries = 0;
    const maxTries = 50;
  
    const interval = setInterval(() => {
      const page = frappe.ui.pages[route];
      const $wrapper = page?.wrapper || $(document);
  
      const $layoutMain = $wrapper.find('.layout-main');
      const $sidebar = $layoutMain.find('.layout-side-section');
      const $sidebarContent = $sidebar.children(); // Save content only
      const $pageActions = $wrapper.find('.page-actions');
      const $pageHeadContent = $wrapper.find('.page-head .page-head-content');
  
      if ($pageActions.length && $layoutMain.length && $sidebar.length) {
        clearInterval(interval);
  
        // Skip if no buttons
        if ($pageActions.find('button').length === 0) {
          return;
        }
  
        // Remove previous injection
        $layoutMain.find('.custom-action-slot').remove();
  
        // Create custom container
        const $customSlot = $('<div class="custom-action-slot"></div>');
        $sidebar.before($customSlot);
  
        // Style the custom slot
        $customSlot.css({
          width: '270.333px',
          // width: `${$sidebar.outerWidth()}px`,
          minHeight: `${$sidebar.outerHeight()}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '12px',
          background: '#fff',
          overflowY: 'auto',
          borderRight: '1px solid #eee',
        });
  
        // Grab button groups
        const $primaryAction = $pageActions.find('.primary-action').detach();
        const $customActions = $pageActions.find('.custom-actions').detach();
        const $standardActions = $pageActions.find('.standard-actions').detach();
        const $otherButtons = $pageActions.find('button:not(.primary-action)').detach();
  
        // Style all buttons
        const allButtons = $primaryAction
          .add($customActions)
          .add($standardActions)
          .add($otherButtons);
  
        allButtons.find('button').css({
          width: '100%',
          display: 'block',
        });
  
        // Inject buttons in order
        if ($primaryAction.length) $customSlot.append($primaryAction);
        if ($customActions.length) $customSlot.append($customActions);
        if ($standardActions.length) $customSlot.append($standardActions);
        if ($otherButtons.length) $customSlot.append($otherButtons);
  
        // 👉 Inject sidebar content after buttons
        $customSlot.append($sidebarContent);
  
        // 🗑️ Remove original sidebar container
        $sidebar.remove();
  
        // Clean up page-actions
        if ($pageHeadContent.find('.page-actions').length) {
          $pageHeadContent.find('.page-actions').remove();
        }

      }
  
      if (++tries > maxTries) {
        clearInterval(interval);
      }
    }, 100);
  }
})();

(function () {
    // Run after page load
    document.addEventListener("DOMContentLoaded", function () {
        if (window.location.href.includes("login")) {

            // Navbar background + font color
            const navbar = document.querySelector(".navbar.navbar-light.navbar-expand-lg");
            if (navbar) {
                navbar.style.backgroundColor = "#e1dfec";
                navbar.style.color = "#332757";
                navbar.querySelectorAll("a, .navbar-brand, .nav-link").forEach(el => {
                    el.style.color = "#332757";
                });
            }

            // Inputs border + font color
            document.querySelectorAll(".form-control").forEach(input => {
                input.style.border = "1px solid #332757";
                input.style.color = "#332757";
            });

            // Text color
            document.querySelectorAll("body, #page-login, .page-card, .form-control, .page-card-head h4").forEach(el => {
                el.style.color = "#332757";
            });

            // Login button
            document.querySelectorAll(".btn.btn-primary, .btn.btn-sm.btn-primary.btn-block.btn-login").forEach(btn => {
                btn.style.backgroundColor = "#332757";
                btn.style.borderColor = "#332757";
                btn.style.color = "#fff";
                btn.addEventListener("mouseover", () => {
                    btn.style.backgroundColor = "#012d4d";
                    btn.style.borderColor = "#012d4d";
                });
                btn.addEventListener("mouseout", () => {
                    btn.style.backgroundColor = "#332757";
                    btn.style.borderColor = "#332757";
                });
            });
        }
    });
})();

// ========================
// Hide Roles
// ========================

(function () {
    function hideUserRolesUI() {
        if (!window.location.href.includes("app/user")) return;

        function applyHiding() {
            // get the user being edited
            const userField = document.querySelector('.frappe-control[data-fieldname="email"] input');
            // 🛑 Skip for Administrator
             if (frappe.session.user === "Administrator") return;

            const rolesToHide = [
                "Agriculture Manager","Agriculture User","Analytics","Blogger","Employee",
                "Expense Approver","Fleet Manager","Fulfillment User","HR Manager","HR User",
                "Interviewer","Knowledge Base Contributor","Knowledge Base Editor","Leave Approver",
                "Link Manager","Newsletter Manager","Prepared Report User","Projects Manager",
                "Projects User","Quality Manager","Report Manager","Script Manager","Support Team",
                "System Manager","Translator","Website Manager","Workspace Manager","Manufacturing Manager",
                "Manufacturing User","Delivery Manager","Delivery User","Academics User"
            ];

            rolesToHide.forEach(role => {
                document.querySelectorAll(`.checkbox.unit-checkbox input[data-unit="${role}"]`)
                    .forEach(el => el.closest(".checkbox.unit-checkbox").style.display = "none");
            });

            document.querySelectorAll('.frappe-control[data-fieldname="role_profile_name"]')
                .forEach(el => el.style.display = "none");

            document.querySelectorAll(".bulk-select-options")
                .forEach(el => el.style.display = "none");
        }

        // apply once
        applyHiding();

        // watch for changes
        const target = document.querySelector('.role-editor') || document.body;
        const observer = new MutationObserver(applyHiding);
        observer.observe(target, { childList: true, subtree: true });
    }

    hideUserRolesUI();
    frappe.router.on("change", hideUserRolesUI);
})();



// ========================
// Modules Roles
// ========================

(function () {
    function hideUserModulesUI() {
        if (!window.location.href.includes("app/user")) return;

        function applyHiding() {
            // 🛑 Skip for Administrator
             if (frappe.session.user === "Administrator") return;

            // 1️⃣ Hide Module Profile field
            document.querySelectorAll('.frappe-control.input-max-width[data-fieldname="module_profile"]')
                .forEach(el => el.style.display = "none");

            // 2️⃣ Modules to hide
            const modulesToHide = [
                "Assets", "Automation", "Bulk Transaction", "Communication", "CRM",
                "Custom", "Email", "ERPNext Integrations", "Geo", "HR", "Integrations",
                "Maintenance", "Manufacturing", "Payroll", "Portal", "Printing",
                "Projects", "Quality Management", "Regional", "Setup", "ShiftITsV1",
                "Social", "Subcontracting", "Support", "Telephony", "two_B",
                "Utilities", "Website", "Workflow"
            ];

            // Hide specific modules
            modulesToHide.forEach(module => {
                document.querySelectorAll(`.checkbox.unit-checkbox input[data-unit="${module}"]`)
                    .forEach(input => {
                        input.closest(".checkbox.unit-checkbox").style.display = "none";
                    });
            });
        }

        // Run multiple times to catch async rendering
        let attempts = 0;
        let interval = setInterval(() => {
            applyHiding();
            attempts++;
            if (attempts > 10) clearInterval(interval); // stop after ~5s
        }, 500);
    }

    // Run once on load
    hideUserModulesUI();

    // Run again on page navigation inside Frappe
    frappe.router.on("change", hideUserModulesUI);
})();

// ========================
// Hide side menu
// ========================
(function hideCustomActionSlot() {
  const restrictedUrls = [
    "/app/payables",
    "/app/receivables",
    "/app/financial-reports",
    "/app/employee-lifecycle",
    "/app/recruitment",
    "/app/shift-&-attendance",
    "/app/leaves",
    "/app/expense-claims",
    "/app/assets",
    "/app/performance",
    "/app/manufacturing",
    "/app/quality",
    "/app/salary-payout",
    "/app/tax-&-benefits",
    "/app/projects",
    "/app/support",
    "/app/users",
    "/app/website",
    "/app/crm",
    "/app/tools",
    "/app/erpnext-settings",
    "/app/integrations",
    "/app/erpnext-integrations",
    "/app/home",
    "/app/accounting",
    "/app/buying",
    "/app/stock",
    "/app/selling",
    "/app/hr",
    "/app/build",
    "/app/e-invoice-egypt",
    "/app/payroll",
    "/app/e-invoice",
  ];

  function hideSlot() {
    const path = window.location.pathname;
    if (restrictedUrls.includes(path)) {
      const slot = document.querySelector(".custom-action-slot");
      if (slot) {
        slot.style.setProperty("display", "none", "important"); // force override
      }
    }
  }

  function checkAndHide() {
    let tries = 0;
    const interval = setInterval(() => {
      hideSlot();
      tries++;
      if (document.querySelector(".custom-action-slot") || tries > 20) {
        clearInterval(interval);
      }
    }, 300);
  }

  // Run initially
  checkAndHide();

  // Re-run on router change
  frappe.router.on("change", () => {
    checkAndHide();
  });
})();

// ========================
// Report Actions
// ========================
(function () {
    function extractReportActions() {
        // Only run on Query Report pages
        if (!window.location.pathname.includes('/app/query-report')) return;

        // Try until elements are ready
        const tryBuild = setInterval(() => {
            const pageActions = document.querySelector('.page-actions');
            if (!pageActions) return;

            const menuGroup = pageActions.querySelector('.menu-btn-group');
            if (!menuGroup) return;

            const dropdownMenu = menuGroup.querySelector('.dropdown-menu');
            if (!dropdownMenu) return;

            const menuItems = dropdownMenu.querySelectorAll('li > a.dropdown-item, a.dropdown-item');
            if (!menuItems.length) return;

            // Stop retrying once found
            clearInterval(tryBuild);

            // If already injected, skip
            if (menuGroup.querySelector('.visible-menu-buttons')) return;

            const allowedLabels = ['Add Column', 'Export', 'Print'];

            // Create container for visible buttons
            const visibleContainer = document.createElement('div');
            visibleContainer.classList.add('visible-menu-buttons');
            Object.assign(visibleContainer.style, {
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginRight: '6px',
            });

            // Loop over dropdown items
            menuItems.forEach((item) => {
                const text = item.textContent.trim();
                if (allowedLabels.includes(text)) {
                    // Create visible button
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-default btn-xs';
                    btn.innerHTML = item.innerHTML;
                    btn.style.whiteSpace = 'nowrap';
                    btn.title = text;

                    // Trigger the original click handler dynamically
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        item.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                    });

                    // Add to visible group
                    visibleContainer.appendChild(btn);

                    // ✅ Remove from dropdown to avoid duplicates
                    item.parentElement?.remove();
                }
            });

            // Insert before dropdown toggle
            if (visibleContainer.children.length > 0) {
                const dropdownToggle = menuGroup.querySelector('.btn.dropdown-toggle');
                menuGroup.insertBefore(visibleContainer, dropdownToggle);
                console.log('✅ Added inline report action buttons.');
            }
        }, 300); // retry every 300ms until ready, then clear
    }

    // Run initially and on route changes
    frappe.router.on('change', () => {
        extractReportActions();
    });

    extractReportActions();
})();


// ========================
// Dashboard Menu button 
// ========================

(function () {
    function RemoveDashboardMenuButton() {
        // Check if the current URL contains "dashboard-view"
    
    // 🛑 Skip for Administrator
    if (frappe.session.user === "Administrator") return;
    const checkExist = setInterval(() => {
            const el = document.querySelector(".standard-actions.flex");
            if (window.location.href.includes("dashboard-view")) {
            // Find and remove all menu button groups
            if (el) {
                el.remove();
                clearInterval(checkExist);
            }
        }
            
        }, 300); // check every 300ms until found
    }
    // Run initially
    RemoveDashboardMenuButton();

    // Also run on route changes (important for SPA navigation)
    frappe.router.on('change', () => {
        RemoveDashboardMenuButton();
    });
})();

// ========================
// hide search bar
// ========================
(function () {
  function removeRestrictedElements() {
    const username = frappe.session?.user || "";
    const isAdmin = username === "Administrator";

    // Only apply for non-admin users
    if (isAdmin) return;

    const helpDropdown = document.querySelector(".dropdown-help");
    const notificationsDropdown = document.querySelector(".dropdown-notifications");
    const searchBar = document.querySelector(".input-group.search-bar");

    // --- 🔸 Remove the elements completely ---
    if (helpDropdown) helpDropdown.remove();
    if (notificationsDropdown) notificationsDropdown.remove();
    if (searchBar) searchBar.remove();

    // Disable Ctrl+G shortcut for non-admin users
    frappe.ui.keys.off("ctrl+g");
  }

  function observeNavbarChanges() {
    // Watch entire navbar area for changes
    const navbar = document.querySelector(".navbar") || document.body;

    const observer = new MutationObserver(() => {
      removeRestrictedElements();
    });

    observer.observe(navbar, { childList: true, subtree: true });
  }

  frappe.after_ajax(() => {
    removeRestrictedElements();
    observeNavbarChanges();
  });

  // Reapply on route change (Frappe navigation)
  frappe.router.on("change", removeRestrictedElements);
})();


// ========================
// hide Supplier Quotation from items
// ========================
(function () {
  function removeUnwantedItems() {
    if (frappe.session.user === "Administrator") return;

    const dropdowns = document.querySelectorAll(".dropdown-menu");

    dropdowns.forEach((dropdown) => {
      const itemsToRemove = [
        // 🔹 Existing English labels
        "Supplier%20Quotation",
        "Quotation",
        "Material%20Request",
        "Bill%20of%20Materials",
        "Transit%20Entry",
        "Expired%20Batches",
        "Fetch%20Timesheet",
        "Product%20Bundle",

        // 🔹 NEW — Create menu (Purchase Receipt)
        "Landed%20Cost%20Voucher",
        "Retention%20Stock%20Entry",

        // 🔹 NEW — View menu
        "Asset",
        "Asset%20Movement",

        // 🔹 Existing Arabic labels
        "%D8%A7%D9%84%D8%AA%D8%B3%D8%B9%D9%8A%D8%B1%D8%A9%20%D9%85%D9%86%20%D8%A7%D9%84%D9%85%D9%88%D8%B1%D8%AF", // التسعيرة من المورد
        "%D8%B9%D8%B1%D8%B6%20%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1", // عرض أسعار
        "%D8%B7%D9%84%D8%A8%20%D9%85%D9%88%D8%A7%D8%AF", // طلب مواد
        "%D8%AF%D9%81%D8%B9%D8%A7%D8%AA%20%D9%85%D9%86%D8%AA%D9%87%D9%8A%D8%A9%20%D8%A7%D9%84%D8%B5%D9%84%D8%A7%D8%AD%D9%8A%D8%A9", // دفعات منتهية الصلاحية
        "%D9%81%D8%A7%D8%AA%D9%88%D8%B1%D8%A9%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%AF", // فاتورة المواد
        "%D8%AC%D9%84%D8%A8%20%D8%A7%D9%84%D8%AC%D8%AF%D9%88%D9%84%20%D8%A7%D9%84%D8%B2%D9%85%D9%86%D9%8A" // جلب الجدول الزمني
      ];

      itemsToRemove.forEach((label) => {
        const item = dropdown.querySelector(
          `a.dropdown-item[data-label="${label}"]`
        );
        if (item) item.remove();
      });
    });
  }

  // Run repeatedly (safe for dynamic menus)
  setInterval(removeUnwantedItems, 500);

  // Also run on route change
  frappe.router.on("change", () => {
    setTimeout(removeUnwantedItems, 1000);
  });
})();

// ========================
// hide TimeSheet
// ========================
(function () {
  function removeTimeSheet() {
    // Do nothing for Administrator
    if (frappe.session.user === "Administrator") return;
    
      const arabicBtn = document.querySelector('button[data-label="%D8%AC%D9%84%D8%A8%20%D8%A7%D9%84%D8%AC%D8%AF%D9%88%D9%84%20%D8%A7%D9%84%D8%B2%D9%85%D9%86%D9%8A"]');
      const englishBtn = document.querySelector('button[data-label="Fetch%20Timesheet"]');
      if (arabicBtn) arabicBtn.remove();
      if (englishBtn) englishBtn.remove();
 }

     // Run repeatedly (cheap and safe)
  setInterval(removeTimeSheet, 500);


// Also run on route changes
  frappe.router.on("change", () => {
    setTimeout(removeTimeSheet, 1000);
  });
})();


// ========================
// hide download report
// ========================
(function () {
  function removeDownloadReport() {
    if (frappe.session.user === "Administrator") return;
    // Target only the "Actions" dropdown
    const dropdowns = document.querySelectorAll(
      '.inner-group-button[data-label="Actions"] .dropdown-menu.show'
    );

    dropdowns.forEach((dropdown) => {
      const downloadItem = dropdown.querySelector(
        'a.dropdown-item[data-label="Download%20Report"]'
      );
      if (downloadItem) downloadItem.remove();
    });
  }

  // Run periodically because dropdown appears dynamically
  setInterval(removeDownloadReport, 500);

  // Also re-run after page/route changes
  frappe.router.on("change", () => {
    setTimeout(removeDownloadReport, 1000);
  });
})();

// ========================
// hide some buttons
// ========================
(function () {
  function cleanUserMenu() {
    if (frappe.session.user === "Administrator") return;
    const dropdown = document.querySelector("#toolbar-user");

    if (dropdown) {
      // Select and remove each unwanted element
      const selectors = [
        'a.dropdown-item[href="/app/user-profile"]',
        'button.dropdown-item[onclick*="setup_session_defaults"]',
        'button.dropdown-item[onclick*="view_website"]',
        'button.dropdown-item[onclick*="toggle_full_width"]',
        'button.dropdown-item[onclick*="apps"]'
      ];

      selectors.forEach((selector) => {
        const item = dropdown.querySelector(selector);
        if (item) item.remove();
      });
    }
  }

  // Run periodically (since Frappe menus load dynamically)
  setInterval(cleanUserMenu, 500);

  // Run again after route changes (for SPA navigation)
  frappe.router.on("change", () => {
    setTimeout(cleanUserMenu, 1000);
  });
})();


// ========================
// Add Footer
// ========================
(function () {
    function addFooter() {
        // Prevent duplicate footer
        if (document.querySelector("#custom-footer")) return;

        const lang = frappe.boot.lang || "en";
        const isArabic = lang === "ar";

        const footer = document.createElement("footer");
        footer.id = "custom-footer";

        // --- Arabic / English content ---
        const websiteName = isArabic ? "سالس" : "Salis";
        const contactLabel = isArabic ? "اتصل بنا" : "Contact";
        const email = "mfarouk@shiftits.com";
        const phone = "+20 122 399 9209";
        const rightsText = isArabic
            ? `© ${new Date().getFullYear()} جميع الحقوق محفوظة.`
            : `© ${new Date().getFullYear()} All rights reserved.`;

        footer.innerHTML = `
        <style>
            .footer-bottom {
                background-color: #1e3a8a;
                color: white;
                padding: 1rem;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                font-size: 0.95rem;
                direction: ${isArabic ? "rtl" : "ltr"};
            }

            .contact-line {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                gap: 250px;
            }

            .website-link {
                color: #ff9900;
                font-weight: 700;
                text-decoration: none;
            }

            .website-link:hover {
                color: white;
                text-decoration: underline;
            }

            .contact-item {
                display: flex;
                align-items: center;
                gap: 6px;
                color: white;
            }

            .contact-icon {
                width: 24px;
                height: 24px;
                background-color: #ff9900;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                color: white;
            }

            .copyright-line {
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.85rem;
                margin-top: 0.4rem;
            }
        </style>

        <div class="footer-bottom">
            <div class="contact-line">
                <a href="/app/home-page" class="website-link">${websiteName}</a>
                <div class="contact-item">
                    <div class="contact-icon">📞</div>
                    <span>${phone}</span>
                </div>
                <div class="contact-item">
                    <div class="contact-icon">✉️</div>
                    <span>${email}</span>
                </div>
                <div class="copyright-line">${rightsText}</div>
            </div>
        </div>
        `;

        document.body.appendChild(footer);
    }

    frappe.after_ajax(() => {
        addFooter();
    });

    window.addFooter = addFooter;
})();

// ========================
// Move moveBreadcrumbsAfterNavbarEnd
// ========================

(function () {
function moveBreadcrumbsAfterNavbarEnd() {
  const checkExist = setInterval(() => {
    // Get the container inside the main navbar
    const navbarContainer = document.querySelector("header.navbar .container");
    if (!navbarContainer) return;

    // Target the collapse section
    const navbarEnd = navbarContainer.querySelector("div.collapse.navbar-collapse.justify-content-end");
    // Target breadcrumbs
    const breadcrumbs = navbarContainer.querySelector("ul.nav.navbar-nav.d-none.d-sm-flex#navbar-breadcrumbs");

    // Both must exist before moving
    if (!navbarEnd || !breadcrumbs) return;

    // Check if breadcrumbs are already in the right place
    if (navbarEnd.nextElementSibling === breadcrumbs) {
      clearInterval(checkExist);
      return;
    }

    // ✅ Move breadcrumbs AFTER navbarEnd
    navbarEnd.insertAdjacentElement("afterend", breadcrumbs);

    clearInterval(checkExist);
  }, 300);
}
    frappe.after_ajax(() => {
        moveBreadcrumbsAfterNavbarEnd();
    });

})();

// ========================
// hideSectionsIfUserPage
// ========================

(function () {
    function hideSectionsIfUserPage() {
        // Don't hide for Administrator
        if (frappe.session.user === "Administrator") return;

        // Check URL contains /user (case-insensitive)
        if (!window.location.pathname.toLowerCase().includes("/user")) return;

        // Wait until form is fully rendered
        frappe.after_ajax(() => {

            // Section DOMs using their data-fieldname attributes
            const selectors = [
                '[data-fieldname="navigation_settings_section"]',
                '[data-fieldname="list_settings_section"]',
                '[data-fieldname="form_settings_section"]'
            ];

            selectors.forEach(sel => {
                const section = document.querySelector(sel);
                if (section) {
                    section.style.display = "none";
                }
            });
        });
    }

    // Run on page load + route change
    frappe.router.on('change', hideSectionsIfUserPage);
    hideSectionsIfUserPage();

})();

// ========================
// moveLabels
// ========================

(function () {
    function moveLabels() {
        

        const controls = document.querySelectorAll('.frappe-control');

        

        controls.forEach(control => {
            const label = control.querySelector('.control-label');
            const wrapper = control.querySelector('.control-input-wrapper');

            

            if (!label || !wrapper) {
                
                return;
            }

            // Prevent double moving
            if (wrapper.previousElementSibling === label) {
               
                return;
            }

            // move label before wrapper
            wrapper.parentNode.insertBefore(label, wrapper);

            
        });

        
    }

    // Run after AJAX (most forms)
    frappe.after_ajax(() => {
        
        setTimeout(moveLabels, 200);
    });

    // Run on route change
    frappe.router.on('change', () => {
        
        setTimeout(moveLabels, 300);
    });

    // Run when form refreshes (best hook)
    frappe.ui.form.on('*', {
        refresh(frm) {
            
            setTimeout(moveLabels, 300);
        }
    });

})();

// ========================
// remove from delivery not
// ========================

(function () {
  function removeQualityItems() {
    if (frappe.session.user === "Administrator") return;

    const dropdowns = document.querySelectorAll(".dropdown-menu.show");

    dropdowns.forEach((dropdown) => {
      const itemsToRemove = [
        "Quality%20Inspection(s)",
        "Packing%20Slip"
      ];

      itemsToRemove.forEach((label) => {
        const item = dropdown.querySelector(`a.dropdown-item[data-label="${label}"]`);
        if (item) item.remove();
      });
    });
  }

  // Run continuously because dropdown appears dynamically
  setInterval(removeQualityItems, 300);
})();

// ========================
// remove hide
// ========================
(function () {

  function removeHideSections() {
    // Only run on Document Naming Settings page
    if (window.location.pathname.toLowerCase().includes("/document-naming-settings")) {


      document.querySelectorAll(".section-body.hide").forEach(el => {
        el.classList.remove("hide");
      });

    }
  }

  // Run on route change
  if (frappe.router) {
    frappe.router.on("change", () => {
      setTimeout(removeHideSections, 700);
    });
  }

  // Run on initial load (FIXED)
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(removeHideSections, 1000);
  });

})();