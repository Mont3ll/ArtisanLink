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
  Users,
  CreditCard,
  Shield,
  Star,
  MapPin,
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

// FAQ Data for Clients
const faqCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Book,
    faqs: [
      {
        question: "How do I find an artisan?",
        answer:
          "Use the 'Find Artisans' page to search by profession, location, or specialization. You can also browse the Map View to find artisans near you. Use filters to narrow down results by rating, availability, and verification status.",
      },
      {
        question: "How do I know if an artisan is trustworthy?",
        answer:
          "Look for the verification badge on artisan profiles - this means they've submitted and verified their identity and business documents. Also check their ratings, reviews from other clients, portfolio of past work, and how long they've been on the platform.",
      },
      {
        question: "How do I contact an artisan?",
        answer:
          "Click the 'Message' button on any artisan's profile to start a conversation. Describe your project needs clearly, including location, timeline, and budget expectations. Most artisans respond within 24 hours.",
      },
    ],
  },
  {
    id: "finding-artisans",
    title: "Finding Artisans",
    icon: Users,
    faqs: [
      {
        question: "What types of artisans are on ChapaWorks?",
        answer:
          "We have a wide range of skilled artisans including electricians, plumbers, carpenters, painters, masons, welders, mechanics, tailors, furniture makers, and many more. You can filter by profession to find exactly what you need.",
      },
      {
        question: "How does the Map View work?",
        answer:
          "The Map View shows artisans on an interactive map based on their service areas. You can zoom in on your location to find nearby artisans, see their ratings at a glance, and click on markers to view their profiles.",
      },
      {
        question: "Can I save artisans for later?",
        answer:
          "Yes! Click the heart/save icon on any artisan's profile to add them to your Saved Artisans list. This makes it easy to compare and contact them later when you're ready to start your project.",
      },
    ],
  },
  {
    id: "hiring-process",
    title: "Hiring & Projects",
    icon: MapPin,
    faqs: [
      {
        question: "How do I hire an artisan?",
        answer:
          "After finding an artisan you like, send them a message describing your project. Discuss the scope, timeline, and pricing. Once you agree on terms, the artisan will schedule a visit or start the work. We recommend getting quotes from multiple artisans.",
      },
      {
        question: "How should I communicate project details?",
        answer:
          "Be as specific as possible: include photos of the area/item, measurements if relevant, your timeline expectations, and budget range. Clear communication upfront prevents misunderstandings later.",
      },
      {
        question: "What if I need to cancel or reschedule?",
        answer:
          "Contact the artisan directly through messages to discuss changes. Most artisans appreciate advance notice. Be respectful of their time - repeated cancellations may affect your ability to book artisans in the future.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    icon: CreditCard,
    faqs: [
      {
        question: "How do I pay artisans?",
        answer:
          "Payments are arranged directly between you and the artisan. Common methods include M-Pesa, bank transfer, or cash. We recommend using M-Pesa for a secure transaction record. Always get a receipt for your records.",
      },
      {
        question: "Should I pay upfront?",
        answer:
          "Payment terms vary by artisan and project size. For larger projects, a deposit (typically 30-50%) is common to cover materials. Discuss payment terms before work begins and avoid paying the full amount until work is completed satisfactorily.",
      },
      {
        question: "What if there's a payment dispute?",
        answer:
          "Try to resolve issues directly with the artisan first. If you can't reach an agreement, contact our support team with details of the project, communication history, and evidence of the issue. We'll help mediate.",
      },
    ],
  },
  {
    id: "reviews",
    title: "Reviews & Feedback",
    icon: Star,
    faqs: [
      {
        question: "How do I leave a review?",
        answer:
          "After working with an artisan, go to 'My Reviews' and click 'Write a Review'. Rate their work (1-5 stars), provide details about the project, and share your experience. Honest reviews help other clients and reward good artisans.",
      },
      {
        question: "Can I edit or delete my review?",
        answer:
          "Yes, you can edit or delete your reviews from the 'My Reviews' page. Click the edit or delete button on any review you've written. Note that edited reviews may be re-submitted for approval.",
      },
      {
        question: "What makes a helpful review?",
        answer:
          "Mention specifics: the type of work done, quality of craftsmanship, punctuality, communication, and value for money. Include photos if possible. Both positive and constructive feedback helps the community.",
      },
    ],
  },
  {
    id: "account-security",
    title: "Account & Security",
    icon: Shield,
    faqs: [
      {
        question: "How is my information protected?",
        answer:
          "We use industry-standard encryption for all data. Your personal information is only shared with artisans you contact. We never sell your data to third parties. Review our Privacy Policy for complete details.",
      },
      {
        question: "How do I update my account settings?",
        answer:
          "Go to Settings to update your notification preferences and other account options. For email or password changes, use the account dropdown in the header.",
      },
      {
        question: "What should I do if I encounter fraud?",
        answer:
          "Report immediately to our support team with all evidence (messages, payment records, photos). We take fraud seriously and will investigate. Never share sensitive personal information or pay through unofficial channels.",
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

export default function ClientHelpPage() {
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
                <h3 className="font-semibold">How It Works</h3>
                <p className="text-sm text-muted-foreground">
                  Learn the basics of ChapaWorks
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
                    href="mailto:support@chapaworks.co.ke"
                    className="text-sm text-primary hover:underline"
                  >
                    support@chapaworks.co.ke
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
