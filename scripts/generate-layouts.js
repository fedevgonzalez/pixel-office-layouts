#!/usr/bin/env node
/**
 * Layout generator for Pixel Office community gallery.
 * Creates layout JSON files with proper tile arrays and tileColors.
 */
const fs = require('fs')
const path = require('path')

// Tile types
const WALL = 0
const FLOOR_1 = 1
const FLOOR_2 = 2
const FLOOR_3 = 3
const FLOOR_4 = 4
const VOID = 8

// Floor color presets
const COLORS = {
  warmWood:    { h: 35, s: 30, b: 15, c: 0 },
  darkWood:    { h: 25, s: 45, b: 5, c: 10 },
  carpet:      { h: 280, s: 40, b: -5, c: 0 },
  concrete:    { h: 0, s: 5, b: -15, c: -10 },
  greenCarpet: { h: 140, s: 25, b: -5, c: 0 },
  blueCarpet:  { h: 220, s: 30, b: -5, c: 0 },
  redCarpet:   { h: 0, s: 35, b: -5, c: 5 },
  teal:        { h: 180, s: 25, b: -5, c: 0 },
  cream:       { h: 40, s: 15, b: 20, c: -10 },
  slate:       { h: 210, s: 10, b: -20, c: 0 },
  oak:         { h: 30, s: 20, b: -10, c: -20 },
  cherry:      { h: 10, s: 40, b: 0, c: 5 },
  marble:      { h: 0, s: 0, b: 25, c: -15 },
  darkSlate:   { h: 240, s: 15, b: -25, c: 5 },
}

let uidCounter = 0
function uid(prefix = 'f') {
  return `${prefix}-${++uidCounter}`
}

function resetUid() { uidCounter = 0 }

/** Create a grid filled with a single tile type */
function fillGrid(cols, rows, tile) {
  return new Array(cols * rows).fill(tile)
}

/** Set a tile at (col, row) */
function setTile(tiles, cols, col, row, tile) {
  tiles[row * cols + col] = tile
}

/** Fill a rectangle of tiles */
function fillRect(tiles, cols, c1, r1, c2, r2, tile) {
  for (let r = r1; r <= r2; r++)
    for (let c = c1; c <= c2; c++)
      setTile(tiles, cols, c, r, tile)
}

/** Create tileColors array matching tiles, with per-tile color based on tile type */
function buildTileColors(tiles, colorMap) {
  return tiles.map(t => t === WALL || t === VOID ? null : (colorMap[t] || COLORS.oak))
}

/** Build a layout object */
function buildLayout(cols, rows, tiles, furniture, tileColors, pets) {
  const layout = { version: 1, cols, rows, tiles, furniture, tileColors }
  if (pets && pets.length > 0) layout.pets = pets
  return layout
}

