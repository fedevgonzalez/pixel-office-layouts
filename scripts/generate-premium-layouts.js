#!/usr/bin/env node
/**
 * Generate all 10 premium community layouts.
 * Run: node scripts/generate-premium-layouts.js
 */
const fs = require('fs')
const path = require('path')

const WALL = 0, VOID = 8
const F1 = 1, F2 = 2, F3 = 3, F4 = 4, F5 = 5, F6 = 6, F7 = 7

let uidCounter = 0
function uid() { return `f-${Date.now()}-${(uidCounter++).toString(36).padStart(4, '0')}` }

function makeGrid(cols, rows, fill = VOID) {
  return new Array(cols * rows).fill(fill)
}

function fillRect(tiles, cols, r1, c1, r2, c2, val) {
  for (let r = r1; r <= r2; r++)
    for (let c = c1; c <= c2; c++)
      tiles[r * cols + c] = val
}

function makeColors(tiles, colorMap) {
  return tiles.map(t => {
    if (t === WALL || t === VOID) return null
    return colorMap[t] || null
  })
}

/** Build zones array — mark work/focus floor types as 'focus' (no-wander), rest as null */
function makeZones(tiles, workFloorTypes) {
  const workSet = new Set(workFloorTypes)
  return tiles.map(t => workSet.has(t) ? 'focus' : null)
}

function furn(type, col, row, color) {
  const f = { uid: uid(), type, col, row }
  if (color) f.color = color
  return f
}

function deskCluster(col, row, opts = {}) {
  const items = [furn('desk', col, row)]
  if (opts.chairBelow !== false) items.push(furn('chair', col, row + 2))
  if (opts.pc !== false) items.push(furn('pc', col, row))
  if (opts.lamp) items.push(furn('lamp', col + 1, row))
  return items
}

// ─── Layout 1: default-office (20×18) ────────────────────────────────
function makeDefaultOffice() {
  const cols = 20, rows = 18
  const tiles = makeGrid(cols, rows)
  // Outer VOID border already filled
  // Outer walls
  fillRect(tiles, cols, 0, 0, 0, cols - 1, WALL) // top wall row
  fillRect(tiles, cols, rows - 1, 0, rows - 1, cols - 1, WALL) // bottom
  fillRect(tiles, cols, 0, 0, rows - 1, 0, WALL) // left
  fillRect(tiles, cols, 0, cols - 1, rows - 1, cols - 1, WALL) // right

  // Work area (rows 1-8, cols 1-18)
  fillRect(tiles, cols, 1, 1, 8, cols - 2, F2)
  // Dividing wall row 9
  fillRect(tiles, cols, 9, 0, 9, cols - 1, WALL)
  // Meeting room (rows 10-14, cols 1-9)
  fillRect(tiles, cols, 10, 1, 14, 9, F4)
  // Break room (rows 10-14, cols 11-18)
  fillRect(tiles, cols, 10, 11, 14, cols - 2, F1)
  // Vertical wall between meeting and break
  fillRect(tiles, cols, 10, 10, 14, 10, WALL)
  // Bottom corridor (rows 15-16)
  fillRect(tiles, cols, 15, 0, 15, cols - 1, WALL)
  fillRect(tiles, cols, 16, 1, 16, cols - 2, F3)

  const furniture = [
    // Work area - 6 desk clusters in 2 rows of 3
    ...deskCluster(1, 1, { lamp: true }),
    ...deskCluster(5, 1, { pc: true }),
    ...deskCluster(9, 1, { lamp: true }),
    ...deskCluster(1, 5, { pc: true }),
    ...deskCluster(5, 5, { lamp: true }),
    ...deskCluster(9, 5, { pc: true }),
    // Right side storage
    furn('bookshelf', 14, 1),
    furn('bookshelf', 14, 4),
    furn('bookshelf', 16, 1),
    furn('bookshelf', 16, 4),
    // Plants in work area
    furn('plant', 13, 3),
    furn('plant', 18, 1),
    furn('plant', 18, 8),
    // Doors in dividing wall
    furn('door', 5, 8),
    furn('door', 14, 8),
    // Meeting room furniture
    furn('whiteboard', 1, 10),
    furn('whiteboard', 3, 10),
    furn('desk', 3, 12),
    furn('desk', 5, 12),
    furn('chair', 3, 11),
    furn('chair', 5, 11),
    furn('chair', 6, 11),
    furn('chair', 7, 11),
    furn('chair', 4, 14),
    furn('chair', 6, 14),
    furn('plant', 9, 14),
    // Break room furniture
    furn('break_couch', 11, 11),
    furn('break_couch', 14, 11),
    furn('coffee_machine', 18, 10),
    furn('cooler', 18, 12),
    furn('plant', 11, 14),
    furn('plant', 17, 14),
    furn('plant', 14, 14),
    // Corridor plants
    furn('plant', 4, 16),
    furn('plant', 15, 16),
    // Exterior door (bottom wall, corridor)
    furn('door', 10, 16),
  ]

  const colorMap = {
    [F2]: { h: 35, s: 25, b: -10, c: 0, colorize: true },
    [F4]: { h: 210, s: 20, b: -15, c: 0, colorize: true },
    [F1]: { h: 90, s: 18, b: -5, c: 0, colorize: true },
    [F3]: { h: 25, s: 10, b: -20, c: 0, colorize: true },
  }

  return {
    layout: { version: 1, cols, rows, tiles, furniture, tileColors: makeColors(tiles, colorMap), zones: makeZones(tiles, [F2, F4]) },
    metadata: {
      name: 'Default Office',
      author: 'fedevgonzalez',
      description: 'The flagship three-wing office: open work area, meeting room, break room, and corridor',
      tags: ['starter', 'default', 'team'],
      createdAt: '2026-03-08',
    },
  }
}

