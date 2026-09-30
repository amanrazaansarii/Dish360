import type { DishGeometry } from "./geometry";

/**
 * Minimal glTF 2.0 binary (GLB) writer.
 *
 * Emits one mesh with one primitive per material, which is all `<model-viewer>`
 * and WebXR need. Keeping this in-house means the AR pipeline has no native
 * dependency and no external service.
 *
 * Layout: 12-byte header, JSON chunk, BIN chunk — both padded to 4 bytes.
 */

const GLTF_MAGIC = 0x46546c67; // "glTF"
const CHUNK_JSON = 0x4e4f534a; // "JSON"
const CHUNK_BIN = 0x004e4942; // "BIN\0"

const COMPONENT_FLOAT = 5126;
const COMPONENT_UINT = 5125;
const TARGET_ARRAY_BUFFER = 34962;
const TARGET_ELEMENT_ARRAY_BUFFER = 34963;

interface Accessor {
  bufferView: number;
  componentType: number;
  count: number;
  type: "VEC3" | "VEC2" | "SCALAR";
  min?: number[];
  max?: number[];
}

interface BufferView {
  buffer: 0;
  byteOffset: number;
  byteLength: number;
  target?: number;
}

function padTo4(length: number): number {
  return (4 - (length % 4)) % 4;
}

export function encodeGlb(geometry: DishGeometry, dishName: string): Buffer {
  const accessors: Accessor[] = [];
  const bufferViews: BufferView[] = [];
  const chunks: Buffer[] = [];
  let offset = 0;

  const pushView = (data: Buffer, target?: number): number => {
    // Accessor byteOffsets are relative to the view, so each view starts aligned.
    const padding = padTo4(offset);
    if (padding > 0) {
      chunks.push(Buffer.alloc(padding));
      offset += padding;
    }
    bufferViews.push({
      buffer: 0,
      byteOffset: offset,
      byteLength: data.byteLength,
      ...(target ? { target } : {}),
    });
    chunks.push(data);
    offset += data.byteLength;
    return bufferViews.length - 1;
  };

  const materials = geometry.primitives.map((primitive) => ({
    name: primitive.name,
    pbrMetallicRoughness: {
      baseColorFactor: primitive.baseColor,
      metallicFactor: primitive.metallic,
      roughnessFactor: primitive.roughness,
    },
    doubleSided: true,
    ...(primitive.baseColor[3] < 1
      ? { alphaMode: "BLEND" as const }
      : {}),
  }));

  const meshPrimitives = geometry.primitives.map((primitive, index) => {
    const positionBuffer = Buffer.from(
      primitive.positions.buffer,
      primitive.positions.byteOffset,
      primitive.positions.byteLength,
    );
    const normalBuffer = Buffer.from(
      primitive.normals.buffer,
      primitive.normals.byteOffset,
      primitive.normals.byteLength,
    );
    const uvBuffer = Buffer.from(
      primitive.uvs.buffer,
      primitive.uvs.byteOffset,
      primitive.uvs.byteLength,
    );
    const indexBuffer = Buffer.from(
      primitive.indices.buffer,
      primitive.indices.byteOffset,
      primitive.indices.byteLength,
    );

    // POSITION requires min/max per the spec; viewers use it for framing.
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < primitive.positions.length; i += 3) {
      for (let axis = 0; axis < 3; axis += 1) {
        const value = primitive.positions[i + axis];
        if (value < min[axis]) min[axis] = value;
        if (value > max[axis]) max[axis] = value;
      }
    }

    const positionView = pushView(positionBuffer, TARGET_ARRAY_BUFFER);
    accessors.push({
      bufferView: positionView,
      componentType: COMPONENT_FLOAT,
      count: primitive.positions.length / 3,
      type: "VEC3",
      min,
      max,
    });
    const positionAccessor = accessors.length - 1;

    const normalView = pushView(normalBuffer, TARGET_ARRAY_BUFFER);
    accessors.push({
      bufferView: normalView,
      componentType: COMPONENT_FLOAT,
      count: primitive.normals.length / 3,
      type: "VEC3",
    });
    const normalAccessor = accessors.length - 1;

    const uvView = pushView(uvBuffer, TARGET_ARRAY_BUFFER);
    accessors.push({
      bufferView: uvView,
      componentType: COMPONENT_FLOAT,
      count: primitive.uvs.length / 2,
      type: "VEC2",
    });
    const uvAccessor = accessors.length - 1;

    const indexView = pushView(indexBuffer, TARGET_ELEMENT_ARRAY_BUFFER);
    accessors.push({
      bufferView: indexView,
      componentType: COMPONENT_UINT,
      count: primitive.indices.length,
      type: "SCALAR",
    });
    const indexAccessor = accessors.length - 1;

    return {
      attributes: {
        POSITION: positionAccessor,
        NORMAL: normalAccessor,
        TEXCOORD_0: uvAccessor,
      },
      indices: indexAccessor,
      material: index,
    };
  });

  const binaryPadding = padTo4(offset);
  if (binaryPadding > 0) chunks.push(Buffer.alloc(binaryPadding));
  const binary = Buffer.concat(chunks);

  const gltf = {
    asset: { version: "2.0", generator: "Dish360 procedural mesh pipeline" },
    scene: 0,
    scenes: [{ nodes: [0], name: "Dish360 Scene" }],
    nodes: [{ mesh: 0, name: dishName.slice(0, 64) }],
    meshes: [{ name: dishName.slice(0, 64), primitives: meshPrimitives }],
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: binary.byteLength }],
  };

  let json = Buffer.from(JSON.stringify(gltf), "utf8");
  const jsonPadding = padTo4(json.byteLength);
  if (jsonPadding > 0) {
    // The JSON chunk pads with spaces so it stays parseable.
    json = Buffer.concat([json, Buffer.alloc(jsonPadding, 0x20)]);
  }

  const totalLength = 12 + 8 + json.byteLength + 8 + binary.byteLength;
  const out = Buffer.alloc(totalLength);
  let cursor = 0;

  out.writeUInt32LE(GLTF_MAGIC, cursor);
  cursor += 4;
  out.writeUInt32LE(2, cursor);
  cursor += 4;
  out.writeUInt32LE(totalLength, cursor);
  cursor += 4;

  out.writeUInt32LE(json.byteLength, cursor);
  cursor += 4;
  out.writeUInt32LE(CHUNK_JSON, cursor);
  cursor += 4;
  json.copy(out, cursor);
  cursor += json.byteLength;

  out.writeUInt32LE(binary.byteLength, cursor);
  cursor += 4;
  out.writeUInt32LE(CHUNK_BIN, cursor);
  cursor += 4;
  binary.copy(out, cursor);

  return out;
}
