"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  Search,
  Archive,
  MoreVertical,
  Loader2,
  Plus,
  Mail,
  Check,
  CheckCheck,
  User,
  X,
  MapPin,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  useConversations,
  useArchiveConversation,
  useCreateConversation,
  type Conversation,
} from "@/lib/hooks";

// Type for artisan details fetched from API
interface ArtisanDetails {
  id: string;
  firstName: string;
  lastName: string;
  profile?: {
    profession?: string;
    profileImage?: string;
    city?: string;
    county?: string;
    averageRating?: number;
    isAvailable?: boolean;
  };
}

// Format message time
function formatMessageTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("en-KE", { weekday: "short" });
  } else {
    return date.toLocaleDateString("en-KE", {
      month: "short",
      day: "numeric",
    });
  }
}

// Conversation Item Component
function ConversationItem({
  conversation,
  currentUserId,
  onArchive,
}: {
  conversation: Conversation;
  currentUserId: string;
  onArchive: (id: string) => void;
}) {
  const otherParty = conversation.artisan;
  const initials = `${otherParty.firstName[0]}${otherParty.lastName[0]}`;
  
  const lastMessageTime = conversation.lastMessageAt
    ? formatMessageTime(new Date(conversation.lastMessageAt))
    : formatMessageTime(new Date(conversation.createdAt));

  const isUnread =
    conversation.lastMessage &&
    conversation.lastMessage.senderId !== currentUserId &&
    conversation.lastMessage.status !== "READ";

  return (
    <Link href={`/client-dashboard/messages/${conversation.id}`}>
      <Card
        className={cn(
          "hover:bg-accent/50 transition-colors cursor-pointer",
          isUnread && "border-primary/50 bg-primary/5"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={otherParty.profile?.profileImage || undefined}
                alt={`${otherParty.firstName} ${otherParty.lastName}`}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={cn("font-medium", isUnread && "font-semibold")}>
                    {otherParty.firstName} {otherParty.lastName}
                  </span>
                  {otherParty.profile?.profession && (
                    <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                      {otherParty.profile.profession}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {lastMessageTime}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.preventDefault()}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          onArchive(conversation.id);
                        }}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {conversation.subject && (
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.subject}
                </p>
              )}

              {conversation.lastMessage && (
                <div className="flex items-center gap-1 mt-1">
                  {conversation.lastMessage.senderId === currentUserId && (
                    <span className="text-muted-foreground">
                      {conversation.lastMessage.status === "READ" ? (
                        <CheckCheck className="h-3 w-3 text-blue-500" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </span>
                  )}
                  <p
                    className={cn(
                      "text-sm truncate",
                      isUnread
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {conversation.lastMessage.content}
                  </p>
                </div>
              )}
            </div>

            {isUnread && (
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton for loading state
function ConversationSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// New Conversation Dialog
function NewConversationDialog({
  open,
  onOpenChange,
  onCreated,
  initialArtisanId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
  initialArtisanId?: string;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateConversation();

  // Fetch artisan details when initialArtisanId is provided
  const { data: artisan, isLoading: isLoadingArtisan, error: artisanError } = useQuery<ArtisanDetails>({
    queryKey: ["artisan-details", initialArtisanId],
    queryFn: async () => {
      const res = await fetch(`/api/client/artisans/${initialArtisanId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Artisan not found");
      }
      return res.json();
    },
    enabled: !!initialArtisanId && open,
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSubject("");
      setMessage("");
      setError(null);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!initialArtisanId) {
      setError("No artisan selected");
      return;
    }

    setError(null);

    try {
      const result = await createMutation.mutateAsync({
        artisanId: initialArtisanId,
        subject: subject.trim() || undefined,
        initialMessage: message.trim() || undefined,
      });
      onCreated(result.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create conversation");
    }
  };

  const artisanInitials = artisan 
    ? `${artisan.firstName[0]}${artisan.lastName[0]}`
    : "?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Start a new conversation with an artisan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {artisanError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {artisanError instanceof Error ? artisanError.message : "Failed to load artisan details"}
            </div>
          )}

          {/* Artisan Info Card */}
          <div className="space-y-2">
            <Label>Contacting</Label>
            {isLoadingArtisan ? (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ) : artisan ? (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={artisan.profile?.profileImage || undefined}
                    alt={`${artisan.firstName} ${artisan.lastName}`}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {artisanInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {artisan.firstName} {artisan.lastName}
                    </span>
                    {artisan.profile?.isAvailable && (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                        Available
                      </Badge>
                    )}
                  </div>
                  {artisan.profile?.profession && (
                    <p className="text-sm text-muted-foreground">
                      {artisan.profile.profession}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {artisan.profile?.city && artisan.profile?.county && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {artisan.profile.city}, {artisan.profile.county}
                      </span>
                    )}
                    {artisan.profile?.averageRating !== undefined && artisan.profile.averageRating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {artisan.profile.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : !initialArtisanId ? (
              <div className="flex items-center justify-center gap-2 p-6 border rounded-lg border-dashed text-muted-foreground">
                <User className="h-5 w-5" />
                <span>Find an artisan first to start a conversation</span>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input
              id="subject"
              placeholder="e.g., Kitchen renovation project"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">First message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Write your first message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={createMutation.isPending || isLoadingArtisan || !artisan}
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Start Conversation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [selectedArtisanId, setSelectedArtisanId] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  // React Query hooks
  const { 
    data: conversationsData, 
    isLoading 
  } = useConversations({
    page,
    limit: 20,
    status: activeTab === "archived" ? "ARCHIVED" : "ACTIVE",
  });

  const archiveMutation = useArchiveConversation();

  // Derived data
  const conversations = conversationsData?.conversations ?? [];
  const unreadCount = conversationsData?.unreadCount ?? 0;
  const pagination = conversationsData?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 };

  // Current user ID (from first conversation)
  const currentUserId = useMemo(() => {
    if (conversations.length > 0) {
      return conversations[0].clientId;
    }
    return "";
  }, [conversations]);

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }

    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const artisanName = `${conv.artisan.firstName} ${conv.artisan.lastName}`.toLowerCase();
      const profession = conv.artisan.profile?.profession?.toLowerCase() || "";
      const subject = conv.subject?.toLowerCase() || "";
      const lastMessage = conv.lastMessage?.content.toLowerCase() || "";

      return (
        artisanName.includes(query) ||
        profession.includes(query) ||
        subject.includes(query) ||
        lastMessage.includes(query)
      );
    });
  }, [searchQuery, conversations]);

  // Check if coming from artisan contact link
  useEffect(() => {
    const artisanId = searchParams.get("artisan");
    if (artisanId) {
      setSelectedArtisanId(artisanId);
      setNewConversationOpen(true);
    }
  }, [searchParams]);

  // Handle archive conversation
  const handleArchive = (id: string) => {
    archiveMutation.mutate(id);
  };

  // Handle new conversation created
  const handleConversationCreated = (id: string) => {
    // Clear the URL param
    router.replace("/client-dashboard/messages");
    setSelectedArtisanId(undefined);
    router.push(`/client-dashboard/messages/${id}`);
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setNewConversationOpen(open);
    if (!open) {
      // Clear the artisan ID and URL param when closing
      setSelectedArtisanId(undefined);
      if (searchParams.get("artisan")) {
        router.replace("/client-dashboard/messages");
      }
    }
  };

  // Handle "New Message" button click (without pre-selected artisan)
  const handleNewMessageClick = () => {
    // Redirect to find artisans page since we need to select an artisan first
    router.push("/client-dashboard/find-artisans");
  };

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            {isLoading ? (
              <Skeleton className="h-6 w-16 rounded-full" />
            ) : unreadCount > 0 ? (
              <Badge variant="default" className="rounded-full">
                {unreadCount} unread
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground">
            Your conversations with artisans
          </p>
        </div>
        <Button onClick={handleNewMessageClick}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v as "active" | "archived");
        setPage(1);
      }}>
        <TabsList>
          <TabsTrigger value="active">
            <MessageSquare className="h-4 w-4 mr-2" />
            Active
          </TabsTrigger>
          <TabsTrigger value="archived">
            <Archive className="h-4 w-4 mr-2" />
            Archived
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <ConversationSkeleton key={i} />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {conversations.length === 0
                    ? activeTab === "archived"
                      ? "No archived conversations"
                      : "No conversations yet"
                    : "No matches found"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {conversations.length === 0
                    ? activeTab === "archived"
                      ? "Archived conversations will appear here"
                      : "Find an artisan to start a conversation"
                    : "Try adjusting your search query"}
                </p>
                {conversations.length === 0 && activeTab === "active" && (
                  <Button onClick={handleNewMessageClick}>
                    <Search className="h-4 w-4 mr-2" />
                    Find Artisans
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  currentUserId={currentUserId}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPage((prev) => prev - 1)}
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
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* New Conversation Dialog */}
      <NewConversationDialog
        open={newConversationOpen}
        onOpenChange={handleDialogClose}
        onCreated={handleConversationCreated}
        initialArtisanId={selectedArtisanId}
      />
    </div>
  );
}