// ─── Layout 2: command-center (20×13) ────────────────────────────────
function makeCommandCenter() {
  const cols = 20, rows = 13
  const tiles = makeGrid(cols, rows)
  // Outer walls
  fillRect(tiles, cols, 0, 0, 0, cols - 1, WALL)
  fillRect(tiles, cols, rows - 1, 0, rows - 1, cols - 1, WALL)
  fillRect(tiles, cols, 0, 0, rows - 1, 0, WALL)
  fillRect(tiles, cols, 0, cols - 1, rows - 1, cols - 1, WALL)
  // Operations floor (cols 1-12, rows 1-11)
  fillRect(tiles, cols, 1, 1, 11, 12, F5)
  // Vertical wall divider
  fillRect(tiles, cols, 1, 13, 11, 13, WALL)
  // Briefing pod (cols 14-18, rows 1-5)
  fillRect(tiles, cols, 1, 14, 5, 18, F6)
  // Horizontal wall in east wing
  fillRect(tiles, cols, 6, 13, 6, 18, WALL)
  // Break alcove (cols 14-18, rows 7-11)
  fillRect(tiles, cols, 7, 14, 11, 18, F1)

  const furniture = [
    // Ops floor - row 1 monitoring stations
    ...deskCluster(1, 1, { lamp: true }),
    ...deskCluster(4, 1, { pc: true }),
    ...deskCluster(7, 1, { lamp: true }),
    // Ops floor - row 2
    ...deskCluster(1, 6, { pc: true }),
    ...deskCluster(4, 6, { pc: true }),
    ...deskCluster(7, 6, { lamp: true }),
    // Ops decoration
    furn('bookshelf', 10, 1),
    furn('bookshelf', 10, 4),
    furn('bookshelf', 12, 1),
    furn('plant', 1, 11),
    furn('plant', 12, 11),
    furn('plant', 11, 5),
    // Door ops→briefing
    furn('door', 13, 3),
    // Briefing room
    furn('whiteboard', 14, 1),
    furn('whiteboard', 16, 1),
    furn('desk', 15, 3),
    furn('chair', 15, 2),
    furn('chair', 16, 2),
    furn('chair', 15, 5),
    furn('chair', 16, 5),
    furn('plant', 18, 1),
    // Door ops→break
    furn('door', 13, 8),
    // Break alcove
    furn('coffee_machine', 18, 7),
    furn('cooler', 18, 9),
    furn('break_couch', 14, 8),
    furn('break_couch', 14, 10),
    furn('plant', 14, 7),
    furn('plant', 16, 11),
    // Exterior door (bottom wall)
    furn('door', 6, 11),
  ]

  const colorMap = {
    [F5]: { h: 220, s: 40, b: -30, c: 10, colorize: true },
    [F6]: { h: 200, s: 30, b: -20, c: 5, colorize: true },
    [F1]: { h: 30, s: 20, b: -10, c: 0, colorize: true },
  }

  return {
    layout: { version: 1, cols, rows, tiles, furniture, tileColors: makeColors(tiles, colorMap), zones: makeZones(tiles, [F5, F6]) },
    metadata: {
      name: 'Command Center',
      author: 'fedevgonzalez',
      description: 'Mission control layout with monitoring stations, tactical briefing pod, and break alcove',
      tags: ['large', 'ops', 'monitoring'],
      createdAt: '2026-03-08',
    },
  }
}

