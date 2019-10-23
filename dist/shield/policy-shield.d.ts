/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { AmPolicyDecisionRequest } from '..';
import { PolicyAgent } from '../policyagent/policy-agent';
import { SessionData } from './session-data';
import { Shield } from './shield';
export declare class PolicyShield implements Shield {
    readonly applicationName: string;
    readonly pathOnly: boolean;
    constructor(applicationName?: string, pathOnly?: boolean);
    evaluate(req: IncomingMessage, res: ServerResponse, agent: PolicyAgent): Promise<SessionData>;
    toDecisionParams(req: IncomingMessage, ssoToken: string): AmPolicyDecisionRequest;
}
