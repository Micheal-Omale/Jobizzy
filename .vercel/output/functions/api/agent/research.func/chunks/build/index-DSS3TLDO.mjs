import { _ as __nuxt_component_0$1 } from './nuxt-link-DZJkgzcN.mjs';
import { defineComponent, mergeProps, computed, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { u as useAuth, a as useAnalytics } from './useAuth-DqhK3zbv.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../_/nitro.mjs';
import '@browserbasehq/stagehand';
import '@google/genai';
import 'pdfmake/src/printer.js';
import '@insforge/sdk/ssr';
import 'posthog-node';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@posthog/core/vendor/uuidv7';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import './server.mjs';
import 'vue-router';
import '@vue/shared';

const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "Hero",
  __ssrInlineRender: true,
  setup(__props) {
    const { isAuthenticated } = useAuth();
    const { track } = useAnalytics();
    const ctaTarget = computed(() => isAuthenticated.value ? "/dashboard" : "/login");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<!--[--><section class="relative overflow-hidden border-b-2 border-border"><div class="jz-dot-grid absolute inset-0 opacity-80" aria-hidden="true"></div><div class="relative mx-auto max-w-[1000px] px-7 pt-20 pb-[92px] text-center md:pt-[84px]"><div class="jz-frame-sm mb-[26px] inline-flex items-center gap-2 rounded-[22px] bg-good-soft px-3.5 py-[7px] text-[12.5px] font-semibold text-good-ink"><span class="h-2 w-2 rounded-full border-[1.5px] border-border bg-good"></span> Your AI job copilot </div><h1 class="m-0 font-display text-[40px] font-bold leading-[1.0] tracking-[-0.04em] text-text sm:text-[52px] md:text-[62px]"> Job hunting is hard.<br> Your tools <span class="text-accent">shouldn’t</span> be. </h1><p class="mx-auto mt-[22px] max-w-[560px] text-[18px] leading-[1.55] text-text-2"> Stop applying blind. Jobizzy finds the jobs, scores every role against your real skills, and researches the company before you apply. </p><div class="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(ctaTarget),
        class: "jz-frame jz-press rounded-[11px] bg-accent px-[26px] py-[15px] text-[16px] font-semibold text-white",
        onClick: ($event) => unref(track)("cta_clicked", { location: "hero", label: "Get Started", target: unref(ctaTarget) })
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Get Started → `);
          } else {
            return [
              createTextVNode(" Get Started → ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(ctaTarget),
        class: "jz-frame jz-press rounded-[11px] bg-surface-2 px-[26px] py-[15px] text-[16px] font-semibold text-text",
        onClick: ($event) => unref(track)("cta_clicked", { location: "hero", label: "Find Your First Match", target: unref(ctaTarget) })
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Find Your First Match `);
          } else {
            return [
              createTextVNode(" Find Your First Match ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></section><section class="border-b-2 border-border bg-surface-sunk px-7 py-14"><div class="mx-auto max-w-[1080px]"><div class="jz-frame-lg overflow-hidden rounded-[14px] bg-surface"><div class="flex items-center gap-[7px] border-b-2 border-border bg-surface-2 px-4 py-[11px]"><span class="h-[11px] w-[11px] rounded-full border-[1.5px] border-border" style="${ssrRenderStyle({ "background": "#ff5f57" })}"></span><span class="h-[11px] w-[11px] rounded-full border-[1.5px] border-border" style="${ssrRenderStyle({ "background": "#febc2e" })}"></span><span class="h-[11px] w-[11px] rounded-full border-[1.5px] border-border" style="${ssrRenderStyle({ "background": "#28c840" })}"></span><span class="mx-auto rounded-[6px] border-[1.5px] border-border-soft bg-surface-sunk px-3.5 py-1 font-mono text-[12px] text-text-3"> jobizzy.ai/dashboard </span></div><div class="grid grid-cols-2 gap-3.5 p-[22px] md:grid-cols-4"><div class="jz-frame-sm rounded-[10px] bg-surface-2 px-[15px] py-3.5"><div class="font-mono text-[10.5px] uppercase tracking-[0.04em] text-text-3">Total Jobs</div><div class="mt-[3px] font-display text-[26px] font-bold text-text">284</div><div class="mt-0.5 text-[11px] font-semibold text-good-ink">+12% ▲</div></div><div class="jz-frame-sm rounded-[10px] bg-surface-2 px-[15px] py-3.5"><div class="font-mono text-[10.5px] uppercase tracking-[0.04em] text-text-3">Avg Match</div><div class="mt-[3px] font-display text-[26px] font-bold text-text">82%</div><div class="mt-0.5 text-[11px] font-semibold text-good-ink">+3% ▲</div></div><div class="jz-frame-sm rounded-[10px] bg-surface-2 px-[15px] py-3.5"><div class="font-mono text-[10.5px] uppercase tracking-[0.04em] text-text-3">Researched</div><div class="mt-[3px] font-display text-[26px] font-bold text-text">35</div><div class="mt-0.5 text-[11px] font-semibold text-text-3">companies</div></div><div class="jz-frame-sm rounded-[10px] bg-accent px-[15px] py-3.5"><div class="font-mono text-[10.5px] uppercase tracking-[0.04em] text-white/85">This Week</div><div class="mt-[3px] font-display text-[26px] font-bold text-white">28</div><div class="mt-0.5 text-[11px] font-semibold text-white/85">new roles</div></div><div class="jz-frame-sm col-span-2 rounded-[10px] bg-surface-2 p-4"><div class="mb-3 text-[14px] font-bold text-text">Recent Activity</div><div class="flex flex-col gap-[11px]"><div class="flex items-center gap-2.5"><span class="h-[9px] w-[9px] rounded-full border-[1.5px] border-border bg-accent"></span><span class="text-[12.5px] text-text-2">Found 8 jobs for Frontend Engineer</span></div><div class="flex items-center gap-2.5"><span class="h-[9px] w-[9px] rounded-full border-[1.5px] border-border bg-info"></span><span class="text-[12.5px] text-text-2">Researched Stripe</span></div><div class="flex items-center gap-2.5"><span class="h-[9px] w-[9px] rounded-full border-[1.5px] border-border bg-good"></span><span class="text-[12.5px] text-text-2">Found 12 jobs for React Developer</span></div></div></div><div class="jz-frame-sm col-span-2 rounded-[10px] bg-surface-2 p-4"><div class="mb-3.5 text-[14px] font-bold text-text">Company Research</div><div class="flex h-[84px] items-end gap-[9px]"><div class="flex-1 rounded-t-[4px] border-[1.5px] border-border bg-info" style="${ssrRenderStyle({ "height": "24%" })}"></div><div class="flex-1 rounded-t-[4px] border-[1.5px] border-border bg-info" style="${ssrRenderStyle({ "height": "46%" })}"></div><div class="flex-1 rounded-t-[4px] border-[1.5px] border-border bg-info" style="${ssrRenderStyle({ "height": "34%" })}"></div><div class="flex-1 rounded-t-[4px] border-[1.5px] border-border bg-info" style="${ssrRenderStyle({ "height": "70%" })}"></div><div class="flex-1 rounded-t-[4px] border-[1.5px] border-border bg-accent" style="${ssrRenderStyle({ "height": "100%" })}"></div><div class="flex-1 rounded-t-[4px] border-[1.5px] border-border bg-info" style="${ssrRenderStyle({ "height": "52%" })}"></div><div class="flex-1 rounded-t-[4px] border-[1.5px] border-border bg-info" style="${ssrRenderStyle({ "height": "18%" })}"></div></div></div></div></div></div></section><!--]-->`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/homepage/Hero.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$4, { __name: "HomepageHero" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "Features",
  __ssrInlineRender: true,
  setup(__props) {
    const rows = [
      { company: "Vercel", match: 94, tier: "good", salary: "$160–200k", source: "IN" },
      { company: "Stripe", match: 88, tier: "info", salary: "$180–240k", source: "URL" },
      { company: "Linear", match: 96, tier: "good", salary: "$150–190k", source: "IN" },
      { company: "Notion", match: 72, tier: "fair", salary: "$130–170k", source: "IN" },
      { company: "OpenAI", match: 91, tier: "good", salary: "$200–280k", source: "IN" }
    ];
    const barClass = {
      good: "bg-good",
      info: "bg-info",
      fair: "bg-fair"
    };
    const inkClass = {
      good: "text-good-ink",
      info: "text-info-ink",
      fair: "text-fair-ink"
    };
    const manageFeatures = [
      {
        title: "Find jobs that actually fit",
        body: "Search by title and location, or paste a job link. Get matched roles you can scan in seconds."
      },
      {
        title: "Know the company before you apply",
        body: "Jobizzy browses a company's public pages and hands you a dossier — apply with confidence."
      },
      {
        title: "Keep track of every application",
        body: "A clear view of every job you've found, tailored — activity and progress in one place."
      }
    ];
    const applyFeatures = [
      {
        title: "Understand your match score",
        body: "See how your profile lines up with each role before you apply — what fits and what's missing."
      },
      {
        title: "AI-powered job matching",
        body: "Jobizzy scores every role against your actual skills, so you focus only on the ones that matter."
      },
      {
        title: "Focus on the right roles",
        body: "Filter out low-fit jobs. Spend less time sorting and more time applying."
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><section class="mx-auto grid max-w-[1140px] items-center gap-12 px-7 py-[84px] md:grid-cols-[1fr_1.15fr] md:gap-16"><div><div class="mb-4 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-accent-ink"> 01 — Find &amp; Track </div><h2 class="m-0 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-text md:text-[42px]"> Manage your job search with ease </h2><div class="mt-[30px] flex flex-col"><!--[-->`);
      ssrRenderList(manageFeatures, (feat, i) => {
        _push(`<div class="${ssrRenderClass([{ "border-b-2": i === manageFeatures.length - 1 }, "border-t-2 border-border-soft py-[18px]"])}"><div class="text-[16px] font-bold text-text">${ssrInterpolate(feat.title)}</div><div class="mt-[5px] text-[14.5px] leading-[1.5] text-text-2">${ssrInterpolate(feat.body)}</div></div>`);
      });
      _push(`<!--]--></div></div><div class="jz-frame-lg overflow-hidden rounded-[14px] bg-surface-2"><div class="grid grid-cols-[1.4fr_0.9fr_0.9fr_0.7fr] border-b-2 border-border bg-surface-sunk px-[18px] py-[13px] font-mono text-[10.5px] font-bold uppercase tracking-[0.05em] text-text-3"><span>Company</span><span>Match</span><span>Salary</span><span>Source</span></div><!--[-->`);
      ssrRenderList(rows, (row, i) => {
        _push(`<div class="${ssrRenderClass([{ "border-b-[1.5px] border-border-soft": i !== rows.length - 1 }, "grid grid-cols-[1.4fr_0.9fr_0.9fr_0.7fr] items-center px-[18px] py-3.5"])}"><span class="text-[13.5px] font-semibold text-text">${ssrInterpolate(row.company)}</span><span class="flex items-center gap-2"><span class="h-[9px] w-[46px] overflow-hidden rounded-[5px] border-[1.5px] border-border bg-surface"><span class="${ssrRenderClass([barClass[row.tier], "block h-full"])}" style="${ssrRenderStyle({ width: `${row.match}%` })}"></span></span><b class="${ssrRenderClass([inkClass[row.tier], "text-[13px]"])}">${ssrInterpolate(row.match)}%</b></span><span class="text-[12.5px] text-text-2">${ssrInterpolate(row.salary)}</span><span class="${ssrRenderClass([row.source === "IN" ? "bg-info-soft text-linkedin" : "bg-surface-sunk text-text-2", "rounded-[5px] border-[1.5px] border-border px-[7px] py-[3px] text-center font-mono text-[10px] font-bold"])}">${ssrInterpolate(row.source)}</span></div>`);
      });
      _push(`<!--]--></div></section><section class="border-y-2 border-border bg-surface-sunk"><div class="mx-auto grid max-w-[1140px] items-center gap-12 px-7 py-[84px] md:grid-cols-[1.15fr_1fr] md:gap-16"><div class="jz-frame-lg overflow-hidden rounded-[14px]" style="${ssrRenderStyle({ "background": "#161410" })}"><div class="flex items-center gap-2 border-b-2 px-4 py-3" style="${ssrRenderStyle({ "border-color": "#000", "background": "#0e0d0a" })}"><span class="h-[11px] w-[11px] rounded-full" style="${ssrRenderStyle({ "background": "#ff5f57" })}"></span><span class="h-[11px] w-[11px] rounded-full" style="${ssrRenderStyle({ "background": "#febc2e" })}"></span><span class="h-[11px] w-[11px] rounded-full" style="${ssrRenderStyle({ "background": "#28c840" })}"></span><span class="ml-2 font-mono text-[12px]" style="${ssrRenderStyle({ "color": "#8a857c" })}">agent_log.ts</span></div><div class="px-5 py-[22px] font-mono text-[13px] leading-[2.05]" style="${ssrRenderStyle({ "color": "#e8e4da" })}"><div><span style="${ssrRenderStyle({ "color": "#8a857c" })}">1</span>  <span style="${ssrRenderStyle({ "color": "#8b6dff" })}">[SYSTEM]</span> Initializing Jobizzy Agent…</div><div><span style="${ssrRenderStyle({ "color": "#8a857c" })}">2</span>  <span style="${ssrRenderStyle({ "color": "#c77dff" })}">[SCAN]</span> Found 14 matching roles</div><div><span style="${ssrRenderStyle({ "color": "#8a857c" })}">3</span>  ↳ Filtered out 3 roles (below salary cap)</div><div><span style="${ssrRenderStyle({ "color": "#8a857c" })}">4</span>  <span style="${ssrRenderStyle({ "color": "#4ade80" })}">[ACTION]</span> Tailoring resume for Stripe</div><div><span style="${ssrRenderStyle({ "color": "#8a857c" })}">5</span>  <span style="${ssrRenderStyle({ "color": "#fbbf24" })}">…</span> Generating cover letter</div></div></div><div><div class="mb-4 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-accent-ink"> 02 — Apply Smart </div><h2 class="m-0 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-text md:text-[42px]"> Apply with more confidence, every time </h2><div class="mt-[30px] flex flex-col"><!--[-->`);
      ssrRenderList(applyFeatures, (feat, i) => {
        _push(`<div class="${ssrRenderClass([{ "border-b-2": i === applyFeatures.length - 1 }, "border-t-2 border-border-soft py-[18px]"])}"><div class="text-[16px] font-bold text-text">${ssrInterpolate(feat.title)}</div><div class="mt-[5px] text-[14.5px] leading-[1.5] text-text-2">${ssrInterpolate(feat.body)}</div></div>`);
      });
      _push(`<!--]--></div></div></div></section><!--]-->`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/homepage/Features.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$3, { __name: "HomepageFeatures" });
const _sfc_main$2 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<section${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-[880px] px-7 py-[84px] text-center" }, _attrs))}><div class="mb-7 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-accent-ink"> Success Stories </div><p class="m-0 font-display text-[26px] font-medium leading-[1.32] tracking-[-0.02em] text-text md:text-[32px]"> “I used to spend my evenings copy-pasting resumes. Now I open my dashboard to see interviews waiting. Had <span class="rounded-[6px] border-2 border-border bg-good-soft px-2 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">3 offers</span> on the table simultaneously.” </p><div class="jz-frame mt-[34px] inline-flex items-center gap-[13px] rounded-[50px] bg-surface-2 py-2 pl-2 pr-[18px]"><span class="flex h-[42px] w-[42px] items-center justify-center rounded-full border-2 border-border font-display font-bold text-white" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,var(--color-accent),var(--color-info))" })}"> TW </span><div class="text-left"><div class="text-[14px] font-bold text-text">Tom Wilson</div><div class="text-[12.5px] text-text-3">Junior Developer</div></div></div></section>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/homepage/Testimonial.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender]]), { __name: "HomepageTestimonial" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BottomCta",
  __ssrInlineRender: true,
  setup(__props) {
    const { isAuthenticated } = useAuth();
    const { track } = useAnalytics();
    const ctaTarget = computed(() => isAuthenticated.value ? "/dashboard" : "/login");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "relative overflow-hidden border-t-2 border-border bg-accent" }, _attrs))}><div class="jz-dot-grid-light absolute inset-0" aria-hidden="true"></div><div class="relative mx-auto max-w-[780px] px-7 py-[84px] text-center"><h2 class="m-0 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-[46px]"> Your next job search can feel a lot less overwhelming </h2><p class="mx-auto mt-[18px] max-w-[480px] text-[17px] leading-[1.5]" style="${ssrRenderStyle({ "color": "#ede7ff" })}"> Set up your profile, upload your resume, and start finding matches in minutes. </p><div class="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(ctaTarget),
        class: "jz-frame jz-press rounded-[11px] bg-white px-7 py-[15px] text-[16px] font-bold text-accent-ink",
        onClick: ($event) => unref(track)("cta_clicked", { location: "bottom_cta", label: "Get Started", target: unref(ctaTarget) })
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Get Started → `);
          } else {
            return [
              createTextVNode(" Get Started → ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(ctaTarget),
        class: "rounded-[11px] border-2 border-white bg-transparent px-7 py-[15px] text-[16px] font-bold text-white transition-colors hover:bg-white/[0.12]",
        onClick: ($event) => unref(track)("cta_clicked", { location: "bottom_cta", label: "Find Your First Match", target: unref(ctaTarget) })
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Find Your First Match `);
          } else {
            return [
              createTextVNode(" Find Your First Match ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/homepage/BottomCta.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "HomepageBottomCta" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_HomepageHero = __nuxt_component_0;
      const _component_HomepageFeatures = __nuxt_component_1;
      const _component_HomepageTestimonial = __nuxt_component_2;
      const _component_HomepageBottomCta = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full bg-bg" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_HomepageHero, null, null, _parent));
      _push(ssrRenderComponent(_component_HomepageFeatures, null, null, _parent));
      _push(ssrRenderComponent(_component_HomepageTestimonial, null, null, _parent));
      _push(ssrRenderComponent(_component_HomepageBottomCta, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DSS3TLDO.mjs.map
