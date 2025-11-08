export interface BulkUpsertResult<TPayload, TExisting> {
  toCreate: TPayload[];
  toUpdate: Array<{ payload: TPayload; existing: TExisting }>;
  toDelete: Array<{ payload: TPayload; existing?: TExisting }>;
  stats: {
    create: number;
    update: number;
    delete: number;
  };
}

export interface BulkUpsertOptions<TPayload> {
  /**
   * Property name used to uniquely identify records. Defaults to `code`.
   */
  identifierKey?: keyof TPayload | string;
  /**
   * Custom predicate to determine whether a payload entry should be treated as a delete.
   */
  isDeletedPredicate?: (payload: TPayload) => boolean;
  /**
   * Optional normalizer for identifier values before lookup, e.g. trim or lowercase.
   */
  normalizeIdentifier?: (value: unknown) => string;
}

const DEFAULT_IDENTIFIER_KEY = 'code';

function defaultNormalizeIdentifier(value: unknown): string {
  if (value === undefined || value === null) return '';

  if (typeof value === 'string') return value.trim();

  if (
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    typeof value === 'boolean'
  )
    return String(value);

  if (value instanceof Date) return value.toISOString();

  throw new TypeError(
    `Identifier values must be primitive types or Date, received "${typeof value}".`,
  );
}

function defaultIsDeletedPredicate(payload: Record<string, unknown>): boolean {
  return Boolean(
    payload.is_deleted === true ||
      payload.isDeleted === true ||
      payload.deleted_at ||
      payload.deletedAt,
  );
}

export function bulkUpsert<
  TPayload extends Record<string, unknown>,
  TExisting extends Record<string, unknown>,
>(
  payload: TPayload[],
  existing: TExisting[],
  options: BulkUpsertOptions<TPayload> = {},
): BulkUpsertResult<TPayload, TExisting> {
  const identifierKey = options.identifierKey ?? DEFAULT_IDENTIFIER_KEY;
  const normalizeIdentifier =
    options.normalizeIdentifier ?? defaultNormalizeIdentifier;
  const isDeleted =
    options.isDeletedPredicate ??
    (defaultIsDeletedPredicate as (payload: TPayload) => boolean);

  const existingMap = new Map<string, TExisting>();
  for (const existingItem of existing) {
    const identifierValue =
      existingItem[identifierKey as keyof TExisting] ??
      existingItem[String(identifierKey)];

    if (identifierValue === undefined || identifierValue === null) continue;

    existingMap.set(normalizeIdentifier(identifierValue), existingItem);
  }

  const toCreate: TPayload[] = [];
  const toUpdate: Array<{ payload: TPayload; existing: TExisting }> = [];
  const toDelete: Array<{ payload: TPayload; existing?: TExisting }> = [];

  for (const payloadItem of payload) {
    const identifierValue =
      payloadItem[identifierKey as keyof TPayload] ??
      payloadItem[String(identifierKey)];

    if (identifierValue === undefined || identifierValue === null) {
      toCreate.push(payloadItem);
      continue;
    }

    const normalizedIdentifier = normalizeIdentifier(identifierValue);
    const existingItem = existingMap.get(normalizedIdentifier);
    const markedForDeletion = isDeleted(payloadItem);

    if (!existingItem) {
      if (markedForDeletion) toDelete.push({ payload: payloadItem });
      else toCreate.push(payloadItem);
      continue;
    }

    if (markedForDeletion) {
      toDelete.push({ payload: payloadItem, existing: existingItem });
      continue;
    }

    toUpdate.push({ payload: payloadItem, existing: existingItem });
  }

  return {
    toCreate,
    toUpdate,
    toDelete,
    stats: {
      create: toCreate.length,
      update: toUpdate.length,
      delete: toDelete.length,
    },
  };
}
