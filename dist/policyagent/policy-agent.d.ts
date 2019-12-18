/// <reference types="node" />
import { EventEmitter } from 'events';
import { RequestHandler } from 'express';
import * as Handlebars from 'handlebars';
import { IncomingMessage, ServerResponse } from 'http';
import { Logger } from 'winston';
import { AmClient } from '../amclient/am-client';
import { AmPolicyDecision } from '../amclient/am-policy-decision';
import { AmPolicyDecisionRequest } from '../amclient/am-policy-decision-request';
import { AmServerInfo } from '../amclient/am-server-info';
import { Cache } from '../cache/cache';
import { Shield } from '../shield/shield';
import { PolicyAgentOptions } from './policy-agent-options';
export declare const SESSION_EVENT = "session";
export declare const CDSSO_PATH = "/agent/cdsso";
export declare const NOTIFICATION_PATH = "/agent/notifications";
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
export declare class PolicyAgent extends EventEmitter {
    readonly options: PolicyAgentOptions;
    readonly id: string;
    amClient: AmClient;
    logger: Logger;
    sessionCache: Cache;
    private serverInfo?;
    private agentSession?;
    private agentInfo?;
    private errorTemplate;
    private cdssoPath;
    private notificationPath;
    constructor(options: PolicyAgentOptions);
    /**
     * Returns the cached AM server info (cookie name & domain list)
     */
    getServerInfo(): Promise<AmServerInfo>;
    /**
     * Returns a cached agent session
     */
    getAgentSession(): Promise<{
        tokenId: string;
    }>;
    /**
     * Returns a cached agent session
     */
    getAgentInfo(tokenId: string, cookieName: string): Promise<Object>;
    /**
     * Creates a new agent session
     */
    authenticateAgent(): Promise<{
        tokenId: string;
    }>;
    /**
     * Retry sending a request a specified number of times. If the response status is 401, renew the agent session
     */
    reRequest<T = any>(request: () => Promise<T>, attemptLimit?: number, name?: string): Promise<T>;
    validateSession(sessionId: string): Promise<any>;
    /**
     * Sets the session cookie on the response in a set-cookie header
     */
    setSessionCookie(res: ServerResponse, sessionId: string): Promise<void>;
    /**
     * Sets the session cookie on the response in a set-cookie header
     */
    clearSessionCookie(res: ServerResponse): Promise<void>;
    /**
     * Gets the session ID from the session cookie in the request
     */
    getSessionIdFromRequest(req: IncomingMessage): Promise<string>;
    /**
     * Fetches the user profile for a given username (uid) and saves it to the sessionCache.
     */
    getUserProfile(userId: string, realm: string, sessionId: string): Promise<any>;
    /**
     * Fetches the user profile for a given username (uid) and saves it to the sessionCache.
     */
    getAgentInformation(): Promise<Object>;
    /**
     * Gets policy decisions from OpenAM. The application name specified in the agent config.
     */
    getPolicyDecision(data: AmPolicyDecisionRequest): Promise<AmPolicyDecision[]>;
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
    shield(shield: Shield): RequestHandler;
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
    cdsso(path?: string): import("@forgerock/openam-agent/node_modules/@types/express-serve-static-core").Router;
    /**
     * Parses the LARES response (CDSSO Assertion) and returns the Session ID if valid
     */
    getSessionIdFromLARES(lares: string): Promise<string>;
    /**
     * Returns a regular login URL
     */
    getLoginUrl(req: IncomingMessage): string;
    /**
     * Returns a CDSSO login URL
     */
    getCDSSOUrl(req: IncomingMessage): Promise<string>;
    getConditionalLoginUrl(agentInfo: any): string;
    getConditionalUrlMap(conditionalUrls: Array<string>): Object;
    /**
     * Returns custom access denied page
     */
    getAccessDeniedUrl(): Promise<string>;
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
    notifications(path?: string): import("@forgerock/openam-agent/node_modules/@types/express-serve-static-core").Router;
    /**
     * Parses notifications in a notification set and emits a 'session' event for each. CookieShield instances listen
     * on this event to delete any destroyed cookies from the agent's session cache.
     * @fires 'session'
     */
    sessionNotification(notificationSet: any): void;
    /**
     * Cleans up after the agent (closes the cache and logs out the agent)
     */
    destroy(): Promise<void>;
    /**
     * Cleans up user session
     */
    clearUserSession(sessionId: any): Promise<void>;
    logout(): RequestHandler;
    /**
     * Constructs a RequestSet document containing a AddSessionListener node for sessionId, and sends it to the
     * SessionService.
     */
    protected registerSessionListener(sessionId: string): Promise<void>;
    /**
     * Registers a handler for expired session events to remove any expired sessions from the cache
     */
    protected registerSessionExpiryHandler(): void;
    /**
     * Registers a process exit hook to call destroy() before exiting
     * Shutdown-handler registers hooks when it's required, which causes the tests to hang
     */
    protected registerShutdownHandler(): void;
    /**
     * Compiles the default error page with Handlebars.js
     */
    protected getDefaultErrorTemplate(): Handlebars.TemplateDelegate<any>;
}