// ═══════════════════════════════════════════════════════
// LAYOUT 1: Tech Startup (18×12)
// Modern startup with 4 workstations, break corner, plants
// ═══════════════════════════════════════════════════════
function createTechStartup() {
  resetUid()
  const cols = 18, rows = 12
  const tiles = fillGrid(cols, rows, VOID)

  // Walls around the office
  fillRect(tiles, cols, 0, 0, 17, 0, WALL)   // top wall
  fillRect(tiles, cols, 0, 11, 17, 11, WALL)  // bottom wall
  fillRect(tiles, cols, 0, 0, 0, 11, WALL)    // left wall
  fillRect(tiles, cols, 17, 0, 17, 11, WALL)  // right wall

  // Main floor
  fillRect(tiles, cols, 1, 1, 16, 10, FLOOR_1)

  // Break area carpet (bottom-right)
  fillRect(tiles, cols, 12, 7, 16, 10, FLOOR_3)

  // Internal wall divider (partial, with gap)
  fillRect(tiles, cols, 11, 0, 11, 4, WALL)
  // Gap at rows 5-6 for walking

  // Meeting area floor (right section, rows 1-5)
  fillRect(tiles, cols, 12, 1, 16, 5, FLOOR_2)

  const colorMap = {
    [FLOOR_1]: COLORS.warmWood,
    [FLOOR_2]: COLORS.cream,
    [FLOOR_3]: COLORS.greenCarpet,
  }

  const furniture = [
    // Door on top wall
    { uid: uid(), type: 'door', col: 5, row: -1 },

    // Left work area: 4 desks in pairs
    { uid: uid(), type: 'desk', col: 2, row: 2 },
    { uid: uid(), type: 'desk', col: 5, row: 2 },
    { uid: uid(), type: 'chair', col: 2, row: 4 },
    { uid: uid(), type: 'chair', col: 3, row: 4 },
    { uid: uid(), type: 'chair', col: 5, row: 4 },
    { uid: uid(), type: 'chair', col: 6, row: 4 },

    // Second row of desks
    { uid: uid(), type: 'desk', col: 2, row: 6 },
    { uid: uid(), type: 'desk', col: 5, row: 6 },
    { uid: uid(), type: 'chair', col: 2, row: 8 },
    { uid: uid(), type: 'chair', col: 3, row: 8 },
    { uid: uid(), type: 'chair', col: 5, row: 8 },
    { uid: uid(), type: 'chair', col: 6, row: 8 },

    // PCs on desks
    { uid: uid(), type: 'pc', col: 2, row: 2 },
    { uid: uid(), type: 'pc', col: 5, row: 2 },
    { uid: uid(), type: 'pc', col: 2, row: 6 },
    { uid: uid(), type: 'pc', col: 5, row: 6 },

    // Meeting area (right section)
    { uid: uid(), type: 'whiteboard', col: 13, row: 1 },
    { uid: uid(), type: 'desk', col: 13, row: 3 },
    { uid: uid(), type: 'chair', col: 12, row: 3 },
    { uid: uid(), type: 'chair', col: 15, row: 3 },

    // Break area (bottom right)
    { uid: uid(), type: 'coffee_machine', col: 16, row: 7 },
    { uid: uid(), type: 'break_couch', col: 13, row: 9 },

    // Decorations
    { uid: uid(), type: 'plant', col: 1, row: 1 },
    { uid: uid(), type: 'plant', col: 10, row: 1 },
    { uid: uid(), type: 'plant', col: 1, row: 10 },
    { uid: uid(), type: 'plant', col: 10, row: 10 },
    { uid: uid(), type: 'plant', col: 12, row: 7 },
    { uid: uid(), type: 'lamp', col: 8, row: 1 },
    { uid: uid(), type: 'cooler', col: 9, row: 5 },

    // Bookshelves
    { uid: uid(), type: 'bookshelf', col: 8, row: 8 },
    { uid: uid(), type: 'bookshelf', col: 9, row: 8 },
  ]

  const pets = [
    {
      uid: 'pet-ts-1',
      species: 'cat',
      name: 'Pixel',
      col: 9,
      row: 3,
      personality: 'playful',
      petColors: { body: '#d08030', eyes: '#40c040', pattern: 'striped', patternColor: '#e8e0d8' }
    }
  ]

  return buildLayout(cols, rows, tiles, furniture, buildTileColors(tiles, colorMap), pets)
}

