import { getTableCodeByCode } from "@/lib/db";
import { qrPng, qrSvg, scanUrl } from "@/lib/qr";

/**
 * A table code as an image.
 *
 *   /api/qr/<code>                    PNG at 1024px
 *   /api/qr/<code>?format=svg         vector, for a print shop
 *   /api/qr/<code>?size=2048&download=1
 *
 * Public on purpose. A code printed on a stand in a public room is not a
 * secret, and the stand page, the dashboard and a print shop all need to fetch
 * it without signing in.
 *
 * Error correction is fixed at the highest level: a stand on a café table gets
 * splashed, scuffed and half-covered by a plate, and the code still has to read.
 */
export async function GET(
  request: Request,
  { params }: { params: { code: string } },
) {
  const row = await getTableCodeByCode(params.code);
  if (!row) return Response.json({ error: "No such code." }, { status: 404 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "svg" ? "svg" : "png";
  const size = Math.min(4096, Math.max(128, Number(url.searchParams.get("size")) || 1024));
  const download = url.searchParams.get("download") === "1";

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  const target = scanUrl(row.code, origin);

  const filename = `dish360-${row.code.toLowerCase()}.${format}`;
  const disposition = `${download ? "attachment" : "inline"}; filename="${filename}"`;

  if (format === "svg") {
    return new Response(await qrSvg(target, { size }), {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": disposition,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const png = await qrPng(target, { size });
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(png.byteLength),
      "Content-Disposition": disposition,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
