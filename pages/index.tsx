/**
 * XalesIn ERP - Landing Page
 * 
 * This is the main landing page for the XalesIn ERP application.
 * It provides an overview of the platform's features and capabilities.
 * 
 * Features:
 * - Modern, responsive design
 * - Feature showcase
 * - Call-to-action sections
 * - Authentication integration
 * - Multi-tenant support
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { type NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { 
  ArrowRight, 
  BarChart3, 
  Building2, 
  CheckCircle, 
  DollarSign, 
  Package, 
  Shield, 
  Users, 
  Zap,
  Menu,
  X
} from 'lucide-react'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { LandingPageHeader } from '../components/landing-page-header'
import { Hero } from '../components/hero'
import { Features } from '../components/features'
import { Pricing } from '../components/pricing'
import { Footer } from '../components/footer'
import { ColorModeSwitcher } from '../components/color-mode-switcher'
import { api } from '../lib/api'
import { env } from '../env.mjs'

/**
 * Feature data for the landing page
 */
const features = [
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Track stock levels, manage suppliers, and automate reordering with real-time inventory insights.',
    benefits: ['Real-time stock tracking', 'Automated reorder points', 'Supplier management', 'Barcode scanning']
  },
  {
    icon: DollarSign,
    title: 'Financial Management',
    description: 'Complete accounting suite with invoicing, expense tracking, and financial reporting.',
    benefits: ['Automated invoicing', 'Expense tracking', 'Financial reports', 'Tax management']
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Powerful analytics dashboard with customizable reports and business intelligence.',
    benefits: ['Custom dashboards', 'Real-time analytics', 'Export capabilities', 'KPI tracking']
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Role-based access control and team management for seamless collaboration.',
    benefits: ['Role-based permissions', 'Team workspaces', 'Activity tracking', 'Communication tools']
  },
  {
    icon: Building2,
    title: 'Multi-Tenant Architecture',
    description: 'Secure, scalable multi-tenant platform that grows with your business.',
    benefits: ['Data isolation', 'Custom branding', 'Scalable infrastructure', 'Enterprise security']
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security with encryption, audit logs, and compliance features.',
    benefits: ['Data encryption', 'Audit trails', 'Compliance ready', 'Backup & recovery']
  }
]

/**
 * Statistics data
 */
const stats = [
  { label: 'Active Users', value: '10,000+' },
  { label: 'Transactions Processed', value: '$50M+' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Countries', value: '25+' }
]

/**
 * Testimonials data
 */
const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CEO, TechStart Inc.',
    content: 'XalesIn ERP transformed our business operations. The inventory management alone saved us 30% in operational costs.',
    avatar: '/avatars/sarah.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'CFO, GrowthCorp',
    content: 'The financial reporting features are incredible. We now have real-time insights into our business performance.',
    avatar: '/avatars/michael.jpg'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Operations Manager, ScaleCo',
    content: 'Multi-tenant architecture made it easy to manage multiple business units. Highly recommended!',
    avatar: '/avatars/emily.jpg'
  }
]

/**
 * Main Landing Page Component
 */
const LandingPage: NextPage = () => {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Check if user is already authenticated
  const { data: session, isLoading } = api.auth.getSession.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  })

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (session?.user && !isLoading) {
      router.push('/dashboard')
    }
  }, [session, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render landing page if user is authenticated
  if (session?.user) {
    return null
  }

  return (
    <>
      <Head>
        <title>{env.NEXT_PUBLIC_APP_NAME} - Modern ERP Solution</title>
        <meta 
          name="description" 
          content="Streamline your business operations with XalesIn ERP. Comprehensive inventory management, financial tracking, and analytics in one powerful platform." 
        />
        <meta name="keywords" content="ERP, inventory management, financial management, business software, multi-tenant" />
        <meta property="og:title" content={`${env.NEXT_PUBLIC_APP_NAME} - Modern ERP Solution`} />
        <meta property="og:description" content="Streamline your business operations with comprehensive ERP features" />
        <meta property="og:type" content="website" />
        {env.NEXT_PUBLIC_APP_URL && (
          <meta property="og:url" content={env.NEXT_PUBLIC_APP_URL} />
        )}
        <link rel="canonical" href={env.NEXT_PUBLIC_APP_URL || 'https://xalesin.com'} />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <LandingPageHeader />

        {/* Hero Section */}
        <Hero />

        {/* Stats Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <Features />

        {/* Detailed Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Run Your Business
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                From inventory management to financial reporting, XalesIn ERP provides 
                all the tools you need to streamline operations and drive growth.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Trusted by Growing Businesses
              </h2>
              <p className="text-xl text-muted-foreground">
                See what our customers have to say about XalesIn ERP
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="h-full">
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <Pricing />

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of businesses that trust XalesIn ERP to streamline 
              their operations and drive growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-3"
                onClick={() => router.push('/auth/signup')}
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-3 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                onClick={() => router.push('/demo')}
              >
                View Demo
              </Button>
            </div>
            <p className="text-sm mt-6 opacity-75">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}

export default LandingPage