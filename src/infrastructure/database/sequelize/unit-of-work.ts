import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { IUnitOfWork } from 'src/domain/adapters/unit-of-work.adapter';

@Injectable()
export class SequelizeUnitOfWork implements IUnitOfWork {
  constructor(private sequelize: Sequelize) {}

  async execute<T>(work: () => Promise<T>): Promise<T> {
    return this.sequelize.transaction(async () => {
      return await work();
    });
  }
}