// ─── Layout 3: cozy-cabin (14×10) ───────────────────────────────────
function makeCozyCabin() {
  const cols = 14, rows = 10
  const tiles = makeGrid(cols, rows)
  // Outer walls
  fillRect(tiles, cols, 0, 0, 0, cols - 1, WALL)
  fillRect(tiles, cols, rows - 1, 0, rows - 1, cols - 1, WALL)
  fillRect(tiles, cols, 0, 0, rows - 1, 0, WALL)
  fillRect(tiles, cols, 0, cols - 1, rows - 1, cols - 1, WALL)
  // Work room (cols 1-8, rows 1-8)
  fillRect(tiles, cols, 1, 1, 8, 8, F3)
  // Vertical wall
  fillRect(tiles, cols, 1, 9, 8, 9, WALL)
  // Break nook (cols 10-12, rows 1-8)
  fillRect(tiles, cols, 1, 10, 8, 12, F1)

  const furniture = [
    // Work room
    ...deskCluster(1, 1, { lamp: true }),
    ...deskCluster(4, 4, { pc: true }),
    furn('bookshelf', 1, 5),
    furn('bookshelf', 7, 1),
    furn('bookshelf', 8, 1),
    furn('plant', 8, 5),
    furn('plant', 1, 8),
    furn('plant', 6, 8),
    // Door
    furn('door', 9, 4),
    // Break nook
    furn('break_couch', 10, 3),
    furn('coffee_machine', 12, 1),
    furn('cooler', 12, 5),
    furn('plant', 10, 7),
    furn('plant', 12, 7),
    // Exterior door (bottom wall)
    furn('door', 4, 8),
  ]

  const colorMap = {
    [F3]: { h: 28, s: 40, b: -5, c: 5, colorize: true },
    [F1]: { h: 38, s: 25, b: 5, c: 0, colorize: true },
  }

  return {
    layout: { version: 1, cols, rows, tiles, furniture, tileColors: makeColors(tiles, colorMap), zones: makeZones(tiles, [F3]) },
    metadata: {
      name: 'Cozy Cabin',
      author: 'fedevgonzalez',
      description: 'Warm and intimate workspace with rustic pine floors, bookshelves, and a cozy break nook',
      tags: ['cozy', 'small', 'plants'],
      createdAt: '2026-03-08',
    },
  }
}

// ─── Layout 4: executive-suite (15×10) ──────────────────────────────
function makeExecutiveSuite() {
  const cols = 15, rows = 10
  const tiles = makeGrid(cols, rows)
  fillRect(tiles, cols, 0, 0, 0, cols - 1, WALL)
  fillRect(tiles, cols, rows - 1, 0, rows - 1, cols - 1, WALL)
  fillRect(tiles, cols, 0, 0, rows - 1, 0, WALL)
  fillRect(tiles, cols, 0, cols - 1, rows - 1, cols - 1, WALL)
  // Executive office (cols 1-6, rows 1-8)
  fillRect(tiles, cols, 1, 1, 8, 6, F4)
  // Vertical wall
  fillRect(tiles, cols, 1, 7, 8, 7, WALL)
  // Meeting room (cols 8-13, rows 1-4)
  fillRect(tiles, cols, 1, 8, 4, 13, F6)
  // Horizontal wall in east wing
  fillRect(tiles, cols, 5, 7, 5, 13, WALL)
  // Executive lounge (cols 8-13, rows 6-8)
  fillRect(tiles, cols, 6, 8, 8, 13, F1)

  const furniture = [
    // Executive office
    furn('desk', 1, 2),
    furn('chair', 2, 4),
    furn('pc', 1, 2),
    furn('lamp', 2, 2),
    furn('desk', 4, 5),
    furn('chair', 4, 7),
    furn('pc', 4, 5),
    furn('bookshelf', 6, 1),
    furn('bookshelf', 6, 4),
    furn('plant', 1, 1),
    furn('plant', 1, 7),
    furn('plant', 5, 8),
    // Door to meeting
    furn('door', 7, 2),
    // Meeting room
    furn('whiteboard', 8, 1),
    furn('whiteboard', 10, 1),
    furn('desk', 9, 2),
    furn('chair', 9, 1),
    furn('chair', 11, 1),
    furn('chair', 10, 4),
    furn('chair', 12, 4),
    furn('plant', 13, 1),
    // Door meeting→lounge
    furn('door', 10, 4),
    // Executive lounge
    furn('break_couch', 8, 6),
    furn('coffee_machine', 13, 6),
    furn('cooler', 13, 8),
    furn('plant', 8, 8),
    furn('plant', 11, 8),
    // Exterior door (bottom wall)
    furn('door', 3, 8),
  ]

  const colorMap = {
    [F4]: { h: 260, s: 25, b: -20, c: 5, colorize: true },
    [F6]: { h: 200, s: 20, b: -15, c: 0, colorize: true },
    [F1]: { h: 32, s: 22, b: -5, c: 0, colorize: true },
  }

  return {
    layout: { version: 1, cols, rows, tiles, furniture, tileColors: makeColors(tiles, colorMap), zones: makeZones(tiles, [F4, F6]) },
    metadata: {
      name: 'Executive Suite',
      author: 'fedevgonzalez',
      description: 'Private executive suite with commanding desk, meeting room, and executive lounge',
      tags: ['executive', 'upscale', 'solo'],
      createdAt: '2026-03-08',
    },
  }
}

