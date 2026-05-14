"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Loader2,
  CreditCard,
  FileText,
  Play,
  CheckCheck,
  Plus,
  Trash2,
  Pencil,
  Package,
  Hammer,
  Wrench,
  Truck,
  Droplets,
  ClipboardList,
  MoreHorizontal,
  AlertTriangle,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  useArtisanJobDetails,
  useCreateQuote,
  useDeclineJob,
  useStartJob,
  useCompleteJob,
  QuoteLineItemInput,
} from "@/lib/hooks";
import {
  QUOTE_LINE_ITEM_CATEGORIES,
  DEPOSIT_CONFIG,
  calculateMaxDeposit,
  getDepositTierDescription,
  getCategoryInfo,
} from "@/lib/constants/quote-categories";

// Category icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  LABOR: <Hammer className="h-4 w-4" />,
  MATERIALS: <Package className="h-4 w-4" />,
  EQUIPMENT: <Wrench className="h-4 w-4" />,
  TRANSPORT: <Truck className="h-4 w-4" />,
  CONSUMABLES: <Droplets className="h-4 w-4" />,
  OPERATION_COST: <ClipboardList className="h-4 w-4" />,
  OTHER: <MoreHorizontal className="h-4 w-4" />,
};

// Status badge configuration
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; color: string }> = {
  REQUESTED: { label: "New Request", variant: "outline", icon: <Clock className="h-4 w-4" />, color: "text-gray-500" },
  QUOTED: { label: "Quote Sent", variant: "secondary", icon: <FileText className="h-4 w-4" />, color: "text-yellow-500" },
  ACCEPTED: { label: "Accepted", variant: "default", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-600" },
  DEPOSIT_PAID: { label: "Deposit Paid", variant: "default", icon: <DollarSign className="h-4 w-4" />, color: "text-green-500" },
  IN_PROGRESS: { label: "In Progress", variant: "default", icon: <Loader2 className="h-4 w-4 animate-spin" />, color: "text-emerald-600" },
  COMPLETED: { label: "Completed", variant: "secondary", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-500" },
  PAID: { label: "Paid", variant: "default", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-500" },
  CANCELLED: { label: "Cancelled", variant: "destructive", icon: <XCircle className="h-4 w-4" />, color: "text-red-500" },
  DECLINED: { label: "Declined", variant: "destructive", icon: <XCircle className="h-4 w-4" />, color: "text-red-500" },
  DISPUTED: { label: "Disputed", variant: "destructive", icon: <AlertCircle className="h-4 w-4" />, color: "text-red-500" },
};

// Line item type for the form
interface LineItemFormData {
  id: string;
  category: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export default function ArtisanJobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { data, isLoading, error } = useArtisanJobDetails(jobId);
  const createQuoteMutation = useCreateQuote();
  const declineJobMutation = useDeclineJob();
  const startJobMutation = useStartJob();
  const completeJobMutation = useCompleteJob();

  // Quote form state
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [lineItems, setLineItems] = useState<LineItemFormData[]>([]);
  const [finalAmount, setFinalAmount] = useState("");
  const [depositPercent, setDepositPercent] = useState(30);
  const [quoteDescription, setQuoteDescription] = useState("");
  const [quoteDuration, setQuoteDuration] = useState("");
  const [quoteTerms, setQuoteTerms] = useState("");
  const [quoteValidDays, setQuoteValidDays] = useState("7");

  // Add/Edit line item dialog state
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemUnit, setItemUnit] = useState("");
  const [itemUnitPrice, setItemUnitPrice] = useState("");

  // Decline form state
  const [declineReason, setDeclineReason] = useState("");

  const job = data?.job;
  const config = job ? (statusConfig[job.status] || statusConfig.REQUESTED) : statusConfig.REQUESTED;
  
  // Get the latest quote for revision pre-population
  const latestQuote = job?.quotes[0];
  const revisionRequested = latestQuote?.status === "REVISION_REQUESTED";

  // Pre-populate form when opening dialog for revision
  const handleOpenQuoteDialog = (open: boolean) => {
    setIsQuoteDialogOpen(open);
    
    // If opening and this is a revision, pre-populate with previous quote data
    if (open && revisionRequested && latestQuote) {
      // Filter out system-generated items (Miscellaneous, Discount)
      const previousLineItems = latestQuote.lineItems
        .filter(item => !item.isSystemGenerated)
        .map(item => ({
          id: crypto.randomUUID(), // New ID for the form
          category: item.category,
          name: item.name,
          description: item.description || "",
          quantity: item.quantity,
          unit: item.unit || "",
          unitPrice: item.unitPrice,
        }));
      
      setLineItems(previousLineItems);
      setFinalAmount(latestQuote.amount.toString());
      setDepositPercent(latestQuote.requestedDepositPercent || 30);
      setQuoteDescription(latestQuote.description || "");
      setQuoteDuration(latestQuote.estimatedDuration || "");
      setQuoteTerms(latestQuote.paymentTerms || "");
    } else if (!open) {
      // Reset form when closing
      setLineItems([]);
      setFinalAmount("");
      setDepositPercent(30);
      setQuoteDescription("");
      setQuoteDuration("");
      setQuoteTerms("");
      setQuoteValidDays("7");
    }
  };

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const materialsCost = lineItems
      .filter(item => item.category === "MATERIALS")
      .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    const finalAmountNum = parseFloat(finalAmount) || subtotal;
    const maxDeposit = calculateMaxDeposit(materialsCost, finalAmountNum);
    const materialPercentage = finalAmountNum > 0 ? (materialsCost / finalAmountNum) * 100 : 0;
    const depositTierDescription = getDepositTierDescription(maxDeposit);
    const depositAmount = (finalAmountNum * depositPercent) / 100;
    
    return {
      subtotal,
      materialsCost,
      finalAmountNum,
      maxDeposit,
      materialPercentage,
      depositTierDescription,
      depositAmount,
      difference: finalAmountNum - subtotal,
    };
  }, [lineItems, finalAmount, depositPercent]);

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
    if (amount === null || amount === undefined) return "TBD";
    return `KES ${amount.toLocaleString()}`;
  };

  // Calculate urgency for timeframe
  const getTimeframeUrgency = () => {
    if (!job?.requestedStartDate) return null;
    const startDate = new Date(job.requestedStartDate);
    const today = new Date();
    const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilStart < 0) return { level: "overdue", days: Math.abs(daysUntilStart), message: "Start date has passed" };
    if (daysUntilStart <= 3) return { level: "urgent", days: daysUntilStart, message: `Only ${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''} until requested start` };
    if (daysUntilStart <= 7) return { level: "soon", days: daysUntilStart, message: `${daysUntilStart} days until requested start` };
    return { level: "normal", days: daysUntilStart, message: `${daysUntilStart} days until requested start` };
  };

  const handleAddLineItem = () => {
    if (!selectedCategory || !itemName || !itemQuantity || !itemUnitPrice) {
      toast.error("Missing information", {
        description: "Please fill in category, name, quantity, and unit price.",
      });
      return;
    }

    if (editingItemId) {
      // Update existing item
      setLineItems(lineItems.map(item => 
        item.id === editingItemId
          ? {
              ...item,
              category: selectedCategory,
              name: itemName,
              description: itemDescription,
              quantity: parseFloat(itemQuantity),
              unit: itemUnit,
              unitPrice: parseFloat(itemUnitPrice),
            }
          : item
      ));
    } else {
      // Add new item
      const newItem: LineItemFormData = {
        id: crypto.randomUUID(),
        category: selectedCategory,
        name: itemName,
        description: itemDescription,
        quantity: parseFloat(itemQuantity),
        unit: itemUnit,
        unitPrice: parseFloat(itemUnitPrice),
      };

      setLineItems([...lineItems, newItem]);
      
      // Update final amount to match new subtotal if not manually set
      if (!finalAmount) {
        const newSubtotal = [...lineItems, newItem].reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        setFinalAmount(newSubtotal.toString());
      }
    }
    
    // Reset form and close dialog
    resetItemForm();
    setIsAddItemDialogOpen(false);
  };

  const resetItemForm = () => {
    setEditingItemId(null);
    setSelectedCategory("");
    setItemName("");
    setItemDescription("");
    setItemQuantity("1");
    setItemUnit("");
    setItemUnitPrice("");
  };

  const handleEditLineItem = (item: LineItemFormData) => {
    setEditingItemId(item.id);
    setSelectedCategory(item.category);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemQuantity(item.quantity.toString());
    setItemUnit(item.unit);
    setItemUnitPrice(item.unitPrice.toString());
    setIsAddItemDialogOpen(true);
  };

  const handleCloseItemDialog = () => {
    resetItemForm();
    setIsAddItemDialogOpen(false);
  };

  const handleRemoveLineItem = (id: string) => {
    const updated = lineItems.filter(item => item.id !== id);
    setLineItems(updated);
    
    // Update final amount
    const newSubtotal = updated.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    if (parseFloat(finalAmount) === calculations.subtotal) {
      setFinalAmount(newSubtotal.toString());
    }
  };

  const handleCreateQuote = async () => {
    if (lineItems.length === 0) {
      toast.error("No line items", {
        description: "Please add at least one line item to your quote.",
      });
      return;
    }

    if (!finalAmount || parseFloat(finalAmount) <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid final amount.",
      });
      return;
    }

    if (!quoteDescription.trim()) {
      toast.error("Missing description", {
        description: "Please provide a description for your quote.",
      });
      return;
    }

    // Convert line items to API format
    const lineItemsInput: QuoteLineItemInput[] = lineItems.map(item => ({
      category: item.category,
      name: item.name,
      description: item.description || undefined,
      quantity: item.quantity,
      unit: item.unit || undefined,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    try {
      await createQuoteMutation.mutateAsync({
        jobId,
        amount: parseFloat(finalAmount),
        description: quoteDescription.trim(),
        lineItems: lineItemsInput,
        requestedDepositPercent: depositPercent,
        estimatedDuration: quoteDuration || undefined,
        paymentTerms: quoteTerms || undefined,
        validDays: parseInt(quoteValidDays) || 7,
      });
      
      // Reset form by closing dialog (handler will reset state)
      handleOpenQuoteDialog(false);
      
      toast.success("Quote Sent", {
        description: "The client will be notified of your quote.",
      });
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to send quote",
      });
    }
  };

  const handleDeclineJob = async () => {
    try {
      await declineJobMutation.mutateAsync({ jobId, declineReason });
      toast.success("Job Declined", {
        description: "The client will be notified.",
      });
      router.push("/artisan-dashboard/jobs");
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to decline job",
      });
    }
  };

  const handleStartJob = async () => {
    try {
      await startJobMutation.mutateAsync({ jobId });
      toast.success("Job Started", {
        description: "You can now track your progress.",
      });
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to start job",
      });
    }
  };

  const handleCompleteJob = async () => {
    try {
      await completeJobMutation.mutateAsync({ jobId });
      toast.success("Job Completed", {
        description: "Awaiting final payment from client.",
      });
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to complete job",
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
              <Link href="/artisan-dashboard/jobs">Back to Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clientInitials = job.client.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  const canDecline = ["REQUESTED"].includes(job.status);
  const canQuote = job.status === "REQUESTED" || (job.status === "QUOTED" && job.quotes.some(q => q.status === "REVISION_REQUESTED"));
  const canStart = job.status === "DEPOSIT_PAID";
  const canComplete = job.status === "IN_PROGRESS";
  const timeframeUrgency = getTimeframeUrgency();

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/artisan-dashboard/jobs">
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
              Received {formatDate(job.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {job.conversationId && (
            <Button variant="outline" asChild>
              <Link href={`/artisan-dashboard/messages/${job.conversationId}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Client
              </Link>
            </Button>
          )}
          {canDecline && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Decline Job</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Decline this job request?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The client will be notified that you declined their request.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea
                  placeholder="Reason for declining (optional)"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeclineJob}
                    disabled={declineJobMutation.isPending}
                  >
                    {declineJobMutation.isPending ? "Declining..." : "Decline Job"}
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
          {/* Timeframe Section - Only show if dates are set */}
          {(job.requestedStartDate || job.requestedEndDate) && (
            <Card className={timeframeUrgency?.level === "urgent" || timeframeUrgency?.level === "overdue" ? "border-orange-500" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-5 w-5" />
                  Client&apos;s Requested Timeframe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Start Date</h4>
                    <p className="text-sm font-medium">{formatDate(job.requestedStartDate)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">End Date</h4>
                    <p className="text-sm font-medium">{formatDate(job.requestedEndDate)}</p>
                  </div>
                </div>
                {timeframeUrgency && (timeframeUrgency.level === "urgent" || timeframeUrgency.level === "overdue") && (
                  <div className={`mt-3 p-3 rounded-md flex items-center gap-2 ${
                    timeframeUrgency.level === "overdue" ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"
                  }`}>
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{timeframeUrgency.message}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Client Budget</h4>
                  <p className="text-sm font-medium">{formatCurrency(job.clientBudget)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Agreed Price</h4>
                  <p className="text-sm font-medium">{formatCurrency(job.agreedPrice)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Client&apos;s Deposit Offer</h4>
                  <p className="text-sm">{job.depositPercent}%</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Deposit Status</h4>
                  <p className="text-sm">
                    {job.depositPaid ? (
                      <span className="text-green-600">Paid ({formatCurrency(job.depositAmount)})</span>
                    ) : (
                      <span>{formatCurrency(job.depositAmount || 0)} pending</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Action Card */}
          {canQuote && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {revisionRequested ? "Send Revised Quote" : "Send Quote"}
                </CardTitle>
                <CardDescription>
                  {revisionRequested
                    ? "The client has requested a revision to your quote."
                    : "Provide an itemized quote for this job request."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {revisionRequested && latestQuote?.clientResponse && (
                  <div className="mb-4 p-3 bg-yellow-50 border-l-2 border-yellow-400 rounded">
                    <h5 className="font-medium text-sm">Client Feedback:</h5>
                    <p className="text-sm text-muted-foreground mt-1">{latestQuote.clientResponse}</p>
                  </div>
                )}
                <Dialog open={isQuoteDialogOpen} onOpenChange={handleOpenQuoteDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      {revisionRequested ? "Create Revised Quote" : "Create Quote"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {revisionRequested ? "Create Revised Quote" : "Create Itemized Quote"}
                      </DialogTitle>
                      <DialogDescription>
                        {revisionRequested 
                          ? "Review the client's feedback and create a revised quote with updated pricing."
                          : "Add line items to show the client a transparent breakdown of costs."}
                      </DialogDescription>
                    </DialogHeader>
                    
                    {/* Revision Notice */}
                    {revisionRequested && lineItems.length > 0 && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-emerald-800">
                            Your previous quote items have been loaded. Edit quantities, prices, or add/remove items as needed based on the client&apos;s feedback.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-6">
                      {/* Line Items Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base">Line Items</Label>
                          <Dialog open={isAddItemDialogOpen} onOpenChange={(open) => {
                            if (!open) handleCloseItemDialog();
                            else setIsAddItemDialogOpen(true);
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Item
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{editingItemId ? "Edit Line Item" : "Add Line Item"}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Category *</Label>
                                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(QUOTE_LINE_ITEM_CATEGORIES).map(([key, cat]) => (
                                        <SelectItem key={key} value={key}>
                                          <div className="flex items-center gap-2">
                                            {categoryIcons[key]}
                                            {cat.name}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Item Name *</Label>
                                  <Input
                                    placeholder="e.g. Skilled Labor, Cement, etc."
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Description (optional)</Label>
                                  <Input
                                    placeholder="Additional details"
                                    value={itemDescription}
                                    onChange={(e) => setItemDescription(e.target.value)}
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="space-y-2">
                                    <Label>Quantity *</Label>
                                    <Input
                                      type="number"
                                      min="0.01"
                                      step="0.01"
                                      value={itemQuantity}
                                      onChange={(e) => setItemQuantity(e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Unit</Label>
                                    <Input
                                      placeholder="e.g. hours, bags"
                                      value={itemUnit}
                                      onChange={(e) => setItemUnit(e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Unit Price (KES) *</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={itemUnitPrice}
                                      onChange={(e) => setItemUnitPrice(e.target.value)}
                                    />
                                  </div>
                                </div>
                                {itemQuantity && itemUnitPrice && (
                                  <div className="p-3 bg-muted rounded-md">
                                    <span className="text-sm text-muted-foreground">Line Total: </span>
                                    <span className="font-medium">
                                      {formatCurrency(parseFloat(itemQuantity) * parseFloat(itemUnitPrice))}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={handleCloseItemDialog}>
                                  Cancel
                                </Button>
                                <Button onClick={handleAddLineItem}>
                                  {editingItemId ? "Update Item" : "Add Item"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {/* Line Items List */}
                        {lineItems.length === 0 ? (
                          <div className="border border-dashed rounded-lg p-6 text-center text-muted-foreground">
                            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No line items yet. Add items to build your quote.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {lineItems.map((item) => {
                              const catInfo = getCategoryInfo(item.category);
                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded">
                                      {categoryIcons[item.category] || <MoreHorizontal className="h-4 w-4" />}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                          {catInfo?.name || item.category}
                                        </Badge>
                                        <span className="font-medium text-sm">{item.name}</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium">
                                      {formatCurrency(item.quantity * item.unitPrice)}
                                    </span>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() => handleEditLineItem(item)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => handleRemoveLineItem(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Totals Section */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal (from line items)</span>
                          <span>{formatCurrency(calculations.subtotal)}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Final Amount (KES) *</Label>
                          <Input
                            type="number"
                            placeholder="Enter final amount"
                            value={finalAmount}
                            onChange={(e) => setFinalAmount(e.target.value)}
                          />
                          {Math.abs(calculations.difference) >= 100 && finalAmount && (
                            <p className="text-xs text-muted-foreground">
                              {calculations.difference > 0 
                                ? `+${formatCurrency(calculations.difference)} miscellaneous will be added`
                                : `${formatCurrency(calculations.difference)} discount will be applied`}
                            </p>
                          )}
                        </div>

                        {job.clientBudget && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Client budget: {formatCurrency(job.clientBudget)}
                          </p>
                        )}
                      </div>

                      <Separator />

                      {/* Deposit Section */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Requested Deposit</Label>
                            <span className="text-lg font-bold">{depositPercent}%</span>
                          </div>
                          <Slider
                            value={[depositPercent]}
                            onValueChange={(value: number[]) => setDepositPercent(value[0])}
                            min={DEPOSIT_CONFIG.MIN_PERCENT}
                            max={calculations.maxDeposit}
                            step={5}
                            className="py-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{DEPOSIT_CONFIG.MIN_PERCENT}%</span>
                            <span>{calculations.maxDeposit}%</span>
                          </div>
                        </div>

                        {/* Material info */}
                        {calculations.materialsCost > 0 && (
                          <div className="p-3 bg-emerald-50 rounded-md space-y-1">
                            <div className="flex items-center gap-2 text-sm text-emerald-700">
                              <Package className="h-4 w-4" />
                              <span>
                                Materials: {formatCurrency(calculations.materialsCost)} ({calculations.materialPercentage.toFixed(0)}% of total)
                              </span>
                            </div>
                            {calculations.maxDeposit > DEPOSIT_CONFIG.STANDARD_MAX_PERCENT && (
                              <p className="text-xs text-emerald-600">
                                {calculations.depositTierDescription} - higher deposit available
                              </p>
                            )}
                          </div>
                        )}

                        {/* Deposit amount */}
                        {calculations.finalAmountNum > 0 && (
                          <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                            <span className="text-sm">Deposit Amount</span>
                            <span className="font-bold">{formatCurrency(calculations.depositAmount)}</span>
                          </div>
                        )}

                        {/* Warning for high deposit */}
                        {depositPercent > DEPOSIT_CONFIG.STANDARD_MAX_PERCENT && (
                          <div className="p-3 bg-yellow-50 border-l-2 border-yellow-400 rounded text-sm">
                            <p className="font-medium text-yellow-800">Higher Deposit Request</p>
                            <p className="text-yellow-700 text-xs mt-1">
                              The client will see an explanation that this job requires significant upfront material costs.
                            </p>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Client offered: {job.depositPercent}% deposit
                        </p>
                      </div>

                      <Separator />

                      {/* Additional Details */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            placeholder="Summarize what's included in your quote..."
                            value={quoteDescription}
                            onChange={(e) => setQuoteDescription(e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="duration">Estimated Duration</Label>
                            <Input
                              id="duration"
                              placeholder="e.g. 3 days, 1 week"
                              value={quoteDuration}
                              onChange={(e) => setQuoteDuration(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="validDays">Valid For (days)</Label>
                            <Input
                              id="validDays"
                              type="number"
                              value={quoteValidDays}
                              onChange={(e) => setQuoteValidDays(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="terms">Terms & Conditions</Label>
                          <Textarea
                            id="terms"
                            placeholder="Any terms or conditions..."
                            value={quoteTerms}
                            onChange={(e) => setQuoteTerms(e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="mt-6">
                      <Button variant="outline" onClick={() => handleOpenQuoteDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateQuote}
                        disabled={createQuoteMutation.isPending || lineItems.length === 0}
                      >
                        {createQuoteMutation.isPending ? "Sending..." : "Send Quote"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {canStart && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Ready to Start
                </CardTitle>
                <CardDescription>
                  The client has paid the deposit. You can now start working on this job.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={handleStartJob}
                  disabled={startJobMutation.isPending}
                >
                  {startJobMutation.isPending ? "Starting..." : "Start Job"}
                </Button>
              </CardContent>
            </Card>
          )}

          {canComplete && (
            <Card className="border-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCheck className="h-5 w-5" />
                  Mark as Complete
                </CardTitle>
                <CardDescription>
                  When you&apos;ve finished the work, mark the job as complete.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" variant="default">
                      Mark Job Complete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Complete this job?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will notify the client that the work is complete and they can proceed with the final payment.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCompleteJob}
                        disabled={completeJobMutation.isPending}
                      >
                        {completeJobMutation.isPending ? "Completing..." : "Mark Complete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}

          {/* Quotes History */}
          {job.quotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quote History</CardTitle>
                <CardDescription>
                  {job.quotes.length} quote{job.quotes.length !== 1 ? "s" : ""} sent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className={`p-4 rounded-lg border ${quote.status === "ACCEPTED" ? "border-green-500 bg-green-50" : quote.status === "SENT" ? "border-primary bg-primary/5" : "bg-muted/30"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{formatCurrency(quote.amount)}</span>
                          <Badge variant={quote.status === "ACCEPTED" ? "default" : quote.status === "DECLINED" || quote.status === "REVISION_REQUESTED" ? "secondary" : "outline"}>
                            {quote.status === "SENT" ? "Pending" : quote.status.replace("_", " ")}
                          </Badge>
                          <Badge variant="outline">Round {quote.round}</Badge>
                        </div>
                        {quote.requestedDepositPercent && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Deposit: {quote.requestedDepositPercent}%
                          </p>
                        )}
                        {quote.estimatedDuration && (
                          <p className="text-sm text-muted-foreground">
                            Est. Duration: {quote.estimatedDuration}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(quote.createdAt)}
                      </span>
                    </div>
                    
                    {/* Line Items Display */}
                    {quote.lineItems && quote.lineItems.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <h5 className="text-xs font-medium text-muted-foreground">Breakdown:</h5>
                        <div className="space-y-1">
                          {quote.lineItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                {item.name} {item.quantity > 1 && `(${item.quantity} ${item.unit || 'units'})`}
                              </span>
                              <span>{formatCurrency(item.total)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
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
                        <h5 className="font-medium mb-1">Client Feedback</h5>
                        <p className="text-muted-foreground">{quote.clientResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Payments Section */}
          {job.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payments Received</CardTitle>
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
        </div>

        {/* Sidebar - Client Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={job.client.profileImage || undefined} alt={job.client.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {clientInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{job.client.name}</h3>
                  <p className="text-sm text-muted-foreground">Client</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                {job.client.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{job.client.email}</span>
                  </div>
                )}
                {job.client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{job.client.phone}</span>
                  </div>
                )}
                {job.client.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.client.location}</span>
                  </div>
                )}
              </div>
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
                  <Link href={`/artisan-dashboard/messages/${job.conversationId}`}>
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
                  label="Request Received"
                  date={job.createdAt}
                  completed
                />
                <TimelineItem
                  icon={<FileText className="h-4 w-4" />}
                  label="Quote Sent"
                  date={job.quotes[job.quotes.length - 1]?.createdAt}
                  completed={job.quotes.length > 0}
                />
                <TimelineItem
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  label="Quote Accepted"
                  completed={["ACCEPTED", "DEPOSIT_PAID", "IN_PROGRESS", "COMPLETED", "PAID"].includes(job.status)}
                />
                <TimelineItem
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Deposit Received"
                  date={job.depositPaidAt}
                  completed={job.depositPaid}
                />
                <TimelineItem
                  icon={<Play className="h-4 w-4" />}
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
