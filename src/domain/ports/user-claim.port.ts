import { UserClaim } from '../entities';
import { DeleteResult } from '../types';
import { BasePort } from './base.port';

export interface UserClaimPort extends BasePort<UserClaim> {
  getClaims(userId: string): Promise<UserClaim[]>;
  addClaim(
    userId: string,
    claimType: string,
    claimValue: string,
    transaction?: any,
  ): Promise<UserClaim>;
  replaceClaim(
    userId: string,
    claimType: string,
    claimValue: string,
    newClaimType: string,
    newClaimValue: string,
    transaction?: any,
  ): Promise<boolean>;
  removeClaim(
    userId: string,
    claimType: string,
    claimValue: string,
    transaction?: any,
  ): Promise<DeleteResult>;
}
