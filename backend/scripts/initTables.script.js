import fs from 'fs';
import path from 'path';
import pool from '../db/db.config.js';

const schemaPath = path.join(process.cwd(), 'sql', 'tables.sql');
const triggerPath = path.join(process.cwd(), "sql", "triggers.sql");

function splitStatements(sql) {
  return sql
    .replace(/^\uFEFF/, "")
    .split(/;\s*(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/)
    .map(s => s.trim())
    .filter(Boolean);
}

const initTables = async () => {
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  const triggerSql = fs.readFileSync(triggerPath, "utf8");

  const statements = splitStatements(schemaSql);
  const conn = await pool.getConnection();

  try {
    console.log('⚙️ Initializing tables...');
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt) continue;
      try {
        await conn.query(stmt);
        console.log(`  ✅ Executed statement ${i + 1}/${statements.length}`);
      } catch (err) {
        console.error(`  ❌ Failed at statement ${i + 1}:`, err.message);
        throw err;
      }
    }
    console.log("⚙️ Creating triggers...");
    await conn.query(triggerSql);
    console.log("✅ Triggers created successfully.");
    console.log('✅ Schema initialized (or already existed).');
  } catch (err) {
    console.error("❌ Initialization failed:", err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
};

initTables().catch(err => {
  console.error('❌ Table initialization failed:', err.message);
  process.exit(1);
});
