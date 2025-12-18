import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { IUnitOfWork } from 'src/domain/adapters/unit-of-work.adapter';

@Injectable()
export class SequelizeUnitOfWork implements IUnitOfWork {
  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}

  async execute<T>(work: () => Promise<T>): Promise<T> {
    return this.sequelize.transaction(async () => {
      return await work();
    });
  }
}
