import type { Metadata } from "next";
import { headers } from "next/headers";
import { requireAuth } from "@/lib/auth/session";
import { getDish, listTableCodes } from "@/lib/db";
import { qrMatrix, scanUrl } from "@/lib/qr";
import PrintBar from "./PrintBar";

export const metadata: Metadata = {
  title: "Print the stands · Dish360",
  robots: { index: false, follow: false },
};

/**
 * The little stand that goes on each table.
 *
 * Laid out dark-on-white at real millimetre sizes with trim marks, so "Save as
 * PDF" in the browser's own print dialog produces artwork a print shop can use.
 * No PDF library, nothing uploaded anywhere.
 *
 * The QR is drawn from its own module matrix rather than dropped in as an
 * image, so it stays sharp at any size a printer runs it at.
 */
export default async function PrintPage({
  searchParams,
}: {
  searchParams: { code?: string; size?: string };
}) {
  const { restaurant } = await requireAuth();

  const host = headers().get("host") ?? "localhost:3000";
  const scheme = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${scheme}://${host}`;

  const all = await listTableCodes(restaurant.id);
  const chosen = searchParams.code
    ? all.filter((c) => c.code.toUpperCase() === searchParams.code!.toUpperCase())
    : all.filter((c) => c.active);

  const stands = await Promise.all(
    chosen.map(async (code) => ({
      code,
      dish: code.targetDishId ? await getDish(code.targetDishId) : null,
      matrix: await qrMatrix(scanUrl(code.code, origin)),
    })),
  );

  const big = searchParams.size === "a5";

  return (
    <>
      <PrintBar count={stands.length} size={big ? "a5" : "a6"} />

      <div className="flex flex-col items-center gap-8 py-8 print:gap-0 print:py-0">
        {stands.length === 0 ? (
          <p className="text-[14px] text-ink-plain">
            No codes in use to print. Make one first.
          </p>
        ) : null}

        {stands.map(({ code, dish, matrix }) => (
          <article
            key={code.id}
            className="print-sheet relative flex flex-col items-center justify-between bg-white text-[#131313]"
            style={{
              // A6 is 105×148mm, A5 is 148×210mm. Sized in mm so the browser's
              // print pipeline lands it 1:1 on the paper.
              width: big ? "148mm" : "105mm",
              height: big ? "210mm" : "148mm",
              padding: big ? "15mm 13mm" : "11mm 9mm",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <TrimMarks />

            <header className="flex w-full flex-col items-center gap-1">
              <p
                className="font-extrabold uppercase"
                style={{
                  fontSize: big ? "13pt" : "10pt",
                  letterSpacing: "0.2em",
                }}
              >
                {restaurant.name}
              </p>
              {code.tableNumber ? (
                <p
                  className="font-semibold"
                  style={{ fontSize: big ? "8.5pt" : "7pt", opacity: 0.5 }}
                >
                  TABLE {code.tableNumber}
                </p>
              ) : null}
            </header>

            <QrBlock matrix={matrix} mm={big ? 78 : 55} />

            <footer className="flex w-full flex-col items-center gap-1.5 text-center">
              <p
                className="font-extrabold"
                style={{ fontSize: big ? "13pt" : "10pt", lineHeight: 1.2 }}
              >
                {dish ? dish.name : "See the food before you order"}
              </p>
              <p
                style={{
                  fontSize: big ? "9pt" : "7pt",
                  opacity: 0.62,
                  lineHeight: 1.45,
                  maxWidth: big ? "95mm" : "70mm",
                }}
              >
                Point your phone camera at the code. Nothing to download.
              </p>
              <p
                className="font-mono"
                style={{
                  fontSize: big ? "7pt" : "5.6pt",
                  opacity: 0.38,
                  marginTop: "2.5mm",
                }}
              >
                {code.code}
              </p>
            </footer>
          </article>
        ))}
      </div>
    </>
  );
}

/** Corner marks a print shop trims to. */
function TrimMarks() {
  const corners: { style: React.CSSProperties; angle: number }[] = [
    { style: { top: 0, left: 0 }, angle: 0 },
    { style: { top: 0, right: 0 }, angle: 90 },
    { style: { bottom: 0, right: 0 }, angle: 180 },
    { style: { bottom: 0, left: 0 }, angle: 270 },
  ];

  return (
    <>
      {corners.map((corner, index) => (
        <span
          key={index}
          aria-hidden
          className="absolute"
          style={{
            ...corner.style,
            width: "5mm",
            height: "5mm",
            borderTop: "0.25mm solid rgba(0,0,0,0.3)",
            borderLeft: "0.25mm solid rgba(0,0,0,0.3)",
            transform: `rotate(${corner.angle}deg)`,
            transformOrigin: "center",
          }}
        />
      ))}
    </>
  );
}

function QrBlock({
  matrix,
  mm,
}: {
  matrix: { size: number; cells: boolean[] };
  mm: number;
}) {
  const quiet = 3;
  const total = matrix.size + quiet * 2;

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      style={{ width: `${mm}mm`, height: `${mm}mm` }}
      shapeRendering="crispEdges"
      role="img"
      aria-label="The code for this table"
    >
      <rect width={total} height={total} fill="#ffffff" />
      {matrix.cells.map((on, index) =>
        on ? (
          <rect
            key={index}
            x={quiet + (index % matrix.size)}
            y={quiet + Math.floor(index / matrix.size)}
            width={1}
            height={1}
            fill="#131313"
          />
        ) : null,
      )}
    </svg>
  );
}
