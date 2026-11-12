import type { Metadata } from "next";
import ResetForm from "./ResetForm";

export const metadata: Metadata = {
  title: "Set a new password · Dish360",
  robots: { index: false },
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return <ResetForm token={searchParams.token ?? ""} />;
}
