"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  FileText,
  Users,
  Shield,
  Truck
} from "lucide-react"
import Link from "next/link"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

export default function Support() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  const faqData: FAQItem[] = [
    {
      id: "1",
      question: "How do I place an order?",
      answer: "To place an order, browse our restaurant selection, choose your favorite dishes, add them to your cart, and proceed to checkout. You can pay using various payment methods including cards, digital wallets, or cash on delivery.",
      category: "ordering"
    },
    {
      id: "2",
      question: "What are the delivery times?",
      answer: "Delivery times vary by restaurant and location. Typically, orders are delivered within 25-45 minutes. You can see the estimated delivery time for each restaurant on their menu page.",
      category: "delivery"
    },
    {
      id: "3",
      question: "How can I track my order?",
      answer: "Once your order is confirmed, you'll receive a tracking link. You can also track your order in real-time through your order history in the dashboard.",
      category: "tracking"
    },
    {
      id: "4",
      question: "What if my order is late or incorrect?",
      answer: "If your order is late or incorrect, please contact our support team immediately. We'll work to resolve the issue and may offer compensation for the inconvenience.",
      category: "issues"
    },
    {
      id: "5",
      question: "Can I cancel my order?",
      answer: "You can cancel your order within 5 minutes of placing it. After that, please contact our support team as the restaurant may have already started preparing your food.",
      category: "ordering"
    },
    {
      id: "6",
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including credit/debit cards, digital wallets (PayPal, Google Pay, Apple Pay), and cash on delivery for eligible orders.",
      category: "payment"
    },
    {
      id: "7",
      question: "How do I add a restaurant to my favorites?",
      answer: "While browsing restaurants, click the heart icon next to any restaurant to add it to your favorites. You can access your favorites from the dashboard.",
      category: "account"
    },
    {
      id: "8",
      question: "Is there a minimum order amount?",
      answer: "Yes, each restaurant sets its own minimum order amount. This is displayed on the restaurant's page and in your cart before checkout.",
      category: "ordering"
    }
  ]

  const filteredFAQs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you'd send this to your API
    alert('Thank you for your message! We\'ll get back to you within 24 hours.')
    setContactForm({ name: "", email: "", subject: "", message: "" })
  }

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/user">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
                <p className="text-gray-600">Get help with your orders and account</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Contact Us
                </CardTitle>
                <CardDescription>Get in touch with our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm text-gray-600">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">support@grubclub.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Support Hours</p>
                    <p className="text-sm text-gray-600">24/7 Available</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Quick Links</h4>
                  <div className="space-y-2">
                    <Link href="/orders/history">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Order History
                      </Button>
                    </Link>
                    <Link href="/restaurants/browse">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Truck className="h-4 w-4 mr-2" />
                        Browse Restaurants
                      </Button>
                    </Link>
                    <Link href="/profile/edit">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Account Settings
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>Find answers to common questions</CardDescription>
                
                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div key={faq.id} className="border rounded-lg">
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      {expandedFAQ === faq.id && (
                        <div className="px-4 pb-4">
                          <p className="text-gray-600">{faq.answer}</p>
                          <Badge variant="secondary" className="mt-2">
                            {faq.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredFAQs.length === 0 && (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
                    <p className="text-gray-600">Try adjusting your search terms</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="border-0 shadow-lg bg-white mt-6">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>Can't find what you're looking for? Send us a message and we'll get back to you.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <Input
                        value={contactForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Subject</label>
                    <Input
                      value={contactForm.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="What can we help you with?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Message</label>
                    <Textarea
                      value={contactForm.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please describe your issue or question..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Support Resources */}
        <div className="mt-8">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
              <CardDescription>Helpful resources to enhance your experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Privacy & Security</h4>
                  <p className="text-sm text-gray-600 mb-3">Learn about how we protect your data</p>
                  <Button variant="outline" size="sm">Learn More</Button>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Terms of Service</h4>
                  <p className="text-sm text-gray-600 mb-3">Read our terms and conditions</p>
                  <Button variant="outline" size="sm">View Terms</Button>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Community</h4>
                  <p className="text-sm text-gray-600 mb-3">Join our community forum</p>
                  <Button variant="outline" size="sm">Join Forum</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 