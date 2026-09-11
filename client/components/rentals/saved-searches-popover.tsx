"use client";

import React, { useState, useEffect } from "react";
import {
  BookmarkIcon,
  BookmarkCheckIcon,
  PlusIcon,
  Trash2Icon,
  CheckIcon,
  FilterIcon,
  ArrowRightIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  getSavedSearches,
  saveSearch,
  deleteSavedSearch,
  formatFilterSummary,
  type SavedSearch,
} from "@/lib/saved-searches";
import type { FilterState } from "@/src/data/rentals-data";
import { toast } from "sonner";

interface SavedSearchesPopoverProps {
  currentFilters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  className?: string;
}

export function SavedSearchesControl({
  currentFilters,
  onApplyFilters,
  className = "",
}: SavedSearchesPopoverProps) {
  const [savedList, setSavedList] = useState<SavedSearch[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    setSavedList(getSavedSearches());
  }, []);

  const refreshList = () => {
    setSavedList(getSavedSearches());
  };

  const handleOpenSaveModal = () => {
    const summary = formatFilterSummary(currentFilters);
    setSearchName(summary !== "All Available Rentals" ? summary : "My Rental Search");
    setIsSaveModalOpen(true);
  };

  const handleSave = () => {
    if (!searchName.trim()) return;
    saveSearch(searchName.trim(), currentFilters);
    refreshList();
    setIsSaveModalOpen(false);
    toast.success("Search saved!", {
      description: `Saved "${searchName.trim()}" to your preferences.`,
    });
  };

  const handleApply = (s: SavedSearch) => {
    onApplyFilters(s.filters);
    setIsOpen(false);
    toast.success(`Applied search: ${s.name}`, {
      description: s.summary,
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    deleteSavedSearch(id);
    refreshList();
    toast.info(`Deleted saved search "${name}"`);
  };

  return (
    <>
      <div className={`flex items-center gap-1.5 ${className}`}>
        {/* Save Current Search Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleOpenSaveModal}
          className="h-8 gap-1.5 text-xs font-semibold hover:border-primary/50"
          title="Save current search criteria"
        >
          <BookmarkIcon className="size-3.5 text-primary" />
          <span className="hidden sm:inline">Save Search</span>
        </Button>

        {/* View Saved Searches Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="h-8 gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground relative"
          title="View saved searches"
        >
          <BookmarkCheckIcon className="size-3.5 text-muted-foreground" />
          <span className="hidden md:inline">Saved Searches</span>
          {savedList.length > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {savedList.length}
            </span>
          )}
        </Button>
      </div>

      {/* Saved Searches Drawer/Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookmarkCheckIcon className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Saved Searches</DialogTitle>
                <DialogDescription className="text-xs">
                  Re-apply your favorite filter preferences with one click.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-2.5 overflow-y-auto py-2 pr-1">
            {savedList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <BookmarkIcon className="size-8 mx-auto text-muted-foreground/60" />
                <p className="mt-2 text-sm font-semibold text-foreground">No saved searches yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Apply filters and click &quot;Save Search&quot; to bookmark criteria.
                </p>
              </div>
            ) : (
              savedList.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleApply(s)}
                  className="group flex items-center justify-between rounded-xl border border-border/80 bg-card p-3 transition-all hover:border-primary/50 hover:bg-muted/30 cursor-pointer shadow-2xs"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {s.name}
                      </h4>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">
                      {s.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs font-semibold gap-1"
                      onClick={() => handleApply(s)}
                    >
                      <span>Apply</span>
                      <ArrowRightIcon className="size-3" />
                    </Button>
                    <button
                      type="button"
                      aria-label="Delete saved search"
                      onClick={(e) => handleDelete(e, s.id, s.name)}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border/60 pt-3">
            <span className="text-xs text-muted-foreground">
              {savedList.length} search{savedList.length === 1 ? "" : "es"} stored locally
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenSaveModal}
              className="gap-1.5 text-xs"
            >
              <PlusIcon className="size-3.5" />
              <span>Save Current Criteria</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Search Naming Modal */}
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Save Current Search</DialogTitle>
            <DialogDescription className="text-xs">
              Give this filter combination a name so you can quickly find it again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Search Label</label>
              <Input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g. 2-Bed Luxury in Downtown"
                className="h-9 text-sm"
                autoFocus
              />
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs">
              <span className="font-semibold text-foreground block mb-0.5">Filter Summary:</span>
              <span className="text-muted-foreground">{formatFilterSummary(currentFilters)}</span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!searchName.trim()}
              className="gap-1.5"
            >
              <CheckIcon className="size-3.5" />
              <span>Save Search</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

