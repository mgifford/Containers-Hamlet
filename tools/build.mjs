#!/usr/bin/env node
// Eco Hamlet generator: data/*.json -> drawings, OBJ/MTL, site plan, page fragments.
//
//   node tools/build.mjs           regenerate everything
//   node tools/build.mjs --check   fail if any generated file is out of date
//
// No dependencies beyond Node.js 22+ (CI pins 26 LTS in .nvmrc). MIT licence.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { planSVG, elevationsSVG, sectionSVG, axoSVG } from './lib/drawings.mjs';
import { toOBJ, toMTL } from './lib/obj.mjs';
import { analyseSite, siteLayers, renderSitePlan, terrainGrid } from './lib/site.mjs';
import { renderViewDiagram } from './lib/views.mjs';
import { renderImpression } from './lib/impression.mjs';
import {
  replaceFragments, factsList, roomsTable, drawingsBlock, siteChecks, passportTables,
  provenanceList, reviewsTables, downloadsList, homeTabs, homeDossiers, landscapeFacts,
  modelCards,
} from './lib/html.mjs';

const require = createRequire(import.meta.url);
const EcoModel = require('../site/js/model.js');

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILDINGS = ['cabin-a', 'lodge'];
const DATA_FILES = ['cabin-a.json', 'lodge.json', 'site.json'];

const readText = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const kb = (s) => Math.max(1, Math.round(Buffer.byteLength(s) / 1024));
const svgSize = (s) => {
  const mm = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(s);
  return { width: Math.round(+mm[1]), height: Math.round(+mm[2]) };
};

