const fs = require('fs');
const name = process.argv[2] || 'command-center';
const rMin = parseInt(process.argv[3]) || 1;
const rMax = parseInt(process.argv[4]) || 11;
const cMin = parseInt(process.argv[5]) || 0;
const cMax = parseInt(process.argv[6]) || 19;

const layout = JSON.parse(fs.readFileSync(`layouts/${name}/layout.json`,'utf8'));
const {cols, tiles, furniture} = layout;
const meta = {desk:{w:2,h:2},chair:{w:1,h:1},bookshelf:{w:1,h:2},plant:{w:1,h:1},cooler:{w:1,h:1},whiteboard:{w:2,h:1},door:{w:1,h:2},coffee_machine:{w:1,h:1},break_couch:{w:2,h:1}};

const blocked = new Set();
const doors = new Set();
for (const f of furniture) {
  const m = meta[f.type];
  if (!m || f.type==='pc'||f.type==='lamp') continue;
  if (f.type==='door') {
    for (let dr=0;dr<m.h;dr++) doors.add(`${f.col},${f.row+dr}`);
    continue;
  }
  for (let dr=0;dr<m.h;dr++) for (let dc=0;dc<m.w;dc++) blocked.add(`${f.col+dc},${f.row+dr}`);
}

for (let r=rMin;r<=rMax;r++) {
  let row = `r${String(r).padStart(2)}: `;
  for (let c=cMin;c<=cMax;c++) {
    const k = `${c},${r}`;
    const t = tiles[r*cols+c];
    if (doors.has(k)) row += 'D';
    else if (blocked.has(k)) row += 'X';
    else if (t===0) row += '#';
    else if (t===8) row += '~';
    else row += '.';
  }
  console.log(row);
}
