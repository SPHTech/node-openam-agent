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
var axios_1 = require("axios");
var shortid = require("shortid");
var url = require("url");
/**
 * ForgeRock OpenAM / Access Management client
 * Supports OpenAM 13 and above. Policy decisions via REST are only available in 13.5 and above.
 */
var AmClient = /** @class */ (function () {
    function AmClient(serverUrl, privateIp) {
        this.hostname = null;
        this.serverUrl = serverUrl.replace(/\/$/, '');
        if (privateIp) {
            this.hostname = url.parse(this.serverUrl).hostname || '';
            this.serverAddress = this.serverUrl.replace(this.hostname, privateIp);
        }
        else {
            this.serverAddress = this.serverUrl;
        }
    }
    /**
     * Gets the results of /json/serverinfo/*
     */
    AmClient.prototype.getServerInfo = function () {
        return axios_1.default
            .get(this.serverAddress + "/json/serverinfo/*", { headers: { host: this.hostname } })
            .then(function (res) { return res.data; });
    };
    /**
     * Sends an authentication request to OpenAM. Returns Promise. The module argument overrides service. The default
     * realm is /. If noSession is true, the credentials will be validated but no session will be created.
     */
    AmClient.prototype.authenticate = function (username, password, realm, service, module, noSession) {
        if (realm === void 0) { realm = '/'; }
        if (noSession === void 0) { noSession = false; }
        var authIndexType, authIndexValue;
        if (service) {
            authIndexType = 'service';
            authIndexValue = service;
        }
        if (module) {
            authIndexType = 'module';
            authIndexValue = module;
        }
        return axios_1.default
            .post(this.serverAddress + "/json/authenticate", null, {
            headers: {
                host: this.hostname,
                'X-OpenAM-Username': username,
                'X-OpenAM-Password': password,
                'Accept-API-Version': 'resource=1.0'
            },
            params: { realm: realm, authIndexType: authIndexType, authIndexValue: authIndexValue, noSession: noSession }
        })
            .then(function (res) { return res.data; });
    };
    /**
     * Sends a logout request to OpenAM to to destroy the session identified by sessionId
     */
    AmClient.prototype.logout = function (sessionId, cookieName, realm) {
        if (realm === void 0) { realm = '/'; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, headers;
            return __generator(this, function (_b) {
                if (!sessionId) {
                    return [2 /*return*/];
                }
                headers = (_a = {},
                    _a[cookieName] = sessionId,
                    _a.host = this.hostname,
                    _a['Content-Type'] = 'application/json',
                    _a['Accept-API-Version'] = 'resource=1.1',
                    _a);
                return [2 /*return*/, axios_1.default
                        .post(this.serverAddress + "/json/sessions", null, {
                        headers: headers,
                        params: { realm: realm, _action: 'logout' }
                    })
                        .then(function (res) { return res.data; })];
            });
        });
    };
    /**
     * Validates a given sessionId against OpenAM.
     */
    AmClient.prototype.validateSession = function (sessionId) {
        if (!sessionId) {
            return Promise.resolve({ valid: false });
        }
        return axios_1.default
            .post(this.serverAddress + "/json/sessions/" + sessionId, null, {
            params: { _action: 'validate' },
            headers: {
                host: this.hostname,
                'Content-Type': 'application/json',
                'Accept-API-Version': 'resource=1.1'
            }
        })
            .then(function (res) { return res.data; });
    };
    /**
     * Returns an OpenAM login URL with the goto query parameter set to the original URL in req.
     */
    AmClient.prototype.getLoginUrl = function (goto, realm) {
        if (realm === void 0) { realm = '/'; }
        return this.serverUrl + url.format({
            pathname: '/UI/Login',
            query: { goto: goto, realm: realm }
        });
    };
    /**
     * Constructs a CDSSO login URL
     *
     * @param {string} target Target URL
     * @param {string} provider ProviderId (app URL)
     * @return {string}
     */
    AmClient.prototype.getCDSSOUrl = function (target, provider) {
        return this.serverUrl + url.format({
            pathname: '/cdcservlet',
            query: {
                TARGET: target,
                RequestID: shortid.generate(),
                MajorVersion: 1,
                MinorVersion: 0,
                ProviderID: provider,
                IssueInstant: new Date().toISOString()
            }
        });
    };
    /**
     * Gets policy decisions from OpenAM for params. params must be a well formatted OpenAM policy request object.
     * It needs a valid sessionId and cookieName in order to make the request. (The user to whom the session belongs needs
     * to have the REST calls for policy evaluation privilege in OpenAM.
     */
    AmClient.prototype.getPolicyDecision = function (data, sessionId, cookieName, realm) {
        if (realm === void 0) { realm = '/'; }
        var _a;
        return axios_1.default
            .post(this.serverAddress + "/json/policies", data, {
            headers: (_a = {},
                _a[cookieName] = sessionId,
                _a.host = this.hostname,
                _a),
            params: {
                _action: 'evaluate',
                realm: realm || '/'
            }
        })
            .then(function (res) { return res.data; });
    };
    /**
     * Sends requestSet to the SessionService. requestSet must be a properly formatted XML document.
     *
     * @param {object} requestSet Session service request set
     * @return {Promise} Session service response
     */
    AmClient.prototype.sessionServiceRequest = function (requestSet) {
        return axios_1.default
            .post(this.serverAddress + "/sessionservice", requestSet, {
            headers: {
                host: this.hostname,
                'Content-Type': 'text/xml'
            }
        })
            .then(function (res) { return res.data; });
    };
    /**
     * Validates the OAuth2 access_token in the specified realm.
     *
     * @param {string} accessToken OAuth2 access_token
     * @param {string} [realm=/]
     * @return {Promise} Token info response
     */
    AmClient.prototype.validateAccessToken = function (accessToken, realm) {
        if (realm === void 0) { realm = '/'; }
        return axios_1.default
            .get(this.serverAddress + "/oauth2/tokeninfo", {
            headers: {
                host: this.hostname
            },
            params: {
                access_token: accessToken,
                realm: realm
            }
        })
            .then(function (res) { return res.data; });
    };
    /**
     * Gets a user's profile (requires an agent or admin session).
     */
    AmClient.prototype.getProfile = function (userId, realm, sessionId, cookieName) {
        return axios_1.default
            .get(this.serverAddress + "/json/users/" + userId, {
            headers: {
                host: this.hostname,
                cookie: cookieName + "=" + sessionId
            },
            params: {
                realm: realm || '/'
            }
        })
            .then(function (res) { return res.data; });
    };
    return AmClient;
}());
exports.AmClient = AmClient;
/**
 * Alias to the old name
 * @deprecated
 */
exports.OpenAMClient = AmClient;
//# sourceMappingURL=am-client.js.map