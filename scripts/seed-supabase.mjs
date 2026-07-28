import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://mdqucjligktvfoxlxwcz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcXVjamxpZ2t0dmZveGx4d2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMTQwOTksImV4cCI6MjEwMDc5MDA5OX0.f2VbHHj-VBgGjusu2l_gbKrvB4LkyiKwdvoYVgGpBHU';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates',
};

// Read the routes.ts file
const content = readFileSync('./src/data/routes.ts', 'utf-8');

// Extract DETAILED_ROUTES
const drMarker = 'const DETAILED_ROUTES = [';
const drStart = content.indexOf(drMarker);
const almanacMarker = 'export const ALMANAC = {';
const almanacStart = content.indexOf(almanacMarker);
const drSection = content.substring(drStart + 'const '.length, almanacStart).trim();
const drArrayStr = drSection.replace(/^DETAILED_ROUTES\s*=\s*/, '').replace(/;\s*$/, '').trim();
const DETAILED_ROUTES = eval('(' + drArrayStr + ')');

// Extract ALMANAC
const alSection = content.substring(almanacStart + 'export '.length);
const alArrayStr = alSection.replace(/^const\s*ALMANAC\s*=\s*/, '').replace(/;\s*$/, '').trim();
const ALMANAC = eval('(' + alArrayStr + ')');

// Flatten ALMANAC
const almanacRoutes = [];
for (const [region, routes] of Object.entries(ALMANAC)) {
  if (Array.isArray(routes)) {
    for (const r of routes) almanacRoutes.push(r);
  }
}

// Transform detailed routes
const routesForDb = DETAILED_ROUTES.map(r => ({
  id: r.id,
  kind: r.kind || 'detailed',
  name: r.name,
  region: r.region,
  status: r.status || null,
  difficulty: r.difficulty || null,
  distance_km: r.distanceKm ?? null,
  gain_m: r.gainM ?? null,
  loss_m: r.lossM ?? null,
  date_start: r.dateStart || null,
  date_end: r.dateEnd || null,
  from_point: r.from || null,
  to_point: r.to || null,
  season: r.season || null,
  forecast_link: r.forecastLink || null,
  bus_link: r.busLink || null,
  bdz_link: r.bdzLink || null,
  avtogari_link: r.avtogariLink || null,
  route_line: r.routeLine || null,
  verification_level: r.verificationLevel || null,
  transport: r.transport || null,
  huts: r.huts || null,
  risk: r.risk || null,
  days: r.days || null,
  accommodation: r.accommodation || null,
  taxis: r.taxis || null,
  windy_embed: r.windyEmbed || null,
  notes_default: r.notesDefault || null,
}));

// Transform almanac routes
const almanacForDb = almanacRoutes.map(r => ({
  id: r.id,
  name: r.name,
  region: r.region,
  distance_km: r.distanceKm,
  gain_m: r.gainM,
  loss_m: r.lossM,
  difficulty: r.difficulty,
  hut_name: r.hutName,
  hut_phone: r.hutPhone,
  day1: r.day1,
  day2: r.day2,
  back: r.back,
  verified: r.verified ?? false,
  suited_for: r.suitedFor || null,
  friday_night: r.fridayNight || null,
  terrain: r.terrain || null,
  km_note: r.kmNote || null,
  assessment: r.assessment || null,
  practical_rank: r.practicalRank || null,
}));

async function seed() {
  console.log(`Seeding ${routesForDb.length} detailed routes...`);
  
  for (let i = 0; i < routesForDb.length; i += 3) {
    const batch = routesForDb.slice(i, i + 3);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/routes`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Error routes ${i}-${i+batch.length-1}: ${res.status} ${text.substring(0, 200)}`);
    } else {
      console.log(`  Inserted routes ${i}-${i+batch.length-1} (${batch.map(r => r.id).join(', ')})`);
    }
  }

  console.log(`\nSeeding ${almanacForDb.length} almanac routes...`);
  const alRes = await fetch(`${SUPABASE_URL}/rest/v1/almanac_routes`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(almanacForDb),
  });
  if (!alRes.ok) {
    const text = await alRes.text();
    console.error(`Error almanac: ${alRes.status} ${text.substring(0, 200)}`);
  } else {
    console.log(`  Inserted ${almanacForDb.length} almanac routes`);
  }

  // Verify
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/routes?select=id&limit=1`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Prefer': 'count=exact' },
  });
  const countHeader = countRes.headers.get('content-range');
  console.log(`\nVerification: routes content-range = ${countHeader}`);
  
  const alCountRes = await fetch(`${SUPABASE_URL}/rest/v1/almanac_routes?select=id&limit=1`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Prefer': 'count=exact' },
  });
  const alCountHeader = alCountRes.headers.get('content-range');
  console.log(`Verification: almanac content-range = ${alCountHeader}`);
}

seed().catch(console.error);
