// Image-description validation. Code: MIT. Generated content: CC BY-SA 4.0.
// A description is a brief for an illustration, not an architectural source.
// This module checks that every claim it makes is either modeled, inferred,
// explicitly conceptual, or excluded, and that the model has not drifted.
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const Illustration = require('../../site/js/design-illustration.js');

export const SCHEMA = 'containers-hamlet-image-descriptions/v1';
const STATUS = ['ready', 'blocked-pending-reconciliation'];
const ITEM_STATUS = ['modeled', 'inferred', 'conceptual'];
const PLACEMENT_STATUS = ['modeled', 'inferred', 'conceptual', 'not-resolved'];
const CHECK_CODES = ['custom', 'no-hydrant', 'no-fire-cistern', 'no-potable', 'no-stove', 'no-chimney', 'no-battery', 'no-deck-claim', 'no-pv', 'no-partitions', 'no-doors', 'no-fixtures', 'no-extra-geometry'];

function isString(v) { return typeof v === 'string' && v.trim().length > 0; }
function near(a, b, eps) { return Math.abs(a - b) <= (eps == null ? 0.001 : eps); }

function openingById(design, id) {
  for (const m of design.modules) {
    const o = (m.openings || []).find((x) => x.id === id);
    if (o) return { module: m, opening: o };
  }
  return null;
}

function roomById(design, id) {
  return ((design.interior && design.interior.rooms) || []).find((r) => r.id === id) || null;
}

function roomSpans(design, roomIds) {
  const spans = [];
  for (const id of roomIds || []) {
    const r = roomById(design, id);
    if (!r) continue;
    const xs = r.polygon.map((p) => p[0]);
    spans.push({ id: r.id, module: r.module, min: Math.min(...xs), max: Math.max(...xs) });
  }
  return spans;
}

function openingRoomMismatches(design, image) {
  const out = [];
  if (!image.interior) return out;
  const listedRooms = new Set(image.interior.rooms || []);
  for (const id of image.interior.openings || []) {
    const found = openingById(design, id);
    if (!found) continue;
    const { module, opening } = found;
    const claiming = ((design.interior && design.interior.rooms) || [])
      .filter((r) => listedRooms.has(r.id) && (r.openingIds || []).includes(id));
    if (!claiming.length) continue;
    const span = roomSpans(design, claiming.map((r) => r.id)).find((s) => s.module === module.id);
    if (!span) continue;
    const half = module.nominal.length_m / 2;
    if (opening.face === 'north' || opening.face === 'south') {
      const x = -half + opening.position_m;
      if (x < span.min - 0.05 || x > span.max + 0.05) {
        out.push({
          code: 'opening-room-mismatch',
          message: image.id + ': opening ' + id + ' is claimed by ' + span.id + ' but its position ' + x.toFixed(2) + ' m is outside that room (' + span.min.toFixed(2) + '..' + span.max.toFixed(2) + ' m).'
        });
      }
    } else if (opening.face === 'west') {
      if (span.min > -half + 0.2) {
        out.push({
          code: 'opening-room-mismatch',
          message: image.id + ': west-face opening ' + id + ' is claimed by ' + span.id + ', which does not touch the west end of ' + module.id + '.'
        });
      }
    } else if (opening.face === 'east') {
      if (span.max < half - 0.2) {
        out.push({
          code: 'opening-room-mismatch',
          message: image.id + ': east-face opening ' + id + ' is claimed by ' + span.id + ', which does not touch the east end of ' + module.id + '.'
        });
      }
    }
  }
  return out;
}

