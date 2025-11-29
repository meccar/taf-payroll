export const SUCCESS_MESSAGES = {
  SUCCESS: 'SUCCESS',
  CREATED_SUCCESS: 'CREATED_SUCCESS',
  UPDATED_SUCCESS: 'UPDATED_SUCCESS',
  DELETED_SUCCESS: 'DELETED_SUCCESS',
} as const;

export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES;
export type SuccessMessageValue = (typeof SUCCESS_MESSAGES)[SuccessMessageKey];
