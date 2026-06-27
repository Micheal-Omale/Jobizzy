import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { u as useHead } from './composables-DA9IqTxF.mjs';
import { u as useRoute } from './server.mjs';
import { u as useAuth } from './useAuth-DqhK3zbv.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
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
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import '@vue/shared';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "callback",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Signing you in… · JobPilot"
    });
    useRoute();
    useAuth();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex min-h-screen flex-col items-center justify-center bg-background px-6" }, _attrs))}><div class="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" aria-hidden="true"></div><p class="mt-4 text-[14px] font-medium text-text-secondary">Signing you in…</p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/auth/callback.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=callback-Be6mnwp3.mjs.map