function checkDesign(design, image, code) {
  switch (code) {
    case 'no-hydrant': return !(design.fire && design.fire.water_access === true);
    case 'no-fire-cistern': return !(design.water && design.water.fireReserve && design.water.fireReserve.verified === true);
    case 'no-potable': return !(design.water && design.water.treatment && design.water.treatment.potable === true);
    case 'no-stove': return !/wood stove|stove\b/i.test(JSON.stringify(design));
    case 'no-chimney': return !/chimney/i.test(JSON.stringify(design));
    case 'no-battery': return !/battery|inverter/i.test(JSON.stringify(design));
    case 'no-deck-claim': return !(design.fire && design.fire.noncombustible_deck === true);
    case 'no-pv': return !((design.solar_array && design.solar_array.enabled === true) || (design.modules || []).some((m) => m.solar && m.solar.enabled));
    case 'no-partitions': return !((design.interior && design.interior.partitions) || []).length;
    case 'no-doors': return !((design.interior && design.interior.doors) || []).length;
    case 'no-fixtures': return !((design.interior && design.interior.fixtures) || []).length;
    case 'no-extra-geometry': {
      const storeys = design.levels ? design.levels.length : 1;
      const modules = (design.modules || []).length;
      return image && image.geometry ? image.geometry.storeys === storeys && image.geometry.modules === modules : true;
    }
    default: return true;
  }
}

function validateCamera(camera, errors, where) {
  if (!camera || typeof camera !== 'object') { errors.push(where + ': camera object required.'); return; }
  if (!isString(camera.position)) errors.push(where + ': camera.position required.');
  if (!isString(camera.framing)) errors.push(where + ': camera.framing required.');
  if (!Number.isFinite(camera.height_m) || camera.height_m < 0.2 || camera.height_m > 3.5) errors.push(where + ': camera.height_m must be 0.2–3.5 m.');
  if (!Number.isFinite(camera.lens_mm) || camera.lens_mm < 14 || camera.lens_mm > 200) errors.push(where + ': camera.lens_mm must be 14–200 mm.');
}

