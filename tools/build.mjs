#!/usr/bin/env node
// Eco Hamlet generator: data/*.json -> drawings, OBJ/MTL, site plan, page fragments.
//
//   node tools/build.mjs           regenerate everything
//   node tools/build.mjs --check   fail if any generated file is out of date
//
// No dependencies beyond Node.js 22+ (CI pins 26 LTS in .nvmrc). MIT licence.
import fs from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { planSVG, elevationsSVG, sectionSVG, axoSVG } from './lib/drawings.mjs';
import { toOBJ, toMTL } from './lib/obj.mjs';
import { analyseSite, siteLayers, renderSitePlan, terrainGrid } from './lib/site.mjs';
import { renderViewDiagram } from './lib/views.mjs';
import { renderImpression } from './lib/impression.mjs';
import { galleryCards } from './lib/design-gallery.mjs';
import { arrangementCards, arrangementSVG } from './lib/arrangement-studies.mjs';
import { architecturePage } from './lib/design-architecture.mjs';
import { vegetationPage } from './lib/design-vegetation.mjs';
import { vegetationComparisonSVG } from './lib/design-systems.mjs';
import { groundPage, footbridgeSVG } from './lib/design-ground.mjs';
import { patternsPage, patternsSVG } from './lib/design-patterns.mjs';
import { patternLanguagePage } from './lib/pattern-language-page.mjs';
import { validatePatterns, validateSiteElements } from './lib/patterns.mjs';
import { homesIndexPage, homePage, homeCards, legacyHomeRedirect } from './lib/home-pages.mjs';
import { modelPage } from './lib/model-pages.mjs';
import { accessibleHomePage, accessiblePlanSVG } from './lib/accessible-home.mjs';
import { designShellNav } from './lib/design-nav.mjs';
import { guidesPage } from './lib/design-guides.mjs';
import { communityPage, scenariosPage, ownershipPage, costsPage, roadmapPage, livingPage, participatePage, usabilityPage, licensingPage } from './lib/community-pages.mjs';
import { configurationSVG } from './lib/home-config.mjs';
import { firePage, fireZonesSVG } from './lib/design-fire.mjs';
import { twoStoreyPage, twoStoreySVG } from './lib/design-two-storey.mjs';
import { resiliencePage } from './lib/design-resilience.mjs';
import { waterPage, waterSVG } from './lib/design-water.mjs';
import { comparePage } from './lib/design-compare.mjs';
import { residencesPage } from './lib/design-residences.mjs';
import { illustrationPage } from './lib/design-illustration-page.mjs';
import { visualisationsPage } from './lib/design-visualisations-page.mjs';
import {
  replaceFragments, factsList, roomsTable, drawingsBlock, siteChecks, passportTables,
  provenanceList, reviewsTables, downloadsList, homeTabs, homeDossiers, landscapeFacts,
  modelCards,
} from './lib/html.mjs';

const require = createRequire(import.meta.url);
const EcoModel = require('../site/js/model.js');
const DesignSchema = require('../site/js/design-schema.js');
const DesignModel = require('../site/js/design-model.js');
const DesignIllustration = require('../site/js/design-illustration.js');
const DesignInterior = require('../site/js/design-interior.js');

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILDINGS = ['cabin-a', 'cabin-20', 'lodge'];
const DATA_FILES = ['cabin-a.json', 'cabin-20.json', 'lodge.json', 'site.json'];

const readText = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const kb = (s) => Math.max(1, Math.round(Buffer.byteLength(s) / 1024));
const svgSize = (s) => {
  const mm = /viewBox="([\d.-]+) ([\d.-]+) ([\d.]+) ([\d.]+)"/.exec(s);
  return { width: Math.round(+mm[3]), height: Math.round(+mm[4]) };
};

