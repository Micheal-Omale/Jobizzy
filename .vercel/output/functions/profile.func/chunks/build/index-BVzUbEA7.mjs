import { defineComponent, mergeProps, ref, unref, computed, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
import { u as useJobs, f as formatRelativeTime } from './useJobs-DSRPZSOZ.mjs';
import { u as useAuth } from './useAuth-DqhK3zbv.mjs';
import './useInsforge-DhfvSzIK.mjs';
import '@insforge/sdk/ssr';
import './server.mjs';
import '../_/nitro.mjs';
import '@browserbasehq/stagehand';
import '@google/genai';
import 'pdfmake/src/printer.js';
import 'posthog-node';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@posthog/core/vendor/uuidv7';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue-router';
import '@vue/shared';

const labelClass = "mb-2 block font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-text-2";
const fieldClass = "flex items-center gap-2.5 rounded-[9px] border-2 border-border bg-surface-2 px-3.5 py-3";
const inputClass = "w-full bg-transparent text-[14.5px] font-medium text-text placeholder:text-text-3 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "SearchControls",
  __ssrInlineRender: true,
  setup(__props) {
    useJobs();
    const jobTitle = ref("");
    const location = ref("");
    const loading = ref(false);
    const result = ref(null);
    const errorMessage = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "jz-frame-lg rounded-[14px] bg-surface p-6" }, _attrs))}><div class="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"><div><label for="job-title" class="${ssrRenderClass(labelClass)}">Job Title</label><div class="${ssrRenderClass(fieldClass)}"><svg class="shrink-0 text-text-3" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></svg><input id="job-title"${ssrRenderAttr("value", unref(jobTitle))} type="text" placeholder="Frontend Engineer"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="${ssrRenderClass(inputClass)}"></div></div><div><label for="location" class="${ssrRenderClass(labelClass)}">Location</label><div class="${ssrRenderClass(fieldClass)}"><svg class="shrink-0 text-text-3" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z"></path><circle cx="12" cy="10" r="2.5"></circle></svg><input id="location"${ssrRenderAttr("value", unref(location))} type="text" placeholder="Remote, New York…"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="${ssrRenderClass(inputClass)}"></div></div><button type="button"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="jz-frame jz-press flex items-center justify-center gap-2.5 rounded-[9px] bg-accent px-6 py-3 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">`);
      if (unref(loading)) {
        _push(`<svg class="h-[17px] w-[17px] animate-spin" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56" stroke-linecap="round"></path></svg>`);
      } else {
        _push(`<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></svg>`);
      }
      _push(` ${ssrInterpolate(unref(loading) ? "Searching…" : "Find Jobs")}</button></div>`);
      if (unref(result)) {
        _push(`<div role="status" class="mt-4 flex items-center gap-2.5 rounded-[9px] border-2 border-border bg-good-soft px-[15px] py-3 text-[14px] font-semibold text-good-ink"><svg class="shrink-0" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 4.6L18.5 9l-4.6 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.4z"></path></svg> Found ${ssrInterpolate(unref(result).count)} ${ssrInterpolate(unref(result).count === 1 ? "job" : "jobs")} and saved ${ssrInterpolate(unref(result).strongMatches)} strong ${ssrInterpolate(unref(result).strongMatches === 1 ? "match" : "matches")}. </div>`);
      } else if (unref(errorMessage)) {
        _push(`<div role="alert" class="mt-4 rounded-[9px] border-2 border-border bg-error-soft px-[15px] py-3 text-[14px] font-semibold text-error">${ssrInterpolate(unref(errorMessage))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/find-jobs/SearchControls.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_0$1 = Object.assign(_sfc_main$4, { __name: "FindJobsSearchControls" });
const selectClass = "jz-frame cursor-pointer appearance-none rounded-[9px] border-2 border-border bg-surface py-[11px] pl-4 pr-9 text-[14px] font-semibold text-text focus:outline-none";
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "Filters",
  __ssrInlineRender: true,
  setup(__props) {
    const { query, matchFilter, sort } = useJobs();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-wrap items-center gap-3.5" }, _attrs))}><div class="jz-frame flex min-w-[240px] flex-1 items-center gap-2.5 rounded-[9px] border-2 border-border bg-surface px-3.5 py-[11px]"><svg class="shrink-0 text-text-3" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></svg><input${ssrRenderAttr("value", unref(query))} type="text" placeholder="Filter by company or role…" class="w-full bg-transparent text-[14px] text-text placeholder:text-text-3 focus:outline-none"></div><div class="relative"><select class="${ssrRenderClass(selectClass)}" aria-label="Match filter"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(matchFilter)) ? ssrLooseContain(unref(matchFilter), "all") : ssrLooseEqual(unref(matchFilter), "all")) ? " selected" : ""}>All Matches</option><option value="high"${ssrIncludeBooleanAttr(Array.isArray(unref(matchFilter)) ? ssrLooseContain(unref(matchFilter), "high") : ssrLooseEqual(unref(matchFilter), "high")) ? " selected" : ""}>High Match</option><option value="low"${ssrIncludeBooleanAttr(Array.isArray(unref(matchFilter)) ? ssrLooseContain(unref(matchFilter), "low") : ssrLooseEqual(unref(matchFilter), "low")) ? " selected" : ""}>Low Match</option></select><svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></div><div class="relative"><select class="${ssrRenderClass(selectClass)}" aria-label="Sort by"><option value="score"${ssrIncludeBooleanAttr(Array.isArray(unref(sort)) ? ssrLooseContain(unref(sort), "score") : ssrLooseEqual(unref(sort), "score")) ? " selected" : ""}>Match Score</option><option value="newest"${ssrIncludeBooleanAttr(Array.isArray(unref(sort)) ? ssrLooseContain(unref(sort), "newest") : ssrLooseEqual(unref(sort), "newest")) ? " selected" : ""}>Newest</option><option value="oldest"${ssrIncludeBooleanAttr(Array.isArray(unref(sort)) ? ssrLooseContain(unref(sort), "oldest") : ssrLooseEqual(unref(sort), "oldest")) ? " selected" : ""}>Oldest</option></select><svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/find-jobs/Filters.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$3, { __name: "FindJobsFilters" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "MatchScoreBar",
  __ssrInlineRender: true,
  props: {
    score: {}
  },
  setup(__props) {
    const props = __props;
    const fillClass = computed(() => {
      if (props.score >= 90) return "bg-good";
      if (props.score >= 80) return "bg-info";
      return "bg-fair";
    });
    const textClass = computed(() => {
      if (props.score >= 90) return "text-good-ink";
      if (props.score >= 80) return "text-info-ink";
      return "text-fair-ink";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center gap-[11px]" }, _attrs))}><span class="h-[13px] w-[90px] overflow-hidden rounded-[7px] border-2 border-border bg-surface-2"><span class="${ssrRenderClass([fillClass.value, "block h-full"])}" style="${ssrRenderStyle({ width: `${__props.score}%` })}"></span></span><b class="${ssrRenderClass([textClass.value, "font-display text-[17px]"])}">${ssrInterpolate(__props.score)}%</b></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/find-jobs/MatchScoreBar.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$2, { __name: "FindJobsMatchScoreBar" });
const PAGE_SIZE = 20;
const headClass = "px-[22px] py-[15px] text-left font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-text-3";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Table",
  __ssrInlineRender: true,
  setup(__props) {
    const { jobs, filteredJobs, loading, loaded, query, matchFilter, sort } = useJobs();
    const hasJobsButNoMatches = computed(() => jobs.value.length > 0 && filteredJobs.value.length === 0);
    const currentPage = ref(1);
    watch([filteredJobs, query, matchFilter, sort], () => {
      currentPage.value = 1;
    });
    const total = computed(() => filteredJobs.value.length);
    const pageCount = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));
    const pagedJobs = computed(() => {
      const start = (currentPage.value - 1) * PAGE_SIZE;
      return filteredJobs.value.slice(start, start + PAGE_SIZE);
    });
    const rangeStart = computed(() => total.value === 0 ? 0 : (currentPage.value - 1) * PAGE_SIZE + 1);
    const rangeEnd = computed(() => Math.min(currentPage.value * PAGE_SIZE, total.value));
    const pageItems = computed(() => {
      const count = pageCount.value;
      const cur = currentPage.value;
      if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
      const items = [1];
      const start = Math.max(2, cur - 1);
      const end = Math.min(count - 1, cur + 1);
      if (start > 2) items.push("…");
      for (let p = start; p <= end; p++) items.push(p);
      if (end < count - 1) items.push("…");
      items.push(count);
      return items;
    });
    function initial(company) {
      return (company ?? "—").charAt(0).toUpperCase();
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FindJobsMatchScoreBar = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "jz-frame-lg overflow-hidden rounded-[14px] bg-surface" }, _attrs))}><div class="overflow-x-auto"><table class="w-full min-w-[760px] border-collapse"><thead class="border-b-2 border-border bg-surface-sunk"><tr><th scope="col" class="${ssrRenderClass(headClass)}">Company</th><th scope="col" class="${ssrRenderClass(headClass)}">Role</th><th scope="col" class="${ssrRenderClass(headClass)}">Match Score</th><th scope="col" class="${ssrRenderClass(headClass)}">Salary Est.</th><th scope="col" class="${ssrRenderClass(headClass)}">Date Found</th></tr></thead><tbody>`);
      if (unref(loading) && !unref(loaded)) {
        _push(`<tr><td colspan="5" class="px-[22px] py-12 text-center text-[14px] text-text-2"> Loading jobs… </td></tr>`);
      } else if (unref(loaded) && unref(hasJobsButNoMatches)) {
        _push(`<tr><td colspan="5" class="px-[22px] py-12 text-center"><p class="text-[14px] font-semibold text-text">No matching jobs</p><p class="mt-1 text-[13px] text-text-2"> Try adjusting your filters or search to see more results. </p></td></tr>`);
      } else if (unref(loaded) && unref(total) === 0) {
        _push(`<tr><td colspan="5" class="px-[22px] py-12 text-center"><p class="text-[14px] font-semibold text-text">No jobs yet</p><p class="mt-1 text-[13px] text-text-2"> Run a search above to discover roles matched to your profile. </p></td></tr>`);
      } else {
        _push(`<!--[-->`);
        ssrRenderList(unref(pagedJobs), (job) => {
          _push(`<tr class="cursor-pointer border-b-[1.5px] border-border-soft hover:bg-surface-sunk"><td class="px-[22px] py-[17px]"><div class="flex items-center gap-[11px]"><span class="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border-2 border-border bg-surface-2 font-display text-[15px] font-bold text-text">${ssrInterpolate(initial(job.company))}</span><b class="text-[14.5px] text-text">${ssrInterpolate(job.company ?? "—")}</b></div></td><td class="px-[22px] py-[17px] text-[14px] text-text-2">${ssrInterpolate(job.title ?? "—")}</td><td class="px-[22px] py-[17px]">`);
          _push(ssrRenderComponent(_component_FindJobsMatchScoreBar, {
            score: job.match_score ?? 0
          }, null, _parent));
          _push(`</td><td class="px-[22px] py-[17px] text-[13.5px] text-text-2">${ssrInterpolate(job.salary ?? "—")}</td><td class="px-[22px] py-[17px] font-mono text-[12px] text-text-3">${ssrInterpolate(unref(formatRelativeTime)(job.found_at))}</td></tr>`);
        });
        _push(`<!--]-->`);
      }
      _push(`</tbody></table></div>`);
      if (unref(total) > 0) {
        _push(`<div class="flex flex-col gap-3 border-t-2 border-border bg-surface-sunk px-[22px] py-4 sm:flex-row sm:items-center sm:justify-between"><p class="text-[13px] text-text-2"> Showing <b class="text-text">${ssrInterpolate(unref(rangeStart))}</b>–<b class="text-text">${ssrInterpolate(unref(rangeEnd))}</b> of <b class="text-text">${ssrInterpolate(unref(total))}</b> results </p>`);
        if (unref(pageCount) > 1) {
          _push(`<div class="flex items-center gap-[7px]"><button type="button"${ssrIncludeBooleanAttr(unref(currentPage) === 1) ? " disabled" : ""} class="rounded-lg border-2 border-border-soft px-[13px] py-[7px] text-[13px] font-semibold text-text-3 hover:text-text disabled:cursor-not-allowed disabled:opacity-50"> Previous </button><!--[-->`);
          ssrRenderList(unref(pageItems), (page, i) => {
            _push(`<button type="button"${ssrIncludeBooleanAttr(page === "…") ? " disabled" : ""} class="${ssrRenderClass([
              page === unref(currentPage) ? "border-2 border-border bg-accent text-white" : page === "…" ? "cursor-default text-text-3" : "border-2 border-border bg-surface text-text hover:bg-surface-sunk",
              "rounded-lg px-[13px] py-[7px] text-[13px] font-semibold"
            ])}">${ssrInterpolate(page)}</button>`);
          });
          _push(`<!--]--><button type="button"${ssrIncludeBooleanAttr(unref(currentPage) === unref(pageCount)) ? " disabled" : ""} class="rounded-lg border-2 border-border bg-surface px-[13px] py-[7px] text-[13px] font-semibold text-text hover:bg-surface-sunk disabled:cursor-not-allowed disabled:opacity-50"> Next </button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/find-jobs/Table.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "FindJobsTable" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    useJobs();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FindJobsSearchControls = __nuxt_component_0$1;
      const _component_FindJobsFilters = __nuxt_component_1;
      const _component_FindJobsTable = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-[1240px] px-7 pt-[38px] pb-16" }, _attrs))}><h1 class="mb-[22px] font-display text-[36px] font-bold tracking-[-0.03em] text-text">Find Jobs</h1>`);
      _push(ssrRenderComponent(_component_FindJobsSearchControls, null, null, _parent));
      _push(`<div class="mt-[18px]">`);
      _push(ssrRenderComponent(_component_FindJobsFilters, null, null, _parent));
      _push(`</div><div class="mt-[18px]">`);
      _push(ssrRenderComponent(_component_FindJobsTable, null, null, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/find-jobs/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BVzUbEA7.mjs.map
