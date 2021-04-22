/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { PolicyAgent } from '../policyagent/policy-agent';
import { SessionData } from './session-data';
import { Shield } from './shield';
export interface CookieShieldOptions {
    /**
     *  If true, the agent will not redirect to OpenAM's login page for authentication, only return a 401 response
     */
    noRedirect?: boolean;
    /**
     * If true, the agent will fetch and cache the user's profile when validating the session
     */
    getProfiles?: boolean;
    /**
     * If true, the shield will not enforce valid sessions. This is useful in conjunction with {getProfiles:true
     * when a route is public but you want fetch identity information for any logged in users.
     */
    passThrough?: boolean;
    /**
     * Enable CDSSO mode (you must also mount the agent.cdsso() middleware to your application)
     */
    cdsso?: boolean;
}
/**
 * Shield implementation for validating session cookies. This shield checks if the request contains a session cookie
 * and validates it against OpenAM. The session is cached if notifications are enabled, otherwise it's re-validated for
 * every request.
 *
 * The returned Promise is wrapped in a Deferred object. This is because in case of a redirect to login, the Promise
 * must not be resolved (if the Promise is resolved, the agent treats it as success). A redirect is neither success
 * nor failure.
 */
export declare class CookieShield implements Shield {
    readonly options: CookieShieldOptions;
    constructor(options?: CookieShieldOptions);
    evaluate(req: IncomingMessage, res: ServerResponse, agent: PolicyAgent): Promise<SessionData>;
    private handleSessionCookie;
    private checkDomainMatch;
    private redirectToLogin;
}
