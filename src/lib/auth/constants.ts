export const userGroups = {
  PBE_COMMISSIONER: null,
  PBE_HEAD_OFFICE: null,
  PBE_DEVELOPMENT_TEAM: null,
  TRADING_CARDS_DEPARTMENT_HEAD: null,
  TRADING_CARDS_CARD_MAKER: null,
} as const;

export type RoleGroup = (keyof Readonly<typeof userGroups>)[];

export const CAN_ISSUE_PACKS: RoleGroup = ["TRADING_CARDS_DEPARTMENT_HEAD"];
export const CAN_CLAIM_CARDS: RoleGroup = [
  "TRADING_CARDS_DEPARTMENT_HEAD",
  "TRADING_CARDS_CARD_MAKER",
];
export const CAN_SUBMIT_CARDS: RoleGroup = [
  "TRADING_CARDS_DEPARTMENT_HEAD",
  "TRADING_CARDS_CARD_MAKER",
];
export const CAN_APPROVE_CARDS: RoleGroup = [
  "TRADING_CARDS_DEPARTMENT_HEAD",
  "TRADING_CARDS_CARD_MAKER",
];
