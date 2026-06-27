import { _ as __nuxt_component_0 } from './nuxt-link-DZJkgzcN.mjs';
import { defineComponent, computed, ref, withCtx, openBlock, createBlock, createVNode, createTextVNode, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useJobs, f as formatRelativeTime } from './useJobs-DSRPZSOZ.mjs';
import { useRoute } from 'vue-router';
import { u as useAuth } from './useAuth-DqhK3zbv.mjs';
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
import '@vue/shared';
import './useInsforge-DhfvSzIK.mjs';

const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "Header",
  __ssrInlineRender: true,
  props: {
    job: {}
  },
  setup(__props) {
    const props = __props;
    const matchScore = computed(() => props.job.match_score ?? 0);
    const tier = computed(() => {
      if (matchScore.value >= 90) return "good";
      if (matchScore.value >= 80) return "info";
      return "fair";
    });
    const pillClass = computed(() => {
      const map = {
        good: "bg-good-soft text-good-ink",
        info: "bg-info-soft text-info-ink",
        fair: "bg-fair-soft text-fair-ink"
      };
      return map[tier.value];
    });
    const dotClass = computed(() => {
      const map = {
        good: "bg-good",
        info: "bg-info",
        fair: "bg-fair"
      };
      return map[tier.value];
    });
    const jobPostUrl = computed(
      () => props.job.external_apply_url ?? props.job.source_url ?? null
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "jz-frame-lg flex flex-wrap items-center gap-5 rounded-[14px] bg-surface p-6" }, _attrs))}><div class="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-[13px] border-2 border-border bg-surface-2 text-text-2"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14"></path><path d="M9 9h.01M12 9h.01M15 9h.01M9 13h.01M12 13h.01M15 13h.01"></path></svg></div><div class="min-w-[200px] flex-1"><h1 class="font-display text-[30px] font-bold tracking-[-0.03em] text-text">${ssrInterpolate(__props.job.title ?? "—")}</h1><div class="mt-[7px] flex flex-wrap items-center gap-[11px]"><span class="text-[15px] font-medium text-text-2">${ssrInterpolate(__props.job.company ?? "—")}</span><span class="${ssrRenderClass([pillClass.value, "inline-flex items-center gap-1.5 rounded-[7px] border-2 border-border px-2.5 py-1 text-[12.5px] font-bold"])}"><span class="${ssrRenderClass([dotClass.value, "h-[7px] w-[7px] rounded-full border-[1.5px] border-border"])}"></span> ${ssrInterpolate(matchScore.value)}% Match Score </span></div></div>`);
      if (jobPostUrl.value) {
        _push(`<a${ssrRenderAttr("href", jobPostUrl.value)} target="_blank" rel="noopener noreferrer" class="jz-frame jz-press inline-flex shrink-0 items-center gap-2.5 rounded-[9px] bg-surface-2 px-[17px] py-[11px] text-[14px] font-semibold text-text"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h14a1 1 0 001-1v-4"></path></svg> View Job Post </a>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/job-details/Header.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$6, { __name: "JobDetailsHeader" });
const cardClass = "jz-frame flex items-center gap-3 rounded-[12px] bg-surface p-4";
const chipClass = "flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] border-2 border-border";
const valueClass = "truncate font-display text-[15px] font-bold text-text";
const labelClass = "mt-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-text-3";
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "InfoCards",
  __ssrInlineRender: true,
  props: {
    job: {}
  },
  setup(__props) {
    const props = __props;
    const jobType = computed(() => {
      const raw = props.job.job_type;
      if (!raw) return "—";
      const map = {
        fulltime: "Full-time",
        parttime: "Part-time",
        contract: "Contract",
        permanent: "Permanent"
      };
      return map[raw] ?? raw.charAt(0).toUpperCase() + raw.slice(1);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid grid-cols-2 gap-3.5 lg:grid-cols-4" }, _attrs))}><div class="${ssrRenderClass(cardClass)}"><span class="${ssrRenderClass([chipClass, "bg-good-soft text-good-ink"])}"><span class="text-[15px] font-bold">$</span></span><div class="min-w-0"><p class="${ssrRenderClass(valueClass)}">${ssrInterpolate(__props.job.salary ?? "—")}</p><p class="${ssrRenderClass(labelClass)}">Salary Est.</p></div></div><div class="${ssrRenderClass(cardClass)}"><span class="${ssrRenderClass([chipClass, "bg-info-soft text-info-ink"])}"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z"></path><circle cx="12" cy="10" r="2.5"></circle></svg></span><div class="min-w-0"><p class="${ssrRenderClass(valueClass)}">${ssrInterpolate(__props.job.location ?? "—")}</p><p class="${ssrRenderClass(labelClass)}">Location</p></div></div><div class="${ssrRenderClass(cardClass)}"><span class="${ssrRenderClass([chipClass, "bg-accent-soft text-accent-ink"])}"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg></span><div class="min-w-0"><p class="${ssrRenderClass(valueClass)}">${ssrInterpolate(jobType.value)}</p><p class="${ssrRenderClass(labelClass)}">Job Type</p></div></div><div class="${ssrRenderClass(cardClass)}"><span class="${ssrRenderClass([chipClass, "bg-surface-sunk text-text-2"])}"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M3 9h18M8 2v4M16 2v4"></path></svg></span><div class="min-w-0"><p class="${ssrRenderClass(valueClass)}">${ssrInterpolate(unref(formatRelativeTime)(__props.job.found_at))}</p><p class="${ssrRenderClass(labelClass)}">Date Found</p></div></div></div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/job-details/InfoCards.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$5, { __name: "JobDetailsInfoCards" });
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "MatchReasoning",
  __ssrInlineRender: true,
  props: {
    job: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "jz-frame rounded-[14px] bg-surface p-6" }, _attrs))}><div class="mb-3.5 flex items-center gap-2.5"><span class="flex h-[30px] w-[30px] items-center justify-center rounded-lg border-2 border-border bg-good-soft text-good-ink"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 4.6L18.5 9l-4.6 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.4z"></path></svg></span><h2 class="font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-good-ink"> AI Match Reasoning </h2></div><p class="text-[15.5px] leading-[1.65] text-text">${ssrInterpolate(__props.job.match_reason ?? "No match reasoning available for this job yet.")}</p></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/job-details/MatchReasoning.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$4, { __name: "JobDetailsMatchReasoning" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "SkillsComparison",
  __ssrInlineRender: true,
  props: {
    job: {}
  },
  setup(__props) {
    const props = __props;
    const matchedSkills = computed(() => props.job.matched_skills ?? []);
    const missingSkills = computed(() => props.job.missing_skills ?? []);
    const hasSkills = computed(
      () => matchedSkills.value.length > 0 || missingSkills.value.length > 0
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "jz-frame rounded-[14px] bg-surface p-6" }, _attrs))}><h2 class="mb-[18px] font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-text-2"> Required Skills vs Your Profile </h2>`);
      if (!hasSkills.value) {
        _push(`<p class="text-[14px] text-text-2"> No skill comparison available for this job yet. </p>`);
      } else {
        _push(`<!--[-->`);
        if (matchedSkills.value.length) {
          _push(`<div class="mb-1"><div class="mb-2.5 flex items-center gap-2"><span class="flex h-5 w-5 items-center justify-center rounded-md border-2 border-border bg-good"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L19 7"></path></svg></span><span class="text-[13.5px] font-bold text-good-ink">You have</span></div><div class="flex flex-wrap gap-2.5"><!--[-->`);
          ssrRenderList(matchedSkills.value, (skill) => {
            _push(`<span class="rounded-lg border-2 border-border bg-good-soft px-[13px] py-[7px] text-[13px] font-semibold text-good-ink"> ✓ ${ssrInterpolate(skill)}</span>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (missingSkills.value.length) {
          _push(`<div class="${ssrRenderClass(matchedSkills.value.length ? "mt-5" : "")}"><div class="mb-2.5 flex items-center gap-2"><span class="flex h-5 w-5 items-center justify-center rounded-md border-2 border-border bg-fair"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></span><span class="text-[13.5px] font-bold text-fair-ink">Gap skills</span></div><div class="flex flex-wrap gap-2.5"><!--[-->`);
          ssrRenderList(missingSkills.value, (skill) => {
            _push(`<span class="rounded-lg border-2 border-border bg-fair-soft px-[13px] py-[7px] text-[13px] font-semibold text-fair-ink"> ✕ ${ssrInterpolate(skill)}</span>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/job-details/SkillsComparison.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$3, { __name: "JobDetailsSkillsComparison" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "JobDescription",
  __ssrInlineRender: true,
  props: {
    job: {}
  },
  setup(__props) {
    const props = __props;
    const description = computed(() => props.job.about_role);
    const isTruncated = computed(() => {
      const text = description.value?.trimEnd() ?? "";
      return text.endsWith("…") || text.endsWith("...");
    });
    const postingUrl = computed(
      () => props.job.external_apply_url ?? props.job.source_url ?? null
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "jz-frame rounded-[14px] bg-surface p-6" }, _attrs))}><div class="mb-3.5 flex items-center gap-2.5"><span class="flex h-[30px] w-[30px] items-center justify-center rounded-lg border-2 border-border bg-surface-sunk text-text-2"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><path d="M14 2v6h6M9 13h6M9 17h6"></path></svg></span><h2 class="font-display text-[18px] font-bold text-text">Job Description</h2></div><p class="whitespace-pre-line text-[15px] leading-[1.7] text-text-2">${ssrInterpolate(description.value ?? "No job description available.")}</p>`);
      if (isTruncated.value && postingUrl.value) {
        _push(`<div class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t-2 border-border-soft pt-4 text-[13px]"><span class="text-text-3">This is a preview from the job board.</span><a${ssrRenderAttr("href", postingUrl.value)} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 font-semibold text-accent-ink hover:text-accent"> Read the full description <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg></a></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/job-details/JobDescription.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main$2, { __name: "JobDetailsJobDescription" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "CompanyResearch",
  __ssrInlineRender: true,
  props: {
    job: {}
  },
  emits: ["update:companyResearch"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const company = computed(() => props.job.company ?? "this company");
    const dossier = computed(() => props.job.company_research);
    const loading = ref(false);
    const errorMsg = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "jz-frame rounded-[14px] bg-surface p-6" }, _attrs))}><div class="mb-[18px] flex flex-wrap items-center justify-between gap-3"><div class="flex items-center gap-2.5"><span class="flex h-[30px] w-[30px] items-center justify-center rounded-lg border-2 border-border bg-accent-soft text-accent-ink"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14"></path></svg></span><h2 class="font-display text-[18px] font-bold text-text">Company Research</h2></div>`);
      if (!dossier.value) {
        _push(`<button type="button"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} class="jz-frame jz-press inline-flex shrink-0 items-center gap-2 rounded-[9px] bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">`);
        if (loading.value) {
          _push(`<svg class="h-[15px] w-[15px] animate-spin" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56" stroke-linecap="round"></path></svg>`);
        } else {
          _push(`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></svg>`);
        }
        _push(` ${ssrInterpolate(loading.value ? "Researching…" : "Research Company")}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (errorMsg.value) {
        _push(`<div role="alert" class="mb-4 rounded-[9px] border-2 border-border bg-error-soft px-4 py-3 text-[13px] font-semibold text-error">${ssrInterpolate(errorMsg.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (!dossier.value) {
        _push(`<div class="rounded-xl border-2 border-dashed border-border-soft bg-surface-sunk px-6 py-[42px] text-center"><div class="mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[13px] border-2 border-border bg-surface text-text-3"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14"></path></svg></div><p class="font-display text-[17px] font-bold text-text">No research yet</p><p class="mx-auto mt-1.5 max-w-[340px] text-[14px] leading-[1.5] text-text-2"> Click &quot;Research Company&quot; to let the AI browse ${ssrInterpolate(company.value)}&#39;s public pages and build a dossier. </p></div>`);
      } else {
        _push(`<div class="flex flex-col gap-6">`);
        if (dossier.value.companyOverview) {
          _push(`<div><h3 class="mb-2 text-[14px] font-bold text-text">Company Overview</h3><p class="text-[14px] leading-relaxed text-text-2">${ssrInterpolate(dossier.value.companyOverview)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (dossier.value.techStack?.length) {
          _push(`<div><h3 class="mb-2 text-[14px] font-bold text-text">Tech Stack</h3><div class="flex flex-wrap gap-2"><!--[-->`);
          ssrRenderList(dossier.value.techStack, (tech) => {
            _push(`<span class="rounded-md border-2 border-border bg-surface-2 px-2.5 py-1 text-[13px] font-medium text-text-2">${ssrInterpolate(tech)}</span>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (dossier.value.culture?.length) {
          _push(`<div><h3 class="mb-2 text-[14px] font-bold text-text">Culture &amp; Values</h3><ul class="list-disc space-y-1 pl-5"><!--[-->`);
          ssrRenderList(dossier.value.culture, (c) => {
            _push(`<li class="text-[14px] text-text-2">${ssrInterpolate(c)}</li>`);
          });
          _push(`<!--]--></ul></div>`);
        } else {
          _push(`<!---->`);
        }
        if (dossier.value.whyThisRole) {
          _push(`<div><h3 class="mb-2 text-[14px] font-bold text-text">Why This Role</h3><p class="text-[14px] leading-relaxed text-text-2">${ssrInterpolate(dossier.value.whyThisRole)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (dossier.value.yourEdge?.length) {
          _push(`<div class="rounded-xl border-2 border-border bg-accent-soft p-4"><h3 class="mb-2 flex items-center gap-2 text-[14px] font-bold text-accent-ink"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg> Your Edge </h3><ul class="list-disc space-y-1 pl-5"><!--[-->`);
          ssrRenderList(dossier.value.yourEdge, (edge) => {
            _push(`<li class="text-[14px] text-text-2">${ssrInterpolate(edge)}</li>`);
          });
          _push(`<!--]--></ul></div>`);
        } else {
          _push(`<!---->`);
        }
        if (dossier.value.gapsToAddress?.length) {
          _push(`<div><h3 class="mb-2 text-[14px] font-bold text-text">Gaps to Address</h3><ul class="list-disc space-y-1 pl-5"><!--[-->`);
          ssrRenderList(dossier.value.gapsToAddress, (gap) => {
            _push(`<li class="text-[14px] text-text-2">${ssrInterpolate(gap)}</li>`);
          });
          _push(`<!--]--></ul></div>`);
        } else {
          _push(`<!---->`);
        }
        if (dossier.value.smartQuestions?.length) {
          _push(`<div><h3 class="mb-2 text-[14px] font-bold text-text">Smart Questions</h3><ul class="list-disc space-y-1 pl-5"><!--[-->`);
          ssrRenderList(dossier.value.smartQuestions, (q) => {
            _push(`<li class="text-[14px] italic text-text-2"> &quot;${ssrInterpolate(q)}&quot; </li>`);
          });
          _push(`<!--]--></ul></div>`);
        } else {
          _push(`<!---->`);
        }
        if (dossier.value.interviewPrep?.length) {
          _push(`<div><h3 class="mb-2 text-[14px] font-bold text-text">Interview Prep</h3><ul class="list-disc space-y-1 pl-5"><!--[-->`);
          ssrRenderList(dossier.value.interviewPrep, (prep) => {
            _push(`<li class="text-[14px] text-text-2">${ssrInterpolate(prep)}</li>`);
          });
          _push(`<!--]--></ul></div>`);
        } else {
          _push(`<!---->`);
        }
        if (dossier.value.sources?.length) {
          _push(`<div class="mt-4 border-t-2 border-border-soft pt-4"><p class="mb-2 font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-text-3">Sources</p><div class="flex flex-wrap gap-2"><!--[-->`);
          ssrRenderList(dossier.value.sources, (src) => {
            _push(`<a${ssrRenderAttr("href", src)} target="_blank" rel="noopener noreferrer" class="break-all font-mono text-[12px] text-accent-ink hover:underline">${ssrInterpolate(src)}</a>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/job-details/CompanyResearch.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_6 = Object.assign(_sfc_main$1, { __name: "JobDetailsCompanyResearch" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    computed(() => String(route.params.id));
    useAuth();
    useJobs();
    const job = ref(null);
    const loading = ref(true);
    const applyUrl = computed(
      () => job.value?.external_apply_url ?? job.value?.source_url ?? null
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_JobDetailsHeader = __nuxt_component_1;
      const _component_JobDetailsInfoCards = __nuxt_component_2;
      const _component_JobDetailsMatchReasoning = __nuxt_component_3;
      const _component_JobDetailsSkillsComparison = __nuxt_component_4;
      const _component_JobDetailsJobDescription = __nuxt_component_5;
      const _component_JobDetailsCompanyResearch = __nuxt_component_6;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="mx-auto max-w-[920px] px-7 pt-[34px] pb-[120px]">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/find-jobs",
        class: "mb-5 inline-flex w-fit items-center gap-[7px] text-[14px] font-semibold text-text-2 hover:text-accent-ink"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${_scopeId}><path d="m15 18-6-6 6-6"${_scopeId}></path></svg> Back to Jobs `);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                class: "h-4 w-4",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2.2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                "aria-hidden": "true"
              }, [
                createVNode("path", { d: "m15 18-6-6 6-6" })
              ])),
              createTextVNode(" Back to Jobs ")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(loading)) {
        _push(`<div class="flex flex-col gap-[18px]"><div class="jz-frame h-28 animate-pulse rounded-[14px] bg-surface-sunk"></div><div class="jz-frame h-20 animate-pulse rounded-[14px] bg-surface-sunk"></div><div class="jz-frame h-40 animate-pulse rounded-[14px] bg-surface-sunk"></div></div>`);
      } else if (!unref(job)) {
        _push(`<div class="jz-frame-lg rounded-[14px] bg-surface p-6 text-center"><p class="font-display text-[18px] font-bold text-text">Job not found</p><p class="mt-1.5 text-[14px] text-text-2"> This job doesn&#39;t exist or isn&#39;t in your list. </p></div>`);
      } else {
        _push(`<div class="flex flex-col gap-[18px]">`);
        _push(ssrRenderComponent(_component_JobDetailsHeader, { job: unref(job) }, null, _parent));
        _push(ssrRenderComponent(_component_JobDetailsInfoCards, { job: unref(job) }, null, _parent));
        _push(ssrRenderComponent(_component_JobDetailsMatchReasoning, { job: unref(job) }, null, _parent));
        _push(ssrRenderComponent(_component_JobDetailsSkillsComparison, { job: unref(job) }, null, _parent));
        _push(ssrRenderComponent(_component_JobDetailsJobDescription, { job: unref(job) }, null, _parent));
        _push(ssrRenderComponent(_component_JobDetailsCompanyResearch, { job: unref(job) }, null, _parent));
        _push(`</div>`);
      }
      _push(`</div>`);
      if (!unref(loading) && unref(job)) {
        _push(`<div class="sticky bottom-0 z-40 border-t-2 border-border bg-surface"><div class="mx-auto max-w-[920px] px-7 py-3.5">`);
        if (unref(applyUrl)) {
          _push(`<a${ssrRenderAttr("href", unref(applyUrl))} target="_blank" rel="noopener noreferrer" class="jz-frame jz-press block w-full rounded-[11px] bg-accent px-6 py-[15px] text-center font-display text-[16px] font-bold text-white"> Apply Now${ssrInterpolate(unref(job).company ? ` at ${unref(job).company}` : "")} → </a>`);
        } else {
          _push(`<button type="button" disabled class="block w-full cursor-not-allowed rounded-[11px] border-2 border-border bg-accent px-6 py-[15px] text-center font-display text-[16px] font-bold text-white opacity-60"> Apply Now </button>`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/find-jobs/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-BjqHDqTN.mjs.map
