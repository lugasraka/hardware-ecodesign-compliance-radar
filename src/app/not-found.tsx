import Link from "next/link";
import { ArrowLeft, Radar } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white">
        <Radar size={19} />
      </span>
      <p className="mt-4 label">404</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
        This route is not in the program.
      </h1>
      <p className="mt-2 max-w-md text-[12px] leading-6 text-zinc-500">
        The page may have moved, or the product is not part of this demo portfolio. The
        portfolio view has every product and regulatory workstream.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-[11px] font-medium text-white hover:bg-blue-800"
      >
        <ArrowLeft size={13} />
        Back to portfolio
      </Link>
    </div>
  );
}
