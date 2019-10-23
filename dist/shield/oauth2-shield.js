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
var __1 = require("..");
/**
 * Shield implementation for enforcing Oauth2 access_tokens. This Shield implementation validates an OAuth2 access_token
 * issued by OpenAM, using OpenAM's /oauth2/tokeninfo service. The access_token must be sent in an Authorization header.
 */
var Oauth2Shield = /** @class */ (function () {
    function Oauth2Shield(realm) {
        if (realm === void 0) { realm = '/'; }
        this.realm = realm;
    }
    Oauth2Shield.prototype.evaluate = function (req, res, agent) {
        return __awaiter(this, void 0, void 0, function () {
            var accessToken, tokenInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accessToken = this.getAccessTokenFromRequest(req);
                        if (!accessToken.length) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getTokenInfo(agent, accessToken)];
                    case 1:
                        tokenInfo = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        agent.logger.info("OAuth2Shield: " + req.url + " => deny");
                        throw new __1.ShieldEvaluationError(401, 'Unauthorized', 'Missing OAuth2 Bearer token');
                    case 3:
                        agent.logger.info("OAuth2Shield: " + req.url + " => allow");
                        agent.logger.debug(JSON.stringify(tokenInfo, null, 2));
                        return [2 /*return*/, { key: accessToken, data: tokenInfo }];
                }
            });
        });
    };
    Oauth2Shield.prototype.getAccessTokenFromRequest = function (req) {
        var authorizationHeader = req.headers.authorization || '';
        return authorizationHeader.replace('Bearer', '').trim();
    };
    Oauth2Shield.prototype.getTokenInfo = function (agent, accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, agent.amClient.validateAccessToken(accessToken, this.realm)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_1 = _a.sent();
                        message = 'Internal server error';
                        try {
                            message = JSON.parse(err_1.body).error_description;
                        }
                        catch (_b) {
                            // body is not json
                        }
                        throw new __1.ShieldEvaluationError(err_1.statusCode || 500, message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return Oauth2Shield;
}());
exports.Oauth2Shield = Oauth2Shield;
//# sourceMappingURL=oauth2-shield.js.map