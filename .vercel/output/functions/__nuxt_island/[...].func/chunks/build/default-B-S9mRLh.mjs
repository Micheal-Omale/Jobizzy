import { _ as __nuxt_component_0$1 } from './nuxt-link-DZJkgzcN.mjs';
import { d as useTheme, _ as __nuxt_component_1$1 } from './server.mjs';
import { defineComponent, mergeProps, ref, computed, withCtx, createVNode, openBlock, createBlock, createTextVNode, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
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
import '@vue/shared';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "Navbar",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { isAuthenticated } = useAuth();
    useTheme();
    ref(false);
    computed(() => isAuthenticated.value ? "/dashboard" : "/login");
    computed(() => isAuthenticated.value ? "Go to Dashboard" : "Start free");
    const navLinks = [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/find-jobs", label: "Find Jobs" },
      { to: "/profile", label: "Profile" }
    ];
    function isActive(to) {
      return route.path === to || route.path.startsWith(`${to}/`);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_ClientOnly = __nuxt_component_1$1;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "sticky top-0 z-50 w-full border-b-2 border-border bg-surface" }, _attrs))}><div class="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-7">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex items-center gap-[11px]"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="jz-frame-sm flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent" aria-hidden="true"${_scopeId}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"${_scopeId}><path d="M5 13l7-7 7 7"${_scopeId}></path><path d="M5 19l7-7 7 7"${_scopeId}></path></svg></span><span class="font-display text-[21px] font-bold tracking-[-0.03em] text-text"${_scopeId}>Jobizzy</span>`);
          } else {
            return [
              createVNode("span", {
                class: "jz-frame-sm flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent",
                "aria-hidden": "true"
              }, [
                (openBlock(), createBlock("svg", {
                  viewBox: "0 0 24 24",
                  width: "18",
                  height: "18",
                  fill: "none",
                  stroke: "#fff",
                  "stroke-width": "3.3",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, [
                  createVNode("path", { d: "M5 13l7-7 7 7" }),
                  createVNode("path", { d: "M5 19l7-7 7 7" })
                ]))
              ]),
              createVNode("span", { class: "font-display text-[21px] font-bold tracking-[-0.03em] text-text" }, "Jobizzy")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex items-center gap-1.5"><nav class="hidden items-center gap-1.5 md:flex"><!--[-->`);
      ssrRenderList(navLinks, (link) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: link.to,
          to: link.to,
          class: ["relative px-3.5 py-2 text-[14px] font-semibold", isActive(link.to) ? "text-accent-ink" : "text-text-2 hover:text-text"]
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(link.label)} `);
              if (isActive(link.to)) {
                _push2(`<span class="absolute inset-x-3.5 -bottom-px h-[3px] rounded-[3px] bg-accent"${_scopeId}></span>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createTextVNode(toDisplayString(link.label) + " ", 1),
                isActive(link.to) ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "absolute inset-x-3.5 -bottom-px h-[3px] rounded-[3px] bg-accent"
                })) : createCommentVNode("", true)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav><button type="button" class="jz-frame-sm jz-press-sm ml-2 flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-surface-2" title="Toggle theme" aria-label="Toggle theme">`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {
        fallback: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-[16px]"${_scopeId}>🌙</span>`);
          } else {
            return [
              createVNode("span", { class: "text-[16px]" }, "🌙")
            ];
          }
        })
      }, _parent));
      _push(`</button>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(ssrRenderComponent(_component_ClientOnly, null, {
        fallback: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="ml-1 inline-block h-[40px] w-[104px] animate-pulse rounded-[9px] bg-accent/40" aria-hidden="true"${_scopeId}></span>`);
          } else {
            return [
              createVNode("span", {
                class: "ml-1 inline-block h-[40px] w-[104px] animate-pulse rounded-[9px] bg-accent/40",
                "aria-hidden": "true"
              })
            ];
          }
        })
      }, _parent));
      _push(`</div></div></header>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/Navbar.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$2, { __name: "LayoutNavbar" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Footer",
  __ssrInlineRender: true,
  setup(__props) {
    const footerLinks = [
      { to: "/dashboard", label: "Dashboard" },
      { to: "#", label: "Privacy Policy" },
      { to: "#", label: "Terms & Conditions" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "w-full border-t-2 border-border bg-surface" }, _attrs))}><div class="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-7 py-[34px]">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex items-center gap-[11px]"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="flex h-8 w-8 items-center justify-center rounded-[9px] border-2 border-border bg-accent" aria-hidden="true"${_scopeId}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"${_scopeId}><path d="M5 13l7-7 7 7"${_scopeId}></path><path d="M5 19l7-7 7 7"${_scopeId}></path></svg></span><span class="font-display text-[18px] font-bold tracking-[-0.03em] text-text"${_scopeId}>Jobizzy</span>`);
          } else {
            return [
              createVNode("span", {
                class: "flex h-8 w-8 items-center justify-center rounded-[9px] border-2 border-border bg-accent",
                "aria-hidden": "true"
              }, [
                (openBlock(), createBlock("svg", {
                  viewBox: "0 0 24 24",
                  width: "16",
                  height: "16",
                  fill: "none",
                  stroke: "#fff",
                  "stroke-width": "3.3",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, [
                  createVNode("path", { d: "M5 13l7-7 7 7" }),
                  createVNode("path", { d: "M5 19l7-7 7 7" })
                ]))
              ]),
              createVNode("span", { class: "font-display text-[18px] font-bold tracking-[-0.03em] text-text" }, "Jobizzy")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex items-center gap-6"><!--[-->`);
      ssrRenderList(footerLinks, (link) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: link.label,
          to: link.to,
          class: "text-[13.5px] font-medium text-text-2 hover:text-text"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(link.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(link.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></div></footer>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/Footer.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$1, { __name: "LayoutFooter" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LayoutNavbar = __nuxt_component_0;
      const _component_LayoutFooter = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex min-h-screen flex-col bg-bg text-text font-body transition-colors" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_LayoutNavbar, null, null, _parent));
      _push(`<main class="w-full flex-1">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      _push(ssrRenderComponent(_component_LayoutFooter, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-B-S9mRLh.mjs.map
