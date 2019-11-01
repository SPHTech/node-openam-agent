import { AmPolicyDecision } from './am-policy-decision';
import { AmPolicyDecisionRequest } from './am-policy-decision-request';
import { AmServerInfo } from './am-server-info';
/**
 * ForgeRock OpenAM / Access Management client
 * Supports OpenAM 13 and above. Policy decisions via REST are only available in 13.5 and above.
 */
export declare class AmClient {
    serverUrl: string;
    serverAddress: string;
    hostname?: string;
    constructor(serverUrl: string, privateIp?: string);
    /**
     * Gets the results of /json/serverinfo/*
     */
    getServerInfo(): Promise<AmServerInfo>;
    /**
     * Gets a agent's info (requires an admin session).
     */
    getAgentInfo(agentId: string, realm: string, sessionId: string, cookieName: string): Promise<any>;
    /**
     * Sends an authentication request to OpenAM. Returns Promise. The module argument overrides service. The default
     * realm is /. If noSession is true, the credentials will be validated but no session will be created.
     */
    authenticate(username: string, password: string, realm?: string, service?: string, module?: string, noSession?: boolean): Promise<{
        tokenId: string;
    }>;
    /**
     * Sends a logout request to OpenAM to to destroy the session identified by sessionId
     */
    logout(sessionId: string, cookieName: string, realm?: string): Promise<any>;
    /**
     * Validates a given sessionId against OpenAM.
     */
    validateSession(sessionId: string): Promise<{
        valid: boolean;
    }>;
    /**
     * Returns an OpenAM login URL with the goto query parameter set to the original URL in req.
     */
    getLoginUrl(goto?: string, realm?: string): string;
    /**
     * Constructs a CDSSO login URL
     *
     * @param {string} target Target URL
     * @param {string} provider ProviderId (app URL)
     * @return {string}
     */
    getCDSSOUrl(target: string, loginUrl: string, provider: string): string;
    /**
     * Gets policy decisions from OpenAM for params. params must be a well formatted OpenAM policy request object.
     * It needs a valid sessionId and cookieName in order to make the request. (The user to whom the session belongs needs
     * to have the REST calls for policy evaluation privilege in OpenAM.
     */
    getPolicyDecision(data: AmPolicyDecisionRequest, sessionId: string, cookieName: string, realm?: string): Promise<AmPolicyDecision[]>;
    /**
     * Sends requestSet to the SessionService. requestSet must be a properly formatted XML document.
     *
     * @param {object} requestSet Session service request set
     * @return {Promise} Session service response
     */
    sessionServiceRequest(requestSet: string): Promise<any>;
    /**
     * Validates the OAuth2 access_token in the specified realm.
     *
     * @param {string} accessToken OAuth2 access_token
     * @param {string} [realm=/]
     * @return {Promise} Token info response
     */
    validateAccessToken(accessToken: string, realm?: string): Promise<any>;
    /**
     * Gets a user's profile (requires an agent or admin session).
     */
    getProfile(userId: string, realm: string, sessionId: string, cookieName: string): Promise<any>;
}
/**
 * Alias to the old name
 * @deprecated
 */
export declare const OpenAMClient: typeof AmClient;
