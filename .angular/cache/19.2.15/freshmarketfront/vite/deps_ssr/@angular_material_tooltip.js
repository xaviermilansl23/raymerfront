import { createRequire } from 'module';const require = createRequire(import.meta.url);
import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY,
  MAT_TOOLTIP_SCROLL_STRATEGY,
  MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY,
  MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,
  MatTooltip,
  MatTooltipModule,
  SCROLL_THROTTLE_MS,
  TOOLTIP_PANEL_CLASS,
  TooltipComponent,
  getMatTooltipInvalidPositionError
} from "./chunk-3ZW7N4Z6.js";
import "./chunk-AURRSBNL.js";
import "./chunk-6DNNAX5B.js";
import "./chunk-3JSGR5ZA.js";
import "./chunk-52TD5O34.js";
import "./chunk-BABSEUN5.js";
import "./chunk-SGZ3PCV2.js";
import "./chunk-MSCHBWKF.js";
import "./chunk-MOPJB6ZK.js";
import "./chunk-JY5ZLXM3.js";
import "./chunk-JC3YBNA2.js";
import "./chunk-HEDRYEVE.js";
import "./chunk-Y7SVMJPJ.js";
import "./chunk-LS3XI6YR.js";
import "./chunk-C4GLI4BR.js";
import "./chunk-JME5XKN5.js";
import "./chunk-6MVFMEI2.js";
import "./chunk-LO4S3W5H.js";
import "./chunk-NDV4OJH7.js";
import "./chunk-7E2XHEIW.js";
import "./chunk-H6S6V2RE.js";
import "./chunk-JPVXNR5Y.js";
import {
  require_cjs
} from "./chunk-DFRHWMTS.js";
import {
  require_operators
} from "./chunk-OGIUALEI.js";
import "./chunk-7RL4FTI4.js";
import {
  __toESM
} from "./chunk-ANGF2IQY.js";

// node_modules/@angular/material/fesm2022/tooltip.mjs
var import_operators = __toESM(require_operators(), 1);
var import_rxjs = __toESM(require_cjs(), 1);
var matTooltipAnimations = {
  // Represents:
  // trigger('state', [
  //   state('initial, void, hidden', style({opacity: 0, transform: 'scale(0.8)'})),
  //   state('visible', style({transform: 'scale(1)'})),
  //   transition('* => visible', animate('150ms cubic-bezier(0, 0, 0.2, 1)')),
  //   transition('* => hidden', animate('75ms cubic-bezier(0.4, 0, 1, 1)')),
  // ])
  /** Animation that transitions a tooltip in and out. */
  tooltipState: {
    type: 7,
    name: "state",
    definitions: [{
      type: 0,
      name: "initial, void, hidden",
      styles: {
        type: 6,
        styles: {
          opacity: 0,
          transform: "scale(0.8)"
        },
        offset: null
      }
    }, {
      type: 0,
      name: "visible",
      styles: {
        type: 6,
        styles: {
          transform: "scale(1)"
        },
        offset: null
      }
    }, {
      type: 1,
      expr: "* => visible",
      animation: {
        type: 4,
        styles: null,
        timings: "150ms cubic-bezier(0, 0, 0.2, 1)"
      },
      options: null
    }, {
      type: 1,
      expr: "* => hidden",
      animation: {
        type: 4,
        styles: null,
        timings: "75ms cubic-bezier(0.4, 0, 1, 1)"
      },
      options: null
    }],
    options: {}
  }
};
export {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY,
  MAT_TOOLTIP_SCROLL_STRATEGY,
  MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY,
  MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,
  MatTooltip,
  MatTooltipModule,
  SCROLL_THROTTLE_MS,
  TOOLTIP_PANEL_CLASS,
  TooltipComponent,
  getMatTooltipInvalidPositionError,
  matTooltipAnimations
};
//# sourceMappingURL=@angular_material_tooltip.js.map
