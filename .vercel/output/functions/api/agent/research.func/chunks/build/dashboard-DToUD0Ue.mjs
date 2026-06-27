import { _ as __nuxt_component_0$1 } from './nuxt-link-DZJkgzcN.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrRenderAttr } from 'vue/server-renderer';
import { u as useJobs, f as formatRelativeTime, n as niceChartMax } from './useJobs-DSRPZSOZ.mjs';
import { u as useInsforge } from './useInsforge-DhfvSzIK.mjs';
import { u as useAuth } from './useAuth-DqhK3zbv.mjs';
import { a as useState } from './server.mjs';
import { u as useProfile } from './useProfile-BIz0kmkh.mjs';
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
import 'vue-router';
import '@vue/shared';

const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "StatCard",
  __ssrInlineRender: true,
  props: {
    label: {},
    value: {},
    note: {},
    trend: {},
    trendPositive: { type: Boolean, default: true },
    accent: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const pillClass = computed(
      () => props.trendPositive ? "bg-good-soft text-good-ink" : "bg-error-soft text-error"
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["jz-frame rounded-[13px] p-5", __props.accent ? "bg-accent" : "bg-surface"]
      }, _attrs))}><div class="${ssrRenderClass([__props.accent ? "text-white/85" : "text-text-3", "font-mono text-[11px] uppercase tracking-[0.05em]"])}">${ssrInterpolate(__props.label)}</div><div class="${ssrRenderClass([__props.accent ? "text-white" : "text-text", "mt-1.5 font-display text-[40px] font-bold leading-[1.05]"])}">${ssrInterpolate(__props.value)}</div>`);
      if (__props.trend) {
        _push(`<div class="${ssrRenderClass([unref(pillClass), "mt-2 inline-flex items-center gap-[5px] rounded-md border-[1.5px] border-border px-2 py-[3px] text-[12px] font-bold"])}">${ssrInterpolate(__props.trend)} <span aria-hidden="true">${ssrInterpolate(__props.trendPositive ? "▲" : "▼")}</span><span class="font-medium text-text-3">${ssrInterpolate(__props.note)}</span></div>`);
      } else {
        _push(`<div class="${ssrRenderClass([__props.accent ? "text-white/85" : "text-text-3", "mt-2.5 text-[12px] font-medium"])}">${ssrInterpolate(__props.note)}</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/StatCard.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$6, { __name: "DashboardStatCard" });
