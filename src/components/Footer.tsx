import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import api from '@/api/client';

const Footer = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    api.get('/settings').then(res => setSettings(res.data)).catch(() => { });
  }, []);

  return (
    <footer className="bg-[#172337] text-white mt-8">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* About */}
          <div>
            <h4 className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wider">About</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-gray-300 hover:underline">Contact Us</Link></li>
              <li><Link to="/about" className="text-sm text-gray-300 hover:underline">About Us</Link></li>
              <li><Link to="/about" className="text-sm text-gray-300 hover:underline">Vruksha Composites Stories</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wider">Help</h4>
            <ul className="space-y-2">
              <li><Link to="/payments" className="text-sm text-gray-300 hover:underline">Payments</Link></li>
              <li><Link to="/shipping" className="text-sm text-gray-300 hover:underline">Shipping</Link></li>
              <li><Link to="/cancellation" className="text-sm text-gray-300 hover:underline">Cancellation & Returns</Link></li>
              <li><Link to="/faq" className="text-sm text-gray-300 hover:underline">FAQ</Link></li>
              <li><Link to="/report" className="text-sm text-gray-300 hover:underline">Report Infringement</Link></li>
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h4 className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wider">Policy</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-sm text-gray-300 hover:underline">Terms Of Use</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-300 hover:underline">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wider">Social</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-300 hover:underline flex items-center gap-2"><Facebook size={16} /> Facebook</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:underline flex items-center gap-2"><Twitter size={16} /> Twitter</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:underline flex items-center gap-2"><Instagram size={16} /> Instagram</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:underline flex items-center gap-2"><Linkedin size={16} /> LinkedIn</a></li>
            </ul>
          </div>

          {/* Mail Us / Contact Us */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <h4 className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wider">Contact Us</h4>

            <div className="space-y-4">
              {settings?.contactAddress && (
                <div className="flex gap-3 text-gray-300">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{settings.contactAddress}</p>
                </div>
              )}

              {settings?.contactEmail && (
                <div className="flex gap-3 text-gray-300">
                  <Mail size={16} className="shrink-0" />
                  <a href={`mailto:${settings.contactEmail}`} className="text-sm hover:underline">{settings.contactEmail}</a>
                </div>
              )}

              {settings?.contactPhone && (
                <div className="flex gap-3 text-gray-300">
                  <Phone size={16} className="shrink-0" />
                  <a href={`tel:${settings.contactPhone.replace(/\D/g, '')}`} className="text-sm hover:underline">{settings.contactPhone}</a>
                </div>
              )}

              {/* Fallback if no settings (keeps UI pretty while loading/empty) */}
              {!settings?.contactAddress && !settings?.contactEmail && (
                <p className="text-xs text-gray-500 italic">Contact details will appear here once updated by the administrator.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Payment Methods */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>We Accept:</span>
              <div className="flex items-center gap-2">
                <span className="bg-white text-gray-800 px-2 py-1 rounded text-xs font-medium">VISA</span>
                <span className="bg-white text-gray-800 px-2 py-1 rounded text-xs font-medium">Mastercard</span>
                <span className="bg-white text-gray-800 px-2 py-1 rounded text-xs font-medium">RuPay</span>
                <span className="bg-white text-gray-800 px-2 py-1 rounded text-xs font-medium">UPI</span>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-xs text-gray-400">
              © 2024 Vruksha Composites. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
