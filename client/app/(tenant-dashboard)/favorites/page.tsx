"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  AlertCircleIcon,
  ArrowUpDownIcon,
  BathIcon,
  BedDoubleIcon,
  CheckCircle2Icon,
  CompassIcon,
  EyeIcon,
  HeartIcon,
  MapPinIcon,
  SearchIcon,
  SendIcon,
  SparklesIcon,
  StarIcon,
  Trash2Icon,
  WavesIcon,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Amenity = { icon: LucideIcon; label: string };

type FavoriteProperty = {
  id: string;
  address: string;
  amenities: Amenity[];
  badges?: string[];
  image: string;
  name: string;
  price: string;
  priceNum: number;
  rating: number;
  reviews: number;
  bedsCount: number;
};

const initialFavoriteProperties: FavoriteProperty[] = [
  {
    id: "fav-1",
    name: "North Street Lofts",
    address: "42 North Street, Unit 3B",
    image: "/singlelisting-3.jpg",
    price: "$2,450 /mo",
    priceNum: 2450,
    rating: 4.9,
    reviews: 28,
    bedsCount: 2,
    badges: ["Featured"],
    amenities: [
      { icon: BedDoubleIcon, label: "2 beds" },
      { icon: BathIcon, label: "2 baths" },
    ],
  },
  {
    id: "fav-2",
    name: "Willow Lane Residences",
    address: "18 Willow Lane, Apt 204",
    image: "/singlelisting-2.jpg",
    price: "$2,180 /mo",
    priceNum: 2180,
    rating: 4.8,
    reviews: 41,
    bedsCount: 3,
    amenities: [
      { icon: BedDoubleIcon, label: "3 beds" },
      { icon: BathIcon, label: "2 baths" },
      { icon: WavesIcon, label: "Pool" },
    ],
  },
  {
    id: "fav-3",
    name: "Park View House",
    address: "9 Park View Road, Apt 6C",
    image: "/landing-i3.png",
    price: "$1,950 /mo",
    priceNum: 1950,
    rating: 4.7,
    reviews: 19,
    bedsCount: 2,
    badges: ["New"],
    amenities: [
      { icon: BedDoubleIcon, label: "2 beds" },
      { icon: BathIcon, label: "1 bath" },
    ],
  },
  {
    id: "fav-4",
    name: "Garden Square",
    address: "7 Garden Square, Apt 12",
    image: "/landing-i4.png",
    price: "$1,820 /mo",
    priceNum: 1820,
    rating: 4.6,
    reviews: 34,
    bedsCount: 2,
    amenities: [
      { icon: BedDoubleIcon, label: "2 beds" },
      { icon: BathIcon, label: "1 bath" },
    ],
  },
  {
    id: "fav-5",
    name: "The Linden House",
    address: "24 Linden Avenue, Apt 4A",
    image: "/landing-splash.jpg",
    price: "$2,300 /mo",
    priceNum: 2300,
    rating: 4.9,
    reviews: 52,
    bedsCount: 3,
    badges: ["Popular"],
    amenities: [
      { icon: BedDoubleIcon, label: "3 beds" },
      { icon: BathIcon, label: "2 baths" },
      { icon: WavesIcon, label: "Pool" },
    ],
  },
  {
    id: "fav-6",
    name: "Maple Court Studio",
    address: "11 Maple Court, Studio 5",
    image: "/landing-i6.png",
    price: "$1,540 /mo",
    priceNum: 1540,
    rating: 4.5,
    reviews: 16,
    bedsCount: 1,
    amenities: [
      { icon: BedDoubleIcon, label: "1 bed" },
      { icon: BathIcon, label: "1 bath" },
    ],
  },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>(
    initialFavoriteProperties,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [bedFilter, setBedFilter] = useState<"all" | "1" | "2" | "3+">("all");
  const [sortBy, setSortBy] = useState<
    "featured" | "price-asc" | "price-desc" | "rating"
  >("featured");

  // Dialog states
  const [viewingProperty, setViewingProperty] =
    useState<FavoriteProperty | null>(null);
  const [applyingProperty, setApplyingProperty] =
    useState<FavoriteProperty | null>(null);
  const [clearAllConfirmOpen, setClearAllConfirmOpen] = useState(false);
  const [moveInDate, setMoveInDate] = useState("2026-10-01");
  const [isApplying, setIsApplying] = useState(false);

  // Compute metrics
  const avgRent = useMemo(() => {
    if (favorites.length === 0) return 0;
    const sum = favorites.reduce((acc, curr) => acc + curr.priceNum, 0);
    return Math.round(sum / favorites.length);
  }, [favorites]);

  const filteredProperties = useMemo(() => {
    return favorites
      .filter((property) => {
        const matchesSearch =
          searchQuery.trim() === "" ||
          property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.address.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesBeds =
          bedFilter === "all" ||
          (bedFilter === "1" && property.bedsCount === 1) ||
          (bedFilter === "2" && property.bedsCount === 2) ||
          (bedFilter === "3+" && property.bedsCount >= 3);

        return matchesSearch && matchesBeds;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.priceNum - b.priceNum;
        if (sortBy === "price-desc") return b.priceNum - a.priceNum;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0;
      });
  }, [favorites, searchQuery, bedFilter, sortBy]);

  const handleRemoveFavorite = (property: FavoriteProperty) => {
    setFavorites((current) =>
      current.filter((item) => item.id !== property.id),
    );

    toast("Property removed from favorites", {
      description: property.name,
      action: {
        label: "Undo",
        onClick: () => {
          setFavorites((current) => [property, ...current]);
          toast.success(`Restored ${property.name} to favorites`);
        },
      },
    });
  };

  const handleClearAll = () => {
    const savedCopy = [...favorites];
    setFavorites([]);
    setClearAllConfirmOpen(false);

    toast.info("All favorites cleared", {
      action: {
        label: "Undo All",
        onClick: () => {
          setFavorites(savedCopy);
          toast.success("Favorites restored");
        },
      },
    });
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingProperty) return;

    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      const propName = applyingProperty.name;
      setApplyingProperty(null);

      toast.success(`Application submitted for ${propName}!`, {
        description:
          "Your rental application was received. Track status in Applications.",
      });
    }, 700);
  };

  return (
    <main className="min-h-full bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Saved Homes
              </h1>
              <Badge variant="outline" className="text-xs">
                {favorites.length} Saved
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Compare your favorite properties, schedule tours, and start rental
              applications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {favorites.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClearAllConfirmOpen(true)}
                className="text-xs text-muted-foreground hover:text-destructive gap-1"
              >
                <Trash2Icon className="size-3.5" />
                <span>Clear All</span>
              </Button>
            )}
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/" className="flex items-center gap-1.5" />}
            >
              <CompassIcon className="size-3.5" />
              <span>Browse More Listings</span>
            </Button>
          </div>
        </header>

        {/* Stats & Search/Filter Toolbar */}
        {favorites.length > 0 && (
          <div className="flex flex-col gap-4">
            {/* KPI Banner */}
            {/* <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Card className="p-3.5 shadow-2xs">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Saved Properties
                </span>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {favorites.length}
                </p>
              </Card>
              <Card className="p-3.5 shadow-2xs">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Average Rent
                </span>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  ${avgRent.toLocaleString()} /mo
                </p>
              </Card>
              <Card className="p-3.5 shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Ready to Lease
                </span>
                <p className="text-xl font-bold text-emerald-600 mt-0.5">
                  100% Verified
                </p>
              </Card>
            </div> */}

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved homes..."
                  className="h-9 pl-9 text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Bedrooms Filter */}
                <div className="flex items-center rounded-lg bg-muted p-0.5 text-xs font-medium">
                  {(["all", "1", "2", "3+"] as const).map((bed) => (
                    <button
                      key={bed}
                      onClick={() => setBedFilter(bed)}
                      className={`rounded-md px-2.5 py-1 transition-colors ${
                        bedFilter === bed
                          ? "bg-background text-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {bed === "all"
                        ? "All Beds"
                        : bed === "3+"
                          ? "3+ Beds"
                          : `${bed} Bed`}
                    </button>
                  ))}
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-1 text-xs">
                  <ArrowUpDownIcon className="size-3.5 text-muted-foreground" />
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as
                          | "featured"
                          | "price-asc"
                          | "price-desc"
                          | "rating",
                      )
                    }
                    aria-label="Sort properties"
                    className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs shadow-2xs"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center shadow-2xs">
            <div className="flex size-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <HeartIcon className="size-7" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              You haven&apos;t saved any properties yet
            </h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Explore available rentals across prime locations and click the
              heart icon on any home to save it for review.
            </p>
            <Button
              className="mt-6"
              render={<Link href="/" className="flex items-center gap-1.5" />}
            >
              <CompassIcon className="size-4" />
              <span>Browse Properties</span>
            </Button>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <SearchIcon className="size-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              No matching saved homes
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try relaxing your search query or bedroom filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setBedFilter("all");
              }}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <section
            aria-label="Saved properties grid"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {filteredProperties.map((property) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group overflow-hidden p-0 transition-all hover:shadow-md border-border/80">
                    <div className="relative aspect-4/3 overflow-hidden bg-muted">
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
                            <Badge
                              key={badge}
                              variant="secondary"
                              className="backdrop-blur-xs bg-background/90 text-xs font-semibold"
                            >
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Remove Favorite Button */}
                      <button
                        onClick={() => handleRemoveFavorite(property)}
                        aria-label={`Remove ${property.name} from favorites`}
                        className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-background/90 text-rose-500 backdrop-blur-xs transition-transform hover:scale-110 hover:bg-background hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer shadow-xs"
                      >
                        <HeartIcon className="size-4.5" fill="currentColor" />
                      </button>

                      <div className="absolute right-3 bottom-3 flex gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => setViewingProperty(property)}
                          className="bg-background/95 backdrop-blur-xs text-xs shadow-xs"
                        >
                          <EyeIcon className="size-3" />
                          <span>Preview</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4 p-4">
                      <div>
                        <div className="flex items-baseline justify-between gap-2">
                          <h2 className="text-base font-semibold text-foreground truncate">
                            {property.name}
                          </h2>
                          <p className="font-bold text-foreground text-sm shrink-0">
                            {property.price}
                          </p>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          <MapPinIcon className="size-3.5 shrink-0 text-muted-foreground" />
                          {property.address}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-foreground">
                            {property.rating}
                          </span>
                          <span className="text-muted-foreground">
                            ({property.reviews} reviews)
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-600 font-medium">
                          Available Now
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-3 text-xs text-muted-foreground">
                        {property.amenities.map(
                          ({ icon: AmenityIcon, label }) => (
                            <span
                              key={label}
                              className="flex items-center gap-1.5"
                            >
                              <AmenityIcon className="size-3.5 text-muted-foreground" />
                              {label}
                            </span>
                          ),
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingProperty(property)}
                          className="text-xs"
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setApplyingProperty(property)}
                          className="text-xs gap-1"
                        >
                          <SparklesIcon className="size-3" />
                          <span>Apply Now</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>
        )}
      </div>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={clearAllConfirmOpen} onOpenChange={setClearAllConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex size-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 mb-2">
              <AlertCircleIcon className="size-5" />
            </div>
            <DialogTitle>Clear all saved homes?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove all {favorites.length} properties
              from your favorites? You can undo this immediately if done by
              mistake.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearAllConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Property Details Modal */}
      <Dialog
        open={Boolean(viewingProperty)}
        onOpenChange={(open) => !open && setViewingProperty(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {viewingProperty && (
            <>
              <div className="relative aspect-16/9 w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={viewingProperty.image}
                  alt={viewingProperty.name}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur-xs">
                  {viewingProperty.price}
                </Badge>
              </div>

              <DialogHeader className="pt-2">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg">
                    {viewingProperty.name}
                  </DialogTitle>
                  <div className="flex items-center gap-1 text-xs">
                    <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">
                      {viewingProperty.rating}
                    </span>
                    <span className="text-muted-foreground">
                      ({viewingProperty.reviews})
                    </span>
                  </div>
                </div>
                <DialogDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPinIcon className="size-3.5" /> {viewingProperty.address}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 text-center text-xs">
                <div>
                  <span className="text-muted-foreground text-[11px]">
                    Bedrooms
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {viewingProperty.bedsCount} Beds
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">
                    Bathrooms
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    2 Baths
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">
                    Lease Term
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    12 Months
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-3 text-xs space-y-1">
                <span className="font-semibold text-foreground">
                  Included Amenities
                </span>
                <div className="flex flex-wrap gap-2 pt-1 text-muted-foreground">
                  <span className="rounded-md bg-muted px-2 py-0.5">
                    In-unit Washer/Dryer
                  </span>
                  <span className="rounded-md bg-muted px-2 py-0.5">
                    Central AC & Heating
                  </span>
                  <span className="rounded-md bg-muted px-2 py-0.5">
                    Pet Friendly
                  </span>
                  <span className="rounded-md bg-muted px-2 py-0.5">
                    Assigned Parking
                  </span>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingProperty(null)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const prop = viewingProperty;
                    setViewingProperty(null);
                    setApplyingProperty(prop);
                  }}
                  className="gap-1.5"
                >
                  <SparklesIcon className="size-3.5" />
                  <span>Start Application</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Start Rental Application Modal */}
      <Dialog
        open={Boolean(applyingProperty)}
        onOpenChange={(open) => !open && setApplyingProperty(null)}
      >
        <DialogContent className="sm:max-w-md">
          {applyingProperty && (
            <>
              <DialogHeader>
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-1">
                  <SendIcon className="size-4.5" />
                </div>
                <DialogTitle>Apply for {applyingProperty.name}</DialogTitle>
                <DialogDescription>
                  Submit your pre-qualification details directly to the property
                  management.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleApplySubmit}
                className="space-y-3 py-2 text-xs"
              >
                <div className="rounded-xl border bg-muted/40 p-3 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-foreground">
                      {applyingProperty.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {applyingProperty.address}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {applyingProperty.price}
                  </span>
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">
                    Desired Move-in Date
                  </label>
                  <Input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">
                    Notes for Landlord (Optional)
                  </label>
                  <Input
                    placeholder="e.g., 2 occupants, excellent credit history"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="rounded-lg bg-primary/5 p-3 text-muted-foreground flex items-center gap-2">
                  <CheckCircle2Icon className="size-4 text-primary shrink-0" />
                  <span>
                    Your verified tenant credentials will be shared securely.
                  </span>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setApplyingProperty(null)}
                    disabled={isApplying}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isApplying}
                    className="gap-1.5"
                  >
                    {isApplying ? "Submitting..." : "Submit Application"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