export function generate() {
  const specs = Object.fromEntries(BUILDINGS.map((id) => [id, JSON.parse(readText(`data/${id}.json`))]));
  const site = JSON.parse(readText('data/site.json'));
  const pairSpec = JSON.parse(readText('data/cabin-pair.json'));
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
      if (name.endsWith('.obj')) {
        const gz = gzipSync(Buffer.from(content), { mtime: 0 });
        gz[9] = 255;
        put(`site/models/${id}/${name}.gz`, gz);
      } else {
        put(`site/models/${id}/${name}`, content);
      }
      sizes[id][name] = { kb: kb(content), ...(name.endsWith('.svg') ? svgSize(content) : {}) };
    }
  }
  const sitePlan = renderSitePlan(site, models, analysis, layers, { legend: true, idPrefix: 'site-' });
  put('site/assets/site-plan.svg', sitePlan);
  const impression = renderImpression(site);
  put('site/assets/lake-impression.svg', impression);
  for (const f of DATA_FILES) put(`site/data/${f}`, f === 'site.json' ? JSON.stringify(JSON.parse(readText(`data/${f}`))) + '\n' : readText(`data/${f}`));

  const grid = terrainGrid(site, 5);
  const terrainPublic = {
    generated_by: 'tools/build.mjs',
    fictional: true,
    note: 'Seeded fictional elevation grid. Metres. x east, y south. Not a survey, lidar surface or hydrological model.',
    terrain: site.terrain,
    grid,
    hash: analysis.terrain_hash,
  };
  put('site/data/terrain.json', JSON.stringify(terrainPublic) + '\n');
  const HOME_META = {
    a: { slug: 'Cedar-1-simple', name: 'Cedar', configuration: 'One container · simple' },
    b: { slug: 'Birch-2-wide', name: 'Birch', configuration: 'Two containers · wide pair' },
    c: { slug: 'Pine-1-simple', name: 'Pine', configuration: 'One container · simple' },
    d: { slug: 'Moss-2-wide', name: 'Moss', configuration: 'Two containers · wide pair' },
    e: { slug: 'Fern-2-wide', name: 'Fern', configuration: 'Two containers · wide pair' },
    f: { slug: 'Juniper-1-compact', name: 'Juniper', configuration: 'One 20-ft container · compact' },
    lodge: { slug: 'Lodge-3-community', name: 'Common-Lodge', configuration: 'Two containers + hall · community' }
  };
  const designLab = JSON.parse(readText('data/design-lab.json'));
  const patternData = JSON.parse(readText('data/patterns/patterns.json'));
  const patternCheck = validatePatterns(patternData);
  patternCheck.errors.forEach((message) => issues.push({ level: 'error', message: 'patterns: ' + message }));
  patternCheck.warnings.forEach((message) => issues.push({ level: 'warning', message: 'patterns: ' + message }));
  const siteElementData = JSON.parse(readText('data/patterns/site-elements.json'));
  const siteElementCheck = validateSiteElements(siteElementData, patternData);
  siteElementCheck.errors.forEach((message) => issues.push({ level: 'error', message: 'pattern site elements: ' + message }));
  siteElementCheck.warnings.forEach((message) => issues.push({ level: 'warning', message: 'pattern site elements: ' + message }));
  const selectedBySite = {};
  designLab.concepts.filter((c) => c.role === 'hamlet-selected').forEach((c) => { selectedBySite[c.site.homesite] = c; });
  const siteReconciliation = site.buildings.filter((b) => b.design_lab_home).map((b) => {
    const c = designLab.concepts.find((x) => x.id === b.design_lab_home);
    if (!c) return { building: b.id, design: b.design_lab_home, conflict: ['selected design not found'] };
    const m = DesignModel.metrics(c);
    const f = DesignModel.architectureFeatures(c);
    const siteAnalysis = analysis.buildings.find((r) => r.id === b.id);
    const corners = c.modules.flatMap((mod) => DesignModel.moduleCorners(mod));
    const a = (b.rotation_deg || 0) * Math.PI / 180;
    const reach = Math.max.apply(null, corners.map((p) => Math.hypot(p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)))) + Math.max.apply(null, (c.porches || []).map((p) => p.depth_m || 0));
    const margin = (b.clearing_radius_m || 0) - reach;
    const porchArea = (c.porches || []).reduce((sum, p) => sum + (p.length_m || 0) * (p.depth_m || 0), 0);
    const toSite = (p) => [b.x_m + p[0] * Math.cos(a) - p[1] * Math.sin(a), b.y_m + p[0] * Math.sin(a) + p[1] * Math.cos(a)];
    const moduleFootprints = c.modules.map((mod) => ({ id: mod.id, storey: mod.storey, polygon: DesignModel.moduleCorners(mod).map(toSite) }));
    const conflicts = [];
    if (margin < 0) conflicts.push('footprint reaches ' + Math.abs(margin).toFixed(1) + ' m beyond the recorded clearing radius');
    if (f.entrance_orientation !== (b.orientation && b.orientation.path_approach || '').split('-')[0]) conflicts.push('design entrance ' + f.entrance_orientation + ' does not match the recorded path approach ' + (b.orientation && b.orientation.path_approach || 'not recorded'));
    return {
      building: b.id, site_name: b.name, design: c.id, design_name: c.name,
      site_footprint_m2: siteAnalysis ? siteAnalysis.footprint_m2 : null,
      design_footprint_m2: m.groundCoverage_m2, difference_pct: siteAnalysis ? Math.round((m.groundCoverage_m2 - siteAnalysis.footprint_m2) / siteAnalysis.footprint_m2 * 1000) / 10 : null,
      design_height_m: m.buildingHeight_m, storeys: m.storeyCount, entrance: f.entrance_orientation, path_approach: b.orientation && b.orientation.path_approach || null,
      primary_view_deg: b.views && b.views.main ? b.views.main.azimuth_deg : null,
      porch_area_m2: Math.round(porchArea * 10) / 10, clearing_radius_m: b.clearing_radius_m,
      design_reach_m: Math.round(reach * 10) / 10, clearance_margin_m: Math.round(margin * 10) / 10,
      module_footprints: moduleFootprints,
      conflicts
    };
  });
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
      design_lab_metrics: siteReconciliation.find((r) => r.building === b.id) || null,
      design_lab_geometry: (siteReconciliation.find((r) => r.building === b.id) || {}).module_footprints ? { modules: siteReconciliation.find((r) => r.building === b.id).module_footprints } : null,
    })),
    design_lab_reconciliation: siteReconciliation,
  };
  put('site/data/homes.json', JSON.stringify(homesPublic) + '\n');
  homesPublic.buildings.forEach((h) => {
    const meta = HOME_META[h.id] || {};
    const kind = h.model === 'lodge' ? 'lodge' : meta.slug.indexOf('-2-') >= 0 ? 'pair' : meta.slug.indexOf('compact') >= 0 ? 'compact' : 'single';
    put(`site/assets/configurations/${h.id}.svg`, configurationSVG(h.id, h.name, kind));
  });
  put('site/homes/index.html', homesIndexPage(homesPublic.buildings, HOME_META));
  homesPublic.buildings.forEach((h) => {
    const meta = HOME_META[h.id] || { slug: h.id, configuration: 'Home concept' };
    put(`site/homes/${meta.slug}/index.html`, homePage(h, site, meta));
    put(`site/homes/${h.id}/index.html`, legacyHomeRedirect(meta.slug, h.name));
    put(`site/homes/${meta.name}/index.html`, legacyHomeRedirect(meta.slug, h.name));
    if (h.id === 'e') put('site/homes/Fern-1-simple/index.html', legacyHomeRedirect(meta.slug, h.name));
    if (h.id === 'f') put('site/homes/Juniper-1-simple/index.html', legacyHomeRedirect(meta.slug, h.name));
  });

  /* ---------------- Container Home Design Lab ---------------- */
  if (!designLab.concepts || designLab.concepts.length !== 16) issues.push({ level: 'error', message: 'data/design-lab.json must contain nine legacy concepts, six selected residences and the common lodge' });
  const hamletSelected = designLab.concepts.filter((c) => c.role === 'hamlet-selected');
  if (hamletSelected.length !== 6) issues.push({ level: 'error', message: 'data/design-lab.json must contain six hamlet-selected residences' });
  if (designLab.concepts.some((c) => c.modules.some((m) => m.storey > 1))) issues.push({ level: 'error', message: 'a residence may not exceed two occupied storeys' });
  if (hamletSelected.filter((c) => c.levels.length === 1).length !== 3 || hamletSelected.filter((c) => c.levels.length === 2).length !== 3) issues.push({ level: 'error', message: 'the six selected residences must include three single-storey and three two-storey homes' });
  const accessibleSelected = hamletSelected.filter((c) => c.access && c.access.target === 'accessible');
  if (accessibleSelected.length !== 2 || accessibleSelected.some((c) => c.levels.length !== 1)) issues.push({ level: 'error', message: 'exactly two selected homes must be whole-home wheelchair-accessible and single-storey' });
  const designViews = {};
  const illustrationEntries = [];
  designLab.concepts.forEach((concept) => {
    const schemaCheck = DesignSchema.validateSchema(concept);
    schemaCheck.errors.forEach((e) => issues.push({ level: 'error', message: `design-lab ${concept.id}: ${e.message}` }));
    const assessment = DesignModel.assess(concept);
    assessment.items.filter((i) => i.category.startsWith('invalid')).forEach((i) => issues.push({ level: 'error', message: `design-lab ${concept.id}: ${i.message}` }));
    const prefix = `concept-${concept.id}`;
    const views = {
      plan: DesignModel.renderPlan(concept, { idPrefix: `${prefix}-plan` }),
      'plan-ground': DesignModel.renderPlan(concept, { idPrefix: `${prefix}-plan-ground`, storey: 0 }),
      exterior: DesignModel.renderAxo(concept, { idPrefix: `${prefix}-exterior` }),
      cutaway: DesignModel.renderAxo(concept, { idPrefix: `${prefix}-cutaway`, mode: 'cutaway' }),
      porch: DesignModel.renderAxo(concept, { idPrefix: `${prefix}-porch`, focus: 'outdoor' }),
      winter: DesignModel.renderAxo(concept, { idPrefix: `${prefix}-winter`, season: 'winter' }),
      'elevation-south': DesignModel.renderElevation(concept, { idPrefix: `${prefix}-elevation-south`, side: 'south' }),
      'elevation-north': DesignModel.renderElevation(concept, { idPrefix: `${prefix}-elevation-north`, side: 'north' }),
      'elevation-east': DesignModel.renderElevation(concept, { idPrefix: `${prefix}-elevation-east`, side: 'east' }),
      'elevation-west': DesignModel.renderElevation(concept, { idPrefix: `${prefix}-elevation-west`, side: 'west' }),
      section: DesignModel.renderSection(concept, { idPrefix: `${prefix}-section` }),
      exploded: DesignModel.renderExploded(concept, { idPrefix: `${prefix}-exploded` }),
      'solar-summer': DesignModel.renderSolarStudy(concept, { idPrefix: `${prefix}-solar-summer`, season: 'summer' }),
      'solar-winter': DesignModel.renderSolarStudy(concept, { idPrefix: `${prefix}-solar-winter`, season: 'winter' })
    };
    if (concept.levels.length > 1) views['plan-upper'] = DesignModel.renderPlan(concept, { idPrefix: `${prefix}-plan-upper`, storey: 1 });
    const detailedIllustration = concept.role === 'hamlet-selected' || concept.role === 'common-lodge';
    let _illusConfig = null;
    let _scene = null;
    if (detailedIllustration) {
      views['container-layout'] = DesignModel.containerSchematicSVG(concept, { idPrefix: `${prefix}-container-layout`, mode: 'plan' });
      views['container-layout-elevation'] = DesignModel.containerSchematicSVG(concept, { idPrefix: `${prefix}-container-layout-elevation`, mode: 'elevation' });
      views['roof-plan'] = DesignModel.roofPlanSVG(concept, { idPrefix: `${prefix}-roof-plan` });
      views['exterior-opposite'] = DesignModel.renderReference(concept, { idPrefix: `${prefix}-exterior-opposite`, view: 'exterior-three-quarter', rotationDeg: 180 });
      views.approach = DesignModel.renderReference(concept, { idPrefix: `${prefix}-approach`, view: 'front-approach' });
      _illusConfig = DesignIllustration.defaultConfig(concept);
      _scene = DesignIllustration.sceneSpec(concept, _illusConfig, site);
      views['site-facing'] = DesignModel.renderReference(concept, { idPrefix: `${prefix}-site-facing`, view: 'exterior-three-quarter', rotationDeg: _scene.camera.renderRotationDeg });
      if (concept.interior) views['interior-plan'] = DesignInterior.planSVG(concept, { idPrefix: `${prefix}-interior-plan`, storey: 0 });
      if (concept.interior && concept.levels.length > 1) views['interior-plan-upper'] = DesignInterior.planSVG(concept, { idPrefix: `${prefix}-interior-plan-upper`, storey: 1 });
    }
    Object.entries(views).forEach(([name, svg]) => put(`site/design-lab/views/${concept.id}-${name}.svg`, svg));
    if (concept.role === 'hamlet-selected') {
      const base = `site/design-lab/illustration/${concept.id}`;
      const files = {
        'design.json': JSON.stringify(concept) + '\n',
        'description.md': _scene.description.text + '\n',
        'prompt.md': _scene.prompt.text + '\n',
        'interior.md': _scene.interiorPrompt.text + '\n',
        'negative.md': _scene.negativePrompt.text + '\n',
        'config.json': JSON.stringify(_illusConfig) + '\n',
        'scene.json': JSON.stringify(_scene) + '\n'
      };
      Object.entries(files).forEach(([name, content]) => put(`${base}/${name}`, content));
      const artifacts = DesignIllustration.artifactPlan(_scene).map((a) => {
        let content = files[a.path];
        if (!content && a.path === 'prompts/interior.md') content = files['interior.md'];
        if (!content && a.path.indexOf('drawings/') === 0) {
          const viewName = a.path.replace('drawings/', '').replace('.svg', '');
          content = views[viewName] || '';
        }
        if (!content && a.path.indexOf('references/') === 0) content = views['site-facing'] || views['exterior'] || '';
        return { ...a, hash: DesignIllustration.hashString(content || a.path + ':' + concept.id) };
      });
      put(`${base}/manifest.json`, JSON.stringify(DesignIllustration.manifest(_scene, concept, artifacts, designLab.generated || '2026-11-22')) + '\n');
      illustrationEntries.push({ concept, scene: _scene, config: _illusConfig, views });
    }
    put(`site/design-lab/data/${concept.id}.json`, JSON.stringify(concept) + '\n');
    designViews[concept.id] = Object.fromEntries(Object.entries(views).map(([name, svg]) => [name, svgSize(svg)]));
  });
  const designProfiles = designLab.concepts.map((concept) => DesignModel.designProfile(concept));
  const profileById = Object.fromEntries(designProfiles.map((p) => [p.id, p]));
  designLab.concepts.forEach((concept) => put(`site/design-lab/architecture/${concept.id}/index.html`, architecturePage(concept, designViews[concept.id], profileById[concept.id]).replace(/[ \t]+$/gm, '')));
  put('site/design-lab/compare/index.html', comparePage(designProfiles, designLab.concepts));
  put('site/design-lab/illustration/index.html', illustrationPage(illustrationEntries, designLab));
  const hamletProfiles = hamletSelected.map((c) => profileById[c.id]);
  const alternatives = {};
  hamletProfiles.filter((p) => p.storeys > 1).forEach((p) => {
    const concept = designLab.concepts.find((c) => c.id === p.id);
    const alt = DesignModel.singleStoreyAlternative(concept);
    if (alt) alternatives[p.id] = DesignModel.designProfile(alt);
  });
  put('site/design-lab/residences/index.html', residencesPage(hamletProfiles, hamletSelected, alternatives, siteReconciliation).replace(/[ \t]+$/gm, ''));
  put('site/design-lab/vegetation/index.html', vegetationPage(designLab.concepts));
  put('site/design-lab/ground/index.html', groundPage(designLab.concepts));
  put('site/design-lab/patterns/index.html', patternsPage());
  put('site/design-lab/fire/index.html', firePage());
  put('site/design-lab/two-storey/index.html', twoStoreyPage());
  put('site/design-lab/resilience/index.html', resiliencePage());
  const community = JSON.parse(readText('data/community.json'));
  put('site/homes/Cedar-Accessible/index.html', accessibleHomePage());
  put('site/homes/Cedar-Accessible/accessibility-plan.svg', accessiblePlanSVG());
  put('site/community/index.html', communityPage(community));
  put('site/community/scenarios/index.html', scenariosPage(community));
  put('site/community/ownership/index.html', ownershipPage());
  put('site/community/costs/index.html', costsPage(community));
  put('site/community/roadmap/index.html', roadmapPage(community));
  put('site/community/usability/index.html', usabilityPage());
  put('site/living/index.html', livingPage(community));
  put('site/participate/index.html', participatePage());
  put('site/licensing/index.html', licensingPage());

  put('site/design-lab/water/index.html', waterPage());
  put('site/design-lab/systems/fire-zones.svg', fireZonesSVG());
  put('site/design-lab/systems/two-storey-options.svg', twoStoreySVG());
  put('site/design-lab/systems/water-cycle.svg', waterSVG());
  put('site/design-lab/systems/container-patterns.svg', patternsSVG());
  put('site/design-lab/systems/footbridge.svg', footbridgeSVG());
  put('site/design-lab/systems/vegetation-comparison.svg', vegetationComparisonSVG());
  const foundationSystems = Array.from(new Set(designLab.concepts.map((c) => c.foundation.system)));
  foundationSystems.forEach((system) => {
    const concept = designLab.concepts.find((c) => c.foundation.system === system);
    if (concept) put(`site/design-lab/systems/foundation-${system}.svg`, DesignModel.foundationSectionSVG(concept, { idPrefix: `system-foundation-${system}`, title: `Foundation · ${system}` }));
  });
  const solarTilts = Array.from(new Set(designLab.concepts.flatMap((c) => c.modules.filter((m) => m.solar && m.solar.enabled).map((m) => m.solar.tilt_deg))));
  solarTilts.forEach((tilt) => {
    let found = null;
    designLab.concepts.some((c) => { const m = c.modules.find((x) => x.solar && x.solar.enabled && x.solar.tilt_deg === tilt); if (m) { found = { c: c, m: m }; return true; } return false; });
    if (found) put(`site/design-lab/systems/solar-${tilt}.svg`, DesignModel.solarSectionSVG(found.c, found.m.id, { idPrefix: `system-solar-${tilt}`, title: `Solar tilt · ${tilt}°` }));
  });
  ['rigid-board', 'mineral-wool', 'wood-fibre', 'spray-foam', 'hybrid'].forEach((assembly) => {
    const concept = designLab.concepts.find((c) => c.envelope && c.envelope.assembly === assembly) || designLab.concepts[0];
    put(`site/design-lab/systems/wall-${assembly}.svg`, DesignModel.wallSectionSVG(concept, concept.modules[0].id, { idPrefix: `system-wall-${assembly}`, title: 'Exterior wall section · ' + DesignModel.ENVELOPE_LABEL[assembly] }));
  });
  const selectedConceptData = designLab.concepts.filter((c) => c.role === 'hamlet-selected');
  const archiveConceptData = designLab.concepts.filter((c) => c.role !== 'hamlet-selected');
  const archivePresets = archiveConceptData.filter((c) => c.editable).map((c) => ({ id: c.id, name: c.name }));
  put('site/design-lab/concepts-selected.js', `/* Generated by tools/build.mjs from data/design-lab.json. Concept data: CC BY-SA 4.0. */\nwindow.DesignLabConcepts = ${JSON.stringify({ schema: designLab.schema, version: designLab.version, licence: designLab.licence, concepts: selectedConceptData, archivePresets })};\n`);
  put('site/design-lab/concepts-archive.js', `/* Generated by tools/build.mjs from data/design-lab.json. Concept data: CC BY-SA 4.0. */\nwindow.DesignLabArchiveConcepts = ${JSON.stringify({ schema: designLab.schema, version: designLab.version, licence: designLab.licence, concepts: archiveConceptData })};\nwindow.DesignLabConcepts = window.DesignLabConcepts || { schema: designLab.schema, version: designLab.version, licence: designLab.licence, concepts: [], archivePresets: [] };\nwindow.DesignLabConcepts.concepts = window.DesignLabConcepts.concepts.concat(window.DesignLabArchiveConcepts.concepts.filter(function (c) { return !window.DesignLabConcepts.concepts.some(function (x) { return x.id === c.id; }); }));\n`);
  const siteForLab = {
    map: site.map,
    parcel: site.parcel.polygon,
    lake: { name: site.lake.name, shoreline: site.lake.shoreline },
    wetland: { name: site.wetland.name, polygon: site.wetland.polygon },
    no_build: site.no_build,
    rocks: (site.rocks || []).map((r) => ({ id: r.id, name: r.name, polygon: r.polygon })),
    drainage: (site.drainage || []).map((d) => ({ id: d.id, name: d.name, points: d.points, width_m: d.width_m })),
    buildings: site.buildings.map((b) => {
      const r = analysis.placed[b.id];
      return { id: b.id, name: b.name, short_name: b.short_name, use: b.use, x_m: b.x_m, y_m: b.y_m, rotation_deg: b.rotation_deg, footprint: r ? r.parts[0].poly : null, design_lab_home: b.design_lab_home || null, design_lab_note: b.design_lab_note || null, views: b.views || null, orientation: b.orientation || null };
    }),
    lanes: site.circulation.lanes.map((l) => ({ id: l.id, name: l.name, kind: l.kind, width_m: l.width_m, points: l.points })),
    trails: site.circulation.trails.map((t) => ({ id: t.id, name: t.name, kind: t.kind, width_m: t.width_m, points: t.points })),
    parking: site.circulation.parking.polygon,
    note: 'Fictional landscape data for illustrative Design Lab placement only. It does not add a design to the community layout.',
  };
  put('site/design-lab/site-data.js', `/* Generated by tools/build.mjs from data/site.json. Fiction/CC BY 4.0. */\nwindow.DesignLabSite = ${JSON.stringify(siteForLab)};\n`);

  const galleryPagePath = 'site/design-lab/index.html';
  const galleryTemplate = readText(galleryPagePath);
  const summaryOf = (c) => {
    const s = DesignSchema.summary(c);
    const m = DesignModel.metrics(c);
    return Object.assign({}, s, { grossFloorArea_m2: m.grossFloorArea_m2, groundCoverage_m2: m.groundCoverage_m2, buildingHeight_m: m.buildingHeight_m });
  };
  const hamletGallery = galleryCards(hamletSelected, summaryOf, {
    heading: 'Six intentionally different hamlet residences',
    headingId: 'hamlet-residences',
    idPrefix: 'hamlet-',
    intro: 'Each selected home has its own massing, roof, arrangement, interior and relationship to the ground. Three are single-storey and three are two-storey. They share construction principles, not a single look. Two homes are designed as whole-home wheelchair-accessible demonstrations; the others are not held to that target.'
  });
  const archiveConcepts = designLab.concepts.filter((c) => c.role !== 'hamlet-selected');
  const archiveGallery = galleryCards(archiveConcepts, summaryOf, {
    base: '../',
    heading: 'Concept archive and the common lodge',
    headingId: 'concept-archive',
    idPrefix: 'archive-',
    intro: 'The original nine concepts are preserved, migrated to the current schema and clearly separated from the six hamlet-selected homes. No source concept was deleted.'
  });
  const archivePagePath = 'site/design-lab/concepts/index.html';
  const archiveTemplate = readText(archivePagePath);
  const patternLink = '<p class="notice"><strong>Pattern Language Explorer.</strong> Explore 20 source-verified patterns, their hamlet interpretations, trade-offs and evidence limits. <a href="pattern-language/">Open the Pattern Language Explorer</a>.</p>';
  const archiveLink = '<p class="notice"><strong>Looking for the legacy concepts?</strong> The nine original concepts, the common lodge and four arrangement studies are on the <a href="concepts/">concept archive page</a>. The main gallery now carries only the six selected homes.</p>';
  const gallery = hamletGallery + '\n' + patternLink + '\n' + archiveLink;
  ['stacked','cantilever','courtyard','creek'].forEach((k) => put(`site/design-lab/arrangements/${k}.svg`, arrangementSVG(k)));
  const galleryTemplateWithNav = galleryTemplate.replace(/<header class="site-header">[\s\S]*?<\/header>(?:\s*<nav class="subnav"[\s\S]*?<\/nav>)?/, designShellNav(1, 'gallery'));
  const galleryOut = galleryTemplateWithNav.replace(/<!-- gen:gallery -->[\s\S]*?<!-- \/gen:gallery -->/, `<!-- gen:gallery -->\n${gallery}\n<!-- /gen:gallery -->`);
  if (!galleryTemplate.includes('<!-- gen:gallery -->') || !galleryTemplate.includes('<!-- /gen:gallery -->')) issues.push({ level: 'error', message: 'site/design-lab/index.html is missing the gen:gallery markers' });
  put(galleryPagePath, galleryOut.replace(/[ \t]+$/gm, ''));
  const archiveNav = archiveTemplate.replace('<!-- gen:nav -->', designShellNav(2, 'gallery'));
  const archiveOut = archiveNav.replace(/<!-- gen:gallery -->[\s\S]*?<!-- \/gen:gallery -->/, `<!-- gen:gallery -->\n${archiveGallery}\n${arrangementCards('../')}\n<!-- /gen:gallery -->`);
  if (!archiveTemplate.includes('<!-- gen:gallery -->') || !archiveTemplate.includes('<!-- /gen:gallery -->')) issues.push({ level: 'error', message: 'site/design-lab/concepts/index.html is missing the gen:gallery markers' });
  put(archivePagePath, archiveOut.replace(/[ \t]+$/gm, ''));
  put('site/design-lab/pattern-language/index.html', patternLanguagePage(patternData, siteElementData).replace(/\n\s+/g, '\n'));
  put('site/design-lab/visualisations/index.html', visualisationsPage().replace(/\n\s+/g, '\n'));
  put('site/design-lab/guides/index.html', guidesPage());
  const editorPath = 'site/design-lab/editor/index.html';
  const editorHtml = readText(editorPath).replace(/<header class="site-header">[\s\S]*?<\/header>(?:\s*<nav class="subnav"[\s\S]*?<\/nav>)?/, designShellNav(2, 'editor'));
  put(editorPath, editorHtml);
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
  const explorerBuildings = Object.fromEntries(BUILDINGS.map((id) => [id, strip(specs[id])]));
  explorerBuildings['cabin-pair'] = strip(pairSpec);
  const data = {
    buildings: explorerBuildings,
    buildingModels: { a: 'cabin-a', b: 'cabin-pair', c: 'cabin-a', d: 'cabin-pair', e: 'cabin-pair', f: 'cabin-20', lodge: 'lodge' },
    homeSlugs: Object.fromEntries(Object.entries(HOME_META).map(([id, m]) => [id, m.slug])),
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
      [`models/${id}/${id}.obj.gz`, '3D geometry for Blender or FreeCAD', 'OBJ, gzip-compressed, metres, Y up; decompress before importing'],
      [`models/${id}/${id}.mtl`, 'Material colours for the OBJ', 'MTL'],
      [`data/${id}.json`, 'Parametric source data', 'JSON'],
    ]]),
  ], fileKB);

  const html = readText('site/index.html');
  const mapSvg = renderSitePlan(site, models, analysis, layers, { inline: true, idPrefix: 'map-' });
  const hamletTemplate = readText('site/hamlet/index.html');
  const hamlet = replaceFragments(hamletTemplate, {
  });
  hamlet.missing.forEach((n) => issues.push({ level: 'error', message: `site/hamlet/index.html is missing the <!-- gen:${n} --> marker` }));
  put('site/hamlet/index.html', hamlet.html);
  put('site/cabin-a/index.html', modelPage(models['cabin-a'], sizes['cabin-a'], 'cabin'));
  put('site/lodge/index.html', modelPage(models.lodge, sizes.lodge, 'lodge'));
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
    passport: passportTables(BUILDINGS.map((id) => models[id])),
    provenance: provenanceList(BUILDINGS.map((id) => models[id]), site),
    reviews: reviewsTables(BUILDINGS.map((id) => models[id])),
    downloads,
    'hero-image': (() => {
      const sz = svgSize(impression);
      return `<img src="assets/lake-impression.svg" width="${sz.width}" height="${sz.height}" alt="Concept impression of a lake-edge home at dawn: a low timber-clad cabin with a solar roof and a screened porch faces a rocky Canadian Shield lake, framed by cedar and pine." decoding="async">`;
    })(),
    'home-tabs': '',
    'home-dossiers': homeCards(homesPublic.buildings, HOME_META),
    'model-cards': modelCards(BUILDINGS.map((id) => models[id]), {
      'cabin-a': img('cabin-a', 'axonometric.svg', 'Cabin A seen from the south-west: a long timber-clad container home with solar panels, a screened porch, an access ramp and a planted trellis.').replace(' loading="lazy"', ''),
      lodge: img('lodge', 'axonometric.svg', 'The common lodge seen from the south-west: two timber-clad modules either side of a taller hall with clerestory windows, solar panels, a screened porch and two ramps.').replace(' loading="lazy"', ''),
    }),
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
    const current = fs.existsSync(abs) ? fs.readFileSync(abs) : null;
    if (Buffer.isBuffer(content) ? (current && Buffer.compare(current, content) === 0) : current && current.toString('utf8') === content) continue;
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
