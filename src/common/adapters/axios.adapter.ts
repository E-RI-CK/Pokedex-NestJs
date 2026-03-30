import { AxiosInstance } from "axios";
import { HttpAdapter } from "../interfaces/http-adapter.interface";
import { BadRequestException } from "@nestjs/common";
import axios from "axios";


export class AxiosAdapter implements HttpAdapter {

    constructor(
        private readonly axiosA: AxiosInstance = axios
    ) { }

    async get<T>(url: string) {
        try {
            const res = await this.axiosA.get<T>(url);
            const data: T = res.data;
            return data;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }


}