export interface Testimonial {
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

export const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "Lifestyle Creator",
    company: "@sarahliveswell",
    avatar: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150",
    content: "SparkLabs transformed my content strategy. I went from 10K to 500K followers in 6 months, and my revenue increased by 400%. The AI suggestions are incredibly accurate.",
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
    content: "SparkLabs analytics dashboard is a game-changer. I can see exactly which content performs best across all platforms and optimize in real-time. My engagement rate doubled.",
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
    content: "Brand partnerships became so much easier to manage. SparkLabs marketplace connected me with premium brands, and I'm earning 3x more per collaboration.",
    metrics: {
      growth: "+300%",
      revenue: "$75K/month",
      followers: "1M+"
    },
    platforms: ["instagram", "tiktok", "pinterest"]
  }
];
