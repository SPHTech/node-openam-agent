export interface AmPolicyDecisionRequest {
  resources: string[];
  application: string;
  subject: { ssoToken: string };
  environment: { [ key: string ]: string[]; };
}
