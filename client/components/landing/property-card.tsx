import Image from "next/image";
import Link from "next/link";
import { Bed, Layers } from "lucide-react";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPriceValue } from "@/lib/utils";

export type PropertyCardProps = {
  image: string;
  title: string;
  totalArea: number;
  bedrooms: number;
  floor: number;
  price: number;
  status?: "available" | "sold" | "pending";
  href: string;
  layout?: "grid" | "list";
};

export function PropertyCard({
  image,
  title,
  totalArea,
  bedrooms,
  floor,
  price,
  status = "available",
  href,
  layout = "grid",
}: PropertyCardProps) {
  const statusConfig = {
    available: { label: "Ready to sell", variant: "success" as const },
    sold: { label: "Sold", variant: "secondary" as const },
    pending: { label: "Pending", variant: "outline" as const },
  };

  const currentStatus = statusConfig[status];

  return (
    <Card
      className={`group overflow-hidden transition-all hover:shadow-md hover:ring-foreground/20 ${layout === "list" ? "sm:grid sm:grid-cols-[minmax(180px,280px)_1fr]" : ""}`}
    >
      <div
        className={`relative overflow-hidden ${layout === "list" ? "min-h-[220px]" : "aspect-4/3"}`}
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute top-3 right-3">
          <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>
        </div>
      </div>

      <div className={layout === "list" ? "flex flex-col justify-between" : ""}>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="mb-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Wrocław
              </p>
              <h3 className="text-base font-medium">{title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              <span>{totalArea}m²</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4" />
              <span>{bedrooms} bed</span>
            </div>
            <span>Floor {floor}</span>
          </div>
        </CardHeader>

        <CardFooter className="flex items-center justify-between pt-0">
          <p className="text-base sm:text-lg font-semibold">
            {formatPriceValue(price)}
          </p>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={href} />}
          >
            View details
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
