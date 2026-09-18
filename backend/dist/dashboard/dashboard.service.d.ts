import { ApartmentsService } from '../apartments/apartments.service';
import { BookingsService } from '../bookings/bookings.service';
import { TenantsService } from '../tenants/tenants.service';
import { PaymentsService } from '../payments/payments.service';
export declare class DashboardService {
    private readonly apartmentsService;
    private readonly bookingsService;
    private readonly tenantsService;
    private readonly paymentsService;
    constructor(apartmentsService: ApartmentsService, bookingsService: BookingsService, tenantsService: TenantsService, paymentsService: PaymentsService);
    getOverview(): Promise<{
        stats: {
            totalApartments: number;
            occupiedUnits: number;
            vacantUnits: number;
            maintenanceUnits: number;
            monthlyRevenue: number;
            websiteVisitors: number;
        };
        occupancy: {
            occupied: number;
            vacant: number;
            maintenance: number;
        };
        weeklyBookings: {
            label: string;
            count: number;
        }[];
        recentBookings: import("../bookings/bookings.service").Booking[];
        recentActivity: unknown[];
    }>;
    getReports(): Promise<{
        occupancy: {
            totalApartments: number;
            occupied: number;
            vacant: number;
            maintenance: number;
            occupancyRate: number;
        };
        revenue: {
            monthlyRentRoll: number;
            collectedThisMonth: number;
            pendingAmount: number;
            totalCollected: number;
        };
        bookings: {
            total: number;
            byStatus: {
                Pending: number;
                Confirmed: number;
                Cancelled: number;
            };
            byType: {
                tour: number;
                direct: number;
            };
        };
        tenants: {
            total: number;
            active: number;
            former: number;
            byPaymentStatus: {
                Paid: number;
                Due: number;
                Overdue: number;
            };
        };
    }>;
}
