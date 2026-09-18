import { ResourceUtilizationService } from './resource-utilization.service';
export declare class ResourceUtilizationController {
    private readonly utilization;
    constructor(utilization: ResourceUtilizationService);
    getSummary(): Promise<import("./resource-utilization.service").ResourceUtilizationSummary>;
}
