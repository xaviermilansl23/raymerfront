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
} from "./chunk-UNKRBAX3.js";
import "./chunk-L36GFXQ7.js";
import "./chunk-U7AJ4GFS.js";
import {
  MatOptgroup,
  MatOption
} from "./chunk-KVAPB726.js";
import "./chunk-QGU4IDG7.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-BGC6VK5H.js";
import "./chunk-VV5K5FSC.js";
import "./chunk-FA7GIIKW.js";
import "./chunk-D6W4ZY63.js";
import "./chunk-D3CXTRCM.js";
import "./chunk-NMF2G6BM.js";
import "./chunk-AURRSBNL.js";
import "./chunk-GAVRJX25.js";
import "./chunk-6DNNAX5B.js";
import "./chunk-3JSGR5ZA.js";
import "./chunk-52TD5O34.js";
import "./chunk-BABSEUN5.js";
import "./chunk-SGZ3PCV2.js";
import "./chunk-MSCHBWKF.js";
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
