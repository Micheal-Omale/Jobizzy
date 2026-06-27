import { _ as __nuxt_component_1$1 } from './server.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { u as useProfile, c as computeProfileCompletion } from './useProfile-BIz0kmkh.mjs';
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
import 'vue-router';
import '@vue/shared';
import './useInsforge-DhfvSzIK.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "profile",
  __ssrInlineRender: true,
  setup(__props) {
    const { user } = useAuth();
    useProfile();
    const profile = ref(null);
    ref(null);
    ref(0);
    ref("");
    ref(null);
    ref(true);
    ref("");
    computed(() => user.value?.email ?? null);
    computed(
      () => profile.value ? computeProfileCompletion(profile.value) : { percentage: 0, missingFields: [], isComplete: false }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-[880px] px-7 pt-[34px] pb-16" }, _attrs))}><h1 class="mb-[22px] font-display text-[36px] font-bold tracking-[-0.03em] text-text">Your Profile</h1><div class="flex flex-col gap-[18px]">`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {
        fallback: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="jz-frame h-40 animate-pulse rounded-[14px] bg-surface-sunk"${_scopeId}></div><div class="jz-frame h-[760px] animate-pulse rounded-[14px] bg-surface-sunk"${_scopeId}></div>`);
          } else {
            return [
              createVNode("div", { class: "jz-frame h-40 animate-pulse rounded-[14px] bg-surface-sunk" }),
              createVNode("div", { class: "jz-frame h-[760px] animate-pulse rounded-[14px] bg-surface-sunk" })
            ];
          }
        })
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/profile.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=profile-VQejuXsT.mjs.map
