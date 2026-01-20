"use client";

import { useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  Book,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  ExternalLink,
  Search,
  Briefcase,
  CreditCard,
  Shield,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// FAQ Data
const faqCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Book,
    faqs: [
      {
        question: "How do I complete my artisan profile?",
        answer:
          "Go to Settings > Profile to add your profession, bio, skills, and experience. Upload a professional profile photo and add portfolio items to showcase your work. A complete profile helps clients find and trust you.",
      },
      {
        question: "How do I get verified?",
        answer:
          "Navigate to Settings > Verification and submit your ID document (national ID or passport) and a business certificate if applicable. Our team reviews submissions within 2-3 business days. Verified artisans get a badge on their profile and appear higher in search results.",
      },
      {
        question: "How do clients find me?",
        answer:
          "Clients can find you through our search feature by profession, location, or specialization. Having a complete profile, good reviews, and being verified significantly improves your visibility.",
      },
    ],
  },
  {
    id: "jobs-projects",
    title: "Jobs & Projects",
    icon: Briefcase,
    faqs: [
      {
        question: "How do I receive job requests?",
        answer:
          "When clients are interested in your services, they'll send you a message through the platform. You'll receive a notification and can view the request in your Messages section. Respond promptly to increase your chances of getting hired.",
      },
      {
        question: "Can I set my availability?",
        answer:
          "Yes! Go to Settings > Profile and toggle your availability status. When you're unavailable, clients will see this on your profile. This helps manage expectations and prevents overbooking.",
      },
      {
        question: "How do I handle project pricing?",
        answer:
          "You can discuss pricing directly with clients through messages. Consider factors like materials, labor time, complexity, and travel distance. Be transparent about your rates to build trust with clients.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & Subscriptions",
    icon: CreditCard,
    faqs: [
      {
        question: "How do subscriptions work?",
        answer:
          "ArtisanLink offers subscription plans that give you enhanced visibility, priority support, and other benefits. Visit the Subscription page to view available plans and their features. Payments are processed securely via M-Pesa.",
      },
      {
        question: "How do I receive payments from clients?",
        answer:
          "Payments are handled directly between you and your clients. We recommend using M-Pesa for secure transactions. Always agree on payment terms before starting work and consider requesting a deposit for larger projects.",
      },
      {
        question: "Can I get a refund on my subscription?",
        answer:
          "Subscription refunds are handled on a case-by-case basis. Contact our support team with your request and reason, and we'll review it within 48 hours.",
      },
    ],
  },
  {
    id: "reviews",
    title: "Reviews & Reputation",
    icon: Star,
    faqs: [
      {
        question: "How do reviews affect my profile?",
        answer:
          "Reviews are crucial for building trust. Your average rating and review count are displayed on your profile. Higher ratings and more positive reviews improve your visibility in search results and increase client confidence.",
      },
      {
        question: "Can I respond to reviews?",
        answer:
          "Yes! You can respond to reviews from your Reviews page. A professional, courteous response to both positive and negative reviews shows potential clients that you value feedback.",
      },
      {
        question: "What if I receive an unfair review?",
        answer:
          "If you believe a review violates our guidelines (contains false information, harassment, or spam), you can report it through the contact form below. Our team will investigate and take appropriate action.",
      },
    ],
  },
  {
    id: "account-security",
    title: "Account & Security",
    icon: Shield,
    faqs: [
      {
        question: "How do I update my account information?",
        answer:
          "Go to Settings to update your profile information, specializations, location, and notification preferences. For email or password changes, use the account settings in your profile dropdown menu.",
      },
      {
        question: "How is my data protected?",
        answer:
          "We use industry-standard encryption and security practices to protect your data. Your personal information is never shared with third parties without your consent. Review our Privacy Policy for detailed information.",
      },
      {
        question: "What should I do if I suspect unauthorized access?",
        answer:
          "Immediately change your password and contact our support team. We'll help secure your account and investigate any suspicious activity.",
      },
    ],
  },
];

// FAQ Item Component
function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50 rounded-lg",
            isOpen && "bg-muted/50"
          )}
        >
          <span className="font-medium pr-4">{question}</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Contact Form Component
function ContactForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setSubmitted(true);
    setSubject("");
    setMessage("");
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
        <p className="text-muted-foreground mb-4">
          We'll get back to you within 24-48 hours.
        </p>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          placeholder="What do you need help with?"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Describe your issue or question in detail..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}

export default function ArtisanHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    "getting-started"
  );

  // Filter FAQs based on search
  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.faqs.length > 0);

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground">
          Find answers to common questions and get support
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Book className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how to use ArtisanLink
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileQuestion className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">FAQs</h3>
                <p className="text-sm text-muted-foreground">
                  Common questions answered
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Contact Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized help
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* FAQs */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </h2>

          {filteredCategories.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  Try different keywords or contact support below
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCategories.map((category) => (
              <Card key={category.id}>
                <Collapsible
                  open={expandedCategory === category.id || searchQuery !== ""}
                  onOpenChange={(open: boolean) =>
                    setExpandedCategory(open ? category.id : null)
                  }
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <category.icon className="h-4 w-4" />
                          </div>
                          <CardTitle className="text-base">
                            {category.title}
                          </CardTitle>
                        </div>
                        {expandedCategory === category.id || searchQuery ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="divide-y">
                        {category.faqs.map((faq, index) => (
                          <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))
          )}
        </div>

        {/* Contact Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact Us
          </h2>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Send a Message</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Other Ways to Reach Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a
                    href="mailto:support@artisanlink.co.ke"
                    className="text-sm text-primary hover:underline"
                  >
                    support@artisanlink.co.ke
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <a
                    href="tel:+254700000000"
                    className="text-sm text-primary hover:underline"
                  >
                    +254 700 000 000
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Hours</p>
                  <p className="text-sm text-muted-foreground">
                    Mon-Fri, 8AM - 6PM EAT
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
