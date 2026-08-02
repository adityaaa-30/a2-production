import { Hero } from "@/components/Hero";
import { Sections } from "@/components/Sections";

export default function Home() {
  return (
    <main className="w-full min-h-screen overflow-x-hidden">
      <Hero />
      <Sections />
    </main>
  );
}
