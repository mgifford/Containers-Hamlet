// Explicit adapter between the existing authoritative Cabin A spec and the
// Design Lab schema. It never writes Cabin A data. Every conversion returns a
// report of preserved and unmapped information.
// Code: AGPL-3.0-or-later (it imports the Design Lab schema and model). Data: CC BY 4.0 / CC BY-SA 4.0 as noted.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const Schema = require('../../site/js/design-schema.js');
const EcoModel = require('../../site/js/model.js');

const clone = (v) => JSON.parse(JSON.stringify(v));

function zoneType(id, name) {
  const s = String(id + ' ' + name).toLowerCase();
  if (/bath|shower|toilet/.test(s)) return 'bathroom';
  if (/sleep|bed/.test(s)) return 'sleeping';
  if (/kitchen|cook/.test(s)) return 'kitchen';
  if (/dining/.test(s)) return 'dining';
  if (/work|studio|office/.test(s)) return 'work';
  if (/store|storage|boot|pantry|laundry|mechanical/.test(s)) return 'storage';
  return 'living';
}

export function fromCabinA(spec) {
  const model = EcoModel.buildModel(spec);
  const M = model.meta;
  const insulation = (spec.envelope.wall_layers || []).filter((l) => l.material === 'insulation').reduce((s, l) => s + l.thickness_m, 0);
  const cladding = (spec.envelope.wall_layers || []).find((l) => l.material !== 'insulation' && l.material !== 'cavity') || {};
  const roof = spec.roof && spec.roof.default_option ? spec.roof.default_option : 'solar';
  const green = roof === 'green' || roof === 'biosolar';
  const design = Schema.canonicalize({
    schema: Schema.SCHEMA,
    id: 'cabin-a-adapted',
    name: (spec.name || 'Cabin A') + ' (adapted)',
    editable: false,
    description: 'A Design Lab view of the authoritative Cabin A concept. The original data is unchanged; the adapter report lists information that the Design Lab schema does not represent.',
    primary_view_deg: 180,
    modules: [{
      id: 'm1', type: '40ft',
      nominal: { length_m: spec.module.external_length_m, width_m: spec.module.external_width_m, height_m: spec.module.external_height_m },
      position_m: [0, 0], rotation_deg: 0,
      insulation: { thickness_mm: Math.round((insulation || 0.15) * 1000), type: 'adapted from Cabin A envelope' },
      cladding: { type: cladding.material === 'cladding' ? 'timber' : 'mixed', colour: '#8a6a4a' },
      roof: { type: roof, solar: roof !== 'green', green: green },
      structure: { openings_reinforced: true, wall_removal: 'none', cantilever_m: 0, notes: 'Adapted from Cabin A; opening frames are already modelled in the source.' },
      openings: (spec.openings || []).map((o) => ({
        id: o.id, name: o.name || o.id, face: o.face, type: o.type,
        position_m: +(((o.from_m + o.to_m) / 2)).toFixed(3), width_m: +(o.to_m - o.from_m).toFixed(3),
        height_m: +(o.head_m - (o.sill_m || 0)).toFixed(3), sill_m: o.sill_m || 0
      })),
      zones: model.rooms.map((r) => ({
        id: r.id, name: r.name, type: zoneType(r.id, r.name),
        start_m: +r.xs.toFixed(3), end_m: +r.xe.toFixed(3), accessibility: r.accessibility || ''
      }))
    }],
    connections: [],
    porches: (spec.porches || []).slice(0, 1).map((p) => ({
      id: p.id, module: 'm1', face: p.side, start_m: p.from_m, length_m: p.length_m, depth_m: p.depth_m,
      screened: !!p.screened, roof: p.roof !== false, note: p.note || ''
    })),
    decks: [],
    site: { homesite: 'a', rotation_deg: 0, note: 'Adapter output only; illustrative placement.' },
    materials: (spec.material_passport || []).map((p) => ({
      component: p.component, material: p.material, source: p.source,
      disclosure: [p.condition_assessment, p.connections, p.disassembly, p.end_of_life].filter(Boolean).join(' ')
    })),
    provenance: Object.assign({}, spec.provenance, {
      adapted_from: spec.id,
      adapted_for: 'Containers Hamlet Design Lab 1.3.0',
      note: 'The authoritative Cabin A spec remains data/cabin-a.json. This adaptation is a working view, not a replacement.'
    }),
    licence: { code: 'AGPL-3.0-or-later', content: 'CC BY-SA 4.0', source_content: 'CC BY 4.0' },
    status: 'concept only; adapted from authoritative data'
  });
  const unmapped = ['fixtures', 'ramps', 'trellis', 'roof.options', 'foundation detailing', 'reviews_required', 'design_targets', 'screened_porch legacy fields', 'room use text beyond name/accessibility', 'material condition/disassembly detail beyond a combined disclosure'];
  return {
    design: design,
    report: {
      from: 'data/cabin-a.json', to: Schema.SCHEMA,
      preserved: ['module dimensions', 'envelope insulation thickness', 'cladding intent', 'roof default option', 'openings (face, position, width, height, sill)', 'rooms (name, extent, accessibility)', 'first porch', 'material passport summary', 'provenance'],
      unmapped: unmapped,
      note: 'Unmapped information stays in the authoritative Cabin A JSON. It is not deleted by this adapter.'
    }
  };
}

export function toCabinAProposal(design, template) {
  const d = Schema.canonicalize(design);
  const report = { compatible: false, blockers: [], unmapped: [], notes: [] };
  if (d.modules.length !== 1) report.blockers.push('Cabin A is a single-module spec; the design has ' + d.modules.length + ' modules.');
  if (d.modules.length === 1 && d.modules[0].type !== '40ft') report.blockers.push('Cabin A is a 40-foot module; the design uses ' + d.modules[0].type + '.');
  if (report.blockers.length) return { spec: null, report };
  const spec = clone(template);
  const m = d.modules[0];
  const wallIns = (spec.envelope.wall_layers || []).find((l) => l.material === 'insulation');
  if (wallIns) wallIns.thickness_m = m.insulation.thickness_mm / 1000;
  spec.openings = m.openings.map((o) => ({
    id: o.id, name: o.name || o.id, bay: 'main', face: o.face, type: o.type,
    from_m: +(o.position_m - o.width_m / 2).toFixed(3), to_m: +(o.position_m + o.width_m / 2).toFixed(3),
    sill_m: o.sill_m > 0 ? o.sill_m : undefined, head_m: o.sill_m + o.height_m,
    swing: o.type === 'door' ? 'in' : undefined
  }));
  if (d.porches.length) {
    const p = d.porches[0], sp = spec.porches[0];
    sp.id = p.id; sp.name = p.screened ? 'Screened porch' : 'Covered porch'; sp.side = p.face;
    sp.from_m = p.start_m; sp.length_m = p.length_m; sp.depth_m = p.depth_m; sp.screened = !!p.screened;
  }
  report.compatible = true;
  report.preserved = ['single 40-foot module', 'external insulation thickness', 'openings (face, position, width, height, sill)', 'first porch dimensions and screening'];
  report.unmapped = ['fixtures (the template fixture list is retained but not revalidated)', 'ramps', 'trellis', 'roof options other than the template default', 'room use text and detailed accessibility notes', 'decks and connectors', 'material intent choices', 'material passport detail', 'reviews'];
  report.notes.push('The proposal is a copy for review. It is not written to data/cabin-a.json.');
  report.notes.push('Existing rooms and fixtures are retained from the template and may no longer match the edited openings or porch. Review before use.');
  return { spec, report };
}

export { ROOT };
