import type { Metadata } from "next";
import ConverterPage from "@/components/ConverterPage";
import { DEFAULT_PAIR } from "@/lib/formats";

export const metadata: Metadata = {
  title: DEFAULT_PAIR.metaTitle,
  description: DEFAULT_PAIR.description,
};

export default function Home() {
  return <ConverterPage pair={DEFAULT_PAIR} />;
}
