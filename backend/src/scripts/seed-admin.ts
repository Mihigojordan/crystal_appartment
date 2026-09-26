/**
 * Seeds a Firebase Auth admin account plus its matching Firestore profile
 * doc in the 'users' collection (role: 'Administrator') — the directory
 * frontend/src/pages/UserManagement reads, and the one AppContext.jsx's
 * login() checks for Firebase-based sessions to grant /admin/* access.
 *
 * Usage:
 *   npm run seed:admin -- --email=admin@example.com --password=ChangeMe123! --name="System Admin"
 * or via env vars:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... npm run seed:admin
 *
 * Requires FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 * in backend/.env (the same service-account credentials FirebaseModule uses).
 */
import 'dotenv/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

const email = arg('email') ?? process.env.ADMIN_EMAIL ?? 'admin@example.com';
const password =
  arg('password') ?? process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
const name = arg('name') ?? process.env.ADMIN_NAME ?? 'System Administrator';

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      'Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in backend/.env',
    );
    process.exit(1);
  }

  const app =
    getApps()[0] ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const auth = getAuth(app);
  const db = getFirestore(app);

  let uid: string;
  try {
    const existing = await auth.getUserByEmail(email);
    await auth.updateUser(existing.uid, { password, displayName: name });
    uid = existing.uid;
    console.log(`Updated existing Firebase Auth user: ${email} (${uid})`);
  } catch (err) {
    if ((err as { code?: string }).code !== 'auth/user-not-found') throw err;
    const created = await auth.createUser({
      email,
      password,
      displayName: name,
    });
    uid = created.uid;
    console.log(`Created Firebase Auth user: ${email} (${uid})`);
  }

  const profile = {
    name,
    email,
    role: 'Administrator',
    department: 'IT',
    phone: '',
    status: 'Active',
  };

  const existingDocs = await db
    .collection('users')
    .where('email', '==', email)
    .limit(1)
    .get();
  if (existingDocs.empty) {
    await db
      .collection('users')
      .add({ ...profile, createdAt: FieldValue.serverTimestamp() });
    console.log('Created Firestore admin profile in "users" collection.');
  } else {
    await existingDocs.docs[0].ref.update(profile);
    console.log(
      'Updated existing Firestore admin profile in "users" collection.',
    );
  }

  console.log('\nDone. Sign in at the app login page with:');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
