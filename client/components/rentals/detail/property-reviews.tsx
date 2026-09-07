"use client";

import * as React from "react";
import { ShieldCheckIcon, StarIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useGetMeQuery,
  useGetPropertyReviewsQuery,
} from "@/state/api";

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`size-3.5 ${
            i < Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </span>
  );
}

export function PropertyReviewsSection({ propertyId }: { propertyId: string }) {
  const { data, isLoading, isError } = useGetPropertyReviewsQuery(propertyId);
  const { data: me } = useGetMeQuery();
  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");

  const reviews = data?.reviews ?? [];
  const myUserId = me?.user?.id;
  const myReview = reviews.find((r) => r.tenant?.user?.id === myUserId);
  const canSubmit = me?.user?.role === "TENANT" && !myReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReview({ propertyId, rating, comment }).unwrap();
      toast.success("Review submitted");
      setComment("");
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { error?: string } }).data?.error
          : undefined;
      toast.error(message ?? "Couldn't submit your review");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReview({ id, propertyId }).unwrap();
      toast.success("Review removed");
    } catch {
      toast.error("Couldn't remove your review");
    }
  };

  return (
    <div id="reviews-section" className="space-y-6 pt-6 border-t border-border/80 scroll-mt-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Resident Reviews & Ratings</span>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {data?.numberOfReviews ?? 0} reviews
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Feedback from tenants who have leased this property
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2.5 shadow-xs">
          <StarIcon className="size-6 fill-amber-400 text-amber-400" />
          <div>
            <div className="text-xl font-extrabold leading-tight text-foreground">
              {data?.averageRating != null ? Number(data.averageRating).toFixed(2) : "—"}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">
              Overall Score
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground">Couldn&apos;t load reviews.</p>
      ) : reviews.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground rounded-2xl border-dashed">
          No reviews yet — be the first tenant to review this property.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-foreground">
                    <span>{rev.tenant?.user?.name ?? "Verified tenant"}</span>
                    <span title="Verified Leaseholder" className="inline-flex">
                      <ShieldCheckIcon className="size-3.5 text-emerald-500 shrink-0" />
                    </span>
                  </div>
                  <Stars value={rev.rating} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {new Date(rev.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {rev.comment && (
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                )}
              </div>
              {myUserId && rev.tenant?.user?.id === myUserId && (
                <div className="mt-4 pt-3 border-t border-border/60 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(rev.id)}
                  >
                    <Trash2Icon className="size-3.5" />
                    Remove my review
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {canSubmit && (
        <Card className="p-4 sm:p-5 rounded-2xl">
          <h3 className="text-sm font-semibold text-foreground">Leave a review</h3>
          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="review-rating" className="text-xs font-semibold">
                Rating
              </Label>
              <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onClick={() => setRating(n)}
                    className="p-1"
                  >
                    <StarIcon
                      className={`size-6 ${
                        n <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="review-comment" className="text-xs font-semibold">
                Comment (optional)
              </Label>
              <Input
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What was it like living here?"
                maxLength={1000}
                className="h-10 text-sm"
              />
            </div>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit review"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
