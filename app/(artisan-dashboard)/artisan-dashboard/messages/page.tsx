"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Archive,
  MoreVertical,
  Mail,
  Check,
  CheckCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  useConversations,
  useArchiveConversation,
  type Conversation,
} from "@/lib/hooks";

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

// Conversation Item Component for Artisans
function ConversationItem({
  conversation,
  currentUserId,
  onArchive,
  isArchiving,
}: {
  conversation: Conversation;
  currentUserId: string;
  onArchive: (id: string) => void;
  isArchiving: boolean;
}) {
  // For artisans, the other party is the client
  const otherParty = conversation.client;
  const initials = `${otherParty.firstName[0]}${otherParty.lastName[0]}`;

  const lastMessageTime = conversation.lastMessageAt
    ? formatMessageTime(new Date(conversation.lastMessageAt))
    : formatMessageTime(new Date(conversation.createdAt));

  const isUnread =
    conversation.lastMessage &&
    conversation.lastMessage.senderId !== currentUserId &&
    conversation.lastMessage.status !== "READ";

  return (
    <Link href={`/artisan-dashboard/messages/${conversation.id}`} className="block">
      <Card
        className={cn(
          "hover:bg-accent/50 transition-colors cursor-pointer",
          isUnread && "border-primary/50 bg-primary/5",
          isArchiving && "opacity-50"
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
                  <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                    Client
                  </Badge>
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
                        disabled={isArchiving}
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

export default function ArtisanMessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [page, setPage] = useState(1);

  // React Query hooks
  const {
    data,
    isLoading,
    error,
  } = useConversations({
    page,
    limit: 20,
    status: activeTab === "archived" ? "ARCHIVED" : "ACTIVE",
  });

  const archiveMutation = useArchiveConversation();

  const conversations = data?.conversations ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 };

  // Get current user ID from first conversation (artisan ID for artisans)
  const currentUserId = conversations.length > 0 ? conversations[0].artisanId : "";

  // Filter conversations based on search (client-side filtering)
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }

    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const clientName = `${conv.client.firstName} ${conv.client.lastName}`.toLowerCase();
      const subject = conv.subject?.toLowerCase() || "";
      const lastMessage = conv.lastMessage?.content.toLowerCase() || "";

      return (
        clientName.includes(query) ||
        subject.includes(query) ||
        lastMessage.includes(query)
      );
    });
  }, [searchQuery, conversations]);

  // Handle tab change - reset page
  const handleTabChange = (value: string) => {
    setActiveTab(value as "active" | "archived");
    setPage(1);
  };

  // Handle archive conversation
  const handleArchive = (id: string) => {
    archiveMutation.mutate(id);
  };

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header - Always visible */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            {isLoading ? (
              <Skeleton className="h-6 w-20 rounded-full" />
            ) : unreadCount > 0 ? (
              <Badge variant="default" className="rounded-full">
                {unreadCount} unread
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground">
            Your conversations with clients
          </p>
        </div>
      </div>

      {/* Search - Always visible */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-red-600">
              {error instanceof Error ? error.message : "Failed to load conversations"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs - Always visible */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
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
                      : "When clients message you, conversations will appear here"
                    : "Try adjusting your search query"}
                </p>
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
                  isArchiving={archiveMutation.isPending && archiveMutation.variables === conversation.id}
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
                onClick={() => setPage((p) => p - 1)}
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
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
