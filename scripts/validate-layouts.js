#!/usr/bin/env node
/** Validate all layout JSONs for consistency, door access, and room reachability */
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
  const { cols, rows, tiles, furniture, zones } = layout
  const errors = []

  // Check tile array size
  if (tiles.length !== cols * rows) {
    errors.push(`Tile array size ${tiles.length} != ${cols}*${rows}=${cols * rows}`)
  }

  // Build blocked tile set (non-surface furniture footprints)
  const blockedTiles = new Set()
  const deskTiles = new Set()
  for (const f of furniture) {
    const meta = FURNITURE_META[f.type]
    if (!meta) continue
    if (meta.onSurface) continue // pc/lamp on desk, don't block
    if (meta.onWall) continue    // door on wall, handled separately
    for (let dr = 0; dr < meta.h; dr++)
      for (let dc = 0; dc < meta.w; dc++)
        blockedTiles.add(`${f.col + dc},${f.row + dr}`)
    if (f.type === 'desk') {
      for (let dr = 0; dr < 2; dr++)
        for (let dc = 0; dc < 2; dc++)
          deskTiles.add(`${f.col + dc},${f.row + dr}`)
    }
  }

  // Build door tile set
  const doorTiles = new Set()
  const doors = furniture.filter(f => f.type === 'door')
  for (const d of doors) {
    const meta = FURNITURE_META.door
    for (let dr = 0; dr < meta.h; dr++)
      doorTiles.add(`${d.col},${d.row + dr}`)
  }

  // Check each furniture item
  for (const f of furniture) {
    const meta = FURNITURE_META[f.type]
    if (!meta) { errors.push(`Unknown type: ${f.type}`); continue }

    if (f.col < 0 || f.row < 0 || f.col + meta.w > cols || f.row + meta.h > rows) {
      errors.push(`${f.type} at (${f.col},${f.row}) out of bounds`)
      continue
    }

    if (meta.onWall) {
      const bottomRow = f.row + meta.h - 1
      for (let dc = 0; dc < meta.w; dc++) {
        const idx = bottomRow * cols + (f.col + dc)
        if (tiles[idx] !== WALL) {
          errors.push(`${f.type} at (${f.col},${f.row}): bottom row tile at (${f.col + dc},${bottomRow}) is ${tiles[idx]}, expected WALL`)
        }
      }
    } else if (meta.onSurface) {
      if (!deskTiles.has(`${f.col},${f.row}`)) {
        errors.push(`${f.type} at (${f.col},${f.row}) not on a desk tile`)
      }
    } else {
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

  // Check duplicate UIDs
  const uids = furniture.map(f => f.uid)
  const dupes = uids.filter((v, i) => uids.indexOf(v) !== i)
  if (dupes.length) errors.push(`Duplicate UIDs: ${dupes.join(', ')}`)

  // ─── Door adjacency check ─────────────────────────────────────
  // Each door should have at least one walkable neighbor on each side of its wall
  for (const d of doors) {
    // Door occupies (d.col, d.row) and (d.col, d.row+1)
    // Determine wall orientation by checking tiles around the door
    const doorCells = []
    for (let dr = 0; dr < 2; dr++) doorCells.push({ c: d.col, r: d.row + dr })

    // Find which side of each door cell has floor neighbors
    const neighbors = [
      { dc: -1, dr: 0 }, { dc: 1, dr: 0 },
      { dc: 0, dr: -1 }, { dc: 0, dr: 1 },
    ]

    // Collect all non-wall, non-void neighbors of the door
    const accessibleNeighbors = []
    for (const cell of doorCells) {
      for (const n of neighbors) {
        const nc = cell.c + n.dc
        const nr = cell.r + n.dr
        if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue
        const idx = nr * cols + nc
        const t = tiles[idx]
        if (t === WALL || t === VOID) continue
        // It's a floor tile — but is it blocked by furniture?
        const key = `${nc},${nr}`
        if (doorTiles.has(key)) continue // another door tile, skip
        accessibleNeighbors.push({ c: nc, r: nr, blocked: blockedTiles.has(key) })
      }
    }

    const walkableAccess = accessibleNeighbors.filter(n => !n.blocked)
    if (walkableAccess.length === 0) {
      errors.push(`door at (${d.col},${d.row}): ALL adjacent floor tiles are blocked by furniture — door is completely inaccessible`)
    } else if (walkableAccess.length === 1) {
      // Only one side accessible — door leads to a dead end
      errors.push(`door at (${d.col},${d.row}): only 1 accessible neighbor (${walkableAccess[0].c},${walkableAccess[0].r}) — door might be one-sided`)
    }

    // Check blocked neighbors specifically
    const blockedAccess = accessibleNeighbors.filter(n => n.blocked)
    for (const b of blockedAccess) {
      errors.push(`door at (${d.col},${d.row}): adjacent tile (${b.c},${b.r}) is blocked by furniture`)
    }
  }

  // ─── Reachability check ────────────────────────────────────────
  // BFS from first walkable tile — all walkable tiles should be reachable
  function isWalkable(c, r) {
    if (c < 0 || c >= cols || r < 0 || r >= rows) return false
    const idx = r * cols + c
    const t = tiles[idx]
    if (t === WALL || t === VOID) {
      return doorTiles.has(`${c},${r}`)
    }
    return !blockedTiles.has(`${c},${r}`)
  }

  const allWalkable = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (isWalkable(c, r)) allWalkable.push(`${c},${r}`)

  if (allWalkable.length > 0) {
    const [sc, sr] = allWalkable[0].split(',').map(Number)
    const visited = new Set()
    const queue = [{ c: sc, r: sr }]
    visited.add(`${sc},${sr}`)
    while (queue.length > 0) {
      const { c, r } = queue.shift()
      for (const [dc, dr] of [[0,-1],[0,1],[-1,0],[1,0]]) {
        const nc = c + dc, nr = r + dr
        const k = `${nc},${nr}`
        if (visited.has(k)) continue
        if (!isWalkable(nc, nr)) continue
        visited.add(k)
        queue.push({ c: nc, r: nr })
      }
    }

    const unreachable = allWalkable.filter(k => !visited.has(k))
    if (unreachable.length > 0) {
      // Group unreachable tiles by connected component for clearer output
      errors.push(`${unreachable.length} walkable tiles unreachable from (${sc},${sr}) — rooms are disconnected! Examples: ${unreachable.slice(0, 5).join(', ')}`)
    }
  }

  // ─── Zones check ───────────────────────────────────────────────
  if (!zones) {
    errors.push('Missing zones array')
  } else if (zones.length !== tiles.length) {
    errors.push(`Zones array length ${zones.length} != tiles length ${tiles.length}`)
  }

  // ─── Break room check ─────────────────────────────────────────
  const breakItems = furniture.filter(f => ['coffee_machine', 'break_couch', 'cooler'].includes(f.type))
  if (breakItems.length === 0) {
    errors.push('No break room furniture (coffee_machine, break_couch, cooler)')
  }

  // ─── Exterior door check ──────────────────────────────────────
  const exteriorDoors = doors.filter(d => {
    // A door is "exterior" if the WALL row is on the outer boundary
    const bottomRow = d.row + 1
    return bottomRow === rows - 1 || bottomRow === 0
  })
  if (exteriorDoors.length === 0) {
    errors.push('No exterior door (door on outer wall)')
  }

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
