export const USER_MESSAGES = {
  USER_CREATED: 'User created successfully',
} as const;

export type UserMessageKey = keyof typeof USER_MESSAGES;
export type UserMessageValue = (typeof USER_MESSAGES)[UserMessageKey];
