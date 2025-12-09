import { UserClaim } from '../entities';
import { DeleteResult } from '../types';
import { BaseAdapter } from './base.adapter';

export abstract class UserClaimAdapter extends BaseAdapter<UserClaim> {
  abstract getClaims(userId: string): Promise<UserClaim[]>;
  abstract addClaim(
    userId: string,
    claimType: string,
    claimValue: string,
    transaction?: any,
  ): Promise<UserClaim>;
  abstract replaceClaim(
    userId: string,
    claimType: string,
    claimValue: string,
    newClaimType: string,
    newClaimValue: string,
    transaction?: any,
  ): Promise<boolean>;
  abstract removeClaim(
    userId: string,
    claimType: string,
    claimValue: string,
    transaction?: any,
  ): Promise<DeleteResult>;
}
