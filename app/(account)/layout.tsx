import Link from "next/link";
import Image from "next/image";

/**
 * The frame around signing in, creating an account and resetting a password.
 * The root layout already supplies the moving background, the grain and the
 * cursor, so this only has to place the card.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col px-5 py-7 sm:px-8">
      <Link href="/" className="flex w-fit items-center gap-2.5">
        <Image
          src="/brand/dish360-logo-new.png"
          alt=""
          width={32}
          height={32}
          className="rounded-full"
          unoptimized
        />
        <span className="text-[15px] font-bold tracking-tight text-ink">Dish360</span>
      </Link>

      <div className="flex flex-1 items-center justify-center py-10">{children}</div>
    </div>
  );
}
