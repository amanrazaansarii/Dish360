import type { Metadata } from "next";
import ForgotForm from "./ForgotForm";

export const metadata: Metadata = {
  title: "Forgot your password · Dish360",
};

export default function ForgotPasswordPage() {
  return <ForgotForm />;
}
