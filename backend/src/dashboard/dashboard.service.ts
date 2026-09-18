import { Injectable } from '@nestjs/common';
import { ApartmentsService } from '../apartments/apartments.service';
import { BookingsService } from '../bookings/bookings.service';
import { TenantsService } from '../tenants/tenants.service';
import { PaymentsService } from '../payments/payments.service';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

@Injectable()
export class DashboardService {
  constructor(
    private readonly apartmentsService: ApartmentsService,
    private readonly bookingsService: BookingsService,
    private readonly tenantsService: TenantsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async getOverview() {
    const [apartments, bookings] = await Promise.all([
      this.apartmentsService.list(),
      this.bookingsService.list(),
    ]);

    const totalApartments = apartments.length;
    const occupied = apartments.filter((a) => a.status === 'Occupied');
    const vacant = apartments.filter((a) => a.status === 'Vacant').length;
    const maintenance = apartments.filter(
      (a) => a.status === 'Maintenance',
    ).length;
    const monthlyRevenue = occupied.reduce((sum, a) => sum + a.rent, 0);

    const weeklyBookings = WEEKDAYS.map((label) => ({ label, count: 0 }));
    for (const booking of bookings) {
      if (!booking.createdAt) continue;
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
        // No visitor-tracking instrumentation exists yet — an honest 0/null
        // rather than a fabricated number until that's built.
        websiteVisitors: 0,
      },
      occupancy: {
        occupied: occupied.length,
        vacant,
        maintenance,
      },
      weeklyBookings,
      recentBookings: bookings.slice(0, 5),
      // Activity logging isn't instrumented yet either — see logs module.
      recentActivity: [] as unknown[],
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
    const maintenance = apartments.filter(
      (a) => a.status === 'Maintenance',
    ).length;
    const occupancyRate =
      apartments.length > 0
        ? Math.round((occupied.length / apartments.length) * 1000) / 10
        : 0;

    const now = new Date();
    const thisMonthPayments = payments.filter((p) => {
      const d = new Date(p.date);
      return (
        !isNaN(d.getTime()) &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });
    const sumAmount = (list: typeof payments) =>
      list.reduce((sum, p) => sum + p.amount, 0);

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
        collectedThisMonth: sumAmount(
          thisMonthPayments.filter((p) => p.status === 'Paid'),
        ),
        pendingAmount: sumAmount(
          payments.filter((p) => p.status === 'Pending'),
        ),
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
}
