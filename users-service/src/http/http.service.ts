import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class HttpService {

    private client: AxiosInstance;

    constructor(cfg: ConfigService) {
        this.client = axios.create({
            baseURL: cfg.get('SCHEDULING_API', 'http://service-scheduling:3000'),
            timeout: 5000,
        });
    }

    get instance() {
        return this.client;
    }
}