// ═══════════════════════════════════════════════════════
// LAYOUT 2: L-Shaped Office (20×14)
// L-shaped room with work area and lounge
// ═══════════════════════════════════════════════════════
function createLShaped() {
  resetUid()
  const cols = 20, rows = 14
  const tiles = fillGrid(cols, rows, VOID)

  // L-shape: top-left block (cols 0-12, rows 0-8) + bottom-right block (cols 7-19, rows 5-13)
  // Top section walls
  fillRect(tiles, cols, 0, 0, 12, 0, WALL)
  fillRect(tiles, cols, 0, 0, 0, 8, WALL)
  fillRect(tiles, cols, 12, 0, 12, 4, WALL)
  fillRect(tiles, cols, 0, 8, 6, 8, WALL)

  // Bottom section walls
  fillRect(tiles, cols, 7, 5, 19, 5, WALL)
  fillRect(tiles, cols, 19, 5, 19, 13, WALL)
  fillRect(tiles, cols, 7, 13, 19, 13, WALL)
  fillRect(tiles, cols, 7, 8, 7, 13, WALL)

  // Corner connection
  fillRect(tiles, cols, 7, 5, 12, 8, WALL) // overwrite some
  // Open up the connection area
  fillRect(tiles, cols, 7, 5, 12, 8, FLOOR_1) // inner floor
  // Re-add necessary walls
  setTile(tiles, cols, 12, 5, WALL)
  fillRect(tiles, cols, 12, 5, 12, 4, WALL)
  setTile(tiles, cols, 7, 8, WALL)
  // Fix: top-left block border
  fillRect(tiles, cols, 0, 8, 6, 8, WALL)
  fillRect(tiles, cols, 7, 13, 19, 13, WALL)

  // Fill floors
  fillRect(tiles, cols, 1, 1, 11, 7, FLOOR_1) // top section
  fillRect(tiles, cols, 7, 5, 11, 7, FLOOR_1) // overlap OK
  fillRect(tiles, cols, 8, 6, 18, 12, FLOOR_2) // bottom section

  // Lounge carpet
  fillRect(tiles, cols, 14, 9, 18, 12, FLOOR_3)

  const colorMap = {
    [FLOOR_1]: COLORS.darkWood,
    [FLOOR_2]: COLORS.slate,
    [FLOOR_3]: COLORS.blueCarpet,
  }

  const furniture = [
    // Door top wall
    { uid: uid(), type: 'door', col: 6, row: -1 },

    // Top section: 3 workstations in a row
    { uid: uid(), type: 'desk', col: 2, row: 2 },
    { uid: uid(), type: 'desk', col: 5, row: 2 },
    { uid: uid(), type: 'desk', col: 8, row: 2 },
    { uid: uid(), type: 'chair', col: 2, row: 4 },
    { uid: uid(), type: 'chair', col: 3, row: 4 },
    { uid: uid(), type: 'chair', col: 5, row: 4 },
    { uid: uid(), type: 'chair', col: 6, row: 4 },
    { uid: uid(), type: 'chair', col: 8, row: 4 },
    { uid: uid(), type: 'chair', col: 9, row: 4 },

    // PCs
    { uid: uid(), type: 'pc', col: 2, row: 2 },
    { uid: uid(), type: 'pc', col: 5, row: 2 },
    { uid: uid(), type: 'pc', col: 8, row: 2 },

    // Top section decor
    { uid: uid(), type: 'bookshelf', col: 1, row: 1 },
    { uid: uid(), type: 'bookshelf', col: 11, row: 1 },
    { uid: uid(), type: 'whiteboard', col: 1, row: 6 },
    { uid: uid(), type: 'plant', col: 1, row: 5 },

    // Bottom section: 2 more workstations
    { uid: uid(), type: 'desk', col: 9, row: 7 },
    { uid: uid(), type: 'desk', col: 12, row: 7 },
    { uid: uid(), type: 'chair', col: 9, row: 9 },
    { uid: uid(), type: 'chair', col: 10, row: 9 },
    { uid: uid(), type: 'chair', col: 12, row: 9 },
    { uid: uid(), type: 'chair', col: 13, row: 9 },
    { uid: uid(), type: 'pc', col: 9, row: 7 },
    { uid: uid(), type: 'pc', col: 12, row: 7 },

    // Lounge area
    { uid: uid(), type: 'break_couch', col: 15, row: 11 },
    { uid: uid(), type: 'coffee_machine', col: 18, row: 9 },
    { uid: uid(), type: 'cooler', col: 14, row: 9 },

    // Plants scattered
    { uid: uid(), type: 'plant', col: 8, row: 12 },
    { uid: uid(), type: 'plant', col: 18, row: 12 },
    { uid: uid(), type: 'lamp', col: 17, row: 9 },
  ]

  const pets = [
    {
      uid: 'pet-ls-1',
      species: 'dog',
      name: 'Buddy',
      col: 4,
      row: 6,
      personality: 'energetic',
      petColors: { body: '#c09060', eyes: '#201008', nose: '#302010' }
    }
  ]

  return buildLayout(cols, rows, tiles, furniture, buildTileColors(tiles, colorMap), pets)
}

