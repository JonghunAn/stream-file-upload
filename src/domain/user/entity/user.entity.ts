export type User = {
  userDID: string;
  pushTokenType: string;
  pushToken: string;
  socketAddress: string;
  planType: PlanType;
  planEndTime: number;
  subscriptionPeriod: PlanPeriod | null;
  subscriptionStartTime: number | null;
  subscriptionEndTime: number | null;
};

export const OPlanType = {
  BASIC: 'B',
  STANDARD: 'S',
  FREE: 'F',
} as const;

export const OPlanPeriod = {
  ONE_MONTH: '1M',
  THREE_MONTH: '3M',
  SIX_MONTH: '6M',
  ONE_YEAR: '1Y',
  THREE_YEAR: '3Y',
  LIFETIME: 'LT',
  GRACE: 'GRACE',
  FREE_TRIAL: 'FREE_TRIAL',
} as const;

export type PlanType = typeof OPlanType[keyof typeof OPlanType];
export type PlanPeriod = typeof OPlanPeriod[keyof typeof OPlanPeriod];

export type UpdateUserOption = Partial<Omit<User, 'userDID'>>;
