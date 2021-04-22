/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { PolicyAgent } from '../policyagent/policy-agent';
import { SessionData } from './session-data';
import { Shield } from './shield';
/**
 * Shield implementation for enforcing Oauth2 access_tokens. This Shield implementation validates an OAuth2 access_token
 * issued by OpenAM, using OpenAM's /oauth2/tokeninfo service. The access_token must be sent in an Authorization header.
 */
export declare class Oauth2Shield implements Shield {
    readonly realm: string;
    constructor(realm?: string);
    evaluate(req: IncomingMessage, res: ServerResponse, agent: PolicyAgent): Promise<SessionData>;
    getAccessTokenFromRequest(req: IncomingMessage): string;
    getTokenInfo(agent: PolicyAgent, accessToken: string): Promise<any>;
}
