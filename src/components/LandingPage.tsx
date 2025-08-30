import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../design-system/utils/cn';
import { Button } from '../design-system/components/Button';
import { Input } from '../design-system/components/Input';
import { Card } from '../design-system/components/Card';
import { 
  ArrowRight, 
  Play, 
  Star, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  Globe, 
  Smartphone, 
  BarChart3, 
  Camera, 
  Sparkles, 
  DollarSign, 
  Target, 
  CheckCircle, 
  ArrowUpRight,
  Menu,
  X,
  ChevronDown,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Clock,
  Rocket,
  Brain,
  Palette,
  Mic,
  Video,
  Image,
  FileText,
  Calendar,
  PieChart,
  Award,
  Briefcase,
  Coffee,
  Headphones,
  Monitor,
  Layers,
  Filter,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Lock,
  Unlock,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  metrics: {
    growth: string;
    revenue: string;
    followers: string;
  };
  platforms: string[];
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  demo?: React.ReactNode;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  badge?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "Lifestyle Creator",
    company: "@sarahliveswell",
    avatar: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150",
    content: "FlashFusion transformed my content strategy. I went from 10K to 500K followers in 6 months, and my revenue increased by 400%. The AI suggestions are incredibly accurate.",
    metrics: {
      growth: "+5000%",
      revenue: "$50K/month",
      followers: "500K+"
    },
    platforms: ["instagram", "tiktok", "youtube"]
  },
  {
    name: "Marcus Rodriguez",
    role: "Tech Reviewer",
    company: "@techwithmarcus",
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150",
    content: "The analytics dashboard is a game-changer. I can see exactly which content performs best across all platforms and optimize in real-time. My engagement rate doubled.",
    metrics: {
      growth: "+200%",
      revenue: "$25K/month",
      followers: "250K+"
    },
    platforms: ["youtube", "twitter", "linkedin"]
  },
  {
    name: "Emma Thompson",
    role: "Fashion Influencer",
    company: "@emmastyle",
    avatar: "https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=150",
    content: "Brand partnerships became so much easier to manage. FlashFusion's marketplace connected me with premium brands, and I'm earning 3x more per collaboration.",
    metrics: {
      growth: "+300%",
      revenue: "$75K/month",
      followers: "1M+"
    },
    platforms: ["instagram", "tiktok", "pinterest"]
  }
];

const features: Feature[] = [
  {
    icon: <Brain className="w-8 h-8" />,
    title: "AI-Powered Content Creation",
    description: "Generate viral content ideas, captions, and hashtags using advanced AI that understands your niche and audience.",
    benefits: [
      "10x faster content creation",
      "Viral prediction algorithm",
      "Brand voice consistency",
      "Multi-platform optimization"
    ]
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Real-Time Analytics Dashboard",
    description: "Track performance across all platforms with actionable insights and revenue attribution.",
    benefits: [
      "Cross-platform analytics",
      "Revenue tracking",
      "Audience insights",
      "Performance predictions"
    ]
  },
  {
    icon: <Rocket className="w-8 h-8" />,
    title: "Smart Publishing Engine",
    description: "Schedule and publish content across all major platforms with optimal timing suggestions.",
    benefits: [
      "Multi-platform publishing",
      "Optimal timing AI",
      "Bulk scheduling",
      "Auto-optimization"
    ]
  },
  {
    icon: <DollarSign className="w-8 h-8" />,
    title: "Revenue Optimization",
    description: "Maximize earnings with brand partnership matching, pricing optimization, and revenue forecasting.",
    benefits: [
      "Brand partnership matching",
      "Revenue forecasting",
      "Pricing optimization",
      "Tax reporting"
    ]
  }
];

const pricingTiers: PricingTier[] = [
  {
    name: "Creator",
    price: "$29",
    period: "/month",
    description: "Perfect for individual creators starting their journey",
    features: [
      "Up to 3 social platforms",
      "AI content generation (100/month)",
      "Basic analytics dashboard",
      "Content scheduling",
      "Email support"
    ],
    cta: "Start Creating"
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
    description: "For serious creators ready to scale their business",
    features: [
      "Unlimited social platforms",
      "Unlimited AI content generation",
      "Advanced analytics & insights",
      "Brand partnership marketplace",
      "Revenue optimization tools",
      "Priority support",
      "Custom branding"
    ],
    highlighted: true,
    cta: "Go Pro",
    badge: "Most Popular"
  },
  {
    name: "Agency",
    price: "$199",
    period: "/month",
    description: "For agencies managing multiple creator accounts",
    features: [
      "Everything in Pro",
      "Manage up to 10 creators",
      "Team collaboration tools",
      "White-label solution",
      "Advanced reporting",
      "Dedicated account manager",
      "Custom integrations"
    ],
    cta: "Scale Your Agency"
  }
];

