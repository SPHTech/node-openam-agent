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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var BodyParser = require("body-parser");
var cookie = require("cookie");
var events_1 = require("events");
var express_1 = require("express");
var fs = require("fs");
var Handlebars = require("handlebars");
var path_1 = require("path");
var ShortId = require("shortid");
var XMLBuilder = require("xmlbuilder");
var am_client_1 = require("../amclient/am-client");
var in_memory_cache_1 = require("../cache/in-memory-cache");
var invalid_session_error_1 = require("../error/invalid-session-error");
var http_utils_1 = require("../utils/http-utils");
var logger_1 = require("../utils/logger");
var xml_utils_1 = require("../utils/xml-utils");
var pkg = require('../../package.json');
exports.SESSION_EVENT = 'session';
exports.CDSSO_PATH = '/agent/cdsso';
exports.NOTIFICATION_PATH = '/agent/notifications';
/**
 * Policy Agent
 *
 * @example
 * import express from 'express';
 * import {PolicyAgent, CookieShield} from '@forgerock/openam-agent';
 *
 * const config = {
 *    serverUrl: 'http://openam.example.com:8080/openam',
 *    appUrl: 'http://app.example.com:8080',
 *    notificationsEnabled: true,
 *    username: 'my-agent',
 *    password: 'changeit',
 *    realm: '/',
 *    logLevel: 'info',
 *    errorPage: ({status, message, details}) => `<html><body><h1>${status} - ${message }</h1></body></html>`
 * };
 *
 * const agent = new PolicyAgent(config);
 * const app = express();
 *
 * app.use(agent.shield(new CookieShield()));
 * app.use(agent.notifications);
 *
 * app.listen(8080);
 */
