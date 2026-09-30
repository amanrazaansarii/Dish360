import { crc32 } from "node:zlib";
import type { DishGeometry } from "./geometry";

/**
 * USDZ writer for iOS AR Quick Look.
 *
 * A USDZ file is an uncompressed ZIP archive whose members start on 64-byte
 * boundaries so the runtime can memory-map them in place. The payload here is
 * ASCII USD (`.usda`), which Quick Look accepts, so no USD toolchain is needed.
 */

const ALIGNMENT = 64;

function formatFloat(value: number): string {
  // Six decimals is well under a millimetre at these scales and keeps the file small.
  const rounded = Math.round(value * 1e6) / 1e6;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function point3Array(values: Float32Array): string {
  const parts: string[] = [];
  for (let i = 0; i < values.length; i += 3) {
    parts.push(
      `(${formatFloat(values[i])}, ${formatFloat(values[i + 1])}, ${formatFloat(values[i + 2])})`,
    );
  }
  return parts.join(", ");
}

function point2Array(values: Float32Array): string {
  const parts: string[] = [];
  for (let i = 0; i < values.length; i += 2) {
    parts.push(`(${formatFloat(values[i])}, ${formatFloat(values[i + 1])})`);
  }
  return parts.join(", ");
}

function sanitiseIdentifier(name: string, fallback: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9_]/g, "_").replace(/^(\d)/, "_$1");
  return cleaned.length > 0 ? cleaned : fallback;
}

export function encodeUsda(geometry: DishGeometry, dishName: string): string {
  const root = sanitiseIdentifier(dishName, "Dish");
  const lines: string[] = [];

  lines.push("#usda 1.0");
  lines.push("(");
  lines.push('    defaultPrim = "' + root + '"');
  lines.push('    metersPerUnit = 1');
  lines.push('    upAxis = "Y"');
  lines.push(")");
  lines.push("");
  lines.push(`def Xform "${root}" (`);
  lines.push('    kind = "component"');
  lines.push(")");
  lines.push("{");

  const used = new Set<string>();

  geometry.primitives.forEach((primitive, index) => {
    let name = sanitiseIdentifier(primitive.name, `Part${index}`);
    while (used.has(name)) name = `${name}_${index}`;
    used.add(name);

    const faceCount = primitive.indices.length / 3;
    const faceVertexCounts = new Array<string>(faceCount).fill("3").join(", ");
    const faceVertexIndices = Array.from(primitive.indices).join(", ");
    const [r, g, b, alpha] = primitive.baseColor;

    lines.push(`    def Mesh "${name}"`);
    lines.push("    {");
    lines.push(`        uniform bool doubleSided = 1`);
    lines.push(`        int[] faceVertexCounts = [${faceVertexCounts}]`);
    lines.push(`        int[] faceVertexIndices = [${faceVertexIndices}]`);
    lines.push(`        point3f[] points = [${point3Array(primitive.positions)}]`);
    lines.push(
      `        normal3f[] primvars:normals = [${point3Array(primitive.normals)}] (`,
    );
    lines.push('            interpolation = "vertex"');
    lines.push("        )");
    lines.push(
      `        texCoord2f[] primvars:st = [${point2Array(primitive.uvs)}] (`,
    );
    lines.push('            interpolation = "vertex"');
    lines.push("        )");
    lines.push(`        uniform token subdivisionScheme = "none"`);
    lines.push(`        rel material:binding = </${root}/${name}/Material>`);
    lines.push("");
    lines.push(`        def Material "Material"`);
    lines.push("        {");
    lines.push(
      `            token outputs:surface.connect = </${root}/${name}/Material/Surface.outputs:surface>`,
    );
    lines.push("");
    lines.push(`            def Shader "Surface"`);
    lines.push("            {");
    lines.push(`                uniform token info:id = "UsdPreviewSurface"`);
    lines.push(
      `                color3f inputs:diffuseColor = (${formatFloat(r)}, ${formatFloat(g)}, ${formatFloat(b)})`,
    );
    lines.push(`                float inputs:metallic = ${formatFloat(primitive.metallic)}`);
    lines.push(
      `                float inputs:roughness = ${formatFloat(primitive.roughness)}`,
    );
    lines.push(`                float inputs:opacity = ${formatFloat(alpha)}`);
    lines.push(`                int inputs:useSpecularWorkflow = 0`);
    lines.push(`                token outputs:surface`);
    lines.push("            }");
    lines.push("        }");
    lines.push("    }");
  });

  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

interface ZipEntry {
  name: string;
  data: Buffer;
}

/**
 * Builds a store-only ZIP with USDZ's 64-byte data alignment.
 * Alignment is achieved by padding the local header's extra field, which the
 * USDZ spec explicitly sanctions.
 */
function packUsdz(entries: ZipEntry[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name, "utf8");
    const checksum = crc32(entry.data) >>> 0;

    const headerLength = 30 + nameBuffer.byteLength;
    const extraLength = (ALIGNMENT - ((offset + headerLength) % ALIGNMENT)) % ALIGNMENT;

    const localHeader = Buffer.alloc(headerLength + extraLength);
    localHeader.writeUInt32LE(0x04034b50, 0); // local file header signature
    localHeader.writeUInt16LE(10, 4); // version needed (1.0, store)
    localHeader.writeUInt16LE(0, 6); // flags
    localHeader.writeUInt16LE(0, 8); // method: store
    localHeader.writeUInt16LE(0, 10); // mod time
    localHeader.writeUInt16LE(0x21, 12); // mod date (1996-01-01, deterministic)
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(entry.data.byteLength, 18);
    localHeader.writeUInt32LE(entry.data.byteLength, 22);
    localHeader.writeUInt16LE(nameBuffer.byteLength, 26);
    localHeader.writeUInt16LE(extraLength, 28);
    nameBuffer.copy(localHeader, 30);
    // Extra field stays zero-filled; USDZ readers ignore its contents.

    localParts.push(localHeader, entry.data);

    const central = Buffer.alloc(46 + nameBuffer.byteLength);
    central.writeUInt32LE(0x02014b50, 0); // central directory signature
    central.writeUInt16LE(10, 4); // version made by
    central.writeUInt16LE(10, 6); // version needed
    central.writeUInt16LE(0, 8); // flags
    central.writeUInt16LE(0, 10); // method: store
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x21, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(entry.data.byteLength, 20);
    central.writeUInt32LE(entry.data.byteLength, 24);
    central.writeUInt16LE(nameBuffer.byteLength, 28);
    central.writeUInt16LE(0, 30); // extra length (central copy)
    central.writeUInt16LE(0, 32); // comment length
    central.writeUInt16LE(0, 34); // disk number
    central.writeUInt16LE(0, 36); // internal attrs
    central.writeUInt32LE(0, 38); // external attrs
    central.writeUInt32LE(offset, 42); // relative offset of local header
    nameBuffer.copy(central, 46);
    centralParts.push(central);

    offset += localHeader.byteLength + entry.data.byteLength;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); // end of central directory signature
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.byteLength, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

export function encodeUsdz(geometry: DishGeometry, dishName: string): Buffer {
  const usda = Buffer.from(encodeUsda(geometry, dishName), "utf8");
  // The first entry must be the USD file itself — Quick Look opens it by position.
  return packUsdz([{ name: "dish.usda", data: usda }]);
}