// ─── Layout 5: gaming-den (14×11) ───────────────────────────────────
function makeGamingDen() {
  const cols = 14, rows = 11
  const tiles = makeGrid(cols, rows)
  fillRect(tiles, cols, 0, 0, 0, cols - 1, WALL)
  fillRect(tiles, cols, rows - 1, 0, rows - 1, cols - 1, WALL)
  fillRect(tiles, cols, 0, 0, rows - 1, 0, WALL)
  fillRect(tiles, cols, 0, cols - 1, rows - 1, cols - 1, WALL)
  // Gaming floor (cols 1-12, rows 1-6)
  fillRect(tiles, cols, 1, 1, 6, 12, F5)
  // Horizontal wall
  fillRect(tiles, cols, 7, 0, 7, cols - 1, WALL)
  // Chill zone (cols 1-12, rows 8-9)
  fillRect(tiles, cols, 8, 1, 9, 12, F1)

  const furniture = [
    // Gaming floor stations
    ...deskCluster(1, 1, { lamp: true }),
    ...deskCluster(4, 1, { pc: true }),
    ...deskCluster(7, 1, { lamp: true }),
    furn('desk', 1, 4),
    furn('chair', 1, 6),
    furn('pc', 1, 4),
    furn('desk', 5, 4),
    furn('chair', 5, 6),
    furn('pc', 5, 4),
    furn('lamp', 6, 4),
    // Decoration
    furn('bookshelf', 10, 1),
    furn('bookshelf', 12, 1),
    furn('plant', 10, 4),
    furn('plant', 12, 6),
    // Door
    furn('door', 6, 6),
    // Chill zone
    furn('break_couch', 1, 8),
    furn('break_couch', 5, 8),
    furn('coffee_machine', 12, 8),
    furn('cooler', 12, 9),
    furn('plant', 1, 9),
    furn('plant', 9, 9),
    // Exterior door (bottom wall)
    furn('door', 6, 9),
  ]

  const colorMap = {
    [F5]: { h: 250, s: 50, b: -25, c: 15, colorize: true },
    [F1]: { h: 30, s: 30, b: -5, c: 0, colorize: true },
  }

  return {
    layout: { version: 1, cols, rows, tiles, furniture, tileColors: makeColors(tiles, colorMap), zones: makeZones(tiles, [F5]) },
    metadata: {
      name: 'Gaming Den',
      author: 'fedevgonzalez',
      description: 'High-energy gaming setup with multiple stations, electric blue floors, and a chill zone',
      tags: ['fun', 'gaming', 'creative'],
      createdAt: '2026-03-08',
    },
  }
}

