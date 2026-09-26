#!/usr/bin/env bash
# Builds the 3D board assets into public/ from the Poly Haven sources (CC0).
# Never use `gltf-transform optimize`: it joins/flattens/instances the meshes and breaks per-node geometry.
set -euo pipefail
S=${ASSET_SRC:-/private/tmp/claude-501/-Users-regent-chess-winning-team/b2d3a2a5-b61f-4e68-a212-b52e937c63cb/scratchpad/assets}
T=$(mktemp -d); cd "$(dirname "$0")/.."
mkdir -p public/models public/hdri
G="npx -y @gltf-transform/cli@4.5.0"
$G dedup   "$S/chess_set_1k.gltf" "$T/t1.glb"
$G prune   "$T/t1.glb" "$T/t2.glb"
$G webp    "$T/t2.glb" "$T/t3.glb" --quality 88
$G meshopt "$T/t3.glb" public/models/chess_set.glb
# must print 32: the per-node piece geometry survived (inspect only lists meshes, so read the GLB's JSON chunk)
node -e 'const b=require("fs").readFileSync("public/models/chess_set.glb");const n=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString()).nodes.filter(n=>/^piece_/.test(n.name)).length;console.log(n);if(n!==32)process.exit(1)'
cp "$S/studio_small_09_1k.hdr" public/hdri/
printf 'Chess Set by Riley Queen (Poly Haven, CC0). studio_small_09 HDRI by Poly Haven (CC0). https://polyhaven.com/license\n' > public/models/CREDITS.txt
ls -la public/models public/hdri
