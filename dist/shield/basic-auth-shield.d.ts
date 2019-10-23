/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { PolicyAgent } from '../policyagent/policy-agent';
import { SessionData } from './session-data';
import { Shield } from './shield';
export interface BasicAuthShieldOptions {
    realm?: string;
    service?: string;
    module?: string;
}
/**
 * Shield implementation for enforcing a basic auth header. The credentials in the Authorization will be sent to OpenAM.
 * No session will be created.
 */
export declare class BasicAuthShield implements Shield {
    readonly options: BasicAuthShieldOptions;
    constructor(options: BasicAuthShieldOptions);
    /**
     * The returned Promise is wrapped in a Deferred object. This is because in case of a 401 challenge, the Promise
     * must not be resolved (if the Promise is resolved, the agent treats it as success). A challenge is neither success
     * nor failure.
     */
    evaluate(req: IncomingMessage, res: ServerResponse, agent: PolicyAgent): Promise<SessionData>;
    private sendChallenge;
    private authenticate;
}
