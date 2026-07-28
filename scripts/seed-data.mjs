import { readFileSync, writeFileSync } from 'fs';

// Read the routes.ts file
const content = readFileSync('./src/data/routes.ts', 'utf-8');

// Extract DETAILED_ROUTES: from "const DETAILED_ROUTES = [" to the matching "];"
const drMarker = 'const DETAILED_ROUTES = [';
const drStart = content.indexOf(drMarker);
const almanacMarker = 'export const ALMANAC = {';
const almanacStart = content.indexOf(almanacMarker);
// DETAILED_ROUTES ends just before ALMANAC starts
const drSection = content.substring(drStart + 'const '.length, almanacStart).trim();
// drSection is like "DETAILED_ROUTES = [...]\n\n"
const drArrayStr = drSection.replace(/^DETAILED_ROUTES\s*=\s*/, '').replace(/;\s*$/, '').trim();
const DETAILED_ROUTES = eval('(' + drArrayStr + ')');

// Extract ALMANAC: from "const ALMANAC = {" to the end of file "};"
const alSection = content.substring(almanacStart + 'export '.length);
const alArrayStr = alSection.replace(/^const\s*ALMANAC\s*=\s*/, '').replace(/;\s*$/, '').trim();
const ALMANAC = eval('(' + alArrayStr + ')');

// Flatten ALMANAC into array
const almanacRoutes = [];
for (const [region, routes] of Object.entries(ALMANAC)) {
  if (Array.isArray(routes)) {
    for (const r of routes) {
      almanacRoutes.push(r);
    }
  }
}

// Generate SQL
function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

let sql = '-- Seed DETAILED_ROUTES\n';
sql += 'INSERT INTO routes (id, kind, name, region, status, difficulty, distance_km, gain_m, loss_m, date_start, date_end, from_point, to_point, season, forecast_link, bus_link, bdz_link, avtogari_link, route_line, verification_level, transport, huts, risk, days, accommodation, taxis, windy_embed, notes_default) VALUES\n';

const routeValues = DETAILED_ROUTES.map(r => {
  return `(${esc(r.id)}, ${esc(r.kind || 'detailed')}, ${esc(r.name)}, ${esc(r.region)}, ${esc(r.status)}, ${esc(r.difficulty)}, ${esc(r.distanceKm)}, ${esc(r.gainM)}, ${esc(r.lossM)}, ${esc(r.dateStart)}, ${esc(r.dateEnd)}, ${esc(r.from)}, ${esc(r.to)}, ${esc(r.season)}, ${esc(r.forecastLink)}, ${esc(r.busLink)}, ${esc(r.bdzLink)}, ${esc(r.avtogariLink)}, ${esc(r.routeLine)}, ${esc(r.verificationLevel)}, ${esc(r.transport)}, ${esc(r.huts)}, ${esc(r.risk)}, ${esc(r.days)}, ${esc(r.accommodation)}, ${esc(r.taxis)}, ${esc(r.windyEmbed)}, ${esc(r.notesDefault)})`;
});

sql += routeValues.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET\n';
sql += '  name = EXCLUDED.name, region = EXCLUDED.region, status = EXCLUDED.status, difficulty = EXCLUDED.difficulty, distance_km = EXCLUDED.distance_km, gain_m = EXCLUDED.gain_m, loss_m = EXCLUDED.loss_m, date_start = EXCLUDED.date_start, date_end = EXCLUDED.date_end, from_point = EXCLUDED.from_point, to_point = EXCLUDED.to_point, season = EXCLUDED.season, forecast_link = EXCLUDED.forecast_link, bus_link = EXCLUDED.bus_link, bdz_link = EXCLUDED.bdz_link, avtogari_link = EXCLUDED.avtogari_link, route_line = EXCLUDED.route_line, verification_level = EXCLUDED.verification_level, transport = EXCLUDED.transport, huts = EXCLUDED.huts, risk = EXCLUDED.risk, days = EXCLUDED.days, accommodation = EXCLUDED.accommodation, taxis = EXCLUDED.taxis, windy_embed = EXCLUDED.windy_embed, notes_default = EXCLUDED.notes_default, updated_at = now();\n\n';

// Generate SQL for ALMANAC
sql += '-- Seed ALMANAC\n';
sql += 'INSERT INTO almanac_routes (id, name, region, distance_km, gain_m, loss_m, difficulty, hut_name, hut_phone, day1, day2, back, verified, suited_for, friday_night, terrain, km_note, assessment, practical_rank) VALUES\n';

const almanacValues = almanacRoutes.map(r => {
  return `(${esc(r.id)}, ${esc(r.name)}, ${esc(r.region)}, ${esc(r.distanceKm)}, ${esc(r.gainM)}, ${esc(r.lossM)}, ${esc(r.difficulty)}, ${esc(r.hutName)}, ${esc(r.hutPhone)}, ${esc(r.day1)}, ${esc(r.day2)}, ${esc(r.back)}, ${esc(r.verified)}, ${esc(r.suitedFor || null)}, ${esc(r.fridayNight || null)}, ${esc(r.terrain || null)}, ${esc(r.kmNote || null)}, ${esc(r.assessment || null)}, ${esc(r.practicalRank || null)})`;
});

sql += almanacValues.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET\n';
sql += '  name = EXCLUDED.name, region = EXCLUDED.region, distance_km = EXCLUDED.distance_km, gain_m = EXCLUDED.gain_m, loss_m = EXCLUDED.loss_m, difficulty = EXCLUDED.difficulty, hut_name = EXCLUDED.hut_name, hut_phone = EXCLUDED.hut_phone, day1 = EXCLUDED.day1, day2 = EXCLUDED.day2, back = EXCLUDED.back, verified = EXCLUDED.verified, suited_for = EXCLUDED.suited_for, friday_night = EXCLUDED.friday_night, terrain = EXCLUDED.terrain, km_note = EXCLUDED.km_note, assessment = EXCLUDED.assessment, practical_rank = EXCLUDED.practical_rank;\n';

writeFileSync('./seed.sql', sql);
console.log(`Generated seed.sql: ${DETAILED_ROUTES.length} detailed routes + ${almanacRoutes.length} almanac routes`);
console.log(`SQL file size: ${sql.length} chars`);
console.log(`First route id: ${DETAILED_ROUTES[0]?.id}, last: ${DETAILED_ROUTES[DETAILED_ROUTES.length-1]?.id}`);
console.log(`Almanac regions: ${Object.keys(ALMANAC).join(', ')}`);