// ─── Layout 6: l-shaped-office (20×14) ──────────────────────────────
function makeLShapedOffice() {
  const cols = 20, rows = 14
  const tiles = makeGrid(cols, rows)
  // Top arm (full width) - outer walls
  fillRect(tiles, cols, 0, 0, 0, 17, WALL)
  fillRect(tiles, cols, 8, 0, 8, 17, WALL) // bottom of top arm
  fillRect(tiles, cols, 0, 0, 8, 0, WALL)
  fillRect(tiles, cols, 0, 17, 8, 17, WALL)
  // Work area floor
  fillRect(tiles, cols, 1, 1, 7, 10, F2)
  // Vertical wall divider
  fillRect(tiles, cols, 1, 11, 7, 11, WALL)
  // Break room floor
  fillRect(tiles, cols, 1, 12, 7, 16, F1)

  // South stub (cols 0-10, rows 8-13)
  fillRect(tiles, cols, 9, 0, 12, 10, WALL) // stub walls
  fillRect(tiles, cols, 13, 0, 13, 10, WALL) // bottom
  fillRect(tiles, cols, 9, 1, 12, 9, F6) // meeting floor
  fillRect(tiles, cols, 9, 10, 12, 10, WALL) // right wall of stub

  // VOID everywhere else (already VOID from makeGrid)

  const furniture = [
    // Work area
    ...deskCluster(1, 1, { lamp: true }),
    ...deskCluster(5, 1, { pc: true }),
    ...deskCluster(1, 4, { pc: true, lamp: true }),
    ...deskCluster(5, 4, { pc: true }),
    furn('bookshelf', 9, 1),
    furn('bookshelf', 9, 4),
    furn('plant', 10, 7),
    furn('plant', 1, 7),
    // Door work→break
    furn('door', 11, 3),
    // Break room
    furn('coffee_machine', 16, 1),
    furn('cooler', 16, 3),
    furn('break_couch', 12, 3),
    furn('break_couch', 12, 5),
    furn('plant', 12, 1),
    furn('plant', 16, 6),
    // Door work→meeting
    furn('door', 4, 7),
    // Meeting room
    furn('whiteboard', 1, 9),
    furn('whiteboard', 3, 9),
    furn('desk', 3, 10),
    furn('desk', 5, 10),
    furn('chair', 3, 9),
    furn('chair', 5, 9),
    furn('chair', 6, 9),
    furn('chair', 4, 12),
    furn('chair', 6, 12),
    furn('plant', 9, 12),
    furn('plant', 1, 12),
    // Exterior door (bottom wall of meeting stub)
    furn('door', 5, 12),
  ]

  const colorMap = {
    [F2]: { h: 35, s: 22, b: -12, c: 5, colorize: true },
    [F1]: { h: 90, s: 20, b: -5, c: 0, colorize: true },
    [F6]: { h: 210, s: 25, b: -18, c: 5, colorize: true },
  }

  return {
    layout: { version: 1, cols, rows, tiles, furniture, tileColors: makeColors(tiles, colorMap), zones: makeZones(tiles, [F2, F6]) },
    metadata: {
      name: 'L-Shaped Office',
      author: 'fedevgonzalez',
      description: 'Spacious L-shaped layout with open work area, break room wing, and meeting room stub',
      tags: ['large', 'l-shape', 'lounge'],
      createdAt: '2026-03-08',
    },
  }
}

