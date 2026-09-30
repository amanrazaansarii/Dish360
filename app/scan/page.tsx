import type { Metadata } from "next";
import ScanForm from "./ScanForm";

export const metadata: Metadata = {
  title: "Type your table code · Dish360",
  description: "Type the code on your table stand to open the menu.",
};

export default function ScanPage({
  searchParams,
}: {
  searchParams: { unknown?: string; paused?: string };
}) {
  const notice = searchParams.unknown
    ? "That code does not match any table. Check it against the stand — they look like CPL-T04."
    : searchParams.paused
      ? "That code has been paused by the restaurant. Ask a server for a current one."
      : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16 sm:px-8">
      <ScanForm notice={notice} />
    </div>
  );
}