// ═══════════════════════════════════════════════════════
// LAYOUT 3: Library Study (16×11)
// Quiet study room with lots of bookshelves
// ═══════════════════════════════════════════════════════
function createLibraryStudy() {
  resetUid()
  const cols = 16, rows = 11
  const tiles = fillGrid(cols, rows, VOID)

  // Walls
  fillRect(tiles, cols, 0, 0, 15, 0, WALL)
  fillRect(tiles, cols, 0, 10, 15, 10, WALL)
  fillRect(tiles, cols, 0, 0, 0, 10, WALL)
  fillRect(tiles, cols, 15, 0, 15, 10, WALL)

  // Floor
  fillRect(tiles, cols, 1, 1, 14, 9, FLOOR_2)

  // Reading nook carpet (center)
  fillRect(tiles, cols, 6, 4, 9, 7, FLOOR_3)

  const colorMap = {
    [FLOOR_2]: COLORS.cherry,
    [FLOOR_3]: COLORS.carpet,
  }

  const furniture = [
    // Door
    { uid: uid(), type: 'door', col: 7, row: -1 },

    // Bookshelves lining the walls
    { uid: uid(), type: 'bookshelf', col: 1, row: 1 },
    { uid: uid(), type: 'bookshelf', col: 2, row: 1 },
    { uid: uid(), type: 'bookshelf', col: 3, row: 1 },
    { uid: uid(), type: 'bookshelf', col: 4, row: 1 },
    { uid: uid(), type: 'bookshelf', col: 10, row: 1 },
    { uid: uid(), type: 'bookshelf', col: 11, row: 1 },
    { uid: uid(), type: 'bookshelf', col: 12, row: 1 },
    { uid: uid(), type: 'bookshelf', col: 13, row: 1 },

    // Side bookshelves
    { uid: uid(), type: 'bookshelf', col: 1, row: 4 },
    { uid: uid(), type: 'bookshelf', col: 1, row: 6 },
    { uid: uid(), type: 'bookshelf', col: 14, row: 4 },
    { uid: uid(), type: 'bookshelf', col: 14, row: 6 },

    // Study desks (2 pairs)
    { uid: uid(), type: 'desk', col: 3, row: 4 },
    { uid: uid(), type: 'chair', col: 3, row: 6 },
    { uid: uid(), type: 'chair', col: 4, row: 6 },

    { uid: uid(), type: 'desk', col: 11, row: 4 },
    { uid: uid(), type: 'chair', col: 11, row: 6 },
    { uid: uid(), type: 'chair', col: 12, row: 6 },

    // Central reading area
    { uid: uid(), type: 'desk', col: 7, row: 4 },
    { uid: uid(), type: 'chair', col: 7, row: 6 },
    { uid: uid(), type: 'chair', col: 8, row: 6 },
    { uid: uid(), type: 'pc', col: 7, row: 4 },

    // Decorations
    { uid: uid(), type: 'lamp', col: 1, row: 3 },
    { uid: uid(), type: 'lamp', col: 14, row: 3 },
    { uid: uid(), type: 'plant', col: 5, row: 1 },
    { uid: uid(), type: 'plant', col: 9, row: 1 },
    { uid: uid(), type: 'plant', col: 1, row: 9 },
    { uid: uid(), type: 'plant', col: 14, row: 9 },

    // Small break corner
    { uid: uid(), type: 'coffee_machine', col: 14, row: 1 },
    { uid: uid(), type: 'cooler', col: 5, row: 9 },
  ]

  const pets = [
    {
      uid: 'pet-lib-1',
      species: 'cat',
      name: 'Mochi',
      col: 7,
      row: 8,
      personality: 'lazy',
      petColors: { body: '#2a2a2a', eyes: '#d0a020', pattern: 'tuxedo', patternColor: '#e8e0d8' }
    }
  ]

  return buildLayout(cols, rows, tiles, furniture, buildTileColors(tiles, colorMap), pets)
}

