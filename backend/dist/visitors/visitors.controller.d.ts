import { VisitorsService } from './visitors.service';
export declare class VisitorsController {
    private readonly visitorsService;
    constructor(visitorsService: VisitorsService);
    list(): Promise<import("./visitors.service").VisitorsReport>;
}
