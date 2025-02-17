// src/auth/sessions/sessions.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async create(data: Partial<Session>): Promise<Session> {
    const session = this.sessionRepository.create(data);
    return this.sessionRepository.save(session);
  }

  async deactivate(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, { isActive: false });
  }

  async deactivateAllUserSessions(userId: string): Promise<void> {
    await this.sessionRepository.update(
      { user: { id: userId }, isActive: true },
      { isActive: false },
    );
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { user: { id: userId }, isActive: true },
    });
  }

  async findByRefreshToken(refreshToken: string): Promise<Session> {
    return this.sessionRepository.findOne({
      where: { refreshToken, isActive: true },
      relations: ['user'],
    });
  }

  async findById(sessionId: string): Promise<Session> {
    return this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user'],
    });
  }

  async update(sessionId: string, data: Partial<Session>): Promise<Session> {
    await this.sessionRepository.update(sessionId, data);
    return this.findById(sessionId);
  }

  async invalidateToken(refreshToken: string): Promise<void> {
    await this.sessionRepository.update({ refreshToken }, { isActive: false });
  }

  async cleanupExpiredSessions(): Promise<void> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - 7);

    await this.sessionRepository.update(
      {
        lastUsedAt: LessThan(expirationDate),
        isActive: true,
      },
      { isActive: false },
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSessionCleanup() {
    await this.cleanupExpiredSessions();
  }
}
