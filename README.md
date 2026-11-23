### Salis (shiftitsv1)

Simplified ERPNext desk by Shift ITs: custom top bar with module menus, a dashboard page,
a reports launcher, Arabic labels for accounts, and form customisations.

Targets **Frappe / ERPNext v16** (Python 3.14, Node 24).

### Installation

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app https://github.com/mfkotb/shiftitsv1.git --branch v16-refactor
bench --site your.site install-app shiftitsv1
bench --site your.site migrate
bench build --app shiftitsv1
```

### Layout

```
shiftitsv1/
├── hooks.py, api.py, modules.txt, patches.txt
├── public/js/shift.js          # desk UI (top bar, menus, hiding rules) — edit SALIS_CONFIG
├── public/js/*.js              # doctype form scripts
├── public/css/shift.css
├── translations/ar.csv
└── shiftitsv1/                 # module "ShiftITsV1"
    ├── custom/*.json           # Custom Fields + Property Setters (synced on migrate)
    ├── page/home_page/         # dashboard
    ├── page/reports/           # reports launcher
    └── web_template/footer/
```

### Adding a module to the top bar

Add one entry to `SALIS_CONFIG.modules` in `public/js/shift.js`
(and, if it has reports, a key in `SALIS_REPORTS` in `page/reports/reports.js`).

### Contributing

This app uses `pre-commit` (ruff, eslint, prettier):

```bash
cd apps/shiftitsv1
pre-commit install
```

### License

mit