// ─── Layout 7: library-study (16×11) ────────────────────────────────
function makeLibraryStudy() {
  const cols = 16, rows = 11
  const tiles = makeGrid(cols, rows)
  fillRect(tiles, cols, 0, 0, 0, cols - 1, WALL)
  fillRect(tiles, cols, rows - 1, 0, rows - 1, cols - 1, WALL)
  fillRect(tiles, cols, 0, 0, rows - 1, 0, WALL)
  fillRect(tiles, cols, 0, cols - 1, rows - 1, cols - 1, WALL)
  // Main library (cols 1-9, rows 1-9)
  fillRect(tiles, cols, 1, 1, 9, 9, F3)
  // Vertical wall
  fillRect(tiles, cols, 1, 10, 9, 10, WALL)
  // Reading pod (cols 11-14, rows 1-5)
  fillRect(tiles, cols, 1, 11, 5, 14, F7)
  // Horizontal wall in east
  fillRect(tiles, cols, 6, 10, 6, 14, WALL)
  // Break corner (cols 11-14, rows 7-9)
  fillRect(tiles, cols, 7, 11, 9, 14, F1)

  const furniture = [
    // Library - perimeter bookshelves
    furn('bookshelf', 1, 1),
    furn('bookshelf', 2, 1),
    furn('bookshelf', 3, 1),
    furn('bookshelf', 1, 5),
    furn('bookshelf', 2, 5),
    furn('bookshelf', 9, 1),
    furn('bookshelf', 9, 5),
    // Library desks
    furn('desk', 4, 3),
    furn('chair', 4, 5),
    furn('pc', 4, 3),
    furn('lamp', 5, 3),
    furn('desk', 7, 3),
    furn('chair', 7, 5),
    furn('pc', 7, 3),
    // More library items
    furn('desk', 4, 7),
    furn('chair', 4, 9),
    furn('pc', 4, 7),
    furn('plant', 1, 9),
    furn('plant', 8, 9),
    // Door library→reading
    furn('door', 10, 3),
    // Reading pod
    furn('desk', 11, 1),
    furn('chair', 11, 3),
    furn('pc', 11, 1),
    furn('lamp', 12, 1),
    furn('bookshelf', 13, 1),
    furn('bookshelf', 14, 1),
    furn('plant', 14, 4),
    // Door reading→break
    furn('door', 12, 5),
    // Break corner
    furn('coffee_machine', 14, 7),
    furn('cooler', 14, 9),
    furn('break_couch', 11, 7),
    furn('plant', 11, 9),
    // Exterior door (bottom wall)
    furn('door', 5, 9),
  ]

  const colorMap = {
    [F3]: { h: 40, s: 30, b: -10, c: 5, colorize: true },
    [F7]: { h: 45, s: 20, b: 0, c: 0, colorize: true },
    [F1]: { h: 28, s: 25, b: -5, c: 0, colorize: true },
  }

  return {
    layout: { version: 1, cols, rows, tiles, furniture, tileColors: makeColors(tiles, colorMap), zones: makeZones(tiles, [F3, F7]) },
    metadata: {
      name: 'Library Study',
      author: 'fedevgonzalez',
      description: 'Research library with perimeter bookshelves, quiet reading pod, and coffee break corner',
      tags: ['quiet', 'books', 'focus'],
      createdAt: '2026-03-08',
    },
  }
}

// ─── Layout 8: open-plan (25×15) ────────────────────────────────────
function makeOpenPlan() {
  const cols = 25, rows = 15
  const tiles = makeGrid(cols, rows)
  fillRect(tiles, cols, 0, 0, 0, cols - 1, WALL)
  fillRect(tiles, cols, rows - 1, 0, rows - 1, cols - 1, WALL)
  fillRect(tiles, cols, 0, 0, rows - 1, 0, WALL)
  fillRect(tiles, cols, 0, cols - 1, rows - 1, cols - 1, WALL)

  // Focus room west (cols 1-6, rows 1-13)
  fillRect(tiles, cols, 1, 1, 13, 6, F5)
  // Vertical wall
  fillRect(tiles, cols, 1, 7, 13, 7, WALL)
  // Work floor center (cols 8-14, rows 1-13)
  fillRect(tiles, cols, 1, 8, 13, 14, F2)
  // Vertical wall
  fillRect(tiles, cols, 1, 15, 13, 15, WALL)
  // Meeting room NE (cols 16-23, rows 1-6)
  fillRect(tiles, cols, 1, 16, 6, 23, F6)
  // Horizontal wall east wing
  fillRect(tiles, cols, 7, 15, 7, 23, WALL)
  // Break area SE (cols 16-23, rows 8-13)
  fillRect(tiles, cols, 8, 16, 13, 23, F1)

  const furniture = [
    // Focus room - quiet desks
    ...deskCluster(1, 1, { lamp: true }),
    ...deskCluster(1, 5, { pc: true }),
    ...deskCluster(1, 9, { lamp: true }),
    furn('bookshelf', 4, 1),
    furn('bookshelf', 4, 5),
    furn('bookshelf', 4, 9),
    furn('plant', 6, 13),
    furn('plant', 1, 13),
    // Door focus→work
    furn('door', 7, 6),
    // Work floor - 6 desks
    ...deskCluster(8, 1, { lamp: true }),
    ...deskCluster(11, 1, { pc: true }),
    ...deskCluster(8, 5, { pc: true }),
    ...deskCluster(11, 5, { lamp: true }),
    ...deskCluster(8, 9, { pc: true }),
    ...deskCluster(11, 9, { lamp: true }),
    furn('plant', 14, 1),
    furn('plant', 14, 13),
    // Door work→meeting
    furn('door', 15, 3),
    // Door work→break
    furn('door', 15, 9),
    // Meeting room
    furn('whiteboard', 16, 1),
    furn('whiteboard', 18, 1),
    furn('whiteboard', 20, 1),
    furn('desk', 17, 3),
    furn('desk', 19, 3),
    furn('chair', 17, 2),
    furn('chair', 19, 2),
    furn('chair', 21, 2),
    furn('chair', 18, 5),
    furn('chair', 20, 5),
    furn('plant', 23, 1),
    furn('plant', 16, 6),
    // Door meeting↔break
    furn('door', 18, 6),
    // Break area
    furn('break_couch', 16, 9),
    furn('break_couch', 16, 11),
    furn('break_couch', 19, 12),
    furn('coffee_machine', 23, 8),
    furn('cooler', 23, 10),
    furn('plant', 16, 8),
    furn('plant', 23, 13),
    furn('plant', 16, 13),
    furn('plant', 21, 13),
    // Exterior door (bottom wall)
    furn('door', 12, 13),
  ]

  const colorMap = {
    [F5]: { h: 260, s: 30, b: -28, c: 8, colorize: true },
    [F2]: { h: 35, s: 18, b: -8, c: 0, colorize: true },
    [F6]: { h: 195, s: 22, b: -15, c: 5, colorize: true },
    [F1]: { h: 85, s: 22, b: -5, c: 0, colorize: true },
  }

  return {
    layout: { version: 1, cols, rows, tiles, furniture, tileColors: makeColors(tiles, colorMap), zones: makeZones(tiles, [F5, F2, F6]) },
    metadata: {
      name: 'Open Plan',
      author: 'fedevgonzalez',
      description: 'Spacious 4-zone office: focus room, open work floor, meeting room, and large break area',
      tags: ['team', 'large', 'meeting'],
      createdAt: '2026-03-08',
    },
  }
}

