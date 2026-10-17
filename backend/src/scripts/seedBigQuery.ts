import { BigQuery } from '@google-cloud/bigquery';
import path from 'path';
import dotenv from 'dotenv';
import { getFullCatalog } from '../tools/catalogSearch';

dotenv.config();

const projectId = process.env.GCP_PROJECT_ID || 'project-8c073bdd-106e-4938-8df';
const datasetId = process.env.BIGQUERY_DATASET || 'enterprise_bi';
const location = 'US';

const keyFilename = path.resolve(__dirname, '../../gcp-key.json');

const bigquery = new BigQuery({
  projectId,
  keyFilename,
});

async function main() {
  console.log(`🚀 Connecting to Google BigQuery on project [${projectId}]...`);

  // 1. Create or get dataset
  const [datasets] = await bigquery.getDatasets();
  const datasetExists = datasets.some((d) => d.id === datasetId);

  let dataset = bigquery.dataset(datasetId);
  if (!datasetExists) {
    console.log(`📦 Creating BigQuery dataset [${datasetId}] in location [${location}]...`);
    [dataset] = await bigquery.createDataset(datasetId, { location });
    console.log(`✅ Dataset [${datasetId}] created successfully.`);
  } else {
    console.log(`ℹ️ Dataset [${datasetId}] already exists.`);
  }

  // 2. Define Schemas & Tables
  const catalog = getFullCatalog();

  // --- Table 1: inventory ---
  console.log(`📋 Provisioning table: inventory...`);
  const inventorySchema = [
    { name: 'sku', type: 'STRING', mode: 'REQUIRED' },
    { name: 'name', type: 'STRING', mode: 'REQUIRED' },
    { name: 'category', type: 'STRING', mode: 'REQUIRED' },
    { name: 'current_stock', type: 'INT64', mode: 'REQUIRED' },
    { name: 'safety_stock', type: 'INT64', mode: 'REQUIRED' },
    { name: 'daily_velocity', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'trending_capsule_score', type: 'INT64', mode: 'REQUIRED' },
    { name: 'projected_30d_demand', type: 'INT64', mode: 'REQUIRED' },
    { name: 'days_remaining', type: 'INT64', mode: 'REQUIRED' },
    { name: 'stockout_risk', type: 'STRING', mode: 'REQUIRED' },
    { name: 'unit_cost', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'retail_price', type: 'FLOAT64', mode: 'REQUIRED' },
  ];

  const inventoryRows = catalog.map((item, idx) => {
    const baseStock = 45 + ((idx * 17) % 65);
    const safetyStock = 25;
    const baseVelocity = Number((1.8 + ((idx * 3) % 4) * 0.9).toFixed(1));
    const isTrendingOuterwear = item.category === 'Outerwear' || item.name.includes('Camel') || item.name.includes('Turtleneck');
    const trendingScore = isTrendingOuterwear ? 94 : 58 + ((idx * 7) % 35);
    const demandMultiplier = 1 + (trendingScore / 100) * 0.75;
    const projectedDemand = Math.round(baseVelocity * 30 * demandMultiplier);
    const daysRemaining = Math.max(3, Math.round(baseStock / (baseVelocity * demandMultiplier)));

    let risk = 'HEALTHY';
    if (daysRemaining <= 7) risk = 'CRITICAL';
    else if (daysRemaining <= 16) risk = 'WARNING';

    return {
      sku: item.id,
      name: item.name,
      category: item.category,
      current_stock: baseStock,
      safety_stock: safetyStock,
      daily_velocity: baseVelocity,
      trending_capsule_score: trendingScore,
      projected_30d_demand: projectedDemand,
      days_remaining: daysRemaining,
      stockout_risk: risk,
      unit_cost: Number((item.price * 0.42).toFixed(2)),
      retail_price: Number(item.price.toFixed(2)),
    };
  });

  await createAndInsertRows(dataset, 'inventory', inventorySchema, inventoryRows);

  // --- Table 2: customer_segments ---
  console.log(`📋 Provisioning table: customer_segments...`);
  const segmentsSchema = [
    { name: 'segment_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'name', type: 'STRING', mode: 'REQUIRED' },
    { name: 'tagline', type: 'STRING', mode: 'NULLABLE' },
    { name: 'customer_count', type: 'INT64', mode: 'REQUIRED' },
    { name: 'share_pct', type: 'INT64', mode: 'REQUIRED' },
    { name: 'avg_order_value', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'annual_purchase_freq', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'return_rate_pct', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'preferred_archetype', type: 'STRING', mode: 'NULLABLE' },
    { name: 'ai_playbook', type: 'STRING', mode: 'NULLABLE' },
  ];

  const segmentRows = [
    {
      segment_id: 'SEG-001',
      name: 'Capsule Connoisseurs',
      tagline: 'High LTV, multi-piece wardrobe buyers seeking versatile timeless staples',
      customer_count: 1840,
      share_pct: 32,
      avg_order_value: 345.0,
      annual_purchase_freq: 4.8,
      return_rate_pct: 4.2,
      preferred_archetype: 'Quiet Luxury & Minimalist Classic',
      ai_playbook: 'Offer early access to seasonal capsule drops & 1-click curated restyle packs.',
    },
    {
      segment_id: 'SEG-002',
      name: 'Executive Office Shoppers',
      tagline: 'Time-poor corporate professionals needing coordinated business attire',
      customer_count: 1420,
      share_pct: 25,
      avg_order_value: 280.0,
      annual_purchase_freq: 3.6,
      return_rate_pct: 6.8,
      preferred_archetype: 'Business Casual & Executive Minimalist',
      ai_playbook: 'Trigger Monday-to-Friday 5-Piece Rotation styling bundles via personalized email.',
    },
    {
      segment_id: 'SEG-003',
      name: 'Weekend Urban Explorers',
      tagline: 'Casual trend-conscious buyers pairing relaxed outerwear with premium denim',
      customer_count: 1530,
      share_pct: 27,
      avg_order_value: 185.0,
      annual_purchase_freq: 2.9,
      return_rate_pct: 8.5,
      preferred_archetype: 'Elevated Casual & Clean Streetwear',
      ai_playbook: 'Deploy dynamic outfit cross-sell suggestions during Friday/Saturday peak hours.',
    },
    {
      segment_id: 'SEG-004',
      name: 'Impulse Single-Piece Buyers',
      tagline: 'High churn-risk shoppers buying 1 isolated item with elevated return hazard',
      customer_count: 910,
      share_pct: 16,
      avg_order_value: 85.0,
      annual_purchase_freq: 1.2,
      return_rate_pct: 28.4,
      preferred_archetype: 'Mixed / Unfocused',
      ai_playbook: 'Intercept cart with How to style this 3 ways AI assistant to boost basket size.',
    },
  ];

  await createAndInsertRows(dataset, 'customer_segments', segmentsSchema, segmentRows);

  // --- Table 3: returns_log ---
  console.log(`📋 Provisioning table: returns_log...`);
  const returnsSchema = [
    { name: 'return_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'order_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'sku', type: 'STRING', mode: 'REQUIRED' },
    { name: 'category', type: 'STRING', mode: 'REQUIRED' },
    { name: 'reason', type: 'STRING', mode: 'REQUIRED' },
    { name: 'refund_amount', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'prevented_by_ai', type: 'BOOL', mode: 'REQUIRED' },
  ];

  const returnReasons = [
    { reason: 'Width/Arch sizing expectation mismatch', cat: 'Footwear' },
    { reason: 'Waist rise & inseam taper preference', cat: 'Bottoms' },
    { reason: 'Shoulder width & layering clearance', cat: 'Outerwear' },
    { reason: 'Chest fit & drape transparency', cat: 'Tops' },
    { reason: 'Color shade variance under fluorescent light', cat: 'Accessories' },
    { reason: 'Buyer remorse / styling incompatibility', cat: 'Tops' },
  ];

  const returnRows = [];
  for (let i = 1; i <= 30; i++) {
    const pick = returnReasons[i % returnReasons.length];
    const catItem = catalog.find((c) => c.category === pick.cat) || catalog[0];
    returnRows.push({
      return_id: `RET-${1000 + i}`,
      order_id: `ORD-${2000 + i}`,
      sku: catItem.id,
      category: pick.cat,
      reason: pick.reason,
      refund_amount: Number(catItem.price.toFixed(2)),
      prevented_by_ai: i % 3 !== 0,
    });
  }

  await createAndInsertRows(dataset, 'returns_log', returnsSchema, returnRows);

  // --- Table 4: orders ---
  console.log(`📋 Provisioning table: orders...`);
  const ordersSchema = [
    { name: 'order_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'customer_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'order_date', type: 'DATE', mode: 'REQUIRED' },
    { name: 'order_total', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'is_capsule_order', type: 'BOOL', mode: 'REQUIRED' },
    { name: 'items_count', type: 'INT64', mode: 'REQUIRED' },
    { name: 'primary_category', type: 'STRING', mode: 'REQUIRED' },
    { name: 'occasion', type: 'STRING', mode: 'NULLABLE' },
  ];

  const occasions = [
    'Versatile Everyday',
    'Executive Office & Meetings',
    'Autumn Weekend Travel',
    'Evening Gallery & Dinners',
  ];

  const orderRows = [];
  const now = new Date();
  for (let i = 1; i <= 60; i++) {
    const isCapsule = i % 2 === 0;
    const itemsCount = isCapsule ? 3 + (i % 3) : 1;
    const orderTotal = isCapsule ? Number((195 + (i % 5) * 45).toFixed(2)) : Number((65 + (i % 4) * 20).toFixed(2));
    const d = new Date(now.getTime() - (i % 28) * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];

    orderRows.push({
      order_id: `ORD-${3000 + i}`,
      customer_id: `CUST-${100 + (i % 25)}`,
      order_date: dateStr,
      order_total: orderTotal,
      is_capsule_order: isCapsule,
      items_count: itemsCount,
      primary_category: catalog[i % catalog.length].category,
      occasion: isCapsule ? occasions[i % occasions.length] : null,
    });
  }

  await createAndInsertRows(dataset, 'orders', ordersSchema, orderRows);

  console.log('\n======================================================');
  console.log(`🎉 ALL 4 ENTERPRISE MERCHANT TABLES SUCCESSFULLY CREATED & POPULATED IN GOOGLE BIGQUERY!`);
  console.log(`   Project: [${projectId}]`);
  console.log(`   Dataset: [${datasetId}]`);
  console.log(`   Tables:  inventory (${inventoryRows.length} rows), customer_segments (${segmentRows.length} rows), returns_log (${returnRows.length} rows), orders (${orderRows.length} rows)`);
  console.log('======================================================\n');

  // Verify by running a live query
  console.log('🔍 Executing Live Verification Query in Google BigQuery...');
  const [queryRows] = await bigquery.query({
    query: `SELECT category, COUNT(*) as sku_count, SUM(current_stock) as total_stock, ROUND(AVG(retail_price), 2) as avg_price FROM \`${projectId}.${datasetId}.inventory\` GROUP BY 1 ORDER BY total_stock DESC`,
  });
  console.log('📊 Verification Query Results from Google BigQuery:');
  console.table(queryRows);
}

async function createAndInsertRows(
  dataset: any,
  tableName: string,
  schema: any[],
  rows: any[]
) {
  const table = dataset.table(tableName);
  const [exists] = await table.exists();

  if (exists) {
    console.log(`   Table [${tableName}] exists. Truncating & re-inserting fresh data...`);
    await table.delete();
  }

  console.log(`   Creating table [${tableName}]...`);
  const [createdTable] = await dataset.createTable(tableName, { schema });
  console.log(`   Inserting ${rows.length} rows into [${tableName}]...`);
  await createdTable.insert(rows);
  console.log(`   ✅ Inserted ${rows.length} rows into [${tableName}].`);
}

main().catch((err) => {
  console.error('❌ Failed to seed BigQuery:', err);
  process.exit(1);
});
