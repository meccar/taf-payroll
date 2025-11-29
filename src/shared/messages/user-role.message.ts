export const USER_ROLE_MESSAGES = {
  ERR_FAILED_TO_CREATE_USER_ROLE: 'ERR_FAILED_TO_CREATE_USER_ROLE',
};

export type UserRoleMessageKey = keyof typeof USER_ROLE_MESSAGES;
export type UserRoleMessageValue =
  (typeof USER_ROLE_MESSAGES)[UserRoleMessageKey];
