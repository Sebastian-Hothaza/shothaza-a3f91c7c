import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './log.entity';

@Injectable()
export class LogService {
    constructor(
        @InjectRepository(Log)
        private readonly logRepo: Repository<Log>,
    ) { }

    async create(message: string): Promise<void> {
        await this.logRepo.save({ message });
    }


    async findAll() {
        return this.logRepo.find();
    }
}
