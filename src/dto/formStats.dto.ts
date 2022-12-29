
export interface FormStatsDto {
    [k:string]: {
        count: number;
        choices?: Record<string, number>
    }
}