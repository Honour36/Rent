// The `paynow` npm package ships no .d.ts files. These declarations are
// deliberately minimal - only what billing.service.ts actually uses - and
// were verified directly against node_modules/paynow/dist/paynow.js rather
// than the README, which documents a `status.paid()` helper that doesn't
// actually exist on the installed version's response object. Use the raw
// lowercased `status` string instead (see billing.service.ts).
declare module 'paynow' {
  export class Payment {
    reference: string;
    authEmail?: string;
    add(title: string, amount: number, quantity?: number): Payment;
  }

  export interface InnbucksInfo {
    authorizationcode: string;
    deep_link_url: string;
    qr_code: string;
    expires_at: string;
  }

  export class InitResponse {
    status: string;
    success: boolean;
    hasRedirect: boolean;
    isInnbucks: boolean;
    error?: string;
    pollUrl?: string;
    redirectUrl?: string;
    instructions?: string;
    innbucks_info?: InnbucksInfo[];
  }

  export class Paynow {
    constructor(integrationId?: string, integrationKey?: string, resultUrl?: string, returnUrl?: string);
    integrationId: string;
    integrationKey: string;
    resultUrl: string;
    returnUrl: string;
    createPayment(reference: string, authEmail?: string): Payment;
    send(payment: Payment): Promise<InitResponse>;
    sendMobile(payment: Payment, phone: string, method: 'ecocash' | 'onemoney'): Promise<InitResponse>;
    pollTransaction(url: string): Promise<InitResponse>;
  }
}
