"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Loader2,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import { useCreateJobRequest, clientJobsKeys } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";

// Common job categories
const JOB_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Masonry",
  "Roofing",
  "Flooring",
  "HVAC",
  "Landscaping",
  "General Repair",
  "Renovation",
  "Custom Furniture",
  "Metalwork",
  "Welding",
  "Cleaning",
  "Moving",
  "Other",
];

interface CreateJobRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artisanId: string;
  artisanName: string;
  conversationId?: string;
  onSuccess?: (jobId: string) => void;
}

export function CreateJobRequestDialog({
  open,
  onOpenChange,
  artisanId,
  artisanName,
  conversationId,
  onSuccess,
}: CreateJobRequestDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createJobMutation = useCreateJobRequest();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [clientBudget, setClientBudget] = useState("");
  const [requestedStartDate, setRequestedStartDate] = useState("");
  const [requestedEndDate, setRequestedEndDate] = useState("");
  const [depositPercent, setDepositPercent] = useState(30);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setCategory("");
      setLocation("");
      setClientBudget("");
      setRequestedStartDate("");
      setRequestedEndDate("");
      setDepositPercent(30);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.error("Title required", {
        description: "Please enter a job title.",
      });
      return;
    }

    if (!description.trim()) {
      toast.error("Description required", {
        description: "Please describe the work you need done.",
      });
      return;
    }

    try {
      const result = await createJobMutation.mutateAsync({
        artisanId,
        conversationId,
        title: title.trim(),
        description: description.trim(),
        category: category || undefined,
        location: location.trim() || undefined,
        clientBudget: clientBudget ? parseInt(clientBudget, 10) : undefined,
        requestedStartDate: requestedStartDate || undefined,
        requestedEndDate: requestedEndDate || undefined,
        depositPercent,
      });

      toast.success("Job Request Sent", {
        description: `Your job request has been sent to ${artisanName}.`,
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: clientJobsKeys.all });

      onOpenChange(false);

      // Call success callback or navigate to job
      if (onSuccess) {
        onSuccess(result.job.id);
      } else {
        router.push(`/client-dashboard/jobs/${result.job.id}`);
      }
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to create job request",
      });
    }
  };

  // Calculate minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Create Job Request
          </DialogTitle>
          <DialogDescription>
            Send a job request to <strong>{artisanName}</strong>. They will receive your request and can send you a quote.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Kitchen Sink Repair"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={createJobMutation.isPending}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the work you need done, including any specific requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={createJobMutation.isPending}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={createJobMutation.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {JOB_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="e.g., Westlands, Nairobi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={createJobMutation.isPending}
            />
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Budget (KES)
            </Label>
            <Input
              id="budget"
              type="number"
              placeholder="e.g., 5000"
              value={clientBudget}
              onChange={(e) => setClientBudget(e.target.value)}
              min="0"
              disabled={createJobMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              This helps the artisan understand your budget range
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Preferred Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={requestedStartDate}
                onChange={(e) => setRequestedStartDate(e.target.value)}
                min={today}
                disabled={createJobMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Preferred End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={requestedEndDate}
                onChange={(e) => setRequestedEndDate(e.target.value)}
                min={requestedStartDate || today}
                disabled={createJobMutation.isPending}
              />
            </div>
          </div>

          {/* Deposit Percentage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="depositPercent">Deposit Percentage</Label>
              <span className="text-sm font-medium">{depositPercent}%</span>
            </div>
            <Input
              id="depositPercent"
              type="range"
              value={depositPercent}
              onChange={(e) => setDepositPercent(parseInt(e.target.value, 10))}
              min={10}
              max={50}
              step={5}
              disabled={createJobMutation.isPending}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              The artisan will require this percentage as a deposit before starting work (10-50%)
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createJobMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createJobMutation.isPending || !title.trim() || !description.trim()}
            >
              {createJobMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Send Job Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