export const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  const [email, setEmail] = useState('');
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [userType, setUserType] = useState<'creator' | 'agency' | 'brand'>('creator');
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignupOpen(true);
  };

  const handleUserTypeSelect = (type: 'creator' | 'agency' | 'brand') => {
    setUserType(type);
    setSignupStep(2);
  };

  const completeSignup = () => {
    // Simulate account creation
    setTimeout(() => {
      alert(`Welcome to FlashFusion! Your ${userType} account has been created. Check your email for next steps.`);
      setIsSignupOpen(false);
      setSignupStep(1);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrollY > 50 ? "bg-white/95 backdrop-blur-lg border-b border-neutral-200 shadow-sm" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                FlashFusion
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection(featuresRef)}
                className="text-neutral-600 hover:text-primary-600 font-medium transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection(pricingRef)}
                className="text-neutral-600 hover:text-primary-600 font-medium transition-colors"
              >
                Pricing
              </button>
              <a href="#" className="text-neutral-600 hover:text-primary-600 font-medium transition-colors">
                Resources
              </a>
              <a href="#" className="text-neutral-600 hover:text-primary-600 font-medium transition-colors">
                Support
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setIsSignupOpen(true)}
                leftIcon={<Rocket className="w-4 h-4" />}
              >
                Start Free Trial
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-neutral-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <button 
                onClick={() => {
                  scrollToSection(featuresRef);
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-neutral-600 hover:text-primary-600 font-medium py-2"
              >
                Features
              </button>
              <button 
                onClick={() => {
                  scrollToSection(pricingRef);
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-neutral-600 hover:text-primary-600 font-medium py-2"
              >
                Pricing
              </button>
              <a href="#" className="block text-neutral-600 hover:text-primary-600 font-medium py-2">
                Resources
              </a>
              <a href="#" className="block text-neutral-600 hover:text-primary-600 font-medium py-2">
                Support
              </a>
              <div className="pt-4 border-t border-neutral-200 space-y-3">
                <Button variant="ghost" fullWidth>
                  Sign In
                </Button>
                <Button 
                  variant="primary" 
                  fullWidth
                  onClick={() => {
                    setIsSignupOpen(true);
                    setIsMenuOpen(false);
                  }}
                  leftIcon={<Rocket className="w-4 h-4" />}
                >
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-24 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-success-50/30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-success-200/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Creator Platform</span>
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-neutral-900 via-primary-800 to-primary-600 bg-clip-text text-transparent">
                    Create. Publish. 
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary-600 to-success-600 bg-clip-text text-transparent">
                    Earn More.
                  </span>
                </h1>
                <p className="text-xl text-neutral-600 leading-relaxed max-w-2xl">
                  The all-in-one platform that helps creators generate viral content, 
                  publish across all platforms, and maximize revenue with AI-powered insights.
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">500K+</div>
                  <div className="text-sm text-neutral-600">Active Creators</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">$50M+</div>
                  <div className="text-sm text-neutral-600">Creator Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-600">10B+</div>
                  <div className="text-sm text-neutral-600">Content Views</div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  variant="primary"
                  onClick={() => setIsSignupOpen(true)}
                  leftIcon={<Rocket className="w-5 h-5" />}
                  className="text-lg px-8 py-4"
                >
                  Start Free Trial
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost"
                  leftIcon={<Play className="w-5 h-5" />}
                  className="text-lg px-8 py-4"
                >
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning-400 text-warning-400" />
                  ))}
                  <span className="text-sm text-neutral-600 ml-2">4.9/5 from 10K+ reviews</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                {/* Mock Dashboard */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-900">Content Performance</h3>
                    <div className="flex items-center space-x-2 text-success-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">+247%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600">1.2M</div>
                      <div className="text-xs text-neutral-600">Views</div>
                    </div>
                    <div className="bg-success-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-success-600">89K</div>
                      <div className="text-xs text-neutral-600">Likes</div>
                    </div>
                    <div className="bg-warning-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-warning-600">$2.4K</div>
                      <div className="text-xs text-neutral-600">Revenue</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Viral Potential</span>
                      <span className="font-medium text-success-600">94%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-success-500 to-primary-500 h-2 rounded-full w-[94%]" />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                      <Instagram className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Youtube className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <Twitter className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-success-500 text-white p-3 rounded-xl shadow-lg animate-bounce">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-primary-500 text-white p-3 rounded-xl shadow-lg animate-pulse">
                <Zap className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-neutral-600 font-medium">Trusted by creators at</p>
          </div>
          <div className="flex items-center justify-center space-x-12 opacity-60">
            {/* Mock company logos */}
            <div className="text-2xl font-bold text-neutral-400">Netflix</div>
            <div className="text-2xl font-bold text-neutral-400">Disney</div>
            <div className="text-2xl font-bold text-neutral-400">Adobe</div>
            <div className="text-2xl font-bold text-neutral-400">Spotify</div>
            <div className="text-2xl font-bold text-neutral-400">Nike</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Everything you need to succeed as a creator
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              From AI-powered content generation to advanced analytics and revenue optimization, 
              FlashFusion provides all the tools you need in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary-100 rounded-xl text-primary-600 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600 mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center space-x-2 text-sm text-neutral-700">
                          <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Loved by creators worldwide
            </h2>
            <p className="text-xl text-neutral-600">
              See how FlashFusion is transforming creator businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                      <div className="text-sm text-neutral-600">{testimonial.role}</div>
                      <div className="text-sm text-primary-600">{testimonial.company}</div>
                    </div>
                  </div>

                  <p className="text-neutral-700 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
                    <div className="text-center">
                      <div className="font-bold text-success-600">{testimonial.metrics.growth}</div>
                      <div className="text-xs text-neutral-600">Growth</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-primary-600">{testimonial.metrics.revenue}</div>
                      <div className="text-xs text-neutral-600">Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-warning-600">{testimonial.metrics.followers}</div>
                      <div className="text-xs text-neutral-600">Followers</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {testimonial.platforms.map((platform, i) => (
                      <div key={i} className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-primary-500 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-20 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Choose your plan
            </h2>
            <p className="text-xl text-neutral-600">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={cn(
                  "p-8 relative",
                  tier.highlighted 
                    ? "border-2 border-primary-500 shadow-xl scale-105" 
                    : "hover:shadow-lg transition-shadow"
                )}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      {tier.badge}
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-neutral-900">{tier.price}</span>
                    <span className="text-neutral-600 ml-1">{tier.period}</span>
                  </div>
                  <p className="text-neutral-600 mt-2">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
                      <span className="text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={tier.highlighted ? "primary" : "secondary"}
                  fullWidth
                  size="lg"
                  onClick={() => setIsSignupOpen(true)}
                >
                  {tier.cta}
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-neutral-600 mb-4">
              Need a custom solution? We've got you covered.
            </p>
            <Button variant="ghost" leftIcon={<Mail className="w-4 h-4" />}>
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to transform your creator business?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join 500,000+ creators who are already earning more with FlashFusion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setIsSignupOpen(true)}
              leftIcon={<Rocket className="w-5 h-5" />}
              className="text-lg px-8 py-4"
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="ghost"
              leftIcon={<Calendar className="w-5 h-5" />}
              className="text-lg px-8 py-4 text-white border-white hover:bg-white/10"
            >
              Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">FlashFusion</span>
              </div>
              <p className="text-neutral-400">
                Empowering creators to build successful businesses with AI-powered tools and insights.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Creator Academy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-neutral-400">
              © 2024 FlashFusion. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Status
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Security
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Changelog
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Signup Modal */}
      {isSignupOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-neutral-900">
                  {signupStep === 1 ? 'Join FlashFusion' : 'Tell us about yourself'}
                </h3>
                <button
                  onClick={() => {
                    setIsSignupOpen(false);
                    setSignupStep(1);
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {signupStep === 1 && (
                <div className="space-y-4">
                  <p className="text-neutral-600">
                    Start your 14-day free trial. No credit card required.
                  </p>
                  
                  <form onSubmit={handleSignup} className="space-y-4">
                    <Input
                      label="Email address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="creator@example.com"
                      required
                    />
                    
                    <Button type="submit" variant="primary" fullWidth size="lg">
                      Continue
                    </Button>
                  </form>

                  <div className="text-center">
                    <p className="text-sm text-neutral-600">
                      Already have an account?{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                        Sign in
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {signupStep === 2 && (
                <div className="space-y-6">
                  <p className="text-neutral-600">
                    Choose your account type to get personalized features
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => handleUserTypeSelect('creator')}
                      className="w-full p-4 border-2 border-neutral-200 rounded-xl hover:border-primary-500 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Camera className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">Individual Creator</div>
                          <div className="text-sm text-neutral-600">Perfect for solo creators and influencers</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleUserTypeSelect('agency')}
                      className="w-full p-4 border-2 border-neutral-200 rounded-xl hover:border-primary-500 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-success-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">Agency/Team</div>
                          <div className="text-sm text-neutral-600">Manage multiple creator accounts</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleUserTypeSelect('brand')}
                      className="w-full p-4 border-2 border-neutral-200 rounded-xl hover:border-primary-500 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-warning-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">Brand/Business</div>
                          <div className="text-sm text-neutral-600">Find and collaborate with creators</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {signupStep === 3 && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-success-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-neutral-900">
                    Welcome to FlashFusion!
                  </h4>
                  <p className="text-neutral-600">
                    Your {userType} account is being set up. Check your email for next steps.
                  </p>
                  <Button 
                    variant="primary" 
                    fullWidth 
                    size="lg"
                    onClick={completeSignup}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};