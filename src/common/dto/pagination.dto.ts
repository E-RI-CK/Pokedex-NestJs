import { IsNumber, IsOptional, IsPositive } from "class-validator";

export class PaginationDto {

    @IsNumber()
    @IsOptional()
    @IsPositive()
    readonly limit: number;

    @IsNumber()
    @IsOptional()
    readonly offset: number;
}