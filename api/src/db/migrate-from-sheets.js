/**
 * One-time migration: pull live data from Apps Script → insert into Postgres.
 * Usage: node src/db/migrate-from-sheets.js
 * Set APPS_SCRIPT_URL and DATABASE_URL in your environment (or .env).
 */
import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg
const db = new Pool({ connectionString: process.env.DATABASE_URL })

const SCRIPT_URL = process.env.APPS_SCRIPT_URL
const CHILDREN   = ['Paige', 'Nolan', 'Jonah']

async function gs(action, params = {}) {
  const qs  = new URLSearchParams({ action, ...params }).toString()
  const res = await fetch(`${SCRIPT_URL}?${qs}`)
  const data = await res.json()
  if (data?.error) throw new Error(`Apps Script error (${action}): ${data.error}`)
  return data
}

async function run() {
  console.log('Starting migration from Sheets → Postgres…\n')

  // ── Chores ──────────────────────────────────────────────────────────────────
  {
    const chores = await gs('getChores', { includeInactive: 'true' })
    console.log(`Chores: ${chores.length} rows`)
    for (const c of chores) {
      await db.query(
        `INSERT INTO chores (id, label, bucks, icon, active, days, required, instructions)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET
           label=$2, bucks=$3, icon=$4, active=$5, days=$6,
           required=$7, instructions=$8`,
        [
          c.id, c.label, c.bucks, c.icon ?? '', c.active ?? true,
          c.days ?? [], c.required ?? false,
          c.instructions ?? [],
        ]
      )
    }
    console.log('  ✓ chores done')
  }

  // ── Routine Definitions ──────────────────────────────────────────────────────
  {
    const defs = await gs('getRoutineDefs')
    console.log(`RoutineDefs: ${defs.length} rows`)
    for (const r of defs) {
      await db.query(
        `INSERT INTO routine_defs (id, child, label, icon, schedules, time, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET
           child=$2, label=$3, icon=$4, schedules=$5, time=$6, sort_order=$7`,
        [
          r.id, r.child, r.label, r.icon ?? '',
          r.schedules ?? [], r.time ?? '', r.sortOrder ?? 0,
        ]
      )
    }
    console.log('  ✓ routine_defs done')
  }

  // ── Bucks Balances ──────────────────────────────────────────────────────────
  {
    const bucks = await gs('getBucks')
    console.log(`Bucks: ${bucks.length} rows`)
    for (const b of bucks) {
      await db.query(
        `INSERT INTO bucks_balance (child, balance)
         VALUES ($1,$2)
         ON CONFLICT (child) DO UPDATE SET balance=$2`,
        [b.child, b.bucks]
      )
    }
    console.log('  ✓ bucks_balance done')
  }

  // ── Screen Time Balances ─────────────────────────────────────────────────────
  {
    const st = await gs('getScreenTime')
    console.log(`ScreenTime: ${st.length} rows`)
    for (const s of st) {
      await db.query(
        `INSERT INTO screen_time_balance (child, balance)
         VALUES ($1,$2)
         ON CONFLICT (child) DO UPDATE SET balance=$2`,
        [s.child, s.balance]
      )
    }
    console.log('  ✓ screen_time_balance done')
  }

  // ── Grocery ──────────────────────────────────────────────────────────────────
  {
    const items = await gs('getGrocery')
    console.log(`Grocery: ${items.length} rows`)
    for (const g of items) {
      await db.query(
        `INSERT INTO grocery (id, item, added_at)
         VALUES ($1,$2,NOW())
         ON CONFLICT (id) DO NOTHING`,
        [g.id, g.item]
      )
    }
    console.log('  ✓ grocery done')
  }

  // ── Meals ────────────────────────────────────────────────────────────────────
  {
    const meals = await gs('getMeals')
    console.log(`Meals: ${meals.length} rows`)
    for (const m of meals) {
      await db.query(
        `INSERT INTO meals (day, main, note, lunch)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (day) DO UPDATE SET main=$2, note=$3, lunch=$4`,
        [m.day, m.main ?? '', m.note ?? '', m.lunch ?? '']
      )
    }
    console.log('  ✓ meals done')
  }

  // ── Notes ────────────────────────────────────────────────────────────────────
  {
    const notes = await gs('getNotes')
    console.log(`Notes: ${notes.length} rows`)
    for (const n of notes) {
      await db.query(
        `INSERT INTO notes (id, text)
         VALUES ($1,$2)
         ON CONFLICT (id) DO UPDATE SET text=$2`,
        [n.id, n.text]
      )
    }
    console.log('  ✓ notes done')
  }

  // ── Announcements ─────────────────────────────────────────────────────────────
  {
    const announcements = await gs('getAnnouncements')
    console.log(`Announcements: ${announcements.length} rows`)
    for (const a of announcements) {
      await db.query(
        `INSERT INTO announcements (id, text)
         VALUES ($1,$2)
         ON CONFLICT (id) DO UPDATE SET text=$2`,
        [a.id, a.text]
      )
    }
    console.log('  ✓ announcements done')
  }

  // ── Mom Store ─────────────────────────────────────────────────────────────────
  {
    const items = await gs('getMomStore', { includeInactive: 'true' })
    console.log(`MomStore: ${items.length} rows`)
    for (const m of items) {
      await db.query(
        `INSERT INTO mom_store (id, label, icon, cost, requires_approval, active)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET
           label=$2, icon=$3, cost=$4, requires_approval=$5, active=$6`,
        [m.id, m.label, m.icon ?? '', m.cost, m.requiresApproval ?? false, m.active ?? true]
      )
    }
    console.log('  ✓ mom_store done')
  }

  // ── Purchases (unredeemed) ────────────────────────────────────────────────────
  {
    let total = 0
    for (const child of CHILDREN) {
      const purchases = await gs('getPurchases', { child, includeRedeemed: 'true' })
      total += purchases.length
      for (const p of purchases) {
        await db.query(
          `INSERT INTO purchases (id, created_at, child, item_id, item_label, cost, redeemed)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (id) DO NOTHING`,
          [
            p.id,
            p.timestamp ? new Date(p.timestamp) : new Date(),
            p.child, p.itemId, p.itemLabel,
            p.cost, p.redeemed ?? false,
          ]
        )
      }
    }
    console.log(`Purchases: ${total} rows`)
    console.log('  ✓ purchases done')
  }

  console.log('\nMigration complete.')
  await db.end()
}

run().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