// ═══════════════════════════════════════════════════════
// LAYOUT 4: Command Center (22×13)
// Mission control style with central monitoring area
// ═══════════════════════════════════════════════════════
function createCommandCenter() {
  resetUid()
  const cols = 22, rows = 13
  const tiles = fillGrid(cols, rows, VOID)

  // Outer walls
  fillRect(tiles, cols, 0, 0, 21, 0, WALL)
  fillRect(tiles, cols, 0, 12, 21, 12, WALL)
  fillRect(tiles, cols, 0, 0, 0, 12, WALL)
  fillRect(tiles, cols, 21, 0, 21, 12, WALL)

  // Main floor
  fillRect(tiles, cols, 1, 1, 20, 11, FLOOR_1)

  // Central ops floor
  fillRect(tiles, cols, 7, 3, 14, 9, FLOOR_2)

  // Accent strips
  fillRect(tiles, cols, 7, 3, 14, 3, FLOOR_4)
  fillRect(tiles, cols, 7, 9, 14, 9, FLOOR_4)

  const colorMap = {
    [FLOOR_1]: COLORS.darkSlate,
    [FLOOR_2]: COLORS.concrete,
    [FLOOR_4]: COLORS.teal,
  }

  const furniture = [
    // Door
    { uid: uid(), type: 'door', col: 10, row: -1 },

    // Left wing: 3 stations facing center
    { uid: uid(), type: 'desk', col: 2, row: 2 },
    { uid: uid(), type: 'desk', col: 2, row: 5 },
    { uid: uid(), type: 'desk', col: 2, row: 8 },
    { uid: uid(), type: 'chair', col: 4, row: 2 },
    { uid: uid(), type: 'chair', col: 4, row: 5 },
    { uid: uid(), type: 'chair', col: 4, row: 8 },
    { uid: uid(), type: 'pc', col: 2, row: 2 },
    { uid: uid(), type: 'pc', col: 2, row: 5 },
    { uid: uid(), type: 'pc', col: 2, row: 8 },

    // Right wing: 3 stations facing center
    { uid: uid(), type: 'desk', col: 18, row: 2 },
    { uid: uid(), type: 'desk', col: 18, row: 5 },
    { uid: uid(), type: 'desk', col: 18, row: 8 },
    { uid: uid(), type: 'chair', col: 17, row: 2 },
    { uid: uid(), type: 'chair', col: 17, row: 5 },
    { uid: uid(), type: 'chair', col: 17, row: 8 },
    { uid: uid(), type: 'pc', col: 18, row: 2 },
    { uid: uid(), type: 'pc', col: 18, row: 5 },
    { uid: uid(), type: 'pc', col: 18, row: 8 },

    // Central command desk
    { uid: uid(), type: 'desk', col: 9, row: 5 },
    { uid: uid(), type: 'desk', col: 12, row: 5 },
    { uid: uid(), type: 'chair', col: 9, row: 7 },
    { uid: uid(), type: 'chair', col: 10, row: 7 },
    { uid: uid(), type: 'chair', col: 12, row: 7 },
    { uid: uid(), type: 'chair', col: 13, row: 7 },
    { uid: uid(), type: 'pc', col: 9, row: 5 },
    { uid: uid(), type: 'pc', col: 12, row: 5 },

    // Whiteboards (mission displays)
    { uid: uid(), type: 'whiteboard', col: 8, row: 1 },
    { uid: uid(), type: 'whiteboard', col: 12, row: 1 },

    // Break area (bottom center)
    { uid: uid(), type: 'coffee_machine', col: 10, row: 11 },
    { uid: uid(), type: 'break_couch', col: 7, row: 11 },
    { uid: uid(), type: 'cooler', col: 13, row: 11 },

    // Decor
    { uid: uid(), type: 'plant', col: 1, row: 1 },
    { uid: uid(), type: 'plant', col: 20, row: 1 },
    { uid: uid(), type: 'plant', col: 1, row: 11 },
    { uid: uid(), type: 'plant', col: 20, row: 11 },
    { uid: uid(), type: 'lamp', col: 5, row: 1 },
    { uid: uid(), type: 'lamp', col: 16, row: 1 },
    { uid: uid(), type: 'bookshelf', col: 1, row: 4 },
    { uid: uid(), type: 'bookshelf', col: 20, row: 4 },
  ]

  const pets = [
    {
      uid: 'pet-cc-1',
      species: 'dog',
      name: 'Rex',
      col: 10,
      row: 9,
      personality: 'chill',
      petColors: { body: '#705030', eyes: '#201008', nose: '#302010' }
    }
  ]

  return buildLayout(cols, rows, tiles, furniture, buildTileColors(tiles, colorMap), pets)
}