// ─── Layout 9: small-studio (12×10) ─────────────────────────────────
function makeSmallStudio() {
  const cols = 12, rows = 10
  const tiles = makeGrid(cols, rows)
  fillRect(tiles, cols, 0, 0, 0, cols - 1, WALL)
  fillRect(tiles, cols, rows - 1, 0, rows - 1, cols - 1, WALL)
  fillRect(tiles, cols, 0, 0, rows - 1, 0, WALL)
  fillRect(tiles, cols, 0, cols - 1, rows - 1, cols - 1, WALL)
  // Work studio (cols 1-6, rows 1-8)
  fillRect(tiles, cols, 1, 1, 8, 6, F3)
  // Vertical wall
  fillRect(tiles, cols, 1, 7, 8, 7, WALL)
  // Break nook (cols 8-10, rows 1-8)
  fillRect(tiles, cols, 1, 8, 8, 10, F1)

  const furniture = [
    // Work studio
    furn('desk', 1, 1),
    furn('chair', 1, 3),
    furn('pc', 1, 1),
    furn('lamp', 2, 1),
    furn('desk', 4, 4),
    furn('chair', 4, 6),
    furn('pc', 4, 4),
    furn('bookshelf', 4, 1),
    furn('bookshelf', 6, 1),
    furn('plant', 1, 7),
    furn('plant', 6, 8),
    // Door
    furn('door', 7, 4),
    // Break nook
    furn('coffee_machine', 10, 1),
    furn('cooler', 10, 3),
    furn('break_couch', 8, 5),
    furn('plant', 8, 1),
    furn('plant', 8, 8),
    // Exterior door (bottom wall)
    furn('door', 3, 8),
  ]

  const colorMap = {
    [F3]: { h: 30, s: 35, b: -12, c: 5, colorize: true },
    [F1]: { h: 85, s: 20, b: -5, c: 0, colorize: true },
  }

  return {
    layout: { version: 1, cols, rows, tiles, furniture, tileColors: makeColors(tiles, colorMap), zones: makeZones(tiles, [F3]) },
    metadata: {
      name: 'Small Studio',
      author: 'fedevgonzalez',
      description: 'Compact indie studio with face-to-face desks, bookshelves, and a cozy break nook',
      tags: ['compact', 'starter', 'solo'],
      createdAt: '2026-03-08',
    },
  }
}

