import Image from "next/image";
import { StarIcon, ShieldCheckIcon, ThumbsUpIcon } from "lucide-react";
import { ReviewItem } from "@/src/data/rental-details-data";

interface ListingReviewsProps {
  overallRating: number;
  totalReviews: number;
  breakdown: {
    cleanliness: number;
    accuracy: number;
    communication: number;
    location: number;
    value: number;
  };
  reviews: ReviewItem[];
}

export function ListingReviews({
  overallRating,
  totalReviews,
  breakdown,
  reviews,
}: ListingReviewsProps) {
  const breakdownEntries = [
    { label: "Cleanliness", score: breakdown.cleanliness },
    { label: "Accuracy", score: breakdown.accuracy },
    { label: "Communication", score: breakdown.communication },
    { label: "Location", score: breakdown.location },
    { label: "Value for Money", score: breakdown.value },
  ];

  return (
    <div id="reviews-section" className="space-y-6 pt-6 border-t border-border/80 scroll-mt-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Resident Reviews & Ratings</span>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {totalReviews} reviews
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Authentic feedback from verified tenants who previously leased or currently reside here
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2.5 shadow-xs">
          <StarIcon className="size-6 fill-amber-400 text-amber-400" />
          <div>
            <div className="text-xl font-extrabold leading-tight text-foreground">
              {overallRating.toFixed(2)}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">
              Overall Score
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        {breakdownEntries.map((item) => {
          const percentage = (item.score / 5) * 100;
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-bold text-foreground">{item.score.toFixed(1)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual Tenant Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-full bg-muted shrink-0">
                    <Image
                      src={rev.authorAvatar}
                      alt={rev.authorName}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-foreground">
                      <span>{rev.authorName}</span>
                      {rev.verifiedTenant && (
                        <span title="Verified Leaseholder" className="inline-flex">
                          <ShieldCheckIcon className="size-3.5 text-emerald-500 shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {rev.stayDuration} · {rev.date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`size-3.5 ${
                        i < Math.floor(rev.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheckIcon className="size-3 text-emerald-500" />
                Verified Leaseholder Check
              </span>
              <button
                type="button"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ThumbsUpIcon className="size-3" />
                <span>Helpful</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