export function validateImageDescriptions(data, designs, siteData, options) {
  const opts = options || {};
  const errors = [];
  const warnings = [];
  const unresolved = [];
  const designById = new Map((designs || []).map((d) => [d.id, d]));
  const patternNumbers = new Set((opts.patterns || []).map((p) => p.number));
  const primaryPatterns = (data && data.patternDefaults && data.patternDefaults.primary) || [];
  const allImageIds = new Set();
  const sceneCache = new Map();
  const sceneHashFor = (design) => {
    if (!sceneCache.has(design.id)) {
      const scene = Illustration.sceneSpec(design, Illustration.defaultConfig(design), siteData);
      sceneCache.set(design.id, Illustration.sceneHash(scene));
    }
    return sceneCache.get(design.id);
  };
  const summary = { designs: 0, images: 0, ready: 0, blocked: 0, conceptual: 0, excluded: 0, services: 0 };

  if (!data || data.schema !== SCHEMA) {
    return { ok: false, errors: ['image descriptions schema must be ' + SCHEMA], warnings, unresolved, summary };
  }
  if (!data.designs || typeof data.designs !== 'object') {
    return { ok: false, errors: ['image descriptions must contain a designs object'], warnings, unresolved, summary };
  }
  if (!data.patternDefaults || typeof data.patternDefaults !== 'object') {
    errors.push('image descriptions must contain patternDefaults.');
  } else {
    const pd = data.patternDefaults;
    if (!isString(pd.note)) errors.push('patternDefaults.note required.');
    if (!Array.isArray(pd.primary) || !pd.primary.length) errors.push('patternDefaults.primary required.');
    if (!Array.isArray(pd.supporting)) errors.push('patternDefaults.supporting array required.');
    if (!pd.cues || typeof pd.cues !== 'object') errors.push('patternDefaults.cues required.');
    for (const n of pd.primary || []) {
      if (!patternNumbers.has(n)) errors.push('patternDefaults.primary references unknown pattern ' + n + '.');
      if (!isString((pd.cues || {})[String(n)])) errors.push('patternDefaults.cues missing cue for pattern ' + n + '.');
    }
    if (![112,127,159,163,180].every((n) => (pd.primary || []).includes(n))) errors.push('patternDefaults.primary must include 112, 127, 159, 163 and 180.');
  }

  for (const [designId, entry] of Object.entries(data.designs)) {
    const where = designId;
    const design = designById.get(designId);
    if (!design) { errors.push(where + ': unknown design.'); continue; }
    summary.designs += 1;
    if (!isString(entry.label)) errors.push(where + ': label required.');
    const interiorStatus = design.interior ? design.interior.status : 'absent';
    if (!['authored', 'provisional', 'absent'].includes(entry.interiorProvenance)) errors.push(where + ': interiorProvenance must be authored, provisional or absent.');
    if (entry.interiorProvenance !== interiorStatus) errors.push(where + ': interiorProvenance ' + entry.interiorProvenance + ' does not match the model ' + interiorStatus + '.');
    if (entry.interiorReconciliation && !isString(entry.interiorReconciliation)) errors.push(where + ': interiorReconciliation must be a string when present.');

    if (!entry.envelope || typeof entry.envelope !== 'object') errors.push(where + ': envelope object required.');
    else {
      const env = entry.envelope;
      if (!Number.isFinite(env.addedExterior_mm) || env.addedExterior_mm <= 0) errors.push(where + ': envelope.addedExterior_mm must be positive.');
      if (!env.layers_mm || typeof env.layers_mm !== 'object') errors.push(where + ': envelope.layers_mm required.');
      if (!Array.isArray(env.modules) || !env.modules.length) errors.push(where + ': envelope.modules required.');
      for (const em of env.modules || []) {
        const dm = (design.modules || []).find((m) => m.id === em.id);
        if (!dm) { errors.push(where + ': envelope references unknown module ' + em.id + '.'); continue; }
        const expectL = dm.nominal.length_m + 2 * env.addedExterior_mm / 1000;
        const expectW = dm.nominal.width_m + 2 * env.addedExterior_mm / 1000;
        if (!em.finished_m || !near(em.finished_m[0], expectL, 0.005) || !near(em.finished_m[1], expectW, 0.005)) {
          errors.push(where + ': envelope finished dimensions for ' + em.id + ' must be nominal + 2 x ' + env.addedExterior_mm + ' mm.');
        }
      }
      if (env.roofInsulation_mm !== design.thermal.roof_insulation_mm) errors.push(where + ': envelope.roofInsulation_mm does not match the model.');
      if (env.floorInsulation_mm !== design.thermal.floor_insulation_mm) errors.push(where + ': envelope.floorInsulation_mm does not match the model.');
    }

    const images = Array.isArray(entry.images) ? entry.images : [];
    if (!images.length) errors.push(where + ': at least one image description is required.');
    const localImageIds = new Set(images.map((i) => i.id));
    const hasExterior = images.some((i) => i.view === 'exterior-three-quarter');
    const hasInterior = images.some((i) => i.view === 'interior');
    if (!hasExterior) errors.push(where + ': an exterior hero is required.');
    if (!hasInterior) errors.push(where + ': an interior hero is required.');

    const placements = (entry.services && entry.services.placements) || [];
    const excludes = (entry.services && entry.services.excluded) || [];
    if (!Array.isArray(placements)) errors.push(where + ': services.placements must be an array.');
    if (!Array.isArray(excludes)) errors.push(where + ': services.excluded must be an array.');
    const placementIds = new Set();
    for (const p of placements) {
      const pwhere = where + ' placement ' + (p && p.id ? p.id : '(missing id)');
      if (!p || !isString(p.id)) { errors.push(where + ': every placement needs an id.'); continue; }
      if (placementIds.has(p.id)) errors.push(pwhere + ': duplicate id.');
      placementIds.add(p.id);
      summary.services += 1;
      if (!PLACEMENT_STATUS.includes(p.status)) errors.push(pwhere + ': invalid status ' + p.status + '.');
      if (!isString(p.kind)) errors.push(pwhere + ': kind required.');
      if (!isString(p.label)) errors.push(pwhere + ': label required.');
      if (!isString(p.evidence)) errors.push(pwhere + ': evidence required.');
      if (p.status === 'conceptual' && !isString(p.note)) errors.push(pwhere + ': conceptual placements need a note.');
      if (p.status === 'not-resolved' && Array.isArray(p.visibleIn) && p.visibleIn.length) errors.push(pwhere + ': a not-resolved placement cannot be visible.');
      if (!Array.isArray(p.visibleIn)) errors.push(pwhere + ': visibleIn array required.');
      for (const id of p.visibleIn || []) {
        if (!localImageIds.has(id)) errors.push(pwhere + ': visibleIn references unknown image ' + id + '.');
        if (p.status === 'not-resolved') errors.push(pwhere + ': not-resolved placement listed in ' + id + '.');
      }
      if (p.status === 'conceptual') summary.conceptual += 1;
    }
    for (const x of excludes) {
      if (!x || !isString(x.kind) || !isString(x.label) || !isString(x.reason)) { errors.push(where + ': every excluded service needs kind, label and reason.'); continue; }
      if (!CHECK_CODES.includes(x.check || 'custom')) errors.push(where + ' excluded ' + x.kind + ': unknown check ' + x.check + '.');
      if (!checkDesign(design, null, x.check || 'custom')) errors.push(where + ' excluded ' + x.kind + ': the model contradicts the exclusion.');
      summary.excluded += 1;
    }

    for (const image of images) {
      const iwhere = where + ' image ' + (image && image.id ? image.id : '(missing id)');
      if (!image || !isString(image.id)) { errors.push(where + ': every image needs an id.'); continue; }
      if (allImageIds.has(image.id)) errors.push(iwhere + ': duplicate image id.');
      allImageIds.add(image.id);
      summary.images += 1;
      if (!isString(image.title)) errors.push(iwhere + ': title required.');
      if (!isString(image.purpose)) errors.push(iwhere + ': purpose required.');
      if (!STATUS.includes(image.status)) errors.push(iwhere + ': invalid status ' + image.status + '.');
      else if (image.status === 'ready') summary.ready += 1;
      else summary.blocked += 1;
      if (!isString(image.caption)) errors.push(iwhere + ': caption required.');
      if (!isString(image.alt)) errors.push(iwhere + ': alt required.');
      if (isString(image.caption) && image.caption.length > 700) warnings.push(iwhere + ': caption is longer than 700 characters.');
      if (isString(image.alt) && (image.alt.length < 20 || image.alt.length > 400)) warnings.push(iwhere + ': alt should be 20–400 characters.');
      if (!Array.isArray(image.limitations) || !image.limitations.length) errors.push(iwhere + ': limitations required.');
      validateCamera(image.camera, errors, iwhere);

      if (!image.geometry || typeof image.geometry !== 'object') errors.push(iwhere + ': geometry object required.');
      else {
        const storeys = design.levels ? design.levels.length : 1;
        const modules = (design.modules || []).length;
        if (image.geometry.storeys !== storeys) errors.push(iwhere + ': geometry.storeys does not match the model.');
        if (image.geometry.modules !== modules) errors.push(iwhere + ': geometry.modules does not match the model.');
        if (image.geometry.roofType !== design.roof_form.type) errors.push(iwhere + ': geometry.roofType does not match the model.');
        if (image.geometry.roofPitch_deg !== design.roof_form.pitch_deg) errors.push(iwhere + ': geometry.roofPitch_deg does not match the model.');
      }

      if (image.interior) {
        if (!Array.isArray(image.interior.rooms) || !image.interior.rooms.length) errors.push(iwhere + ': interior.rooms required.');
        if (!Array.isArray(image.interior.openings)) errors.push(iwhere + ': interior.openings array required.');
        for (const rid of image.interior.rooms || []) {
          const r = roomById(design, rid);
          if (!r) { errors.push(iwhere + ': unknown room ' + rid + '.'); continue; }
          if (image.interior.provenance === 'authored' && r.provenance !== 'authored') errors.push(iwhere + ': room ' + rid + ' is not authored.');
          if (image.interior.provenance === 'provisional' && r.provenance !== 'inferred-from-zone') errors.push(iwhere + ': room ' + rid + ' is not inferred-from-zone.');
        }
        for (const oid of image.interior.openings || []) {
          if (!openingById(design, oid)) errors.push(iwhere + ': unknown opening ' + oid + '.');
        }
        const mismatches = openingRoomMismatches(design, image);
        if (mismatches.length && image.status === 'ready') mismatches.forEach((m) => errors.push(m.message));
        if (mismatches.length && image.status === 'blocked-pending-reconciliation') mismatches.forEach((m) => unresolved.push({ code: m.code, message: m.message }));
      }

      if (!Array.isArray(image.mustShow) || !image.mustShow.length) errors.push(iwhere + ': mustShow required.');
      for (const item of image.mustShow || []) {
        if (!isString(item.item)) errors.push(iwhere + ': every mustShow item needs text.');
        if (!ITEM_STATUS.includes(item.status)) errors.push(iwhere + ': mustShow status must be modeled, inferred or conceptual.');
        if (!isString(item.evidence)) errors.push(iwhere + ': mustShow item needs evidence.');
        if (item.status === 'conceptual') {
          const placement = placements.find((p) => item.evidence === p.id);
          if (placement && !((placement.visibleIn || []).includes(image.id))) errors.push(iwhere + ': conceptual item ' + item.evidence + ' is not visible in this image according to the placement.');
        }
      }

      if (image.status === 'ready' && !(image.mustShow || []).some((x) => /external envelope|insulation|reveal/i.test(x.item || ''))) errors.push(iwhere + ': mustShow needs an envelope, insulation or reveal item.');
      if (!Array.isArray(image.mustNotShow) || !image.mustNotShow.length) errors.push(iwhere + ': mustNotShow required.');
      for (const item of image.mustNotShow || []) {
        if (!isString(item.item) || !isString(item.reason)) errors.push(iwhere + ': every mustNotShow item needs text and a reason.');
        if (item.check && !CHECK_CODES.includes(item.check)) errors.push(iwhere + ': unknown mustNotShow check ' + item.check + '.');
        if (item.check && item.check !== 'custom' && !checkDesign(design, image, item.check)) errors.push(iwhere + ': the model contradicts the exclusion "' + item.item + '".');
      }

      if (!Array.isArray(image.servicesVisible)) errors.push(iwhere + ': servicesVisible array required.');
      for (const sid of image.servicesVisible || []) {
        const p = placements.find((x) => x.id === sid);
        if (!p) { errors.push(iwhere + ': servicesVisible references unknown placement ' + sid + '.'); continue; }
        if (!((p.visibleIn || []).includes(image.id))) errors.push(iwhere + ': placement ' + sid + ' does not list ' + image.id + ' as visible.');
        if (p.status === 'not-resolved') errors.push(iwhere + ': placement ' + sid + ' is not resolved and cannot be visible.');
      }

      if (!Array.isArray(image.patterns)) errors.push(iwhere + ': patterns array required.');
      if (!['primary', 'supporting'].includes(image.patternRole)) errors.push(iwhere + ': patternRole must be primary or supporting.');
      if (!isString(image.patternCue)) errors.push(iwhere + ': patternCue required.');
      if (typeof image.defaultSet !== 'boolean') errors.push(iwhere + ': defaultSet must be boolean.');
      if (image.status !== 'ready' && image.defaultSet !== false) errors.push(iwhere + ': blocked images must not be in the default set.');
      for (const n of image.patterns || []) if (!patternNumbers.has(n)) errors.push(iwhere + ': unknown pattern ' + n + '.');
      if (image.patternRole === 'primary' && !(image.patterns || []).some((n) => primaryPatterns.includes(n))) errors.push(iwhere + ': a primary image needs at least one primary pattern.');
      if (image.patternRole === 'supporting' && (image.patterns || []).some((n) => primaryPatterns.includes(n))) errors.push(iwhere + ': a supporting image cannot claim a primary pattern.');
      if (image.patterns && image.patterns.length && data.patternDefaults && data.patternDefaults.coverage) {
        for (const n of image.patterns) {
          const covered = (data.patternDefaults.coverage[String(n)] || []);
          if (!covered.includes(image.id)) errors.push(iwhere + ': patternDefaults.coverage[' + n + '] does not list this image.');
        }
      }

      if (image.status === 'ready') {
        const g = image.generation;
        if (!g || typeof g !== 'object') errors.push(iwhere + ': ready images need a generation object.');
        else {
          if (!isString(g.prompt)) errors.push(iwhere + ': generation.prompt required.');
          if (!isString(g.negativePrompt)) errors.push(iwhere + ': generation.negativePrompt required.');
          if (!['low', 'medium', 'high'].includes(g.risk)) errors.push(iwhere + ': generation.risk must be low, medium or high.');
          if (!isString(g.reference)) errors.push(iwhere + ': generation.reference required.');
          if (typeof g.referenceRequired !== 'boolean') errors.push(iwhere + ': generation.referenceRequired must be boolean.');
          if (!Number.isInteger(g.seed) || g.seed < 0) errors.push(iwhere + ': generation.seed must be a non-negative integer.');
          if (isString(g.prompt)) {
            const words = g.prompt.trim().split(/\s+/).length;
            if (words < 40 || words > 230) warnings.push(iwhere + ': generation.prompt is ' + words + ' words; aim for 40–230.');
            if (!/no people/i.test(g.prompt)) warnings.push(iwhere + ': generation.prompt should end with a no-people constraint.');
            for (const [term, code] of [['hydrant','no-hydrant'],['fire cistern','no-fire-cistern'],['potable','no-potable'],['wood stove','no-stove'],['chimney','no-chimney'],['battery','no-battery'],['inverter','no-battery'],['snow guard','custom'],['balcony','custom']]) {
              const re = new RegExp('(^|[^a-z])' + term + '\\b', 'gi');
              let m;
              while ((m = re.exec(g.prompt))) {
                const start = m.index + m[0].toLowerCase().indexOf(term);
                const before = g.prompt.slice(Math.max(0, start - 10), start).toLowerCase();
                if (!/(no|not|without)\s+$/.test(before)) {
                  warnings.push(iwhere + ': generation.prompt may present excluded term "' + term + '" as a positive element.');
                  break;
                }
              }
            }
          }
          if (isString(g.reference)) {
            const genRef = path.join('site', 'design-lab', 'views', design.id + '-' + g.reference);
            if (opts.checkFile ? !opts.checkFile(genRef) : !existsSync(genRef)) errors.push(iwhere + ': generation.reference ' + genRef + ' does not exist.');
          }
          if (isString(g.referencePath)) {
            if (opts.checkFile ? !opts.checkFile(g.referencePath) : !existsSync(g.referencePath)) errors.push(iwhere + ': generation.referencePath ' + g.referencePath + ' does not exist.');
          }
        }
      } else if (image.status === 'blocked-pending-reconciliation') {
        if (image.generation) errors.push(iwhere + ': blocked images must not carry a generation prompt.');
        if (!Array.isArray(image.blockedBy) || !image.blockedBy.length) errors.push(iwhere + ': blocked images need a blockedBy list.');
        unresolved.push({ code: 'blocked-image', message: iwhere + ': blocked pending reconciliation — ' + (Array.isArray(image.blockedBy) ? image.blockedBy[0] : 'see description') });
      }

      if (!image.source || !isString(image.source.designHash) || !isString(image.source.sceneHash)) errors.push(iwhere + ': source.designHash and source.sceneHash required.');
      else {
        const designHash = Illustration.designHash(design);
        if (image.source.designHash !== designHash) errors.push(iwhere + ': source.designHash ' + image.source.designHash + ' is stale; model is ' + designHash + '.');
        const sceneHash = sceneHashFor(design);
        if (image.source.sceneHash !== sceneHash) errors.push(iwhere + ': source.sceneHash ' + image.source.sceneHash + ' is stale; scene is ' + sceneHash + '.');
      }
      if (image.source && image.source.reference) {
        const referencePath = path.join('site', 'design-lab', 'views', design.id + '-' + image.source.reference);
        if (opts.checkFile ? !opts.checkFile(referencePath) : !existsSync(referencePath)) errors.push(iwhere + ': reference ' + referencePath + ' does not exist.');
      } else {
        errors.push(iwhere + ': source.reference required.');
      }
    }
  }

  for (const d of designs || []) {
    if (!data.designs[d.id]) errors.push(d.id + ': selected design is missing an image description.');
  }

  return { ok: errors.length === 0, errors, warnings, unresolved, summary };
}

export function imageDescriptionSummary(data) {
  const rows = [];
  for (const [designId, entry] of Object.entries((data && data.designs) || {})) {
    for (const image of entry.images || []) {
      rows.push({
        designId,
        label: entry.label,
        id: image.id,
        title: image.title,
        view: image.view,
        status: image.status,
        services: (image.servicesVisible || []).length,
        mustShow: (image.mustShow || []).length,
        mustNotShow: (image.mustNotShow || []).length
      });
    }
  }
  return rows;
}
