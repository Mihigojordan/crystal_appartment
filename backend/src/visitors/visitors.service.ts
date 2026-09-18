import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export interface BreakdownRow {
  id: string;
  label: string;
  value: number;
}

export interface VisitorsReport {
  stats: {
    totalVisitors: number | null;
    sessions: number | null;
    bounceRate: number | null;
    avgSessionDuration: number | null;
    bookingConversion: number | null;
    activeUsersNow: number | null;
  };
  topPages: BreakdownRow[];
  sources: BreakdownRow[];
  devices: BreakdownRow[];
}

const logger = new Logger('VisitorsService');

// GA4 Data API reports are aggregated (dimension x metric breakdowns) rather
// than per-visit rows — there's no "list of individual visits" to page
// through, so this returns rollups instead of the old Firestore entry list.
@Injectable()
export class VisitorsService {
  private readonly client: BetaAnalyticsDataClient | null;
  private readonly propertyId: string | null;

  constructor(private readonly config: ConfigService) {
    this.propertyId = config.get<string>('GA4_PROPERTY_ID') ?? null;
    try {
      const clientEmail = config.get<string>('FIREBASE_CLIENT_EMAIL');
      const privateKey = config
        .get<string>('FIREBASE_PRIVATE_KEY')
        ?.replace(/\\n/g, '\n');
      if (!clientEmail || !privateKey) {
        throw new Error('missing FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY');
      }
      this.client = new BetaAnalyticsDataClient({
        credentials: { client_email: clientEmail, private_key: privateKey },
      });
    } catch (err) {
      logger.warn(
        `Google Analytics not configured (${(err as Error).message}) — /visitors will return 503 until backend/.env has real Firebase Admin credentials.`,
      );
      this.client = null;
    }
  }

  async list(): Promise<VisitorsReport> {
    if (!this.client || !this.propertyId) {
      throw new ServiceUnavailableException(
        'Google Analytics is not configured — set GA4_PROPERTY_ID in backend/.env and grant the service account Viewer access on the GA4 property.',
      );
    }
    const property = `properties/${this.propertyId}`;
    const dateRanges = [{ startDate: '28daysAgo', endDate: 'today' }];

    const [[summary], [pages], [sources], [devices], [bookings], [realtime]] =
      await Promise.all([
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
        // Standard reports lag real activity by hours (sometimes up to a day
        // for a brand-new property) — realtime gives instant confirmation
        // that tracking is actually reaching GA4 while the report catches up.
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

    const bookingEvents = Number(
      bookings.rows?.[0]?.metricValues?.[0].value ?? 0,
    );
    const bookingConversion =
      totalVisitors && totalVisitors > 0
        ? Math.round((bookingEvents / totalVisitors) * 1000) / 10
        : null;

    const activeUsersNow = realtime.rows?.[0]
      ? Number(realtime.rows[0].metricValues?.[0].value)
      : 0;

    const toBreakdown = (
      report: typeof pages,
      idPrefix: string,
    ): BreakdownRow[] =>
      (report.rows ?? []).map((row, i) => ({
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
}
