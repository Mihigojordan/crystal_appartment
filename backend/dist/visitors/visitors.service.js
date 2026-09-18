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
exports.VisitorsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const data_1 = require("@google-analytics/data");
const logger = new common_1.Logger('VisitorsService');
let VisitorsService = class VisitorsService {
    config;
    client;
    propertyId;
    constructor(config) {
        this.config = config;
        this.propertyId = config.get('GA4_PROPERTY_ID') ?? null;
        try {
            const clientEmail = config.get('FIREBASE_CLIENT_EMAIL');
            const privateKey = config
                .get('FIREBASE_PRIVATE_KEY')
                ?.replace(/\\n/g, '\n');
            if (!clientEmail || !privateKey) {
                throw new Error('missing FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY');
            }
            this.client = new data_1.BetaAnalyticsDataClient({
                credentials: { client_email: clientEmail, private_key: privateKey },
            });
        }
        catch (err) {
            logger.warn(`Google Analytics not configured (${err.message}) — /visitors will return 503 until backend/.env has real Firebase Admin credentials.`);
            this.client = null;
        }
    }
    async list() {
        if (!this.client || !this.propertyId) {
            throw new common_1.ServiceUnavailableException('Google Analytics is not configured — set GA4_PROPERTY_ID in backend/.env and grant the service account Viewer access on the GA4 property.');
        }
        const property = `properties/${this.propertyId}`;
        const dateRanges = [{ startDate: '28daysAgo', endDate: 'today' }];
        const [[summary], [pages], [sources], [devices], [bookings], [realtime]] = await Promise.all([
            this.client.runReport({
                property,
                dateRanges,
                metrics: [
                    { name: 'activeUsers' },
                    { name: 'sessions' },
                    { name: 'bounceRate' },
                    { name: 'averageSessionDuration' },
                ],
            }),
            this.client.runReport({
                property,
                dateRanges,
                dimensions: [{ name: 'pagePath' }],
                metrics: [{ name: 'screenPageViews' }],
                orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
                limit: 10,
            }),
            this.client.runReport({
                property,
                dateRanges,
                dimensions: [{ name: 'sessionDefaultChannelGroup' }],
                metrics: [{ name: 'sessions' }],
                orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
                limit: 10,
            }),
            this.client.runReport({
                property,
                dateRanges,
                dimensions: [{ name: 'deviceCategory' }],
                metrics: [{ name: 'activeUsers' }],
                orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
                limit: 10,
            }),
            this.client.runReport({
                property,
                dateRanges,
                dimensions: [{ name: 'eventName' }],
                metrics: [{ name: 'eventCount' }],
                dimensionFilter: {
                    filter: {
                        fieldName: 'eventName',
                        stringFilter: { value: 'booking_submitted' },
                    },
                },
            }),
            this.client.runRealtimeReport({
                property,
                metrics: [{ name: 'activeUsers' }],
            }),
        ]);
        const summaryRow = summary.rows?.[0];
        const totalVisitors = summaryRow
            ? Number(summaryRow.metricValues?.[0].value)
            : null;
        const sessions = summaryRow
            ? Number(summaryRow.metricValues?.[1].value)
            : null;
        const bounceRate = summaryRow
            ? Math.round(Number(summaryRow.metricValues?.[2].value) * 1000) / 10
            : null;
        const avgSessionDuration = summaryRow
            ? Math.round(Number(summaryRow.metricValues?.[3].value))
            : null;
        const bookingEvents = Number(bookings.rows?.[0]?.metricValues?.[0].value ?? 0);
        const bookingConversion = totalVisitors && totalVisitors > 0
            ? Math.round((bookingEvents / totalVisitors) * 1000) / 10
            : null;
        const activeUsersNow = realtime.rows?.[0]
            ? Number(realtime.rows[0].metricValues?.[0].value)
            : 0;
        const toBreakdown = (report, idPrefix) => (report.rows ?? []).map((row, i) => ({
            id: `${idPrefix}-${i}`,
            label: row.dimensionValues?.[0].value ?? '(not set)',
            value: Number(row.metricValues?.[0].value ?? 0),
        }));
        return {
            stats: {
                totalVisitors,
                sessions,
                bounceRate,
                avgSessionDuration,
                bookingConversion,
                activeUsersNow,
            },
            topPages: toBreakdown(pages, 'page'),
            sources: toBreakdown(sources, 'source'),
            devices: toBreakdown(devices, 'device'),
        };
    }
};
exports.VisitorsService = VisitorsService;
exports.VisitorsService = VisitorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VisitorsService);
//# sourceMappingURL=visitors.service.js.map