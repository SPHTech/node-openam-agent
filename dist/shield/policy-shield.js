"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var url = require("url");
var __1 = require("..");
var deferred_1 = require("../utils/deferred");
var http_utils_1 = require("../utils/http-utils");
var PolicyShield = /** @class */ (function () {
    function PolicyShield(applicationName, pathOnly) {
        if (applicationName === void 0) { applicationName = 'iPlanetAMWebAgentService'; }
        if (pathOnly === void 0) { pathOnly = false; }
        this.applicationName = applicationName;
        this.pathOnly = pathOnly;
    }
    PolicyShield.prototype.evaluate = function (req, res, agent) {
        return __awaiter(this, void 0, void 0, function () {
            var deferred, sessionId, params, decision, err_1, session, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deferred = new deferred_1.Deferred();
                        return [4 /*yield*/, agent.getSessionIdFromRequest(req)];
                    case 1:
                        sessionId = _a.sent();
                        params = this.toDecisionParams(req, sessionId);
                        agent.logger.debug("PolicyShield: requesting policy decision for " + JSON.stringify(params, null, 2));
                        decision = [];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, agent.getPolicyDecision(params)];
                    case 3:
                        decision = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        throw new __1.ShieldEvaluationError(err_1.statusCode || err_1.status || 500, err_1.name || err_1.message, err_1.stack + '\n' + JSON.stringify(err_1, null, 2));
                    case 5:
                        agent.logger.debug("PolicyShield: got policy decision " + JSON.stringify(decision, null, 2));
                        if (decision && decision[0].actions[req.method]) {
                            agent.logger.info("PolicyShield: " + req.url + " => allow");
                            session = req['session'] || { data: {} };
                            session.data.policies = decision;
                            return [2 /*return*/, session];
                        }
                        agent.logger.info("PolicyShield: " + req.url + " => deny");
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.redirectToAccessDenied(req, res, agent, params.resources)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        err_2 = _a.sent();
                        throw new __1.ShieldEvaluationError(403, 'Forbidden', 'You are not authorized to access this resource.');
                    case 9: return [4 /*yield*/, deferred.promise];
                    case 10: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PolicyShield.prototype.toDecisionParams = function (req, ssoToken) {
        var resourceName = req['originalUrl'] ? http_utils_1.baseUrl(req) + req['originalUrl'] : http_utils_1.baseUrl(req) + req.url;
        if (this.pathOnly) {
            var path = url.parse(req.url).path;
            resourceName = path;
        }
        return {
            resources: [resourceName],
            application: this.applicationName,
            subject: { ssoToken: ssoToken }
        };
    };
    PolicyShield.prototype.redirectToAccessDenied = function (req, res, agent, resources) {
        return __awaiter(this, void 0, void 0, function () {
            var accessDeniedUrl, goto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, agent.getAccessDeniedUrl()];
                    case 1:
                        accessDeniedUrl = _a.sent();
                        goto = resources && resources[0];
                        if (!accessDeniedUrl) return [3 /*break*/, 3];
                        accessDeniedUrl += (accessDeniedUrl.includes('?') ? '&' : '?') + 'goto=' + goto;
                        return [4 /*yield*/, agent.clearSessionCookie(res)];
                    case 2:
                        _a.sent();
                        http_utils_1.redirect(res, accessDeniedUrl);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return PolicyShield;
}());
exports.PolicyShield = PolicyShield;
//# sourceMappingURL=policy-shield.js.map