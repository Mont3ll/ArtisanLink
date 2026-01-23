"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Loader2,
  Filter,
  Calendar,
  DollarSign,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useClientJobs, type ClientJob } from "@/lib/hooks";

// Status badge configuration
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  REQUESTED: { label: "Requested", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  QUOTED: { label: "Quote Received", variant: "secondary", icon: <AlertCircle className="h-3 w-3" /> },
  ACCEPTED: { label: "Accepted", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  DEPOSIT_PAID: { label: "Deposit Paid", variant: "default", icon: <DollarSign className="h-3 w-3" /> },
  IN_PROGRESS: { label: "In Progress", variant: "default", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  COMPLETED: { label: "Completed", variant: "secondary", icon: <CheckCircle2 className="h-3 w-3" /> },
  PAID: { label: "Paid", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  CANCELLED: { label: "Cancelled", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  DECLINED: { label: "Declined", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  DISPUTED: { label: "Disputed", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
};

// Job Card Component
function JobCard({ job }: { job: ClientJob }) {
  const router = useRouter();
  const config = statusConfig[job.status] || statusConfig.REQUESTED;
  
  const artisanInitials = job.artisan.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  const formatDate = (date: string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-KE", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "TBD";
    return `KES ${amount.toLocaleString()}`;
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30"
      onClick={() => router.push(`/client-dashboard/jobs/${job.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {job.title}
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
            <CardDescription className="line-clamp-1">
              {job.description}
            </CardDescription>
          </div>
          <Badge variant={config.variant} className="flex items-center gap-1">
            {config.icon}
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Artisan Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={job.artisan.profileImage || undefined} alt={job.artisan.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {artisanInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{job.artisan.name}</p>
            <p className="text-xs text-muted-foreground">{job.artisan.profession || "Artisan"}</p>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>
              {job.agreedPrice 
                ? formatCurrency(job.agreedPrice) 
                : job.clientBudget 
                  ? `Budget: ${formatCurrency(job.clientBudget)}`
                  : "Price TBD"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(job.requestedStartDate)}</span>
          </div>
        </div>

        {/* Latest Quote Info */}
        {job.latestQuote && job.status === "QUOTED" && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">Quote: {formatCurrency(job.latestQuote.amount)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Valid until: {formatDate(job.latestQuote.validUntil)}
            </p>
          </div>
        )}

        {/* Action Hint */}
        {(job.status === "QUOTED" || job.status === "ACCEPTED" || job.status === "COMPLETED") && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              {job.status === "QUOTED" && "Review and respond to quote"}
              {job.status === "ACCEPTED" && "Pay deposit to start work"}
              {job.status === "COMPLETED" && "Make final payment"}
            </span>
            <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
              Take Action
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function JobCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State
function EmptyState({ status }: { status: string | null }) {
  return (
    <div className="text-center py-12">
      <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-medium">No jobs found</h3>
      <p className="text-muted-foreground mt-2">
        {status 
          ? `You don't have any ${status.toLowerCase().replace("_", " ")} jobs.`
          : "You haven't created any job requests yet."}
      </p>
      <Button className="mt-4" asChild>
        <Link href="/client-dashboard/find-artisans">Find Artisans</Link>
      </Button>
    </div>
  );
}

export default function ClientJobsPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { data, isLoading, error } = useClientJobs(statusFilter);

  const jobs = data?.jobs || [];

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Jobs</h1>
          <p className="text-muted-foreground">
            Manage your job requests and track progress
          </p>
        </div>
        <Button asChild>
          <Link href="/client-dashboard/find-artisans">
            <User className="h-4 w-4 mr-2" />
            Find Artisans
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            <SelectItem value="REQUESTED">Requested</SelectItem>
            <SelectItem value="QUOTED">Quote Received</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="DEPOSIT_PAID">Deposit Paid</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="DECLINED">Declined</SelectItem>
          </SelectContent>
        </Select>
        
        {data?.pagination && (
          <span className="text-sm text-muted-foreground">
            {data.pagination.total} job{data.pagination.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load jobs. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {/* Jobs List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState status={statusFilter} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job: ClientJob) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={data.pagination.page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={data.pagination.page === data.pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
