"use client";

import { useState, useMemo } from "react";
import {
  Star,
  Search,
  MessageSquare,
  Loader2,
  TrendingUp,
  TrendingDown,
  Users,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { useArtisanReviews, type Review } from "@/lib/hooks/use-artisan-reviews";
import { 
  DataNumber, 
  DataList, 
  StatCardWithSkeleton, 
  ReviewCardSkeleton 
} from "@/components/loading";

// Star Rating Display Component
function StarRating({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            rating >= star
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}

// Rating Breakdown Component
function RatingBreakdown({
  breakdown,
  total,
  isLoading,
}: {
  breakdown: Record<number, number>;
  total: number;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = breakdown[rating] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
          <div key={rating} className="flex items-center gap-2">
            <span className="text-sm w-12 flex items-center gap-1">
              {rating} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </span>
            <Progress value={isLoading ? 0 : percentage} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground w-8 text-right">
              {isLoading ? "-" : count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Review Card Component
function ReviewCard({
  review,
  onRespond,
}: {
  review: Review;
  onRespond: (review: Review) => void;
}) {
  const reviewDate = new Date(review.createdAt).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const clientInitials = review.client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {clientInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{review.client.name}</CardTitle>
              <CardDescription className="text-xs">{reviewDate}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-sm font-medium ml-1">{review.rating}/5</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        {/* Project Info */}
        {review.projectTitle && (
          <div className="text-sm">
            <span className="text-muted-foreground">Project: </span>
            <span className="font-medium">{review.projectTitle}</span>
            {review.projectCost && (
              <Badge variant="outline" className="ml-2">
                KES {review.projectCost.toLocaleString()}
              </Badge>
            )}
          </div>
        )}

        {/* Comment */}
        {review.comment ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            &ldquo;{review.comment}&rdquo;
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No written review provided
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Button variant="outline" size="sm" onClick={() => onRespond(review)}>
          <MessageSquare className="h-3 w-3 mr-1" />
          Respond
        </Button>
      </CardFooter>
    </Card>
  );
}

// Response Dialog
function ResponseDialog({
  open,
  onOpenChange,
  review,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: Review | null;
}) {
  const [response, setResponse] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review || !response.trim()) return;

    setIsSending(true);
    // In a real implementation, this would send the response via API
    // For now, we simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSending(false);
    setResponse("");
    onOpenChange(false);
  };

  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Respond to Review</DialogTitle>
          <DialogDescription>
            Send a thank you message to {review.client.name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Review Summary */}
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{review.client.name}</span>
              <StarRating rating={review.rating} size="sm" />
            </div>
            {review.comment && (
              <p className="text-sm text-muted-foreground">&ldquo;{review.comment}&rdquo;</p>
            )}
          </div>

          {/* Response Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Write your response..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {response.length}/500
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSending || !response.trim()}>
                {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send Response
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ArtisanReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // React Query hook
  const { data, isLoading } = useArtisanReviews({ sortBy });

  const artisan = data?.artisan;
  const reviews = data?.reviews ?? [];
  const ratingBreakdown = data?.ratingBreakdown ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 };

  // Filter reviews client-side for search and rating filter
  const filteredReviews = useMemo(() => {
    let filtered = reviews;

    // Apply rating filter
    if (filterRating !== "all") {
      const ratingNum = parseInt(filterRating, 10);
      filtered = filtered.filter((r) => r.rating === ratingNum);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((review) => {
        const clientName = review.client.name.toLowerCase();
        const projectTitle = review.projectTitle?.toLowerCase() || "";
        const comment = review.comment?.toLowerCase() || "";

        return (
          clientName.includes(query) ||
          projectTitle.includes(query) ||
          comment.includes(query)
        );
      });
    }

    return filtered;
  }, [reviews, searchQuery, filterRating]);

  // Handle respond
  const handleRespond = (review: Review) => {
    setSelectedReview(review);
    setResponseDialogOpen(true);
  };

  // Stats calculations
  const averageRating = artisan?.averageRating || 0;
  const totalReviews = pagination.total;
  const positiveReviews =
    (ratingBreakdown[4] || 0) + (ratingBreakdown[5] || 0);
  const positivePercentage =
    totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0;

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header - Always visible */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews Received</h1>
        <p className="text-muted-foreground">
          See what your clients are saying about your work
        </p>
      </div>

      {/* Stats Cards - Static labels visible, values show skeleton */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardWithSkeleton
          title="Average Rating"
          icon={<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
          isLoading={isLoading}
        >
          <div className="flex items-center gap-2">
            <DataNumber
              value={averageRating}
              isLoading={isLoading}
              format={(v) => Number(v).toFixed(1)}
              className="text-3xl font-bold"
            />
          </div>
        </StatCardWithSkeleton>

        <StatCardWithSkeleton
          title="Total Reviews"
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          isLoading={isLoading}
        >
          <DataNumber
            value={totalReviews}
            isLoading={isLoading}
            className="text-3xl font-bold"
          />
        </StatCardWithSkeleton>

        <StatCardWithSkeleton
          title="Positive (4-5 stars)"
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          isLoading={isLoading}
        >
          <DataNumber
            value={positivePercentage}
            isLoading={isLoading}
            format={(v) => `${v}%`}
            className="text-3xl font-bold"
          />
        </StatCardWithSkeleton>

        <StatCardWithSkeleton
          title="Need Improvement (1-2 stars)"
          icon={<TrendingDown className="h-5 w-5 text-orange-500" />}
          isLoading={isLoading}
        >
          <DataNumber
            value={(ratingBreakdown[1] || 0) + (ratingBreakdown[2] || 0)}
            isLoading={isLoading}
            className="text-3xl font-bold"
          />
        </StatCardWithSkeleton>
      </div>

      {/* Rating Breakdown - Static structure, values update */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <RatingBreakdown 
            breakdown={ratingBreakdown} 
            total={totalReviews} 
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Filters - Always visible and interactive */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
              <SelectItem value="4">4 stars</SelectItem>
              <SelectItem value="3">3 stars</SelectItem>
              <SelectItem value="2">2 stars</SelectItem>
              <SelectItem value="1">1 star</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as "recent" | "highest" | "lowest")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews List - Uses DataList for skeleton/content pattern */}
      <DataList
        items={filteredReviews}
        isLoading={isLoading}
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2"
        renderItem={(review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onRespond={handleRespond}
          />
        )}
        renderSkeleton={(i) => <ReviewCardSkeleton key={i} />}
        emptyState={
          <Card className="py-12 md:col-span-2">
            <CardContent className="text-center">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {reviews.length === 0 ? "No reviews yet" : "No matches found"}
              </h3>
              <p className="text-muted-foreground">
                {reviews.length === 0
                  ? "Complete projects to start receiving reviews from clients"
                  : "Try adjusting your search or filter criteria"}
              </p>
            </CardContent>
          </Card>
        }
      />

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Response Dialog */}
      <ResponseDialog
        open={responseDialogOpen}
        onOpenChange={setResponseDialogOpen}
        review={selectedReview}
      />
    </div>
  );
}
