"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deferred = void 0;
var Deferred = /** @class */ (function () {
    function Deferred() {
        var _this = this;
        this.promise = new Promise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
    }
    return Deferred;
}());
exports.Deferred = Deferred;
//# sourceMappingURL=deferred.js.map