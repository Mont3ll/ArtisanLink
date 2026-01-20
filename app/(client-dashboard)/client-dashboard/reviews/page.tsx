"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  useClientReviews,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  type ClientReview,
} from "@/lib/hooks";

// Star Rating Component
function StarRating({
  rating,
  onChange,
  readonly = false,
  size = "md",
}: {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={cn(
            "transition-colors",
            !readonly && "cursor-pointer hover:scale-110"
          )}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => onChange?.(star)}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors",
              (hoverRating || rating) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}

// Review Card Component
function ReviewCard({
  review,
  onEdit,
  onDelete,
  isDeleting,
}: {
  review: ClientReview;
  onEdit: (review: ClientReview) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const artisanName = `${review.profile.user.firstName} ${review.profile.user.lastName}`;
  const artisanInitials = `${review.profile.user.firstName[0]}${review.profile.user.lastName[0]}`;
  const reviewDate = new Date(review.createdAt).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className={cn(isDeleting && "opacity-50")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={review.profile.profileImage || undefined}
                alt={artisanName}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {artisanInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{artisanName}</CardTitle>
              <CardDescription>
                {review.profile.profession || "Artisan"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {review.isApproved ? (
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Approved
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-yellow-600 border-yellow-600"
              >
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} readonly size="sm" />
          <span className="text-sm font-medium">{review.rating}/5</span>
        </div>

        {/* Project Info */}
        {review.projectTitle && (
          <div className="text-sm">
            <span className="text-muted-foreground">Project: </span>
            <span className="font-medium">{review.projectTitle}</span>
            {review.projectCost && (
              <span className="text-muted-foreground ml-2">
                (KES {review.projectCost.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Comment */}
        {review.comment && (
          <p className="text-sm text-muted-foreground">{review.comment}</p>
        )}

        {/* Date */}
        <p className="text-xs text-muted-foreground">Reviewed on {reviewDate}</p>
      </CardContent>

      <CardFooter className="pt-3 border-t flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/client-dashboard/messages?artisan=${review.profile.id}`}>
            <MessageSquare className="h-3 w-3 mr-1" />
            Message
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(review)}
            disabled={isDeleting}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Trash2 className="h-3 w-3 mr-1" />
                )}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete your review for {artisanName}?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(review.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}

// Review Skeleton
function ReviewCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

// New/Edit Review Dialog
function ReviewDialog({
  open,
  onOpenChange,
  review,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: ClientReview | null;
  onSuccess: () => void;
}) {
  const [profileId, setProfileId] = useState(review?.profileId || "");
  const [rating, setRating] = useState(review?.rating || 0);
  const [comment, setComment] = useState(review?.comment || "");
  const [projectTitle, setProjectTitle] = useState(review?.projectTitle || "");
  const [projectCost, setProjectCost] = useState(
    review?.projectCost?.toString() || ""
  );
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();

  const isEdit = !!review;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setProfileId(review?.profileId || "");
      setRating(review?.rating || 0);
      setComment(review?.comment || "");
      setProjectTitle(review?.projectTitle || "");
      setProjectCost(review?.projectCost?.toString() || "");
      setError(null);
    }
  }, [open, review]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEdit && !profileId.trim()) {
      setError("Artisan profile ID is required");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars");
      return;
    }

    setError(null);

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: review.id,
          data: {
            rating,
            comment: comment.trim() || undefined,
            projectTitle: projectTitle.trim() || undefined,
            projectCost: projectCost ? parseFloat(projectCost) : undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          profileId: profileId.trim(),
          rating,
          comment: comment.trim() || undefined,
          projectTitle: projectTitle.trim() || undefined,
          projectCost: projectCost ? parseFloat(projectCost) : undefined,
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save review");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Review" : "Write a Review"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your review for this artisan"
              : "Share your experience with an artisan"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="profileId">Artisan Profile ID</Label>
              <Input
                id="profileId"
                placeholder="Enter the artisan's profile ID"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You can find this on the artisan&apos;s profile page
              </p>
            </div>
          )}

          {isEdit && review && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.profile.profileImage || undefined} />
                <AvatarFallback>
                  {review.profile.user.firstName[0]}
                  {review.profile.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {review.profile.user.firstName} {review.profile.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {review.profile.profession || "Artisan"}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-3">
              <StarRating rating={rating} onChange={setRating} size="lg" />
              {rating > 0 && (
                <span className="text-sm text-muted-foreground">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectTitle">Project Title (optional)</Label>
            <Input
              id="projectTitle"
              placeholder="e.g., Kitchen renovation"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectCost">Project Cost in KES (optional)</Label>
            <Input
              id="projectCost"
              type="number"
              placeholder="e.g., 50000"
              value={projectCost}
              onChange={(e) => setProjectCost(e.target.value)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Your Review (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this artisan..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/2000
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
            <Button type="submit" disabled={isSaving || rating === 0}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Update Review" : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ClientReview | null>(null);

  const { data, isLoading, isError, refetch } = useClientReviews({ page, limit: 20 });
  const deleteMutation = useDeleteReview();

  // Filter reviews based on search (client-side)
  const filteredReviews = useMemo(() => {
    if (!data?.reviews) return [];
    if (!searchQuery.trim()) return data.reviews;

    const query = searchQuery.toLowerCase();
    return data.reviews.filter((review) => {
      const artisanName =
        `${review.profile.user.firstName} ${review.profile.user.lastName}`.toLowerCase();
      const profession = review.profile.profession?.toLowerCase() || "";
      const projectTitle = review.projectTitle?.toLowerCase() || "";
      const comment = review.comment?.toLowerCase() || "";

      return (
        artisanName.includes(query) ||
        profession.includes(query) ||
        projectTitle.includes(query) ||
        comment.includes(query)
      );
    });
  }, [data?.reviews, searchQuery]);

  // Handle edit
  const handleEdit = (review: ClientReview) => {
    setEditingReview(review);
    setDialogOpen(true);
  };

  // Handle new review
  const handleNewReview = () => {
    setEditingReview(null);
    setDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  // Stats calculations
  const reviews = data?.reviews || [];
  const totalReviews = data?.pagination.total || 0;
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
  const pendingReviews = reviews.filter((r) => !r.isApproved).length;

  // Error state
  if (isError) {
    return (
      <div className="px-4 lg:px-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Failed to load reviews</h2>
            <p className="text-muted-foreground mb-4">There was an error loading your reviews.</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews Given</h1>
          <p className="text-muted-foreground">
            Manage your reviews for artisans
          </p>
        </div>
        <Button onClick={handleNewReview}>
          <Plus className="h-4 w-4 mr-2" />
          Write a Review
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Reviews</div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalReviews}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">Average Rating</div>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {averageRating.toFixed(1)}
                </span>
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">Pending Approval</div>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{pendingReviews}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search reviews..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {reviews.length === 0 ? "No reviews yet" : "No matches found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {reviews.length === 0
                ? "Share your experience by writing a review for an artisan"
                : "Try adjusting your search query"}
            </p>
            {reviews.length === 0 && (
              <Button onClick={handleNewReview}>
                <Plus className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === review.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Review Dialog */}
      <ReviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        review={editingReview}
        onSuccess={() => {
          // Dialog handles closing itself
        }}
      />
    </div>
  );
}
