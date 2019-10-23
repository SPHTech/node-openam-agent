"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ShieldEvaluationError = /** @class */ (function (_super) {
    __extends(ShieldEvaluationError, _super);
    function ShieldEvaluationError(statusCode, message, details) {
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.message = message;
        _this.details = details;
        return _this;
    }
    return ShieldEvaluationError;
}(Error));
exports.ShieldEvaluationError = ShieldEvaluationError;
//# sourceMappingURL=shield-evaluation-error.js.map