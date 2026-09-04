"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  BathIcon,
  BedDoubleIcon,
  HeartIcon,
  MapPinIcon,
  StarIcon,
  WavesIcon,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Amenity = { icon: LucideIcon; label: string };

type FavoriteProperty = {
  address: string;
  amenities: Amenity[];
  badges?: string[];
  image: string;
  name: string;
  price: string;
  rating: number;
  reviews: number;
};

const favoriteProperties: FavoriteProperty[] = [
  {
    name: "North Street Lofts",
    address: "42 North Street, Unit 3B",
    image: "/singlelisting-3.jpg",
    price: "$2,450 /night",
    rating: 4.9,
    reviews: 28,
    badges: ["Featured"],
    amenities: [
      { icon: BedDoubleIcon, label: "2 beds" },
      { icon: BathIcon, label: "2 baths" },
    ],
  },
  {
    name: "Willow Lane Residences",
    address: "18 Willow Lane, Apt 204",
    image: "/singlelisting-2.jpg",
    price: "$2,180 /night",
    rating: 4.8,
    reviews: 41,
    amenities: [
      { icon: BedDoubleIcon, label: "3 beds" },
      { icon: BathIcon, label: "2 baths" },
      { icon: WavesIcon, label: "Pool" },
    ],
  },
  {
    name: "Park View House",
    address: "9 Park View Road, Apt 6C",
    image: "/landing-i3.png",
    price: "$1,950 /night",
    rating: 4.7,
    reviews: 19,
    badges: ["New"],
    amenities: [
      { icon: BedDoubleIcon, label: "2 beds" },
      { icon: BathIcon, label: "1 bath" },
    ],
  },
  {
    name: "Garden Square",
    address: "7 Garden Square, Apt 12",
    image: "/landing-i4.png",
    price: "$1,820 /night",
    rating: 4.6,
    reviews: 34,
    amenities: [
      { icon: BedDoubleIcon, label: "2 beds" },
      { icon: BathIcon, label: "1 bath" },
    ],
  },
  {
    name: "The Linden House",
    address: "24 Linden Avenue, Apt 4A",
    image: "/landing-splash.jpg",
    price: "$2,300 /night",
    rating: 4.9,
    reviews: 52,
    badges: ["Popular"],
    amenities: [
      { icon: BedDoubleIcon, label: "3 beds" },
      { icon: BathIcon, label: "2 baths" },
      { icon: WavesIcon, label: "Pool" },
    ],
  },
  {
    name: "Maple Court Studio",
    address: "11 Maple Court, Studio 5",
    image: "/landing-i6.png",
    price: "$1,540 /night",
    rating: 4.5,
    reviews: 16,
    amenities: [
      { icon: BedDoubleIcon, label: "1 bed" },
      { icon: BathIcon, label: "1 bath" },
    ],
  },
];

function FavoriteCard({
  property,
  onRemove,
}: {
  property: FavoriteProperty;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group overflow-hidden p-0 transition-shadow hover:shadow-md">
        <div className="relative aspect-4/3 overflow-hidden">
          <Image
            src={property.image}
            alt={`${property.name} exterior`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {property.badges && property.badges.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {property.badges.map((badge) => (
                <Badge key={badge} variant="secondary">
                  {badge}
                </Badge>
              ))}
            </div>
          )}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 rounded-full bg-background/90 text-rose-500 hover:bg-background hover:text-rose-600"
            onClick={onRemove}
            aria-label={`Remove ${property.name} from favorites`}
          >
            <HeartIcon className="size-4" fill="currentColor" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="#" />}
            className="absolute right-3 bottom-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          >
            View Property
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <h2 className="text-base font-medium">{property.name}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPinIcon className="size-3.5 shrink-0" />
              {property.address}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <StarIcon className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">
                {property.rating}
              </span>
              <span>({property.reviews})</span>
            </div>
            <p className="font-semibold">{property.price}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3 text-sm text-muted-foreground">
            {property.amenities.map(({ icon: AmenityIcon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <AmenityIcon className="size-4" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(favoriteProperties);

  return (
    <main className="min-h-full bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 sm:p-6 lg:p-8">
        <header>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Favorites
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The properties you&apos;ve saved for later.
          </p>
        </header>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-16 text-center">
            <div
              className="flex size-12 items-center justify-center rounded-full bg-muted"
              aria-hidden="true"
            >
              <HeartIcon className="size-6 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-base font-medium">
              You haven&apos;t saved any properties yet
            </h2>
            <Button
              className="mt-5"
              nativeButton={false}
              render={<Link href="/" />}
            >
              Browse Properties
            </Button>
          </div>
        ) : (
          <section
            aria-label="Saved properties"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {favorites.map((property) => (
                <FavoriteCard
                  key={property.name}
                  property={property}
                  onRemove={() =>
                    setFavorites((current) =>
                      current.filter((item) => item.name !== property.name),
                    )
                  }
                />
              ))}
            </AnimatePresence>
          </section>
        )}
      </div>
    </main>
  );
}
