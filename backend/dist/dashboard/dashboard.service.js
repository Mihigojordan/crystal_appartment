"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const apartments_service_1 = require("../apartments/apartments.service");
const bookings_service_1 = require("../bookings/bookings.service");
const tenants_service_1 = require("../tenants/tenants.service");
const payments_service_1 = require("../payments/payments.service");
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
let DashboardService = class DashboardService {
    apartmentsService;
    bookingsService;
    tenantsService;
    paymentsService;
    constructor(apartmentsService, bookingsService, tenantsService, paymentsService) {
        this.apartmentsService = apartmentsService;
        this.bookingsService = bookingsService;
        this.tenantsService = tenantsService;
        this.paymentsService = paymentsService;
    }
    async getOverview() {
        const [apartments, bookings] = await Promise.all([
            this.apartmentsService.list(),
            this.bookingsService.list(),
        ]);
        const totalApartments = apartments.length;
        const occupied = apartments.filter((a) => a.status === 'Occupied');
        const vacant = apartments.filter((a) => a.status === 'Vacant').length;
        const maintenance = apartments.filter((a) => a.status === 'Maintenance').length;
        const monthlyRevenue = occupied.reduce((sum, a) => sum + a.rent, 0);
        const weeklyBookings = WEEKDAYS.map((label) => ({ label, count: 0 }));
        for (const booking of bookings) {
            if (!booking.createdAt)
                continue;
            const day = new Date(booking.createdAt).getDay();
            weeklyBookings[day].count += 1;
        }
        return {
            stats: {
                totalApartments,
                occupiedUnits: occupied.length,
                vacantUnits: vacant,
                maintenanceUnits: maintenance,
                monthlyRevenue,
                websiteVisitors: 0,
            },
            occupancy: {
                occupied: occupied.length,
                vacant,
                maintenance,
            },
            weeklyBookings,
            recentBookings: bookings.slice(0, 5),
            recentActivity: [],
        };
    }
    async getReports() {
        const [apartments, bookings, tenants, payments] = await Promise.all([
            this.apartmentsService.list(),
            this.bookingsService.list(),
            this.tenantsService.list(),
            this.paymentsService.list(),
        ]);
        const occupied = apartments.filter((a) => a.status === 'Occupied');
        const vacant = apartments.filter((a) => a.status === 'Vacant').length;
        const maintenance = apartments.filter((a) => a.status === 'Maintenance').length;
        const occupancyRate = apartments.length > 0
            ? Math.round((occupied.length / apartments.length) * 1000) / 10
            : 0;
        const now = new Date();
        const thisMonthPayments = payments.filter((p) => {
            const d = new Date(p.date);
            return (!isNaN(d.getTime()) &&
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear());
        });
        const sumAmount = (list) => list.reduce((sum, p) => sum + p.amount, 0);
        const bookingsByStatus = {
            Pending: bookings.filter((b) => b.status === 'Pending').length,
            Confirmed: bookings.filter((b) => b.status === 'Confirmed').length,
            Cancelled: bookings.filter((b) => b.status === 'Cancelled').length,
        };
        const bookingsByType = {
            tour: bookings.filter((b) => b.type === 'tour').length,
            direct: bookings.filter((b) => b.type === 'direct').length,
        };
        const tenantsByPayment = {
            Paid: tenants.filter((t) => t.paymentStatus === 'Paid').length,
            Due: tenants.filter((t) => t.paymentStatus === 'Due').length,
            Overdue: tenants.filter((t) => t.paymentStatus === 'Overdue').length,
        };
        return {
            occupancy: {
                totalApartments: apartments.length,
                occupied: occupied.length,
                vacant,
                maintenance,
                occupancyRate,
            },
            revenue: {
                monthlyRentRoll: occupied.reduce((sum, a) => sum + a.rent, 0),
                collectedThisMonth: sumAmount(thisMonthPayments.filter((p) => p.status === 'Paid')),
                pendingAmount: sumAmount(payments.filter((p) => p.status === 'Pending')),
                totalCollected: sumAmount(payments.filter((p) => p.status === 'Paid')),
            },
            bookings: {
                total: bookings.length,
                byStatus: bookingsByStatus,
                byType: bookingsByType,
            },
            tenants: {
                total: tenants.length,
                active: tenants.filter((t) => t.status === 'Active').length,
                former: tenants.filter((t) => t.status === 'Former').length,
                byPaymentStatus: tenantsByPayment,
            },
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [apartments_service_1.ApartmentsService,
        bookings_service_1.BookingsService,
        tenants_service_1.TenantsService,
        payments_service_1.PaymentsService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map