// ─── Layout 10: tech-startup (18×12) ────────────────────────────────
function makeTechStartup() {
  const cols = 18, rows = 12
  const tiles = makeGrid(cols, rows)
  fillRect(tiles, cols, 0, 0, 0, cols - 1, WALL)
  fillRect(tiles, cols, rows - 1, 0, rows - 1, cols - 1, WALL)
  fillRect(tiles, cols, 0, 0, rows - 1, 0, WALL)
  fillRect(tiles, cols, 0, cols - 1, rows - 1, cols - 1, WALL)
  // Engineering pod (cols 1-5, rows 1-10)
  fillRect(tiles, cols, 1, 1, 10, 5, F2)
  // Vertical wall
  fillRect(tiles, cols, 1, 6, 10, 6, WALL)
  // Focus zone (cols 7-10, rows 1-10)
  fillRect(tiles, cols, 1, 7, 10, 10, F5)
  // Vertical wall
  fillRect(tiles, cols, 1, 11, 10, 11, WALL)
  // Break kitchen (cols 12-16, rows 1-10)
  fillRect(tiles, cols, 1, 12, 10, 16, F1)

  const furniture = [
    // Engineering pod
    furn('whiteboard', 1, 1),
    furn('whiteboard', 3, 1),
    ...deskCluster(1, 3, { lamp: true }),
    ...deskCluster(1, 6, { pc: true }),
    furn('desk', 4, 3),
    furn('chair', 4, 5),
    furn('pc', 4, 3),
    furn('desk', 4, 6),
    furn('chair', 4, 8),
    furn('pc', 4, 6),
    furn('bookshelf', 5, 3),
    furn('plant', 1, 10),
    furn('plant', 5, 10),
    // Door eng→focus
    furn('door', 6, 4),
    furn('door', 6, 8),
    // Focus zone
    ...deskCluster(7, 1, { lamp: true }),
    ...deskCluster(7, 5, { pc: true }),
    furn('desk', 9, 3),
    furn('chair', 9, 5),
    furn('pc', 9, 3),
    furn('bookshelf', 10, 1),
    furn('bookshelf', 10, 6),
    furn('plant', 7, 10),
    furn('plant', 10, 10),
    // Door focus→break
    furn('door', 11, 4),
    furn('door', 11, 8),
    // Break kitchen
    furn('coffee_machine', 16, 1),
    furn('coffee_machine', 16, 3),
    furn('cooler', 16, 5),
    furn('break_couch', 12, 2),
    furn('break_couch', 12, 4),
    furn('break_couch', 12, 7),
    furn('plant', 12, 1),
    furn('plant', 16, 8),
    furn('plant', 12, 10),
    furn('plant', 14, 10),
    // Exterior door (bottom wall)
    furn('door', 3, 10),
  ]

  const colorMap = {
    [F2]: { h: 35, s: 20, b: -10, c: 5, colorize: true },
    [F5]: { h: 240, s: 35, b: -30, c: 10, colorize: true },
    [F1]: { h: 100, s: 25, b: -5, c: 0, colorize: true },
  }

  return {
    layout: { version: 1, cols, rows, tiles, furniture, tileColors: makeColors(tiles, colorMap), zones: makeZones(tiles, [F2, F5]) },
    metadata: {
      name: 'Tech Startup',
      author: 'fedevgonzalez',
      description: 'Vibrant tech startup with engineering pod, deep focus zone, and communal break kitchen',
      tags: ['startup', 'modern', 'team'],
      createdAt: '2026-03-08',
    },
  }
}

// ─── Write all layouts ──────────────────────────────────────────────
const layouts = {
  'default-office': makeDefaultOffice,
  'command-center': makeCommandCenter,
  'cozy-cabin': makeCozyCabin,
  'executive-suite': makeExecutiveSuite,
  'gaming-den': makeGamingDen,
  'l-shaped-office': makeLShapedOffice,
  'library-study': makeLibraryStudy,
  'open-plan': makeOpenPlan,
  'small-studio': makeSmallStudio,
  'tech-startup': makeTechStartup,
}

const layoutsDir = path.join(__dirname, '..', 'layouts')

for (const [name, generator] of Object.entries(layouts)) {
  const { layout, metadata } = generator()
  const dir = path.join(layoutsDir, name)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'layout.json'), JSON.stringify(layout, null, 2))
  fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify(metadata, null, 2))
  console.log(`✓ ${name} (${layout.cols}×${layout.rows}, ${layout.furniture.length} furniture)`)
}

// Update gallery.json
const gallery = Object.entries(layouts).map(([slug, gen]) => {
  const { metadata } = gen()
  return { slug, ...metadata }
})
fs.writeFileSync(path.join(layoutsDir, '..', 'gallery.json'), JSON.stringify(gallery, null, 2))
console.log(`\n✓ gallery.json updated with ${gallery.length} layouts`)
