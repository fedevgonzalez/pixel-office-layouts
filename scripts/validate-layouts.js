#!/usr/bin/env node
/** Validate all layout JSONs for consistency */
const fs = require('fs')
const path = require('path')

const WALL = 0, VOID = 8
const layoutsDir = path.join(__dirname, '..', 'layouts')

const FURNITURE_META = {
  desk: { w: 2, h: 2, onWall: false, onSurface: false },
  chair: { w: 1, h: 1, onWall: false, onSurface: false },
  bookshelf: { w: 1, h: 2, onWall: false, onSurface: false },
  plant: { w: 1, h: 1, onWall: false, onSurface: false },
  cooler: { w: 1, h: 1, onWall: false, onSurface: false },
  whiteboard: { w: 2, h: 1, onWall: false, onSurface: false },
  pc: { w: 1, h: 1, onWall: false, onSurface: true },
  lamp: { w: 1, h: 1, onWall: false, onSurface: true },
  door: { w: 1, h: 2, onWall: true, onSurface: false },
  coffee_machine: { w: 1, h: 1, onWall: false, onSurface: false },
  break_couch: { w: 2, h: 1, onWall: false, onSurface: false },
}

let totalErrors = 0

for (const dir of fs.readdirSync(layoutsDir)) {
  const layoutPath = path.join(layoutsDir, dir, 'layout.json')
  if (!fs.existsSync(layoutPath)) continue
  const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf-8'))
  const { cols, rows, tiles, furniture } = layout
  const errors = []

  // Check tile array size
  if (tiles.length !== cols * rows) {
    errors.push(`Tile array size ${tiles.length} != ${cols}*${rows}=${cols * rows}`)
  }

  // Build desk tile set for surface items
  const deskTiles = new Set()
  for (const f of furniture) {
    if (f.type === 'desk') {
      for (let dr = 0; dr < 2; dr++)
        for (let dc = 0; dc < 2; dc++)
          deskTiles.add(`${f.col + dc},${f.row + dr}`)
    }
  }

  // Check each furniture item
  for (const f of furniture) {
    const meta = FURNITURE_META[f.type]
    if (!meta) { errors.push(`Unknown type: ${f.type}`); continue }

    // Bounds check
    if (f.col < 0 || f.row < 0 || f.col + meta.w > cols || f.row + meta.h > rows) {
      errors.push(`${f.type} at (${f.col},${f.row}) out of bounds`)
      continue
    }

    if (meta.onWall) {
      // Door: bottom row should be on WALL
      const bottomRow = f.row + meta.h - 1
      for (let dc = 0; dc < meta.w; dc++) {
        const idx = bottomRow * cols + (f.col + dc)
        if (tiles[idx] !== WALL) {
          errors.push(`${f.type} at (${f.col},${f.row}): bottom row tile at (${f.col + dc},${bottomRow}) is ${tiles[idx]}, expected WALL`)
        }
      }
    } else if (meta.onSurface) {
      // PC/lamp should be on a desk tile
      if (!deskTiles.has(`${f.col},${f.row}`)) {
        errors.push(`${f.type} at (${f.col},${f.row}) not on a desk tile`)
      }
    } else {
      // Normal furniture: all tiles should be floor (not WALL, not VOID)
      for (let dr = 0; dr < meta.h; dr++) {
        for (let dc = 0; dc < meta.w; dc++) {
          const idx = (f.row + dr) * cols + (f.col + dc)
          if (tiles[idx] === WALL || tiles[idx] === VOID) {
            errors.push(`${f.type} at (${f.col},${f.row}): tile (${f.col + dc},${f.row + dr}) is ${tiles[idx] === WALL ? 'WALL' : 'VOID'}`)
          }
        }
      }
    }
  }

  // Check for duplicate UIDs
  const uids = furniture.map(f => f.uid)
  const dupes = uids.filter((v, i) => uids.indexOf(v) !== i)
  if (dupes.length) errors.push(`Duplicate UIDs: ${dupes.join(', ')}`)

  if (errors.length) {
    console.log(`\n✗ ${dir} (${errors.length} errors):`)
    errors.forEach(e => console.log(`  - ${e}`))
    totalErrors += errors.length
  } else {
    console.log(`✓ ${dir} — OK`)
  }
}

console.log(`\n${totalErrors ? `${totalErrors} total errors` : 'All layouts valid!'}`)
process.exit(totalErrors ? 1 : 0)
