import { InternalServerErrorException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Transaction, TransactionOptions } from 'sequelize';

export interface TransactionalOptions extends Partial<TransactionOptions> {
  connectionPropertyKey?: string;
}

const DEFAULT_CONNECTION_KEYS = [
  'sequelize',
  'sequelizeInstance',
  'connection',
  'db',
  'database',
] as const;

function isTransaction(value: unknown): value is Transaction {
  return value instanceof Transaction;
}

function resolveSequelizeInstance(
  context: Record<string, unknown>,
  connectionPropertyKey?: string,
): Sequelize | undefined {
  const keysToCheck = connectionPropertyKey
    ? [connectionPropertyKey]
    : DEFAULT_CONNECTION_KEYS;

  for (const key of keysToCheck) {
    const candidate = context[key];
    if (candidate instanceof Sequelize) return candidate;

    if (candidate && typeof (candidate as Sequelize).transaction === 'function')
      return candidate as Sequelize;
  }
  return undefined;
}

function extractTransactionOptions(
  options: TransactionalOptions,
): TransactionOptions | undefined {
  const clonedOptions: Record<string, unknown> = { ...options };
  delete clonedOptions.connectionPropertyKey;

  const entries = Object.entries(clonedOptions).filter(
    ([, value]) => value !== undefined && value !== null,
  );

  if (entries.length === 0) return undefined;

  return Object.fromEntries(entries) as TransactionOptions;
}

async function executeWithContext(
  method: (...args: unknown[]) => unknown,
  context: unknown,
  args: unknown[],
): Promise<unknown> {
  const result = method.apply(context as never, args) as unknown;
  return await Promise.resolve(result);
}

export function Transactional(
  options: TransactionalOptions = {},
): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

    if (typeof originalMethod !== 'function')
      throw new TypeError(
        `@Transactional can only decorate methods. "${String(
          propertyKey,
        )}" is not a method.`,
      );

    descriptor.value = async function (...args: unknown[]) {
      const existingTransaction = args.find(isTransaction);
      if (existingTransaction)
        return await executeWithContext(originalMethod, this, args);

      const sequelize = resolveSequelizeInstance(
        this as Record<string, unknown>,
        options.connectionPropertyKey,
      );

      if (!sequelize)
        throw new InternalServerErrorException(
          `Unable to resolve Sequelize instance for transactional execution on ${target.constructor.name}.${String(
            propertyKey,
          )}. Ensure the service injects Sequelize and exposes it via a property (default "sequelize") or provide "connectionPropertyKey".`,
        );

      const transactionOptions = extractTransactionOptions(options);
      const transactionHandler = async (transaction: Transaction) => {
        const invocationArgs = [...args, transaction] as unknown[];
        return await executeWithContext(originalMethod, this, invocationArgs);
      };

      if (transactionOptions)
        return await sequelize.transaction(
          transactionOptions,
          transactionHandler,
        );

      return await sequelize.transaction(transactionHandler);
    };

    return descriptor;
  };
}