export function generate() {
  const specs = Object.fromEntries(BUILDINGS.map((id) => [id, JSON.parse(readText(`data/${id}.json`))]));
  const site = JSON.parse(readText('data/site.json'));
  const issues = [];
  const models = {};
  for (const id of BUILDINGS) {
    const spec = specs[id];
    models[id] = EcoModel.buildModel(spec);
    EcoModel.validate(spec, models[id]).forEach((i) => issues.push({ ...i, message: `${id}: ${i.message}` }));
    Object.keys(spec.roof.options).filter((o) => o !== spec.roof.default_option).forEach((opt) => {
      EcoModel.validate(spec, EcoModel.buildModel(spec, { roof: opt }))
        .filter((i) => i.level === 'error')
        .forEach((i) => issues.push({ ...i, message: `${id} (${opt} roof): ${i.message}` }));
    });
  }
  const analysis = analyseSite(site, models);
  issues.push(...analysis.issues);
  const layers = siteLayers(site, models, analysis);

  const files = new Map();
  const put = (p, c) => files.set(p, c);
  const sizes = {};
  for (const id of BUILDINGS) {
    const model = models[id];
    const outs = {
      'floor-plan.svg': planSVG(model),
      'elevations.svg': elevationsSVG(model),
      'section.svg': sectionSVG(model),
      'axonometric.svg': axoSVG(model, 'exterior'),
      'cutaway.svg': axoSVG(model, 'cutaway'),
      [`${id}.obj`]: toOBJ(model, { mtl: `${id}.mtl`, title: `Eco Hamlet: ${model.spec.name}` }),
      [`${id}.mtl`]: toMTL(model),
    };
    sizes[id] = {};
    for (const [name, content] of Object.entries(outs)) {
      put(`models/${id}/${name}`, content);
      put(`site/models/${id}/${name}`, content);
      sizes[id][name] = { kb: kb(content), ...(name.endsWith('.svg') ? svgSize(content) : {}) };
    }
  }
  const sitePlan = renderSitePlan(site, models, analysis, layers, { legend: true, idPrefix: 'site-' });
  put('site/assets/site-plan.svg', sitePlan);
  const impression = renderImpression(site);
  put('site/assets/lake-impression.svg', impression);
  for (const f of DATA_FILES) put(`site/data/${f}`, readText(`data/${f}`));

  const grid = terrainGrid(site, 5);
  const terrainPublic = {
    generated_by: 'tools/build.mjs',
    fictional: true,
    note: 'Seeded fictional elevation grid. Metres. x east, y south. Not a survey, lidar surface or hydrological model.',
    terrain: site.terrain,
    grid,
    hash: analysis.terrain_hash,
  };
  put('site/data/terrain.json', JSON.stringify(terrainPublic, null, 2) + '\n');
  const homesPublic = {
    generated_by: 'tools/build.mjs',
    fictional: true,
    licence: 'CC BY 4.0',
    seed: site.terrain.seed,
    area_acres: analysis.area_acres,
    note: 'Building placements, orientations, briefs and the computed view and siting observations. Not a survey, permission or privacy assessment.',
    buildings: site.buildings.map((b) => ({
      ...b,
      analysis: analysis.buildings.find((r) => r.id === b.id),
    })),
  };
  put('site/data/homes.json', JSON.stringify(homesPublic, null, 2) + '\n');
  const publicAnalysis = {
    generated_by: 'tools/build.mjs',
    fictional: true,
    seed: analysis.seed,
    terrain_hash: analysis.terrain_hash,
    view_tolerance_deg: analysis.view_tolerance_deg,
    area_m2: analysis.area_m2,
    area_acres: analysis.area_acres,
    area_ha: analysis.area_ha,
    no_build: site.no_build,
    buildings: analysis.buildings,
    potential_areas: analysis.potential_areas,
    drainage_crossings: analysis.drainage_crossings,
    lane_drainage_crossings: analysis.lane_drainage_crossings,
    issues: analysis.issues,
  };
  put('site/data/site-analysis.json', JSON.stringify(publicAnalysis, null, 2) + '\n');

  const strip = (spec) => {
    const s = JSON.parse(JSON.stringify(spec));
    ['material_passport', 'reviews_required', 'provenance', 'screened_porch', 'design_intent', 'interior_zones'].forEach((k) => delete s[k]);
    return s;
  };
  const data = {
    buildings: Object.fromEntries(BUILDINGS.map((id) => [id, strip(specs[id])])),
    site: {
      name: 'Containers Hamlet',
      area_acres: analysis.area_acres,
      area_ha: analysis.area_ha,
      seed: analysis.seed,
      terrain_hash: analysis.terrain_hash,
      no_build: site.no_build,
      lake: { name: site.lake.name, type: site.lake.type },
      wetland: { name: site.wetland.name },
      buildings: analysis.buildings.map((b) => {
        const src = site.buildings.find((x) => x.id === b.id) || {};
        return {
          id: b.id, name: b.name, short_name: b.short_name, use: b.use, model: b.model,
          x_m: b.x_m, y_m: b.y_m, rotation_deg: b.rotation_deg,
          clear_floor_area_m2: b.clear_floor_area_m2, footprint_m2: b.footprint_m2,
          shoreline_m: b.shoreline_m, wetland_m: b.wetland_m, pad: { max_m: b.pad.max_m },
          crane_reach_m: b.crane_reach_m, entrance_to_lane_m: b.entrance_to_lane_m,
          door_to_trail_m: b.door_to_trail_m, ramp_to_trail_m: b.ramp_to_trail_m,
          principal_facade: b.principal_facade, principal_azimuth_deg: b.principal_azimuth_deg,
          ok: b.ok, checks: b.checks,
          views: b.views, character: src.character, orientation: src.orientation,
          clearing_note: src.clearing_note, design_note: src.design_note, views_text: src.views,
        };
      }),
    },
  };
  put('site/js/data.js', `/* Generated by tools/build.mjs from data/*.json. Do not edit by hand. Data: CC BY 4.0. */\nwindow.EcoHamletData = ${JSON.stringify(data)};\n`);

  // page fragments
  const fileKB = {};
  for (const [p, c] of files) if (p.startsWith('site/')) fileKB[p.slice(5)] = kb(c);
  const downloads = downloadsList([
    ['Landscape', [
      ['assets/site-plan.svg', 'Fictional site plan with terrain, buffers, paths and views', 'SVG'],
      ['assets/lake-impression.svg', 'Concept impression of a lake-edge home', 'SVG'],
      ['data/site.json', 'Site data: terrain, water, woodland, access, buildings and views', 'JSON'],
      ['data/terrain.json', 'Seeded terrain elevation grid', 'JSON'],
      ['data/site-analysis.json', 'Computed siting, view and access observations', 'JSON'],
      ['data/homes.json', 'Home briefs with placements, orientations and views', 'JSON'],
    ]],
    ...BUILDINGS.map((id) => [models[id].spec.name, [
      [`models/${id}/floor-plan.svg`, 'Floor plan', 'SVG'],
      [`models/${id}/elevations.svg`, 'Elevations', 'SVG'],
      [`models/${id}/section.svg`, 'Section and wall build-up', 'SVG'],
      [`models/${id}/axonometric.svg`, 'Exterior axonometric', 'SVG'],
      [`models/${id}/cutaway.svg`, 'Cutaway axonometric', 'SVG'],
      [`models/${id}/${id}.obj`, '3D geometry for Blender or FreeCAD', 'OBJ, metres, Y up'],
      [`models/${id}/${id}.mtl`, 'Material colours for the OBJ', 'MTL'],
      [`data/${id}.json`, 'Parametric source data', 'JSON'],
    ]]),
  ], fileKB);

  const html = readText('site/index.html');
  const mapSvg = renderSitePlan(site, models, analysis, layers, { inline: true, idPrefix: 'map-' });
  const diagrams = {};
  site.buildings.forEach((b) => {
    const svg = renderViewDiagram(site, models, analysis, b);
    const r = analysis.buildings.find((x) => x.id === b.id);
    put(`site/assets/views/${b.id}.svg`, svg);
    const target = b.views && b.views.main && b.views.main.target;
    const targetLabel = !target ? 'the landscape' : target.type === 'lake' ? 'Heron Lake' : target.type === 'wetland' ? 'the beaver meadow' : (target.id || 'the forest').replace(/-/g, ' ');
    diagrams[b.id] = `<img src="assets/views/${b.id}.svg" width="280" height="280" alt="${b.name}${b.short_name ? ` (${b.short_name})` : ''} view diagram: the principal porch faces ${Math.round(r.principal_azimuth_deg)} degrees toward ${targetLabel}, ${Math.round(r.views.main_distance_m)} metres away. North is up; the shaded wedge is illustrative and is not a sightline or privacy assessment." loading="lazy" decoding="async">`;
  });
  const img = (id, file, alt, loading = 'lazy') => {
    const sz = sizes[id][file];
    return `<img src="models/${id}/${file}" width="${sz.width}" height="${sz.height}" alt="${alt}"${loading === 'lazy' ? ' loading="lazy"' : ''} decoding="async">`;
  };
  const sizeOf = (id) => Object.fromEntries(Object.entries(sizes[id]).map(([k, v]) => [k, v]));
  const { html: page, missing } = replaceFragments(html, {
    'site-map': mapSvg,
    'site-checks': siteChecks(site, analysis),
    'cabin-a-facts': factsList(models['cabin-a']),
    'cabin-a-drawings': drawingsBlock('cabin-a', 'Cabin A', sizeOf('cabin-a')),
    'cabin-a-rooms': roomsTable(models['cabin-a'], 'Cabin A rooms, clear dimensions inside the lining'),
    'lodge-facts': factsList(models.lodge),
    'lodge-drawings': drawingsBlock('lodge', 'Common lodge', sizeOf('lodge')),
    'lodge-rooms': roomsTable(models.lodge, 'Common lodge rooms, clear dimensions inside the lining'),
    passport: passportTables(BUILDINGS.map((id) => models[id])),
    provenance: provenanceList(BUILDINGS.map((id) => models[id]), site),
    reviews: reviewsTables(BUILDINGS.map((id) => models[id])),
    downloads,
    'hero-image': (() => {
      const sz = svgSize(impression);
      return `<img src="assets/lake-impression.svg" width="${sz.width}" height="${sz.height}" alt="Concept impression of a lake-edge home at dawn: a low timber-clad cabin with a solar roof and a screened porch faces a rocky Canadian Shield lake, framed by cedar and pine." decoding="async">`;
    })(),
    'landscape-facts': landscapeFacts(site, analysis),
    'home-tabs': homeTabs(site),
    'home-dossiers': homeDossiers(site, analysis, models, diagrams),
    'model-cards': modelCards(BUILDINGS.map((id) => models[id]), {
      'cabin-a': img('cabin-a', 'axonometric.svg', 'Cabin A seen from the south-west: a long timber-clad container home with solar panels, a screened porch, an access ramp and a planted trellis.').replace(' loading="lazy"', ''),
      lodge: img('lodge', 'axonometric.svg', 'The common lodge seen from the south-west: two timber-clad modules either side of a taller hall with clerestory windows, solar panels, a screened porch and two ramps.').replace(' loading="lazy"', ''),
    }),
    'lodge-image': img('lodge', 'axonometric.svg', 'The common lodge seen from the south-west: two timber-clad modules either side of a taller hall with clerestory windows, solar panels, a screened porch, an entry canopy and two ramps.'),
    'explorer-fallback': img('cabin-a', 'cutaway.svg', 'Cabin A cutaway with the roof removed and walls cut at 1.2 m, showing Sleeping, Living, Kitchenette and Bathroom from the south-west.'),
  });
  missing.forEach((n) => issues.push({ level: 'error', message: `site/index.html is missing the <!-- gen:${n} --> marker` }));
  put('site/index.html', page);
  return { files, issues, models, analysis, sizes };
}

