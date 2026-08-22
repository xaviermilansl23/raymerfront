import { createRequire } from 'module';const require = createRequire(import.meta.url);
import {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger
} from "./chunk-ZIN333AI.js";
import "./chunk-4ABA73F4.js";
import "./chunk-Z5U4ZO4A.js";
import {
  MatOptgroup,
  MatOption
} from "./chunk-Y7PCFRBA.js";
import "./chunk-7RE4SZMR.js";
import "./chunk-M6SCDIG5.js";
import "./chunk-IUOT3J7P.js";
import "./chunk-FWCUTXVA.js";
import "./chunk-DPL2C6XC.js";
import "./chunk-NZZEO3PD.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-CJMMQMEC.js";
import "./chunk-47EXBTWL.js";
import "./chunk-3VA5WAPV.js";
import "./chunk-6DNNAX5B.js";
import "./chunk-IAAE6Q3M.js";
import "./chunk-WS2ELSCE.js";
import "./chunk-BABSEUN5.js";
import "./chunk-SGZ3PCV2.js";
import "./chunk-XPOMKKD4.js";
import "./chunk-NXEY5XCP.js";
import "./chunk-HEDRYEVE.js";
import "./chunk-H4CBYA6O.js";
import "./chunk-5YCWEY4A.js";
import "./chunk-OZPO6I4L.js";
import "./chunk-OR4AOJDN.js";
import "./chunk-JME5XKN5.js";
import "./chunk-ZLCZU7PP.js";
import "./chunk-QH6FTEH3.js";
import "./chunk-DWQWERDK.js";
import "./chunk-TW5G2YXV.js";
import "./chunk-OGEJ2NKO.js";
import "./chunk-JY5RHDA4.js";
import {
  require_operators
} from "./chunk-OGIUALEI.js";
import {
  require_cjs
} from "./chunk-DFRHWMTS.js";
import "./chunk-7RL4FTI4.js";
import {
  __toESM
} from "./chunk-ANGF2IQY.js";

// node_modules/@angular/material/fesm2022/select.mjs
var import_rxjs = __toESM(require_cjs(), 1);
var import_operators = __toESM(require_operators(), 1);
var matSelectAnimations = {
  // Represents
  // trigger('transformPanelWrap', [
  //   transition('* => void', query('@transformPanel', [animateChild()], {optional: true})),
  // ])
  /**
   * This animation ensures the select's overlay panel animation (transformPanel) is called when
   * closing the select.
   * This is needed due to https://github.com/angular/angular/issues/23302
   */
  transformPanelWrap: {
    type: 7,
    name: "transformPanelWrap",
    definitions: [{
      type: 1,
      expr: "* => void",
      animation: {
        type: 11,
        selector: "@transformPanel",
        animation: [{
          type: 9,
          options: null
        }],
        options: {
          optional: true
        }
      },
      options: null
    }],
    options: {}
  },
  // Represents
  // trigger('transformPanel', [
  //   state(
  //     'void',
  //     style({
  //       opacity: 0,
  //       transform: 'scale(1, 0.8)',
  //     }),
  //   ),
  //   transition(
  //     'void => showing',
  //     animate(
  //       '120ms cubic-bezier(0, 0, 0.2, 1)',
  //       style({
  //         opacity: 1,
  //         transform: 'scale(1, 1)',
  //       }),
  //     ),
  //   ),
  //   transition('* => void', animate('100ms linear', style({opacity: 0}))),
  // ])
  /** This animation transforms the select's overlay panel on and off the page. */
  transformPanel: {
    type: 7,
    name: "transformPanel",
    definitions: [{
      type: 0,
      name: "void",
      styles: {
        type: 6,
        styles: {
          opacity: 0,
          transform: "scale(1, 0.8)"
        },
        offset: null
      }
    }, {
      type: 1,
      expr: "void => showing",
      animation: {
        type: 4,
        styles: {
          type: 6,
          styles: {
            opacity: 1,
            transform: "scale(1, 1)"
          },
          offset: null
        },
        timings: "120ms cubic-bezier(0, 0, 0.2, 1)"
      },
      options: null
    }, {
      type: 1,
      expr: "* => void",
      animation: {
        type: 4,
        styles: {
          type: 6,
          styles: {
            opacity: 0
          },
          offset: null
        },
        timings: "100ms linear"
      },
      options: null
    }],
    options: {}
  }
};
export {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatOptgroup,
  MatOption,
  MatPrefix,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger,
  MatSuffix,
  matSelectAnimations
};
//# sourceMappingURL=@angular_material_select.js.map
