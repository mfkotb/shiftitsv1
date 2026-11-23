/**
 * Salis assistant panel: "Explain this screen" + "Ask" (searches help articles).
 * Everything comes from this site (shiftitsv1.assistant) — no external AI service.
 * Opened by the Assistant button in the top bar (event "salis:assistant-toggle").
 */
(() => {
	"use strict";
	if (!window.frappe?.ui || !frappe.router) return;

	const API = "shiftitsv1.assistant.";
	const esc = (s) => frappe.utils.escape_html(String(s ?? ""));
	const is_rtl = () => (frappe.boot.lang || "en").startsWith("ar");
	let $panel = null;
	let tab = "screen";
	let last_context = "";

	// What is on screen right now → arguments for get_screen_help
	function context() {
		const r = frappe.get_route() || [];
		if (r[0] === "Form" || r[0] === "List" || r[0] === "Tree" || r[0] === "Report") return { doctype: r[1] };
		if (r[0] === "query-report") return { report: r[1] };
		if (r[0]) return { page: r[0] };
		return {};
	}

	function build() {
		$panel = $(`
			<aside class="salis-assistant" dir="${is_rtl() ? "rtl" : "ltr"}" aria-label="${esc(__("Assistant"))}">
				<header>
					<div class="sa-title">${esc(__("Assistant"))}</div>
					<button type="button" class="sa-close" aria-label="${esc(__("Close"))}">×</button>
				</header>
				<nav class="sa-tabs">
					<button type="button" data-tab="screen" class="active">${esc(__("Explain this screen"))}</button>
					<button type="button" data-tab="ask">${esc(__("Ask"))}</button>
				</nav>
				<section class="sa-body sa-screen"></section>
				<section class="sa-body sa-ask hide">
					<form class="sa-search">
						<input type="search" placeholder="${esc(__("Type your question…"))}" autocomplete="off">
						<button type="submit">${esc(__("Search"))}</button>
					</form>
					<div class="sa-results"></div>
				</section>
			</aside>`).appendTo(document.body);

		$panel.on("click", ".sa-close", close);
		$panel.on("click", ".sa-tabs button", function () {
			show_tab($(this).data("tab"));
		});
		$panel.on("submit", ".sa-search", (e) => {
			e.preventDefault();
			ask($panel.find(".sa-search input").val());
		});
		let timer;
		$panel.on("input", ".sa-search input", function () {
			clearTimeout(timer);
			const q = this.value;
			timer = setTimeout(() => ask(q), 350);
		});
		$panel.on("click", "[data-article]", function (e) {
			e.preventDefault();
			open_article($(this).data("article"));
		});
		$panel.on("click", "[data-explain]", function (e) {
			e.preventDefault();
			show_tab("screen");
			render_screen({ doctype: $(this).data("explain") });
		});
		$panel.on("click", "[data-open]", function (e) {
			e.preventDefault();
			frappe.set_route("List", $(this).data("open"));
		});
		$panel.on("click", ".sa-back", () => ask($panel.find(".sa-search input").val()));
	}

	function show_tab(name) {
		tab = name;
		$panel.find(".sa-tabs button").removeClass("active").filter(`[data-tab="${name}"]`).addClass("active");
		$panel.find(".sa-screen").toggleClass("hide", name !== "screen");
		$panel.find(".sa-ask").toggleClass("hide", name !== "ask");
		if (name === "ask") setTimeout(() => $panel.find(".sa-search input").trigger("focus"), 50);
		else render_screen();
	}

	function list(items, cls = "") {
		return items?.length ? `<ul class="${cls}">${items.map((i) => `<li>${i}</li>`).join("")}</ul>` : "";
	}

	function render_screen(ctx) {
		ctx = ctx || context();
		last_context = JSON.stringify(ctx);
		const $b = $panel.find(".sa-screen").html(`<div class="sa-muted">${esc(__("Loading…"))}</div>`);
		frappe
			.xcall(API + "get_screen_help", ctx)
			.then((h) => {
				let html = `<h3>${esc(h.title)}</h3>`;
				if (h.summary) html += `<p class="sa-muted">${esc(h.summary)}</p>`;
				if (h.steps?.length) html += `<h4>${esc(__("How it works"))}</h4><ol>${h.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`;
				if (h.required?.length) html += `<h4>${esc(__("Required fields"))}</h4>` + list(h.required.map(esc), "sa-chips");
				for (const t of h.tables || []) {
					html += `<h4>${esc(__("Table"))}: ${esc(t.label)}</h4>`;
					if (t.required.length) html += `<p class="sa-muted">${esc(__("Each row"))}:</p>` + list(t.required.map(esc), "sa-chips");
				}
				if (h.sections?.length) html += `<h4>${esc(__("Sections"))}</h4>` + list(h.sections.map(esc), "sa-chips sa-light");
				if (h.related?.length) html += `<h4>${esc(__("Related screens"))}</h4>` + list(h.related.map(esc), "sa-chips sa-light");
				if (h.articles?.length) {
					html += `<h4>${esc(__("Step-by-step guides"))}</h4>` +
						list(h.articles.map((a) => `<a href="#" data-article="${esc(a.name)}">${esc(a.title)}</a>`), "sa-links");
				}
				$b.html(html);
			})
			.catch(() => $b.html(`<div class="sa-muted">${esc(__("No explanation available for this screen."))}</div>`));
	}

	function ask(q) {
		const $r = $panel.find(".sa-results");
		if (!q || !q.trim()) {
			$r.html(`<div class="sa-muted">${esc(__("Examples"))}: ${esc(__("how do I make a sales return?"))} · ${esc(__("opening balances"))} · ${esc(__("work order"))}</div>`);
			return;
		}
		frappe.xcall(API + "search", { q }).then((res) => {
			let html = "";
			for (const a of res.articles) {
				html += `<a href="#" class="sa-card" data-article="${esc(a.name)}">
					<div class="sa-card-title">${esc(a.title)}</div>
					<div class="sa-muted">${esc(a.snippet)}</div>
				</a>`;
			}
			for (const s of res.screens) {
				html += `<div class="sa-card sa-screen-hit">
					<div class="sa-card-title">${esc(s.label)}</div>
					<div class="sa-actions">
						<a href="#" data-explain="${esc(s.doctype)}">${esc(__("Explain"))}</a>
						<a href="#" data-open="${esc(s.doctype)}">${esc(__("Open"))}</a>
					</div>
				</div>`;
			}
			$r.html(html || `<div class="sa-muted">${esc(__("No answer found. Try other words, e.g. the screen name."))}</div>`);
		});
	}

	function open_article(name) {
		show_tab("ask");
		frappe.xcall(API + "get_article", { name }).then((a) => {
			let html = `<button type="button" class="sa-back">‹ ${esc(__("Back"))}</button>
				<h3>${esc(a.title)}</h3><div class="sa-article">${a.body || ""}</div>`;
			if (a.related_doctype) {
				html += `<div class="sa-actions"><a href="#" data-open="${esc(a.related_doctype)}">${esc(__("Open"))}: ${esc(__(a.related_doctype))}</a></div>`;
			}
			$panel.find(".sa-results").html(html);
		});
	}

	function open() {
		if (!$panel) build();
		$("body").addClass("salis-assistant-open");
		show_tab(tab);
		if (tab === "ask") ask($panel.find(".sa-search input").val());
	}
	function close() {
		$("body").removeClass("salis-assistant-open");
	}

	document.addEventListener("salis:assistant-toggle", () =>
		$("body").hasClass("salis-assistant-open") ? close() : open()
	);
	frappe.router.on("change", () => {
		if ($panel && $("body").hasClass("salis-assistant-open") && tab === "screen") {
			setTimeout(() => {
				if (JSON.stringify(context()) !== last_context) render_screen();
			}, 300);
		}
	});
	$(document).on("keydown", (e) => {
		if (e.key === "Escape" && $("body").hasClass("salis-assistant-open")) close();
	});
})();
