import Image from "next/image";
import DishArt from "./DishArt";
import type { Dish } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The owner's photograph when there is one, generated artwork when there is
 * not. Step 1 of the home page asks for one photo per dish; until it arrives
 * the menu still has to look like something, so it shows a drawing coloured
 * from the dish's own flavour sliders rather than a grey box.
 */
export default function DishPhoto({
  dish,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  plain = false,
  fit = "cover",
}: {
  dish: Pick<Dish, "id" | "name" | "imageUrl" | "flavour" | "dietTags">;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** drops the plate ring, for small thumbnails */
  plain?: boolean;
  fit?: "cover" | "contain";
}) {
  if (dish.imageUrl) {
    return (
      <Image
        src={dish.imageUrl}
        alt={dish.name}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
        // Uploads are served straight from /public, not through the optimiser.
        unoptimized={dish.imageUrl.startsWith("/uploads/")}
      />
    );
  }

  return (
    <DishArt
      dishId={dish.id}
      name={dish.name}
      flavour={dish.flavour}
      dietTags={dish.dietTags}
      compact={plain}
      fit={fit}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