// ═══════════════════════════════════════════════════════
// LAYOUT 5: Cozy Cabin (14×10)
// Warm, intimate workspace with fireplace vibe
// ═══════════════════════════════════════════════════════
function createCozyCabin() {
  resetUid()
  const cols = 14, rows = 10
  const tiles = fillGrid(cols, rows, VOID)

  // Walls
  fillRect(tiles, cols, 0, 0, 13, 0, WALL)
  fillRect(tiles, cols, 0, 9, 13, 9, WALL)
  fillRect(tiles, cols, 0, 0, 0, 9, WALL)
  fillRect(tiles, cols, 13, 0, 13, 9, WALL)

  // Floor - warm wood throughout
  fillRect(tiles, cols, 1, 1, 12, 8, FLOOR_1)

  // Rug area
  fillRect(tiles, cols, 3, 4, 6, 7, FLOOR_3)

  // Work nook floor
  fillRect(tiles, cols, 9, 1, 12, 4, FLOOR_2)

  const colorMap = {
    [FLOOR_1]: COLORS.warmWood,
    [FLOOR_2]: COLORS.oak,
    [FLOOR_3]: COLORS.redCarpet,
  }

  const furniture = [
    // Door
    { uid: uid(), type: 'door', col: 1, row: -1 },

    // Cozy seating area (left)
    { uid: uid(), type: 'break_couch', col: 3, row: 5 },
    { uid: uid(), type: 'break_couch', col: 3, row: 7 },

    // Coffee corner
    { uid: uid(), type: 'coffee_machine', col: 1, row: 8 },
    { uid: uid(), type: 'cooler', col: 1, row: 7 },

    // Work nook (right side)
    { uid: uid(), type: 'desk', col: 10, row: 2 },
    { uid: uid(), type: 'chair', col: 10, row: 4 },
    { uid: uid(), type: 'chair', col: 11, row: 4 },
    { uid: uid(), type: 'pc', col: 10, row: 2 },

    // Second small desk
    { uid: uid(), type: 'desk', col: 10, row: 6 },
    { uid: uid(), type: 'chair', col: 10, row: 8 },
    { uid: uid(), type: 'pc', col: 10, row: 6 },

    // Bookshelves along walls
    { uid: uid(), type: 'bookshelf', col: 7, row: 1 },
    { uid: uid(), type: 'bookshelf', col: 8, row: 1 },

    // Lots of plants for cozy vibe
    { uid: uid(), type: 'plant', col: 1, row: 1 },
    { uid: uid(), type: 'plant', col: 1, row: 4 },
    { uid: uid(), type: 'plant', col: 12, row: 1 },
    { uid: uid(), type: 'plant', col: 12, row: 8 },
    { uid: uid(), type: 'plant', col: 6, row: 1 },

    // Lamps for warmth
    { uid: uid(), type: 'lamp', col: 2, row: 1 },
    { uid: uid(), type: 'lamp', col: 9, row: 1 },
    { uid: uid(), type: 'lamp', col: 7, row: 8 },

    // Whiteboard
    { uid: uid(), type: 'whiteboard', col: 3, row: 1 },
  ]

  const pets = [
    {
      uid: 'pet-cab-1',
      species: 'cat',
      name: 'Luna',
      col: 4,
      row: 6,
      personality: 'lazy',
      petColors: { body: '#e8e0d8', eyes: '#4088e0', nose: '#f0a0b0', pattern: 'solid' }
    },
    {
      uid: 'pet-cab-2',
      species: 'dog',
      name: 'Coco',
      col: 8,
      row: 5,
      personality: 'chill',
      petColors: { body: '#503020', eyes: '#201008', nose: '#302010' }
    }
  ]

  return buildLayout(cols, rows, tiles, furniture, buildTileColors(tiles, colorMap), pets)
}

