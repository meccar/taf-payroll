export const SUCCESS_MESSAGES = {
  SUCCESS: 'Success',
  CREATED_SUCCESS: 'Created successfully',
} as const;

export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES;
export type SuccessMessageValue = (typeof SUCCESS_MESSAGES)[SuccessMessageKey];
