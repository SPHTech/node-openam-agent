import { IncomingMessage, ServerResponse } from 'http';
import * as url from 'url';
import { AmPolicyDecision, AmPolicyDecisionRequest, ShieldEvaluationError } from '..';

import { PolicyAgent } from '../policyagent/policy-agent';
import { SessionData } from './session-data';
import { Shield } from './shield';
import { Deferred } from '../utils/deferred';
import { baseUrl, redirect } from '../utils/http-utils';

export class PolicyShield implements Shield {
  constructor(readonly applicationName: string = 'iPlanetAMWebAgentService',
              readonly pathOnly = false) {}

  async evaluate(req: IncomingMessage, res: ServerResponse, agent: PolicyAgent): Promise<SessionData> {
    const deferred = new Deferred<SessionData>();

    const sessionId = await agent.getSessionIdFromRequest(req);
    const params = this.toDecisionParams(req, sessionId);

    agent.logger.debug(`PolicyShield: requesting policy decision for ${JSON.stringify(params, null, 2)}`);

    let decision: AmPolicyDecision[] = [];

    try {
      decision = await agent.getPolicyDecision(params);
    } catch (err) {
      throw new ShieldEvaluationError(
        err.statusCode || err.status || 500,
        err.name || err.message,
        err.stack + '\n' + JSON.stringify(err, null, 2)
      );
    }

    agent.logger.debug(`PolicyShield: got policy decision ${JSON.stringify(decision, null, 2)}`);

    if (decision && decision[ 0 ].actions[ req.method ]) {
      agent.logger.info(`PolicyShield: ${req.url} => allow`);
      const session = req[ 'session' ] || { data: {} };
      session.data.policies = decision;
      return session;
    }

    agent.logger.info(`PolicyShield: ${req.url} => deny`);

    try {
      await this.redirectToAccessDenied(req, res, agent, params.resources);
    } catch (err) {
      throw new ShieldEvaluationError(403, 'Forbidden', 'You are not authorized to access this resource.');
    }

    return await deferred.promise;

  }

  toDecisionParams(req: IncomingMessage, ssoToken: string): AmPolicyDecisionRequest {
    let resourceName = req[ 'originalUrl' ] ? baseUrl(req) + req[ 'originalUrl' ] : baseUrl(req) + req.url;

    if (this.pathOnly) {
      const { path } = url.parse(req.url);
      resourceName = path;
    }

    return {
      resources: [ resourceName ],
      application: this.applicationName,
      subject: { ssoToken }
    };
  }

  private async redirectToAccessDenied(req: IncomingMessage, res: ServerResponse, agent: PolicyAgent, resources: Array<string>) {
    let accessDeniedUrl = await agent.getAccessDeniedUrl();
    let goto = resources && resources[ 0 ];
    if (accessDeniedUrl) {
      accessDeniedUrl += (accessDeniedUrl.includes('?') ? '&' : '?') + 'goto=' + goto;
      await agent.clearSessionCookie(res);
      redirect(res, accessDeniedUrl);
    }
  }

}
