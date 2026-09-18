import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

export const FIRESTORE = 'FIRESTORE';
export const FIREBASE_AUTH = 'FIREBASE_AUTH';

const logger = new Logger('FirebaseModule');

function initApp(config: ConfigService) {
  return (
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: config.get<string>('FIREBASE_PROJECT_ID'),
        clientEmail: config.get<string>('FIREBASE_CLIENT_EMAIL'),
        privateKey: config
          .get<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
      }),
    })
  );
}

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: FIRESTORE,
      inject: [ConfigService],
      // Returns null instead of throwing when credentials are missing/invalid,
      // so a misconfigured backend/.env can't take down the whole app at boot
      // — only the Firestore-backed endpoints fail, with a clear 503.
      useFactory: (config: ConfigService): Firestore | null => {
        try {
          const firestore = getFirestore(initApp(config));
          // DTOs commonly have optional fields left `undefined` (not sent
          // by the client) — without this, spreading one straight into a
          // Firestore write throws "Cannot use undefined as a Firestore
          // value" instead of just omitting the field.
          firestore.settings({ ignoreUndefinedProperties: true });
          return firestore;
        } catch (err) {
          logger.warn(
            `Firebase not configured (${(err as Error).message}) — Firestore-backed endpoints will return 503 until backend/.env has a real FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.`,
          );
          return null;
        }
      },
    },
    {
      provide: FIREBASE_AUTH,
      inject: [ConfigService],
      // Same degrade-gracefully philosophy as FIRESTORE above — a bad
      // service account should 401/503 auth-gated routes, not crash boot.
      useFactory: (config: ConfigService): Auth | null => {
        try {
          return getAuth(initApp(config));
        } catch (err) {
          logger.warn(
            `Firebase Auth not configured (${(err as Error).message}) — guarded endpoints will return 503 until backend/.env has a real FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.`,
          );
          return null;
        }
      },
    },
  ],
  exports: [FIRESTORE, FIREBASE_AUTH],
})
export class FirebaseModule {}
