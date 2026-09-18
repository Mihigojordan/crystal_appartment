export declare class ClientErrorDto {
    message: string;
    stack?: string;
    url?: string;
    userAgent?: string;
    level?: 'error' | 'warning';
}
