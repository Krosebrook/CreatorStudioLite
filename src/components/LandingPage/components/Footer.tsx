import React from 'react';
import { Sparkles, Instagram, Youtube, Twitter, Linkedin, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Security', href: '#security' },
        { label: 'Roadmap', href: '#roadmap' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#about' },
        { label: 'Blog', href: '#blog' },
        { label: 'Careers', href: '#careers' },
        { label: 'Press', href: '#press' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#docs' },
        { label: 'Help Center', href: '#help' },
        { label: 'Community', href: '#community' },
        { label: 'Contact', href: '#contact' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Cookie Policy', href: '#cookies' },
        { label: 'GDPR', href: '#gdpr' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-neutral-900 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-success-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">SparkLabs</span>
            </div>
            <p className="text-neutral-400 text-sm mb-4">
              The all-in-one platform for content creators to create, publish, and monetize.
            </p>
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-neutral-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-neutral-400 text-sm">
              © {new Date().getFullYear()} SparkLabs. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-neutral-400">
              <a href="#privacy" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#terms" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="mailto:hello@sparklabs.io" className="flex items-center space-x-1 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                <span>hello@sparklabs.io</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
