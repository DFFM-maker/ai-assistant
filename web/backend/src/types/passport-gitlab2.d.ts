declare module 'passport-gitlab2' {
  import { Strategy as PassportStrategy } from 'passport-strategy';
  import { Request } from 'express';

  export interface Profile {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    profileUrl: string;
    emails: Array<{ value: string; verified: boolean }>;
    _raw: string;
    _json: any;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    baseURL?: string;
    scope?: string[];
  }

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void
  ) => void;

  export class Strategy extends PassportStrategy {
    name: string;
    constructor(options: StrategyOptions, verify: VerifyFunction);
    authenticate(req: Request, options?: any): any;
  }
}