var PolicyAgent = /** @class */ (function (_super) {
    __extends(PolicyAgent, _super);
    function PolicyAgent(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.id = ShortId.generate();
        _this.cdssoPath = exports.CDSSO_PATH;
        _this.notificationPath = exports.NOTIFICATION_PATH;
        var openAMClient = options.openAMClient, serverUrl = options.serverUrl, privateIP = options.privateIP, logger = options.logger, logLevel = options.logLevel, sessionCache = options.sessionCache, logAsJson = options.logAsJson;
        _this.logger = logger || logger_1.createLogger(logLevel, _this.id, { json: logAsJson });
        _this.amClient = openAMClient || new am_client_1.AmClient(serverUrl, privateIP);
        _this.sessionCache = sessionCache || new in_memory_cache_1.InMemoryCache({ expireAfterSeconds: 300, logger: logger });
        _this.errorTemplate = options.errorPage || _this.getDefaultErrorTemplate();
        _this.registerSessionExpiryHandler();
        _this.registerShutdownHandler();
        _this.logger.info('Agent initialized.');
        return _this;
    }
    /**
     * Returns the cached AM server info (cookie name & domain list)
     */
    PolicyAgent.prototype.getServerInfo = function () {
        if (!this.serverInfo) {
            this.serverInfo = this.amClient.getServerInfo();
        }
        return this.serverInfo;
    };
    /**
     * Returns a cached agent session
     */
    PolicyAgent.prototype.getAgentSession = function () {
        if (!this.agentSession) {
            this.agentSession = this.authenticateAgent();
        }
        return this.agentSession;
    };
    /**
     * Returns a cached agent session
     */
    PolicyAgent.prototype.getAgentInfo = function (tokenId, cookieName) {
        var _a = this.options, username = _a.username, realm = _a.realm;
        return this.amClient.getAgentInfo(username, realm, tokenId, cookieName);
    };
    /**
     * Creates a new agent session
     */
    PolicyAgent.prototype.authenticateAgent = function () {
        var _this = this;
        var _a = this.options, username = _a.username, password = _a.password, realm = _a.realm;
        if (!username || !password) {
            throw new Error('PolicyAgent: agent username and password must be set');
        }
        return this.amClient
            .authenticate(username, password, realm, '', 'Application')
            .then(function (res) {
            _this.logger.info("PolicyAgent: agent session created \u2013 " + res.tokenId);
            return res;
        });
    };
    /**
     * Retry sending a request a specified number of times. If the response status is 401, renew the agent session
     */
    PolicyAgent.prototype.reRequest = function (request, attemptLimit, name) {
        if (attemptLimit === void 0) { attemptLimit = 1; }
        if (name === void 0) { name = 'reRequest'; }
        return __awaiter(this, void 0, void 0, function () {
            var attemptCount, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        attemptCount = 0;
                        _a.label = 1;
                    case 1:
                        if (!(attemptCount < attemptLimit)) return [3 /*break*/, 9];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 8]);
                        return [4 /*yield*/, request()];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        err_1 = _a.sent();
                        attemptCount++;
                        this.logger.debug("PolicyAgent: " + name + " - caught error " + err_1.message);
                        this.logger.info("PolicyAgent: " + name + " - retrying request - attempt " + attemptCount + " of " + attemptLimit);
                        if (!(err_1 instanceof invalid_session_error_1.InvalidSessionError || err_1.statusCode === 401 || err_1.code === 401 ||
                            (err_1.response && err_1.response.status === 401))) return [3 /*break*/, 6];
                        this.agentSession = this.authenticateAgent();
                        return [4 /*yield*/, this.agentSession];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        if (attemptCount === attemptLimit) {
                            throw err_1;
                        }
                        _a.label = 7;
                    case 7: return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 1];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    PolicyAgent.prototype.validateSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var err_2, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sessionCache.get(sessionId)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_2 = _a.sent();
                        this.logger.info("PolicyAgent: Session not found for this session Id " + sessionId + ". " + err_2);
                        return [3 /*break*/, 3];
                    case 3: return [4 /*yield*/, this.amClient.validateSession(sessionId)];
                    case 4:
                        res = _a.sent();
                        if (res.valid) {
                            this.logger.info("PolicyAgent: session " + sessionId + " is valid; saving to cache");
                            this.sessionCache.put(sessionId, res);
                            if (this.options.notificationsEnabled) {
                                this.registerSessionListener(sessionId);
                            }
                        }
                        else {
                            this.logger.info("PolicyAgent: session " + sessionId + " is invalid");
                        }
                        return [2 /*return*/, res];
                }
            });
        });
    };
    /**
     * Sets the session cookie on the response in a set-cookie header
     */
    PolicyAgent.prototype.setSessionCookie = function (res, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var cookieName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getServerInfo()];
                    case 1:
                        cookieName = (_a.sent()).cookieName;
                        res.append('Set-Cookie', cookie.serialize(cookieName, sessionId, { path: '/' }));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets the session cookie on the response in a set-cookie header
     */
    PolicyAgent.prototype.clearSessionCookie = function (res) {
        return __awaiter(this, void 0, void 0, function () {
            var cookieName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getServerInfo()];
                    case 1:
                        cookieName = (_a.sent()).cookieName;
                        res.clearCookie(cookieName);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets the session ID from the session cookie in the request
     */
    PolicyAgent.prototype.getSessionIdFromRequest = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            var cookieName, cookies, sessionId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getServerInfo()];
                    case 1:
                        cookieName = (_a.sent()).cookieName;
                        cookies = cookie.parse(req.headers.cookie || '');
                        sessionId = cookies[cookieName];
                        if (sessionId) {
                            this.logger.info("PolicyAgent: found sessionId " + sessionId + " in request cookie " + cookieName);
                        }
                        else {
                            this.logger.info("PolicyAgent: missing session ID in request cookie " + cookieName);
                        }
                        return [2 /*return*/, sessionId];
                }
            });
        });
    };
    /**
     * Fetches the user profile for a given username (uid) and saves it to the sessionCache.
     */
    PolicyAgent.prototype.getUserProfile = function (userId, realm, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, err_3, cookieName, profile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sessionCache.get(sessionId)];
                    case 1:
                        cached = _a.sent();
                        if (cached && cached.dn) {
                            return [2 /*return*/, cached];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        err_3 = _a.sent();
                        this.logger.info(err_3);
                        return [3 /*break*/, 3];
                    case 3:
                        this.logger.info('PolicyAgent: profile data is missing from cache - fetching from OpenAM');
                        return [4 /*yield*/, this.getServerInfo()];
                    case 4:
                        cookieName = (_a.sent()).cookieName;
                        return [4 /*yield*/, this.getAgentSession()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.amClient.getProfile(userId, realm, sessionId, cookieName)];
                    case 6:
                        profile = _a.sent();
                        this.sessionCache.put(sessionId, __assign({}, profile, { valid: true }));
                        return [2 /*return*/, profile];
                }
            });
        });
    };
    /**
     * Fetches the user profile for a given username (uid) and saves it to the sessionCache.
     */
    PolicyAgent.prototype.getAgentInformation = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var cookieName, tokenId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getServerInfo()];
                    case 1:
                        cookieName = (_a.sent()).cookieName;
                        return [4 /*yield*/, this.getAgentSession()];
                    case 2:
                        tokenId = (_a.sent()).tokenId;
                        return [4 /*yield*/, this.getAgentInfo(tokenId, cookieName)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets policy decisions from OpenAM. The application name specified in the agent config.
     */
    PolicyAgent.prototype.getPolicyDecision = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var cookieName, tokenId;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getServerInfo()];
                    case 1:
                        cookieName = (_a.sent()).cookieName;
                        return [4 /*yield*/, this.getAgentSession()];
                    case 2:
                        tokenId = (_a.sent()).tokenId;
                        return [2 /*return*/, this.reRequest(function () { return _this.amClient.getPolicyDecision(data, tokenId, cookieName, _this.options.realm); }, 5, 'getPolicyDecision')];
                }
            });
        });
    };
    /**
     * Initializes the shield and returns a middleware function that evaluates the shield.
     *
     * @example
     * const agent = new PolicyAgent(config);
     * const cookieShield = new CookieShield({getProfiles: true});
     *
     * // Express
     * const app = express();
     * app.use(agent.shield(cookieShield));
     * app.listen(3000);
     *
     * // Vanilla Node.js
     * const server = http.createServer(function (req, res) {
     *      var middleware = agent.shield(shield);
     *
     *      if (req.url.match(/some\/path$/) {
     *          middleware(req, res, function () {
     *              res.writeHead(200);
     *              res.write('Hello ' + req.session.data.username);
     *              res.end();
     *          });
     *      }
     * });
     * server.listen(3000);
     */
    PolicyAgent.prototype.shield = function (shield) {
        var _this = this;
        return function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var session, err_4, body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, shield.evaluate(req, res, this)];
                    case 1:
                        session = _a.sent();
                        req['session'] = __assign({}, req['session'], session);
                        next();
                        return [3 /*break*/, 3];
                    case 2:
                        err_4 = _a.sent();
                        this.logger.info('PolicyAgent#shield: evaluation error (%s)', err_4.message);
                        if (this.options.letClientHandleErrors) {
                            next(err_4);
                            return [2 /*return*/];
                        }
                        // only send the response if it hasn't been sent yet
                        if (res.headersSent) {
                            return [2 /*return*/];
                        }
                        body = this.errorTemplate({
                            status: err_4.statusCode,
                            message: err_4.message,
                            details: err_4.stack,
                            pkg: pkg
                        });
                        http_utils_1.sendResponse(res, err_4.statusCode || 500, body, { 'Content-Type': 'text/html' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    };
    /**
     * Express.js Router factory which handles CDSSO (parses the LARES data and sets the session cookie)
     *
     * Note that in order for CDSSO to work, you must have the following:
     * - An agent profile in OpenAM of type "WebAgent" with all alternative app URLs listed in the "Agent Root URL for
     * CDSSO" (agentRootURL) property
     * - The cdsso middleware mounted to the express application
     * - A CookieShield mounted to a path with the cdsso option set to true
  
     * @example
     * const openamAgent = require('openam-agent'),
     *     agent = new openamAgent.PolicyAgent({...}),
     *     app = require('express')();
     *
     * app.use(agent.cdsso('/my/cdsso/path'));
     * app.get('/', new openamAgent.CookieShield(cdsso: true));
     */
    PolicyAgent.prototype.cdsso = function (path) {
        var _this = this;
        if (path === void 0) { path = exports.CDSSO_PATH; }
        this.cdssoPath = path;
        var router = express_1.Router();
        var fail = function (err, res) {
            _this.logger.error(err.message, err);
            var body = _this.errorTemplate({
                status: 401,
                message: 'Unauthorized',
                details: err.stack,
                pkg: pkg
            });
            res.status(403).send(body);
        };
        router.post(path, BodyParser.urlencoded({ extended: false }), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var sessionId, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(req.body && req.body.LARES)) {
                            fail(new Error('PolicyAgent: missing LARES'), res);
                            return [2 /*return*/];
                        }
                        this.logger.info('PolicyAgent: found LARES data; validating CDSSO Assertion.');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getSessionIdFromLARES(req.body.LARES)];
                    case 2:
                        sessionId = _a.sent();
                        this.logger.info("PolicyAgent: CDSSO Assertion validated. Setting cookie for session " + sessionId);
                        return [4 /*yield*/, this.setSessionCookie(res, sessionId)];
                    case 3:
                        _a.sent();
                        res.redirect(req.query.goto || '/');
                        return [3 /*break*/, 5];
                    case 4:
                        err_5 = _a.sent();
                        fail(err_5, res);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        return router;
    };
    /**
     * Parses the LARES response (CDSSO Assertion) and returns the Session ID if valid
     */
    PolicyAgent.prototype.getSessionIdFromLARES = function (lares) {
        return __awaiter(this, void 0, void 0, function () {
            var buffer, doc, assertion, conditions, nameId, now, notBefore, notOnOrAfter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        buffer = Buffer.from(lares, 'base64');
                        return [4 /*yield*/, xml_utils_1.parseXml(buffer.toString())];
                    case 1:
                        doc = _a.sent();
                        assertion = doc['lib:AuthnResponse']['saml:Assertion'][0];
                        conditions = assertion['saml:Conditions'][0];
                        nameId = assertion['saml:AuthenticationStatement'][0]['saml:Subject'][0]['saml:NameIdentifier'][0];
                        now = new Date();
                        notBefore = new Date(conditions.$.NotBefore);
                        notOnOrAfter = new Date(conditions.$.NotOnOrAfter);
                        // check Issuer
                        // OpenAm is returning hostname instead of domain name which we can't change
                        // so we can't match issuer.
                        // if (assertion.$.Issuer !== this.options.serverUrl + '/cdcservlet') {
                        //   throw new Error('Unknown issuer: ' + assertion.$.Issuer);
                        // }
                        // check AuthnResponse dates
                        if (now < notBefore || now >= notOnOrAfter) {
                            throw new Error("The CDSSO Assertion is not in date: " + notBefore + " -  " + notOnOrAfter);
                        }
                        return [2 /*return*/, nameId._];
                }
            });
        });
    };
    /**
     * Returns a regular login URL
     */
    PolicyAgent.prototype.getLoginUrl = function (req) {
        return this.amClient.getLoginUrl(http_utils_1.baseUrl(req) + req.url, this.options.realm);
    };
    /**
     * Returns a CDSSO login URL
     */
    PolicyAgent.prototype.getCDSSOUrl = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            var loginUrl, sessionId, agentInfo, err_6, target;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loginUrl = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getSessionIdFromRequest(req)];
                    case 2:
                        sessionId = _a.sent();
                        return [4 /*yield*/, this.getAgentInformation(sessionId)];
                    case 3:
                        agentInfo = _a.sent();
                        loginUrl = this.getConditionalLoginUrl(agentInfo);
                        return [3 /*break*/, 5];
                    case 4:
                        err_6 = _a.sent();
                        this.logger.error("PolicyAgent: " + err_6.message, err_6);
                        return [3 /*break*/, 5];
                    case 5:
                        target = http_utils_1.baseUrl(req) + this.cdssoPath + '?goto=' + encodeURIComponent(req.url || '');
                        return [2 /*return*/, this.amClient.getCDSSOUrl(target, loginUrl || null, this.options.appUrl || '')];
                }
            });
        });
    };
    PolicyAgent.prototype.getConditionalLoginUrl = function (agentInfo) {
        if (!agentInfo) {
            return null;
        }
        var customProps = agentInfo["com.sun.identity.agents.config.freeformproperties"];
        if (customProps.indexOf("org.forgerock.openam.agents.config.allow.custom.login=true") === -1) {
            return null;
        }
        var customUrl = customProps.find(function (prop) { return prop.includes("com.sun.identity.agents.config.login.url"); });
        var conditionalUrls = customProps.filter(function (prop) { return prop.includes("com.forgerock.agents.conditional.login.url"); });
        // If connditional urls present, get the map with app urls
        var conditionalUrlMap = this.getConditionalUrlMap(conditionalUrls);
        for (var appCondition in conditionalUrlMap) {
            if (this.options.appUrl.indexOf(appCondition) > -1) {
                return conditionalUrlMap[appCondition];
            }
        }
        // If global custom url is present then redirect to that
        if (customUrl && customUrl.indexOf("=") > -1) {
            customUrl = customUrl.replace(/ /g, '');
            return customUrl.split("=")[1];
        }
    };
    PolicyAgent.prototype.getConditionalUrlMap = function (conditionalUrls) {
        var urlMaps = {};
        conditionalUrls.forEach(function (conditionalUrlKey) {
            conditionalUrlKey = conditionalUrlKey.replace(/ /g, '');
            // store queryparams first if login url has any
            var extratQueryParams = conditionalUrlKey.split('?')[1];
            // Keep without query parameters part
            conditionalUrlKey = conditionalUrlKey.split('?')[0];
            // Get conditional url values with conditions
            var conditionalUrlVal = conditionalUrlKey.split("=")[1];
            // Split condition with actual login url
            if (conditionalUrlVal && conditionalUrlVal.indexOf("|") > -1) {
                var loginUrl = conditionalUrlVal.split("|")[1];
                // Append query params back
                if (extratQueryParams) {
                    loginUrl = loginUrl + "?" + extratQueryParams;
                }
                urlMaps[conditionalUrlVal.split("|")[0]] = loginUrl;
            }
        });
        return urlMaps;
    };
    /**
     * A express router factory for the notification receiver endpoint. It can be used as a middleware for your express
     * application. It adds a single route: /agent/notifications which can be used to receive notifications from OpenAM.
     * When a notification is received, its contents will be parsed and handled by one of the handler functions.
     *
     * @example
     * var app = require('express')(),
     *     agent = require('openam-agent').policyAgent(options);
     *
     * app.use(agent.notifications('/my/notification/path'));
     */
    PolicyAgent.prototype.notifications = function (path) {
        var _this = this;
        if (path === void 0) { path = exports.NOTIFICATION_PATH; }
        this.notificationPath = path;
        this.options.notificationsEnabled = true;
        var router = express_1.Router();
        router.post(path, BodyParser.text({ type: 'text/xml' }), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var xml, svcid, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.debug("PolicyAgent: notification received: \n " + req.body);
                        res.send();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, xml_utils_1.parseXml(req.body)];
                    case 2:
                        xml = _a.sent();
                        svcid = xml.NotificationSet.$.svcid;
                        if (svcid === 'session') {
                            this.sessionNotification(xml.NotificationSet);
                        }
                        else {
                            this.logger.error("PolicyAgent: unknown notification type " + svcid);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_7 = _a.sent();
                        this.logger.error("PolicyAgent: " + err_7.message, err_7);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        return router;
    };
    /**
     * Parses notifications in a notification set and emits a 'session' event for each. CookieShield instances listen
     * on this event to delete any destroyed cookies from the agent's session cache.
     * @fires 'session'
     */
    PolicyAgent.prototype.sessionNotification = function (notificationSet) {
        var _this = this;
        notificationSet.Notification.forEach(function (notification) { return __awaiter(_this, void 0, void 0, function () {
            var xml;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, xml_utils_1.parseXml(notification)];
                    case 1:
                        xml = _a.sent();
                        this.emit(exports.SESSION_EVENT, xml.SessionNotification.Session[0].$);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Cleans up after the agent (closes the cache and logs out the agent)
     */
    PolicyAgent.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tokenId, cookieName, err_8, err_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.agentSession) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getAgentSession()];
                    case 1:
                        tokenId = (_a.sent()).tokenId;
                        return [4 /*yield*/, this.getServerInfo()];
                    case 2:
                        cookieName = (_a.sent()).cookieName;
                        this.logger.info("PolicyAgent: destroying agent session " + tokenId);
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.amClient.logout(tokenId, cookieName, tokenId, this.options.realm)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_8 = _a.sent();
                        // ignore
                        this.logger.info('PolicyAgent#destroy: logout request error (%s)', err_8.message);
                        return [3 /*break*/, 6];
                    case 6:
                        this.agentSession = null;
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, this.sessionCache.quit()];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        err_9 = _a.sent();
                        // ignore
                        this.logger.info('PolicyAgent#destroy: cache clear error (%s)', err_9.message);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cleans up user session
     */
    PolicyAgent.prototype.clearUserSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenId, cookieName, err_10, err_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAgentSession()];
                    case 1:
                        tokenId = (_a.sent()).tokenId;
                        return [4 /*yield*/, this.getServerInfo()];
                    case 2:
                        cookieName = (_a.sent()).cookieName;
                        this.logger.info("PolicyAgent: destroying user session " + sessionId + " using agent token " + tokenId);
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.amClient.logout(tokenId, cookieName, sessionId, this.options.realm)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_10 = _a.sent();
                        this.logger.info('PolicyAgent#destroy: logout request error (%s)', err_10.message);
                        return [3 /*break*/, 6];
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.sessionCache.quit()];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        err_11 = _a.sent();
                        this.logger.info('PolicyAgent#destroy: cache clear error (%s)', err_11.message);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    PolicyAgent.prototype.logout = function () {
        var _this = this;
        return function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var err_12, sessionId, err_13, body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.clearSessionCookie(res)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_12 = _a.sent();
                        this.logger.info('PolicyAgent#logout: clear session cookie error (%s)', err_12.message);
                        return [3 /*break*/, 3];
                    case 3:
                        _a.trys.push([3, 8, , 9]);
                        return [4 /*yield*/, this.getSessionIdFromRequest(req)];
                    case 4:
                        sessionId = _a.sent();
                        if (!sessionId) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.clearUserSession(sessionId)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        this.logger.info("PolicyAgent#logout: sessionId " + sessionId + " not found in request.");
                        _a.label = 7;
                    case 7:
                        next();
                        return [3 /*break*/, 9];
                    case 8:
                        err_13 = _a.sent();
                        this.logger.info('PolicyAgent#logout: logout request error (%s)', err_13.message);
                        if (this.options.letClientHandleErrors) {
                            next(err_13);
                            return [2 /*return*/];
                        }
                        // only send the response if it hasn't been sent yet
                        if (res.headersSent) {
                            return [2 /*return*/];
                        }
                        body = this.errorTemplate({
                            status: err_13.statusCode,
                            message: err_13.message,
                            details: err_13.stack,
                            pkg: pkg
                        });
                        http_utils_1.sendResponse(res, err_13.statusCode || 500, body, { 'Content-Type': 'text/html' });
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        }); };
    };
    /**
     * Constructs a RequestSet document containing a AddSessionListener node for sessionId, and sends it to the
     * SessionService.
     */
    PolicyAgent.prototype.registerSessionListener = function (sessionId) {
        var _this = this;
        return this.reRequest(function () { return __awaiter(_this, void 0, void 0, function () {
            var tokenId, sessionRequest, requestSet, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAgentSession()];
                    case 1:
                        tokenId = (_a.sent()).tokenId;
                        sessionRequest = XMLBuilder
                            .create({
                            SessionRequest: {
                                '@vers': '1.0',
                                '@reqid': ShortId.generate(),
                                '@requester': Buffer.from("token: " + tokenId).toString('base64')
                            }
                        })
                            .ele('AddSessionListener')
                            .ele({
                            'URL': this.options.appUrl + this.notificationPath,
                            'SessionID': sessionId
                        })
                            .end();
                        requestSet = XMLBuilder
                            .create({
                            RequestSet: {
                                '@vers': '1.0',
                                '@svcid': 'Session',
                                '@reqid': ShortId.generate()
                            }
                        })
                            .ele('Request')
                            .cdata(sessionRequest)
                            .end();
                        return [4 /*yield*/, this.validateSession(tokenId)];
                    case 2:
                        res = _a.sent();
                        // this hack is needed because the SessionService is stupid and returns 200 even if there is an error...
                        if (!res.valid) {
                            throw new invalid_session_error_1.InvalidSessionError();
                        }
                        return [4 /*yield*/, this.amClient.sessionServiceRequest(requestSet)];
                    case 3:
                        _a.sent();
                        this.logger.info('PolicyAgent: registered session listener for %s', sessionId);
                        return [2 /*return*/];
                }
            });
        }); }, 5, 'registerSessionListener');
    };
    /**
     * Registers a handler for expired session events to remove any expired sessions from the cache
     */
    PolicyAgent.prototype.registerSessionExpiryHandler = function () {
        var _this = this;
        this.on(exports.SESSION_EVENT, function (session) {
            if (session.state === 'destroyed') {
                _this.logger.info('PolicyAgent: removing destroyed session from cache: %s', session.sid);
                _this.sessionCache.remove(session.sid);
            }
        });
    };
    /**
     * Registers a process exit hook to call destroy() before exiting
     * Shutdown-handler registers hooks when it's required, which causes the tests to hang
     */
    PolicyAgent.prototype.registerShutdownHandler = function () {
        var _this = this;
        if (process.env.NODE_ENV === 'test') {
            return;
        }
        require('shutdown-handler').on('exit', function (event) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.preventDefault();
                        return [4 /*yield*/, this.destroy()];
                    case 1:
                        _a.sent();
                        process.exit();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Compiles the default error page with Handlebars.js
     */
    PolicyAgent.prototype.getDefaultErrorTemplate = function () {
        return Handlebars.compile(fs.readFileSync(path_1.resolve(__dirname, '../templates/error.handlebars')).toString());
    };
    return PolicyAgent;
}(events_1.EventEmitter));
exports.PolicyAgent = PolicyAgent;
//# sourceMappingURL=policy-agent.js.map