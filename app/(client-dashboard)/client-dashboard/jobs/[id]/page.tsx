"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  Loader2,
  CreditCard,
  FileText,
  Package,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
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
  DialogTrigger,
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  useClientJobDetails,
  useAcceptQuote,
  useDeclineQuote,
  useCancelJob,
  useCurrentUser,
  type ClientJobDetails,
} from "@/lib/hooks";
import {
  DEPOSIT_CONFIG,
  getCategoryInfo,
} from "@/lib/constants/quote-categories";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Status badge configuration
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; color: string }> = {
  REQUESTED: { label: "Requested", variant: "outline", icon: <Clock className="h-4 w-4" />, color: "text-gray-500" },
  QUOTED: { label: "Quote Received", variant: "secondary", icon: <AlertCircle className="h-4 w-4" />, color: "text-yellow-500" },
  ACCEPTED: { label: "Accepted", variant: "default", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-blue-500" },
  DEPOSIT_PAID: { label: "Deposit Paid", variant: "default", icon: <DollarSign className="h-4 w-4" />, color: "text-green-500" },
  IN_PROGRESS: { label: "In Progress", variant: "default", icon: <Loader2 className="h-4 w-4 animate-spin" />, color: "text-blue-500" },
  COMPLETED: { label: "Completed", variant: "secondary", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-500" },
  PAID: { label: "Paid", variant: "default", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-500" },
  CANCELLED: { label: "Cancelled", variant: "destructive", icon: <XCircle className="h-4 w-4" />, color: "text-red-500" },
  DECLINED: { label: "Declined", variant: "destructive", icon: <XCircle className="h-4 w-4" />, color: "text-red-500" },
  DISPUTED: { label: "Disputed", variant: "destructive", icon: <AlertCircle className="h-4 w-4" />, color: "text-red-500" },
};

export default function ClientJobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { data, isLoading, error } = useClientJobDetails(jobId);
  const { data: currentUserData } = useCurrentUser();
  const acceptQuoteMutation = useAcceptQuote();
  const declineQuoteMutation = useDeclineQuote();
  const cancelJobMutation = useCancelJob();

  const [declineNotes, setDeclineNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  const [expandedQuotes, setExpandedQuotes] = useState<Set<string>>(new Set());

  const job = data?.job;
  const config = job ? (statusConfig[job.status] || statusConfig.REQUESTED) : statusConfig.REQUESTED;
  const userPhone = currentUserData?.user?.phone || null;

  const formatDate = (date: string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-KE", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "TBD";
    return `KES ${amount.toLocaleString()}`;
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await acceptQuoteMutation.mutateAsync({ jobId, quoteId });
      toast.success("Quote Accepted", {
        description: "You can now proceed with the deposit payment.",
      });
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to accept quote",
      });
    }
  };

  const handleDeclineQuote = async (quoteId: string) => {
    try {
      await declineQuoteMutation.mutateAsync({ jobId, quoteId, clientNotes: declineNotes });
      setIsDeclineDialogOpen(false);
      setDeclineNotes("");
      toast.success("Quote Declined", {
        description: "The artisan will be notified of your feedback.",
      });
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to decline quote",
      });
    }
  };

  const handleCancelJob = async () => {
    try {
      await cancelJobMutation.mutateAsync({ jobId, cancelReason });
      toast.success("Job Cancelled", {
        description: "The job has been cancelled.",
      });
      router.push("/client-dashboard/jobs");
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to cancel job",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 lg:px-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold">Job Not Found</h2>
            <p className="text-muted-foreground mt-2">
              The job you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/client-dashboard/jobs">Back to Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const artisanInitials = job.artisan.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  const activeQuote = job.quotes.find((q) => q.status === "SENT");
  const canCancel = ["REQUESTED", "QUOTED", "ACCEPTED"].includes(job.status) && !job.depositPaid;

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Cash-only mode: Payment dialogs removed */}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/client-dashboard/jobs">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
              <Badge variant={config.variant} className="flex items-center gap-1">
                {config.icon}
                {config.label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Created {formatDate(job.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {job.conversationId && (
            <Button variant="outline" asChild>
              <Link href={`/client-dashboard/messages/${job.conversationId}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Link>
            </Button>
          )}
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Cancel Job</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this job?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The artisan will be notified.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea
                  placeholder="Reason for cancellation (optional)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Job</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelJob}
                    disabled={cancelJobMutation.isPending}
                  >
                    {cancelJobMutation.isPending ? "Cancelling..." : "Cancel Job"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-sm">{job.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {job.category && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Category</h4>
                    <p className="text-sm">{job.category}</p>
                  </div>
                )}
                {job.location && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </p>
                  </div>
                )}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Your Budget</h4>
                  <p className="text-sm font-medium">{formatCurrency(job.clientBudget)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Agreed Price</h4>
                  <p className="text-sm font-medium">{formatCurrency(job.agreedPrice)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Requested Start</h4>
                  <p className="text-sm">{formatDate(job.requestedStartDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Scheduled Start</h4>
                  <p className="text-sm">{formatDate(job.scheduledStartDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quotes Section */}
          {job.quotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quotes</CardTitle>
                <CardDescription>
                  {job.quotes.length} quote{job.quotes.length !== 1 ? "s" : ""} received
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.quotes.map((quote) => {
                  const isExpanded = expandedQuotes.has(quote.id);
                  const hasLineItems = quote.lineItems && quote.lineItems.length > 0;
                  const showHighDepositWarning = quote.requestedDepositPercent && 
                    quote.requestedDepositPercent > DEPOSIT_CONFIG.STANDARD_MAX_PERCENT;
                  
                  // Calculate materials cost for display
                  const materialsCost = hasLineItems 
                    ? quote.lineItems.filter((item: { category: string }) => item.category === "MATERIALS")
                        .reduce((sum: number, item: { total: number }) => sum + item.total, 0)
                    : 0;
                  const materialPercentage = quote.amount > 0 ? (materialsCost / quote.amount) * 100 : 0;

                  return (
                    <div
                      key={quote.id}
                      className={`p-4 rounded-lg border ${quote.status === "SENT" ? "border-primary bg-primary/5" : quote.status === "ACCEPTED" ? "border-green-500 bg-green-50" : "bg-muted/30"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{formatCurrency(quote.amount)}</span>
                            <Badge variant={quote.status === "ACCEPTED" ? "default" : quote.status === "DECLINED" ? "destructive" : quote.status === "REVISION_REQUESTED" ? "outline" : "secondary"}>
                              {quote.status === "SENT" ? "Pending" : quote.status === "REVISION_REQUESTED" ? "Revision Requested" : quote.status}
                            </Badge>
                            <Badge variant="outline">Round {quote.round}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            {quote.estimatedDuration && (
                              <p className="text-sm text-muted-foreground">
                                Est. Duration: {quote.estimatedDuration}
                              </p>
                            )}
                            {quote.requestedDepositPercent && (
                              <p className="text-sm text-muted-foreground">
                                Deposit: {quote.requestedDepositPercent}%
                              </p>
                            )}
                          </div>
                        </div>
                        {quote.validUntil && (
                          <span className="text-xs text-muted-foreground">
                            Valid until {formatDate(quote.validUntil)}
                          </span>
                        )}
                      </div>

                      {/* High Deposit Explanation */}
                      {showHighDepositWarning && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="font-medium text-blue-800">Higher Deposit Requested</p>
                              <p className="text-blue-700 mt-1">
                                This job has significant material costs ({materialPercentage.toFixed(0)}% of total = {formatCurrency(materialsCost)}). 
                                The artisan needs {quote.requestedDepositPercent}% upfront to purchase materials.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Line Items Breakdown */}
                      {hasLineItems && (
                        <Collapsible 
                          open={isExpanded} 
                          onOpenChange={(open) => {
                            const newSet = new Set(expandedQuotes);
                            if (open) {
                              newSet.add(quote.id);
                            } else {
                              newSet.delete(quote.id);
                            }
                            setExpandedQuotes(newSet);
                          }}
                          className="mt-3"
                        >
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full justify-between p-2 h-auto">
                              <span className="text-sm flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                View Cost Breakdown ({quote.lineItems.length} items)
                              </span>
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-2 space-y-2 border rounded-md p-3 bg-background">
                              {quote.lineItems.map((item: {
                                id: string;
                                category: string;
                                name: string;
                                quantity: number;
                                unit?: string;
                                unitPrice: number;
                                total: number;
                                isSystemGenerated: boolean;
                              }) => {
                                const catInfo = getCategoryInfo(item.category);
                                return (
                                  <div key={item.id} className="flex justify-between items-start text-sm">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs font-normal">
                                          {catInfo?.name || item.category}
                                        </Badge>
                                        <span className="font-medium">{item.name}</span>
                                        {item.isSystemGenerated && (
                                          <Badge variant="secondary" className="text-xs">Auto</Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {item.quantity} {item.unit || 'unit'}{item.quantity !== 1 ? 's' : ''} × {formatCurrency(item.unitPrice)}
                                      </p>
                                    </div>
                                    <span className={`font-medium ${item.total < 0 ? 'text-green-600' : ''}`}>
                                      {item.total < 0 ? '-' : ''}{formatCurrency(Math.abs(item.total))}
                                    </span>
                                  </div>
                                );
                              })}
                              <Separator className="my-2" />
                              <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>{formatCurrency(quote.amount)}</span>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      <p className="text-sm mt-3">{quote.description}</p>
                      {quote.paymentTerms && (
                        <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
                          <h5 className="font-medium mb-1">Payment Terms</h5>
                          <p className="text-muted-foreground">{quote.paymentTerms}</p>
                        </div>
                      )}
                      {quote.clientResponse && (
                        <div className="mt-3 p-3 bg-yellow-50 border-l-2 border-yellow-400 text-sm">
                          <h5 className="font-medium mb-1">Your Feedback</h5>
                          <p className="text-muted-foreground">{quote.clientResponse}</p>
                        </div>
                      )}
                      {quote.status === "SENT" && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={() => handleAcceptQuote(quote.id)}
                            disabled={acceptQuoteMutation.isPending}
                          >
                            {acceptQuoteMutation.isPending ? "Accepting..." : "Accept Quote"}
                          </Button>
                          <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline">
                                {quote.round === 1 ? "Request Revision" : "Decline"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  {quote.round === 1 ? "Request Quote Revision" : "Decline Quote"}
                                </DialogTitle>
                                <DialogDescription>
                                  {quote.round === 1
                                    ? "Provide feedback so the artisan can send a revised quote."
                                    : "This is the final quote. Declining will end the job."}
                                </DialogDescription>
                              </DialogHeader>
                              {quote.round === 2 && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-yellow-800">
                                      This is the artisan&apos;s revised quote. Declining will end this job request.
                                    </p>
                                  </div>
                                </div>
                              )}
                              <Textarea
                                placeholder="Your feedback or reason..."
                                value={declineNotes}
                                onChange={(e) => setDeclineNotes(e.target.value)}
                                rows={4}
                              />
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDeclineDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button
                                  variant={quote.round === 1 ? "default" : "destructive"}
                                  onClick={() => handleDeclineQuote(quote.id)}
                                  disabled={declineQuoteMutation.isPending}
                                >
                                  {declineQuoteMutation.isPending
                                    ? "Submitting..."
                                    : quote.round === 1
                                      ? "Request Revision"
                                      : "Decline Quote"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                      {quote.status === "SENT" && quote.round === 1 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          You can request 1 revision before the quote becomes final.
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Payments Section */}
          {job.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {job.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{payment.type} Payment</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.paidAt ? formatDate(payment.paidAt) : "Pending"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(payment.amount)}</p>
                        <Badge variant={payment.status === "COMPLETED" ? "default" : payment.status === "FAILED" ? "destructive" : "secondary"}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Info - Cash Only Mode */}
          {job.status === "ACCEPTED" && !job.depositPaid && job.depositAmount && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <DollarSign className="h-5 w-5" />
                  Deposit Required
                </CardTitle>
                <CardDescription className="text-amber-700 dark:text-amber-300">
                  Pay the deposit to start the job
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span>Deposit Amount ({job.depositPercent}%)</span>
                  <span className="text-xl font-bold">{formatCurrency(job.depositAmount)}</span>
                </div>
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-4 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Cash Payment Only</p>
                      <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                        During this testing phase, all payments are made directly in cash to the artisan. 
                        Please coordinate with your artisan to arrange payment of{" "}
                        <strong>{formatCurrency(job.depositAmount)}</strong> before work begins.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {job.status === "COMPLETED" && !job.finalPaid && job.agreedPrice && job.depositAmount && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <DollarSign className="h-5 w-5" />
                  Final Payment
                </CardTitle>
                <CardDescription className="text-amber-700 dark:text-amber-300">
                  Complete the final payment for this job
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span>Remaining Amount</span>
                  <span className="text-xl font-bold">{formatCurrency(job.agreedPrice - job.depositAmount)}</span>
                </div>
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-4 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Cash Payment Only</p>
                      <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                        During this testing phase, all payments are made directly in cash to the artisan.
                        Please pay the remaining <strong>{formatCurrency(job.agreedPrice - job.depositAmount)}</strong> directly to your artisan to complete this job.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Artisan Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Artisan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={job.artisan.profileImage || undefined} alt={job.artisan.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {artisanInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{job.artisan.name}</h3>
                  <p className="text-sm text-muted-foreground">{job.artisan.profession || "Artisan"}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{job.artisan.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                {job.artisan.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{job.artisan.email}</span>
                  </div>
                )}
                {job.artisan.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{job.artisan.phone}</span>
                  </div>
                )}
                {job.artisan.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.artisan.location}</span>
                  </div>
                )}
              </div>
              <Badge variant={job.artisan.isAvailable ? "default" : "secondary"} className="w-full justify-center">
                {job.artisan.isAvailable ? "Available" : "Currently Busy"}
              </Badge>
            </CardContent>
          </Card>

          {/* Conversation Link */}
          {job.conversationId && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Related Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/client-dashboard/messages/${job.conversationId}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Conversation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineItem
                  icon={<FileText className="h-4 w-4" />}
                  label="Job Requested"
                  date={job.createdAt}
                  completed
                />
                <TimelineItem
                  icon={<Clock className="h-4 w-4" />}
                  label="Quote Received"
                  date={job.quotes[0]?.createdAt}
                  completed={job.quotes.length > 0}
                />
                <TimelineItem
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  label="Quote Accepted"
                  completed={["ACCEPTED", "DEPOSIT_PAID", "IN_PROGRESS", "COMPLETED", "PAID"].includes(job.status)}
                />
                <TimelineItem
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Deposit Paid"
                  date={job.depositPaidAt}
                  completed={job.depositPaid}
                />
                <TimelineItem
                  icon={<Loader2 className="h-4 w-4" />}
                  label="Work Started"
                  date={job.startedAt}
                  completed={["IN_PROGRESS", "COMPLETED", "PAID"].includes(job.status)}
                />
                <TimelineItem
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  label="Completed"
                  date={job.completedAt}
                  completed={["COMPLETED", "PAID"].includes(job.status)}
                />
                <TimelineItem
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Final Payment"
                  date={job.finalPaidAt}
                  completed={job.status === "PAID"}
                  isLast
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Timeline Item Component
function TimelineItem({
  icon,
  label,
  date,
  completed,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  date?: string | null;
  completed?: boolean;
  isLast?: boolean;
}) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`p-2 rounded-full ${completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {icon}
        </div>
        {!isLast && <div className={`w-px h-full min-h-[20px] ${completed ? "bg-primary" : "bg-muted"}`} />}
      </div>
      <div className="pb-4">
        <p className={`text-sm font-medium ${completed ? "" : "text-muted-foreground"}`}>{label}</p>
        {date && <p className="text-xs text-muted-foreground">{formatDate(date)}</p>}
      </div>
    </div>
  );
}