function main() {
  const check = process.argv.includes('--check');
  const { files, issues, models, analysis } = generate();
  const errors = issues.filter((i) => i.level === 'error');
  issues.forEach((i) => console[i.level === 'error' ? 'error' : 'warn'](`${i.level.toUpperCase()}: ${i.message}`));
  if (errors.length) {
    console.error(`\n${errors.length} error(s): the data describes something the model cannot build or that breaks a site constraint.`);
    process.exit(1);
  }
  const stale = [];
  for (const [p, content] of files) {
    const abs = path.join(ROOT, p);
    const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
    if (current === content) continue;
    if (check) stale.push(p);
    else {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, content);
    }
  }
  if (check) {
    if (stale.length) {
      console.error('Generated files are out of date. Run `node tools/build.mjs` and commit the result:\n  ' + stale.join('\n  '));
      process.exit(1);
    }
    console.log(`OK: ${files.size} generated files are up to date.`);
    return;
  }
  for (const id of Object.keys(models)) {
    const M = models[id].meta;
    console.log(`${id}: ${models[id].prims.length} solids, ${M.overall.length_m} x ${M.overall.width_m} m, ${M.clear_floor_area_m2} m2 clear, ${M.pv.kwp} kWp`);
  }
  console.log(`site: ${analysis.area_acres} acres; ${analysis.buildings.filter((b) => b.ok).length}/${analysis.buildings.length} buildings pass the siting checks`);
  console.log(`Wrote ${files.size} files.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
