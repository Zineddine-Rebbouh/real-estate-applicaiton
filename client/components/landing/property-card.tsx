import Image from "next/image";
import Link from "next/link";
import { Bed, Layers } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
}: PropertyCardProps) {
  const statusConfig = {
    available: { label: "Ready to sell", variant: "success" as const },
    sold: { label: "Sold", variant: "secondary" as const },
    pending: { label: "Pending", variant: "outline" as const },
  };

  const currentStatus = statusConfig[status];

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md hover:ring-foreground/20">
      <div className="relative aspect-[4/3] overflow-hidden">
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

      <CardHeader className="space-y-2">
        <h3 className="text-base font-medium">{title}</h3>
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
        <p className="text-base font-semibold">{formatPriceValue(price)}</p>
        <Button variant="outline" size="sm" asChild>
          <Link href={href}>View details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
