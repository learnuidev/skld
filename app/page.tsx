import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex my-32 justify-center font-sans">
      <main className="flex w-full flex-col items-start sm:items-start">
        <h1 className="text-4xl font-bold uppercase">skld</h1>
        <p className="mt-2 font-light text-lg"> exam simulation app</p>

        <div className="mt-12 gap-4 flex">
          <Button>Get Started</Button>
          <Button variant={"outline"}>Learn More</Button>
        </div>
      </main>
    </div>
  );
}
