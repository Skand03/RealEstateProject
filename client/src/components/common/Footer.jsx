import { Link } from 'react-router-dom'
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400">
    <div className="page-container py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading font-bold text-white text-lg">
              Haikyu<span className="text-primary-400">Heights</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed mb-4">
            India's first broker-free real estate platform. Connect directly with verified property owners.
          </p>
          <div className="flex gap-3">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="h-8 w-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[['/', 'Home'], ['/properties', 'Properties'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* For Users */}
        <div>
          <h4 className="text-white font-semibold mb-4">For Users</h4>
          <ul className="space-y-2 text-sm">
            {[['/register', 'Register as Buyer'], ['/register', 'Register as Seller'], ['/login', 'Login'], ['/about', 'How It Works']].map(([to, label], i) => (
              <li key={i}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-primary-400 flex-shrink-0" />
              <span>123 Real Estate Ave, Mumbai, Maharashtra 400001</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary-400 flex-shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary-400 flex-shrink-0" />
              <span>hello@haikyuheights.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
        <p>© {new Date().getFullYear()} HaikyuuHeights. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
