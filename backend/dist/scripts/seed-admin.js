"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
function arg(name) {
    const prefix = `--${name}=`;
    const found = process.argv.find((a) => a.startsWith(prefix));
    return found ? found.slice(prefix.length) : undefined;
}
const email = arg('email') ?? process.env.ADMIN_EMAIL ?? 'admin@example.com';
const password = arg('password') ?? process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
const name = arg('name') ?? process.env.ADMIN_NAME ?? 'System Administrator';
async function main() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!projectId || !clientEmail || !privateKey) {
        console.error('Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in backend/.env');
        process.exit(1);
    }
    const app = (0, app_1.getApps)()[0] ??
        (0, app_1.initializeApp)({ credential: (0, app_1.cert)({ projectId, clientEmail, privateKey }) });
    const auth = (0, auth_1.getAuth)(app);
    const db = (0, firestore_1.getFirestore)(app);
    let uid;
    try {
        const existing = await auth.getUserByEmail(email);
        await auth.updateUser(existing.uid, { password, displayName: name });
        uid = existing.uid;
        console.log(`Updated existing Firebase Auth user: ${email} (${uid})`);
    }
    catch (err) {
        if (err.code !== 'auth/user-not-found')
            throw err;
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
            .add({ ...profile, createdAt: firestore_1.FieldValue.serverTimestamp() });
        console.log('Created Firestore admin profile in "users" collection.');
    }
    else {
        await existingDocs.docs[0].ref.update(profile);
        console.log('Updated existing Firestore admin profile in "users" collection.');
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
//# sourceMappingURL=seed-admin.js.map