// ═══════════════════════════════════════════════════════
// Save all layouts
// ═══════════════════════════════════════════════════════
const layouts = [
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Modern startup office with 4 workstations, meeting room, and break area',
    tags: ['startup', 'modern', 'team'],
    generator: createTechStartup,
  },
  {
    id: 'l-shaped-office',
    name: 'L-Shaped Office',
    description: 'Spacious L-shaped office with work zones and a cozy lounge corner',
    tags: ['large', 'l-shape', 'lounge'],
    generator: createLShaped,
  },
  {
    id: 'library-study',
    name: 'Library Study',
    description: 'Quiet study room lined with bookshelves — perfect for focused work',
    tags: ['quiet', 'books', 'focus'],
    generator: createLibraryStudy,
  },
  {
    id: 'command-center',
    name: 'Command Center',
    description: 'Mission control layout with 8+ stations surrounding a central ops desk',
    tags: ['large', 'ops', 'monitoring'],
    generator: createCommandCenter,
  },
  {
    id: 'cozy-cabin',
    name: 'Cozy Cabin',
    description: 'Warm and intimate workspace with couches, plants, and a reading nook',
    tags: ['cozy', 'small', 'plants'],
    generator: createCozyCabin,
  },
]

const outDir = path.join(__dirname, '..', 'layouts')

for (const def of layouts) {
  const dir = path.join(outDir, def.id)
  fs.mkdirSync(dir, { recursive: true })

  const layout = def.generator()
  fs.writeFileSync(path.join(dir, 'layout.json'), JSON.stringify(layout, null, 2))

  const metadata = {
    name: def.name,
    author: 'fedevgonzalez',
    description: def.description,
    tags: def.tags,
    createdAt: '2026-03-08',
  }
  fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify(metadata, null, 2))

  console.log(`✓ ${def.id} (${layout.cols}×${layout.rows}, ${layout.furniture.length} items)`)
}

// Update gallery.json
const galleryPath = path.join(__dirname, '..', 'gallery.json')
const existingGallery = JSON.parse(fs.readFileSync(galleryPath, 'utf-8'))

// Add new layouts (skip if already exists)
const existingIds = new Set(existingGallery.layouts.map(l => l.id))

for (const def of layouts) {
  if (existingIds.has(def.id)) {
    console.log(`  (skipped ${def.id} — already in gallery.json)`)
    continue
  }
  const layout = def.generator()
  existingGallery.layouts.push({
    id: def.id,
    name: def.name,
    author: 'fedevgonzalez',
    description: def.description,
    tags: def.tags,
    cols: layout.cols,
    rows: layout.rows,
    furnitureCount: layout.furniture.length,
    screenshot: null,
    layout: `layouts/${def.id}/layout.json`,
    createdAt: '2026-03-08',
  })
}

existingGallery.updatedAt = new Date().toISOString()
fs.writeFileSync(galleryPath, JSON.stringify(existingGallery, null, 2))
console.log(`\n✓ gallery.json updated (${existingGallery.layouts.length} total layouts)`)
