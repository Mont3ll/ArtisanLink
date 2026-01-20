"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Archive,
  Loader2,
  Check,
  CheckCheck,
  Paperclip,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  useConversation,
  useSendMessage,
  useArchiveConversationDetail,
  type Message,
} from "@/lib/hooks/use-conversation-messages";

// Message Bubble Component
function MessageBubble({
  message,
  isOwn,
  showAvatar,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}) {
  const time = new Date(message.createdAt).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const initials = `${message.sender.firstName[0]}${message.sender.lastName[0]}`;

  return (
    <div
      className={cn(
        "flex items-end gap-2 mb-2",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {showAvatar ? (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage
            src={message.sender.profile?.profileImage || undefined}
            alt={`${message.sender.firstName} ${message.sender.lastName}`}
          />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8" />
      )}

      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

        {/* Attachments */}
        {message.attachmentUrls.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachmentUrls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs underline"
              >
                <Paperclip className="h-3 w-3" />
                Attachment {i + 1}
              </a>
            ))}
          </div>
        )}

        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isOwn ? "justify-end" : "justify-start"
          )}
        >
          <span
            className={cn(
              "text-xs",
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {time}
          </span>
          {isOwn && (
            <span className={cn("text-primary-foreground/70")}>
              {message.status === "READ" ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Date Separator Component
function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
        {date}
      </div>
    </div>
  );
}

// Format date for grouping
function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-KE", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }
}

// Loading Skeleton Component
function ConversationSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header Skeleton */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex items-end gap-2",
              i % 2 === 0 ? "flex-row" : "flex-row-reverse"
            )}
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-16 w-48 rounded-2xl" />
          </div>
        ))}
      </div>

      {/* Input Skeleton */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // React Query hooks
  const { data: conversation, isLoading, error } = useConversation(id);
  const sendMessageMutation = useSendMessage(id);
  const archiveMutation = useArchiveConversationDetail(id);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (conversation?.messages) {
      scrollToBottom();
    }
  }, [conversation?.messages, scrollToBottom]);

  // Handle error (redirect on 404)
  useEffect(() => {
    if (error?.message === "Conversation not found") {
      router.push("/client-dashboard/messages");
    }
  }, [error, router]);

  // Handle send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendMessageMutation.isPending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    sendMessageMutation.mutate(
      { content: messageContent },
      {
        onError: () => {
          // Restore message on error
          setNewMessage(messageContent);
        },
        onSettled: () => {
          inputRef.current?.focus();
        },
      }
    );
  };

  // Handle archive
  const handleArchive = () => {
    archiveMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/client-dashboard/messages");
      },
    });
  };

  // Loading state
  if (isLoading) {
    return <ConversationSkeleton />;
  }

  // Not found state
  if (!conversation) {
    return (
      <Card className="m-4 py-12">
        <CardContent className="text-center">
          <h3 className="text-lg font-semibold mb-2">Conversation not found</h3>
          <p className="text-muted-foreground mb-4">
            This conversation may have been deleted or you don&apos;t have access to it.
          </p>
          <Button asChild>
            <Link href="/client-dashboard/messages">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const messages = conversation.messages;
  const currentUserId = conversation.clientId;
  const otherParty = conversation.artisan;
  const otherPartyName = `${otherParty.firstName} ${otherParty.lastName}`;
  const otherPartyInitials = `${otherParty.firstName[0]}${otherParty.lastName[0]}`;

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = formatDate(new Date(message.createdAt));
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {} as Record<string, Message[]>
  );

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="md:hidden">
              <Link href="/client-dashboard/messages">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>

            <Avatar className="h-10 w-10">
              <AvatarImage
                src={otherParty.profile?.profileImage || undefined}
                alt={otherPartyName}
              />
              <AvatarFallback>{otherPartyInitials}</AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{otherPartyName}</h2>
                {otherParty.profile?.profession && (
                  <Badge variant="secondary" className="text-xs">
                    {otherParty.profile.profession}
                  </Badge>
                )}
              </div>
              {conversation.subject && (
                <p className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-[300px]">
                  {conversation.subject}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleArchive}
                disabled={archiveMutation.isPending}
              >
                <Archive className="h-4 w-4 mr-2" />
                {archiveMutation.isPending ? "Archiving..." : "Archive Conversation"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Start the conversation by sending a message
              </p>
            </div>
          </div>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <DateSeparator date={date} />
                {dateMessages.map((message, index) => {
                  const isOwn = message.senderId === currentUserId;
                  const prevMessage = dateMessages[index - 1];
                  const showAvatar =
                    !prevMessage || prevMessage.senderId !== message.senderId;

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                    />
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      {conversation.status === "BLOCKED" ? (
        <div className="border-t p-4 bg-muted/50">
          <p className="text-center text-sm text-muted-foreground">
            This conversation has been blocked
          </p>
        </div>
      ) : (
        <form onSubmit={handleSend} className="border-t p-4 bg-background">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
