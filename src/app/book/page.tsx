import type { Metadata } from "next";
import { BookWizard } from "./book-wizard";

export const metadata: Metadata = {
  title: "Book Your Event Decoration | Baraabar",
  description:
    "Pick your event date and venue, and we'll take care of the rest — free venue visit, custom setup, no payment now.",
};

export default function BookPage() {
  return <BookWizard />;
}
