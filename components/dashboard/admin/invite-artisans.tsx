"use client";

import { useState, useEffect } from "react";
import { Mail, Plus, Trash2, Clock, CheckCircle2, XCircle, RefreshCw, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Invite {
  id: string;
  token: string;
  email: string;
  name: string | null;
  phone: string | null;
  message: string | null;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
}

const statusConfig = {
  PENDING: { label: "Pending", variant: "secondary" as const, icon: <Clock className="h-3.5 w-3.5" /> },
  ACCEPTED: { label: "Accepted", variant: "default" as const, icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> },
  EXPIRED: { label: "Expired", variant: "outline" as const, icon: <Clock className="h-3.5 w-3.5 text-muted-foreground" /> },
  REVOKED: { label: "Revoked", variant: "destructive" as const, icon: <XCircle className="h-3.5 w-3.5" /> },
};

export default function InviteArtisans() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const fetchInvites = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/invites");
      if (!res.ok) throw new Error("Failed to fetch invites");
      const data = await res.json();
      setInvites(data.invites || []);
    } catch {
      toast.error("Failed to load invites");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined, phone: phone.trim() || undefined, message: message.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send invite");
        return;
      }

      toast.success("Invite sent!", { description: `Invitation email sent to ${email}` });
      setIsDialogOpen(false);
      setEmail("");
      setName("");
      setPhone("");
      setMessage("");
      fetchInvites();

      // Show invite URL for copying
      if (data.invite?.inviteUrl) {
        setTimeout(() => {
          toast.info("Invite link created", {
            description: "You can also share the invite link directly.",
            action: {
              label: "Copy link",
              onClick: () => {
                navigator.clipboard.writeText(data.invite.inviteUrl);
                toast.success("Link copied!");
              },
            },
          });
        }, 500);
      }
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (token: string, email: string) => {
    if (!confirm(`Revoke invite for ${email}?`)) return;
    try {
      const res = await fetch(`/api/admin/invites/${token}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to revoke");
      toast.success("Invite revoked");
      fetchInvites();
    } catch {
      toast.error("Failed to revoke invite");
    }
  };

  const copyInviteLink = (token: string) => {
    const appUrl = window.location.origin;
    const url = `${appUrl}/sign-up?invite=${token}&role=artisan`;
    navigator.clipboard.writeText(url);
    toast.success("Invite link copied to clipboard!");
  };

  const pendingCount = invites.filter((i) => i.status === "PENDING").length;
  const acceptedCount = invites.filter((i) => i.status === "ACCEPTED").length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Artisan Invites
              </CardTitle>
              <CardDescription>
                Send invitations to artisans to join ChapaWorks. Invites expire after 7 days.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchInvites}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Send Invite
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>Invite an Artisan</DialogTitle>
                      <DialogDescription>
                        Send an invitation email to an artisan to join ChapaWorks. They&apos;ll receive a link to sign up as a verified artisan.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="invite-email">Email Address *</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="artisan@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="invite-name">Full Name</Label>
                        <Input
                          id="invite-name"
                          placeholder="Jane Mwangi"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="invite-phone">Phone Number</Label>
                        <Input
                          id="invite-phone"
                          placeholder="0712345678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="invite-message">Personal Message (optional)</Label>
                        <Textarea
                          id="invite-message"
                          placeholder="Hi Jane, we'd love to have you on ChapaWorks..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={3}
                          maxLength={500}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">{message.length}/500</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting || !email.trim()}>
                        {isSubmitting ? "Sending..." : "Send Invite"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{invites.length}</p>
              <p className="text-xs text-muted-foreground">Total Invites</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
              <p className="text-xs text-muted-foreground">Accepted</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-slate-500">
                {invites.filter((i) => i.status === "EXPIRED" || i.status === "REVOKED").length}
              </p>
              <p className="text-xs text-muted-foreground">Expired/Revoked</p>
            </div>
          </div>

          {/* Invites Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading invites...</div>
          ) : invites.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No invites sent yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Send your first invite to get artisans on board.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => {
                    const sc = statusConfig[invite.status];
                    return (
                      <TableRow key={invite.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{invite.email}</p>
                            {invite.name && (
                              <p className="text-xs text-muted-foreground">{invite.name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sc.variant} className="gap-1 text-xs">
                            {sc.icon}
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(invite.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(invite.expiresAt).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {invite.status === "PENDING" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Copy invite link"
                                  onClick={() => copyInviteLink(invite.token)}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  title="Revoke invite"
                                  onClick={() => handleRevoke(invite.token, invite.email)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
