/**
 * Seed script – populates DB with demo services and an admin user
 * Run: node src/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');
const Service  = require('./models/Service');

const DEMO_SERVICES = [
  // ─── Instagram ────────────────────────────────────────────────────────────
  { name: 'Instagram Followers – High Quality', category: 'Instagram', type: 'Followers',
    providerServiceId: '1', providerRate: 0.80, rate: 1.60,
    minOrder: 100, maxOrder: 50000, description: 'High retention followers. Gradual delivery.' },
  { name: 'Instagram Likes – Real Mix', category: 'Instagram', type: 'Likes',
    providerServiceId: '2', providerRate: 0.20, rate: 0.50,
    minOrder: 50, maxOrder: 100000, description: 'Mix of real & premium accounts.' },
  { name: 'Instagram Views – Instant', category: 'Instagram', type: 'Views',
    providerServiceId: '3', providerRate: 0.05, rate: 0.12,
    minOrder: 100, maxOrder: 1000000, description: 'Instant reel/video views.' },
  { name: 'Instagram Story Views', category: 'Instagram', type: 'Story Views',
    providerServiceId: '4', providerRate: 0.08, rate: 0.18,
    minOrder: 100, maxOrder: 500000 },
  { name: 'Instagram Comments – Custom', category: 'Instagram', type: 'Comments',
    providerServiceId: '5', providerRate: 3.00, rate: 6.00,
    minOrder: 5, maxOrder: 300, description: 'Custom comments, fast delivery.' },

  // ─── TikTok ───────────────────────────────────────────────────────────────
  { name: 'TikTok Followers – Instant', category: 'TikTok', type: 'Followers',
    providerServiceId: '10', providerRate: 0.60, rate: 1.20,
    minOrder: 100, maxOrder: 100000 },
  { name: 'TikTok Views – Fast', category: 'TikTok', type: 'Views',
    providerServiceId: '11', providerRate: 0.04, rate: 0.09,
    minOrder: 1000, maxOrder: 5000000, description: 'Real-looking TikTok views, superfast.' },
  { name: 'TikTok Likes', category: 'TikTok', type: 'Likes',
    providerServiceId: '12', providerRate: 0.15, rate: 0.35,
    minOrder: 50, maxOrder: 200000 },
  { name: 'TikTok Shares', category: 'TikTok', type: 'Shares',
    providerServiceId: '13', providerRate: 0.50, rate: 1.00,
    minOrder: 100, maxOrder: 50000 },

  // ─── YouTube ──────────────────────────────────────────────────────────────
  { name: 'YouTube Views – HQ Retention', category: 'YouTube', type: 'Views',
    providerServiceId: '20', providerRate: 1.50, rate: 3.00,
    minOrder: 500, maxOrder: 500000, description: '60%+ retention, monetization-safe.' },
  { name: 'YouTube Subscribers', category: 'YouTube', type: 'Subscribers',
    providerServiceId: '21', providerRate: 2.50, rate: 5.00,
    minOrder: 100, maxOrder: 20000 },
  { name: 'YouTube Likes', category: 'YouTube', type: 'Likes',
    providerServiceId: '22', providerRate: 0.80, rate: 1.60,
    minOrder: 50, maxOrder: 50000 },

  // ─── Twitter ──────────────────────────────────────────────────────────────
  { name: 'Twitter/X Followers – Real', category: 'Twitter', type: 'Followers',
    providerServiceId: '30', providerRate: 1.20, rate: 2.50,
    minOrder: 100, maxOrder: 30000 },
  { name: 'Twitter/X Likes', category: 'Twitter', type: 'Likes',
    providerServiceId: '31', providerRate: 0.25, rate: 0.55,
    minOrder: 50, maxOrder: 100000 },
  { name: 'Twitter/X Retweets', category: 'Twitter', type: 'Retweets',
    providerServiceId: '32', providerRate: 0.40, rate: 0.85,
    minOrder: 50, maxOrder: 50000 },

  // ─── Telegram ─────────────────────────────────────────────────────────────
  { name: 'Telegram Channel Members', category: 'Telegram', type: 'Members',
    providerServiceId: '40', providerRate: 1.00, rate: 2.00,
    minOrder: 100, maxOrder: 100000 },
  { name: 'Telegram Post Views', category: 'Telegram', type: 'Views',
    providerServiceId: '41', providerRate: 0.10, rate: 0.22,
    minOrder: 100, maxOrder: 1000000 },

  // ─── Spotify ──────────────────────────────────────────────────────────────
  { name: 'Spotify Plays – Premium', category: 'Spotify', type: 'Plays',
    providerServiceId: '50', providerRate: 0.80, rate: 1.70,
    minOrder: 1000, maxOrder: 1000000 },
  { name: 'Spotify Followers', category: 'Spotify', type: 'Followers',
    providerServiceId: '51', providerRate: 2.00, rate: 4.50,
    minOrder: 100, maxOrder: 10000 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ── Admin user ──────────────────────────────────────────────────────────
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@smmflow.com';
    const adminPass  = process.env.SEED_ADMIN_PASS  || 'admin123456';

    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      await User.create({ name: 'Admin', email: adminEmail, password: adminPass, role: 'admin', balance: 9999 });
      console.log(`✅ Admin created: ${adminEmail} / ${adminPass}`);
    } else {
      console.log(`ℹ️  Admin already exists: ${adminEmail}`);
    }

    // ── Demo user ───────────────────────────────────────────────────────────
    const demoEmail = 'demo@smmflow.com';
    const demoExists = await User.findOne({ email: demoEmail });
    if (!demoExists) {
      await User.create({ name: 'Demo User', email: demoEmail, password: 'demo123456', balance: 25.00 });
      console.log(`✅ Demo user created: ${demoEmail} / demo123456`);
    }

    // ── Services ────────────────────────────────────────────────────────────
    const count = await Service.countDocuments();
    if (count === 0) {
      await Service.insertMany(DEMO_SERVICES);
      console.log(`✅ Inserted ${DEMO_SERVICES.length} demo services`);
    } else {
      console.log(`ℹ️  ${count} services already exist, skipping`);
    }

    console.log('\n🎉 Seed complete!');
    console.log('   Admin login:', adminEmail, '/', adminPass);
    console.log('   Demo login:  demo@smmflow.com / demo123456');
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
