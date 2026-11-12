import type { Metadata } from "next";
import DemoForm from "./DemoForm";

export const metadata: Metadata = {
  title: "Book a demo · Dish360",
  description: "Tell us about your restaurant and we will show you Dish360 on your own menu.",
};

export default function DemoPage() {
  return <DemoForm />;
}