const WEEK_MS = 7 * 24 * 60 * 60 * 1e3;
function averageScore(list) {
  const scored = list.filter((job) => job.match_score !== null);
  if (scored.length === 0) return null;
  return scored.reduce((sum, job) => sum + (job.match_score ?? 0), 0) / scored.length;
}
function countTrend(current, previous) {
  if (previous === 0) return {};
  const pct = Math.round((current - previous) / previous * 100);
  return { trend: `${pct >= 0 ? "+" : ""}${pct}%`, trendPositive: pct >= 0 };
}
function avgScoreTrend(current, previous) {
  const cur = averageScore(current);
  const prev = averageScore(previous);
  if (cur === null || prev === null) return {};
  const delta = Math.round(cur - prev);
  return { trend: `${delta >= 0 ? "+" : ""}${delta}%`, trendPositive: delta >= 0 };
}
function useDashboardStats() {
  const { jobs, loading, loaded, refresh } = useJobs();
  const stats = computed(() => {
    const now = Date.now();
    const list = jobs.value;
    const total = list.length;
    const avg = averageScore(list);
    const avgMatch = avg === null ? 0 : Math.round(avg);
    const researched = list.filter((job) => job.company_research !== null).length;
    const thisWeek = list.filter((job) => new Date(job.found_at).getTime() >= now - WEEK_MS);
    const prevWeek = list.filter((job) => {
      const t = new Date(job.found_at).getTime();
      return t >= now - 2 * WEEK_MS && t < now - WEEK_MS;
    });
    const totalTrend = countTrend(thisWeek.length, prevWeek.length);
    const matchTrend = avgScoreTrend(thisWeek, prevWeek);
    return [
      {
        label: "Total Jobs Found",
        value: String(total),
        note: totalTrend.trend ? "vs last week" : "All time",
        ...totalTrend
      },
      {
        label: "Avg. Match Rate",
        value: `${avgMatch}%`,
        note: matchTrend.trend ? "vs last week" : "Across all jobs",
        ...matchTrend
      },
      {
        label: "Companies Researched",
        value: String(researched),
        note: "Total researched"
      },
      {
        label: "Jobs This Week",
        value: String(thisWeek.length),
        note: "New this week"
      }
    ];
  });
  return { stats, loading, loaded, refresh };
}
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "StatsBar",
  __ssrInlineRender: true,
  setup(__props) {
    const { stats, loaded } = useDashboardStats();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_DashboardStatCard = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" }, _attrs))}>`);
      if (unref(loaded)) {
        _push(`<!--[-->`);
        ssrRenderList(unref(stats), (stat, i) => {
          _push(ssrRenderComponent(_component_DashboardStatCard, {
            key: stat.label,
            label: stat.label,
            value: stat.value,
            note: stat.note,
            trend: stat.trend,
            "trend-positive": stat.trendPositive,
            accent: i === unref(stats).length - 1
          }, null, _parent));
        });
        _push(`<!--]-->`);
      } else {
        _push(`<!--[-->`);
        ssrRenderList(4, (n) => {
          _push(`<div class="jz-frame h-[124px] animate-pulse rounded-[13px] bg-surface-sunk"></div>`);
        });
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/StatsBar.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$5, { __name: "DashboardStatsBar" });
const ACTIVITY_LIMIT = 6;
function useRecentActivity() {
  const insforge = useInsforge();
  const { user } = useAuth();
  const { jobs } = useJobs();
  const runs = useState("activity:runs", () => []);
  const loading = useState("activity:loading", () => false);
  const loaded = useState("activity:loaded", () => false);
  async function refresh() {
    const userId = user.value?.id;
    if (!userId) return;
    loading.value = true;
    try {
      const { data, error } = await insforge.database.from("agent_runs").select("*").eq("user_id", userId).eq("status", "completed").order("started_at", { ascending: false }).limit(ACTIVITY_LIMIT);
      if (error) {
        console.error("[composables/useRecentActivity] refresh", error);
        return;
      }
      runs.value = data ?? [];
    } catch (error) {
      console.error("[composables/useRecentActivity] refresh", error);
    } finally {
      loading.value = false;
      loaded.value = true;
    }
  }
  const activities = computed(() => {
    const searchEntries = runs.value.map((run) => {
      const when = run.completed_at ?? run.started_at;
      return {
        id: `run-${run.id}`,
        text: `Found ${run.jobs_found} ${run.jobs_found === 1 ? "job" : "jobs"} for ${run.job_title_searched ?? "your search"}`,
        time: formatRelativeTime(when),
        type: "search",
        timestamp: new Date(when).getTime()
      };
    });
    const researchEntries = jobs.value.filter((job) => job.company_research !== null).map((job) => ({
      id: `job-${job.id}`,
      text: `Researched ${job.company ?? "a company"}`,
      time: formatRelativeTime(job.found_at),
      type: "research",
      timestamp: new Date(job.found_at).getTime()
    }));
    return [...searchEntries, ...researchEntries].sort((a, b) => b.timestamp - a.timestamp).slice(0, ACTIVITY_LIMIT).map(({ id, text, time, type }) => ({ id, text, time, type }));
  });
  return { activities, loading, loaded, refresh };
}
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "RecentActivity",
  __ssrInlineRender: true,
  setup(__props) {
    const { activities, loaded } = useRecentActivity();
    const dotClass = {
      search: "bg-good",
      research: "bg-info"
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "jz-frame flex flex-col rounded-[13px] bg-surface p-[22px]" }, _attrs))}><h2 class="mb-[18px] font-display text-[18px] font-bold text-text">Recent Activity</h2>`);
      if (!unref(loaded)) {
        _push(`<div class="flex flex-col"><!--[-->`);
        ssrRenderList(5, (n) => {
          _push(`<div class="flex gap-[13px] pb-4"><div class="flex flex-col items-center"><span class="h-3 w-3 shrink-0 animate-pulse rounded-full bg-surface-sunk"></span>`);
          if (n < 5) {
            _push(`<span class="mt-1 w-[2px] flex-1 bg-border-soft"></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex-1"><div class="h-3.5 w-2/3 animate-pulse rounded bg-surface-sunk"></div><div class="mt-1.5 h-3 w-20 animate-pulse rounded bg-surface-sunk"></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(activities).length === 0) {
        _push(`<div class="flex flex-1 flex-col items-center justify-center gap-1 py-10 text-center"><p class="text-[14px] font-medium text-text-2">No activity yet</p><p class="max-w-xs text-[13px] leading-5 text-text-3"> Your job searches and company research will show up here. </p></div>`);
      } else {
        _push(`<div class="flex flex-col"><!--[-->`);
        ssrRenderList(unref(activities), (activity, i) => {
          _push(`<div class="${ssrRenderClass([i < unref(activities).length - 1 ? "pb-4" : "", "flex gap-[13px]"])}"><div class="flex flex-col items-center"><span class="${ssrRenderClass([dotClass[activity.type], "h-3 w-3 shrink-0 rounded-full border-2 border-border"])}"></span>`);
          if (i < unref(activities).length - 1) {
            _push(`<span class="mt-1 w-[2px] flex-1 bg-border-soft"></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div><div class="text-[14px] font-semibold text-text">${ssrInterpolate(activity.text)}</div><div class="mt-0.5 font-mono text-[11.5px] text-text-3">${ssrInterpolate(activity.time)}</div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/RecentActivity.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$4, { __name: "DashboardRecentActivity" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "CompanyResearchChart",
  __ssrInlineRender: true,
  props: {
    data: {},
    loading: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const isEmpty = computed(
      () => props.data.length === 0 || props.data.every((d) => d.value === 0)
    );
    const max = computed(() => Math.max(1, ...props.data.map((d) => d.value)));
    const bars = computed(
      () => props.data.map((d) => ({
        label: d.label,
        height: d.value / max.value * 100,
        isPeak: d.value === max.value && d.value > 0
      }))
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "jz-frame flex flex-col rounded-[13px] bg-surface p-[22px]" }, _attrs))}><h2 class="mb-[22px] font-display text-[18px] font-bold text-text">Company Research Activity</h2>`);
      if (__props.loading) {
        _push(`<div class="h-[224px] w-full animate-pulse rounded-[10px] bg-surface-sunk"></div>`);
      } else if (unref(isEmpty)) {
        _push(`<div class="flex h-[224px] flex-col items-center justify-center gap-1 text-center"><p class="text-[14px] font-medium text-text-2">No data yet</p><p class="max-w-xs text-[13px] leading-5 text-text-3"> Research a company from a job&#39;s page to see activity here. </p></div>`);
      } else {
        _push(`<div class="flex h-[200px] items-end gap-[14px] pl-1.5"><!--[-->`);
        ssrRenderList(unref(bars), (bar) => {
          _push(`<div class="flex h-full flex-1 flex-col items-center justify-end gap-2"><div class="${ssrRenderClass([bar.isPeak ? "bg-accent" : "bg-info", "w-full rounded-t-[5px] border-2 border-border"])}" style="${ssrRenderStyle({ height: `${bar.height}%` })}"></div><span class="font-mono text-[11px] text-text-3">${ssrInterpolate(bar.label)}</span></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/CompanyResearchChart.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$3, { __name: "DashboardCompanyResearchChart" });
const LEFT = 30;
const RIGHT = 690;
const TOP = 40;
const BOTTOM = 190;
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "JobsFoundChart",
  __ssrInlineRender: true,
  props: {
    data: {},
    loading: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const isEmpty = computed(
      () => props.data.length === 0 || props.data.every((d) => d.value === 0)
    );
    const max = computed(() => niceChartMax(props.data.map((d) => d.value)));
    const points = computed(() => {
      const n = props.data.length;
      const peak = Math.max(...props.data.map((d) => d.value));
      return props.data.map((d, i) => ({
        label: d.label,
        x: n <= 1 ? (LEFT + RIGHT) / 2 : LEFT + i / (n - 1) * (RIGHT - LEFT),
        y: BOTTOM - d.value / max.value * (BOTTOM - TOP),
        isPeak: d.value === peak && d.value > 0
      }));
    });
    const linePath = computed(() => {
      const pts = points.value;
      if (pts.length === 0) return "";
      return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    });
    const areaPath = computed(() => {
      const pts = points.value;
      if (pts.length === 0) return "";
      const first = pts[0];
      const last = pts[pts.length - 1];
      return `${linePath.value} L${last.x},${BOTTOM} L${first.x},${BOTTOM} Z`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "jz-frame flex flex-col rounded-[13px] bg-surface p-[22px]" }, _attrs))}><h2 class="mb-[18px] font-display text-[18px] font-bold text-text">Jobs Found Over Time</h2>`);
      if (__props.loading) {
        _push(`<div class="h-[224px] w-full animate-pulse rounded-[10px] bg-surface-sunk"></div>`);
      } else if (unref(isEmpty)) {
        _push(`<div class="flex h-[224px] flex-col items-center justify-center gap-1 text-center"><p class="text-[14px] font-medium text-text-2">No data yet</p><p class="max-w-xs text-[13px] leading-5 text-text-3"> Run a job search and your activity will chart here. </p></div>`);
      } else {
        _push(`<!--[--><svg viewBox="0 0 700 210" class="h-auto w-full overflow-visible"><line x1="30" y1="40" x2="690" y2="40" stroke="var(--color-border-soft)" stroke-width="1.5" stroke-dasharray="4 5"></line><line x1="30" y1="90" x2="690" y2="90" stroke="var(--color-border-soft)" stroke-width="1.5" stroke-dasharray="4 5"></line><line x1="30" y1="140" x2="690" y2="140" stroke="var(--color-border-soft)" stroke-width="1.5" stroke-dasharray="4 5"></line><line x1="30" y1="190" x2="690" y2="190" stroke="var(--color-border)" stroke-width="2"></line><path${ssrRenderAttr("d", unref(areaPath))} fill="var(--color-accent-soft)"></path><path${ssrRenderAttr("d", unref(linePath))} fill="none" stroke="var(--color-accent)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"></path><!--[-->`);
        ssrRenderList(unref(points), (p) => {
          _push(`<circle${ssrRenderAttr("cx", p.x)}${ssrRenderAttr("cy", p.y)}${ssrRenderAttr("r", p.isPeak ? 5.5 : 5)}${ssrRenderAttr("fill", p.isPeak ? "var(--color-accent)" : "var(--color-surface)")} stroke="var(--color-border)" stroke-width="2.5"></circle>`);
        });
        _push(`<!--]--></svg><div class="mt-2 flex justify-between px-1"><!--[-->`);
        ssrRenderList(unref(points), (p) => {
          _push(`<span class="font-mono text-[11px] text-text-3">${ssrInterpolate(p.label)}</span>`);
        });
        _push(`<!--]--></div><!--]-->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/JobsFoundChart.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$2, { __name: "DashboardJobsFoundChart" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "MatchScoreChart",
  __ssrInlineRender: true,
  props: {
    data: {},
    loading: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const isEmpty = computed(
      () => props.data.length === 0 || props.data.every((d) => d.value === 0)
    );
    const max = computed(() => Math.max(1, ...props.data.map((d) => d.value)));
    const bars = computed(
      () => props.data.map((d) => ({
        label: d.label,
        height: d.value / max.value * 100
      }))
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "jz-frame flex flex-col rounded-[13px] bg-surface p-[22px]" }, _attrs))}><h2 class="mb-[22px] font-display text-[18px] font-bold text-text">Match Score Distribution</h2>`);
      if (__props.loading) {
        _push(`<div class="h-[224px] w-full animate-pulse rounded-[10px] bg-surface-sunk"></div>`);
      } else if (unref(isEmpty)) {
        _push(`<div class="flex h-[224px] flex-col items-center justify-center gap-1 text-center"><p class="text-[14px] font-medium text-text-2">No data yet</p><p class="max-w-xs text-[13px] leading-5 text-text-3"> Scored jobs from your searches will appear here. </p></div>`);
      } else {
        _push(`<div class="flex h-[200px] items-end gap-[11px]"><!--[-->`);
        ssrRenderList(unref(bars), (bar) => {
          _push(`<div class="flex h-full flex-1 flex-col items-center justify-end gap-2"><div class="w-full rounded-t-[5px] border-2 border-border bg-good" style="${ssrRenderStyle({ height: `${bar.height}%` })}"></div><span class="font-mono text-[9.5px] text-text-3">${ssrInterpolate(bar.label)}</span></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/MatchScoreChart.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main$1, { __name: "DashboardMatchScoreChart" });
const WEEKDAY_FMT = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const SCORE_BUCKETS = ["50-60%", "60-70%", "70-80%", "80-90%", "90-100%"];
function scoreBucket(score) {
  if (score < 60) return "50-60%";
  if (score < 70) return "60-70%";
  if (score < 80) return "70-80%";
  if (score < 90) return "80-90%";
  return "90-100%";
}
function lastSevenDays() {
  const days = [];
  const now = /* @__PURE__ */ new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days.push({ key: dayKey(d), label: WEEKDAY_FMT.format(d) });
  }
  return days;
}
function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dailyCounts(items, when) {
  const days = lastSevenDays();
  const counts = new Map(days.map((d) => [d.key, 0]));
  for (const job of items) {
    const key = dayKey(new Date(when(job)));
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return days.map((d) => ({ label: d.label, value: counts.get(d.key) ?? 0 }));
}
function useDashboardAnalytics() {
  const { jobs, loading, loaded, refresh } = useJobs();
  const data = computed(() => {
    const list = jobs.value;
    const dist = new Map(SCORE_BUCKETS.map((b) => [b, 0]));
    for (const job of list) {
      if (job.match_score === null) continue;
      const b = scoreBucket(job.match_score);
      dist.set(b, (dist.get(b) ?? 0) + 1);
    }
    const matchDistribution = SCORE_BUCKETS.map((label) => ({
      label,
      value: dist.get(label) ?? 0
    }));
    return {
      // Jobs Found Over Time — every job, keyed by found_at.
      jobsFound: dailyCounts(list, (job) => job.found_at),
      matchDistribution,
      // Company Research Activity — jobs whose research dossier is populated.
      // jobs.company_research has no timestamp, so found_at is the proxy (the
      // same approximation useRecentActivity makes).
      companyResearch: dailyCounts(
        list.filter((job) => job.company_research !== null),
        (job) => job.found_at
      )
    };
  });
  return { data, loading, loaded, refresh };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dashboard",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    useProfile();
    useDashboardStats();
    useRecentActivity();
    const { data: analytics, loaded: analyticsLoaded } = useDashboardAnalytics();
    const chartsLoading = computed(() => !analyticsLoaded.value);
    const firstName = ref("");
    const greeting = computed(() => firstName.value ? `Welcome back, ${firstName.value}` : "Welcome back");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_DashboardStatsBar = __nuxt_component_1;
      const _component_DashboardRecentActivity = __nuxt_component_2;
      const _component_DashboardCompanyResearchChart = __nuxt_component_3;
      const _component_DashboardJobsFoundChart = __nuxt_component_4;
      const _component_DashboardMatchScoreChart = __nuxt_component_5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-[1240px] px-7 pt-[38px] pb-16" }, _attrs))}><div class="mb-[26px] flex flex-wrap items-end justify-between gap-[14px]"><div><h1 class="font-display text-[36px] font-bold tracking-[-0.03em] text-text">${ssrInterpolate(unref(greeting))}</h1><p class="mt-1.5 text-[15px] text-text-2">Here&#39;s what your copilot found this week.</p></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/find-jobs",
        class: "jz-frame jz-press rounded-[9px] bg-accent px-[18px] py-[11px] text-[14px] font-semibold text-white"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` + Find new jobs `);
          } else {
            return [
              createTextVNode(" + Find new jobs ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_DashboardStatsBar, null, null, _parent));
      _push(`<div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.35fr]">`);
      _push(ssrRenderComponent(_component_DashboardRecentActivity, null, null, _parent));
      _push(ssrRenderComponent(_component_DashboardCompanyResearchChart, {
        data: unref(analytics).companyResearch,
        loading: unref(chartsLoading)
      }, null, _parent));
      _push(`</div><div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">`);
      _push(ssrRenderComponent(_component_DashboardJobsFoundChart, {
        data: unref(analytics).jobsFound,
        loading: unref(chartsLoading)
      }, null, _parent));
      _push(ssrRenderComponent(_component_DashboardMatchScoreChart, {
        data: unref(analytics).matchDistribution,
        loading: unref(chartsLoading)
      }, null, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=dashboard-DToUD0Ue.mjs.map
