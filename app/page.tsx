import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex py-4 bg-gray-200 flex-row items-center justify-between p-24">
      <h1>Hello, Next.js!</h1>
      <UserButton />
      <ModeToggle />
    </div>
  );
}
