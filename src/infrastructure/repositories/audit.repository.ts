import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Audit } from 'src/domain/entities/audit.entity';
import { IAuditRepository } from 'src/domain/repositories/audit.interface';

@Injectable()
export class AuditRepository implements IAuditRepository {
  constructor(
    @InjectModel(Audit)
    private readonly auditModel: typeof Audit,
  ) {}

  async save(audit: Audit): Promise<void> {
    await audit.save();
  }

  async findByEntity(entityName: string, entityId: string): Promise<Audit[]> {
    return this.auditModel.findAll({
      where: { entityName, entityId },
      order: [['timestamp', 'DESC']],
    });
  }

  async findByUser(userId: string): Promise<Audit[]> {
    return this.auditModel.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Audit[]> {
    return this.auditModel.findAll({
      where: { timestamp: { [Op.between]: [startDate, endDate] } },
      order: [['timestamp', 'DESC']],
    });
  }
}
