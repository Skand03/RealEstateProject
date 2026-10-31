import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Building2, Clock, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { contactService } from '../../services/contact.service'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.message.trim().length < 10) {
      toast.error('Message must be at least 10 characters.')
      return
    }
    setLoading(true)

    try {
      await contactService.create({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      })
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      const validationMessage = err.response?.data?.errors?.[0]?.message
      toast.error(validationMessage || err.response?.data?.message || 'Unable to send your message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Call Us',
      detail: '+91 98765 43210',
      subDetail: 'Mon-Sat, 9 AM - 7 PM'
    },
    {
      icon: Mail,
      title: 'Email Us',
      detail: 'support@haikyuuheights.com',
      subDetail: 'We reply within 24 hours'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      detail: '123 Real Estate Plaza',
      subDetail: 'Mumbai, Maharashtra 400001'
    }
  ]

  const faqs = [
    {
      question: 'How do I list my property?',
      answer: 'Create a seller account, complete verification, and you can start listing properties immediately.'
    },
    {
      question: 'What are the commission charges?',
      answer: 'We charge a transparent 2.5% commission on successful transactions - much lower than traditional brokers.'
    },
    {
      question: 'How long does verification take?',
      answer: 'Seller verification typically takes 1-2 business days after submitting all required documents.'
    },
    {
      question: 'Can I schedule property visits?',
      answer: 'Yes! You can directly message property owners through our platform to schedule visits.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-6 text-primary-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Have questions? We're here to help you navigate your real estate journey
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 -mt-32 relative z-10">
            {contactInfo.map((info, index) => (
              <div key={index} className="card p-8 text-center bg-white shadow-xl hover:shadow-2xl transition-shadow">
                <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <info.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
                <p className="text-lg text-primary-600 font-semibold mb-1">{info.detail}</p>
                <p className="text-sm text-gray-500">{info.subDetail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Send us a Message</h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="label">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      required
                      className="input-field"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="label">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      className="input-field"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="label">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="input-field"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="label">Subject</label>
                  <select
                    id="subject"
                    required
                    className="input-field"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="verification">Verification Issues</option>
                    <option value="listing">Property Listing</option>
                    <option value="payment">Payment & Commission</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="label">Message</label>
                  <textarea
                    id="message"
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-gray-500">At least 10 characters.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              {/* Map */}
              <div className="card overflow-hidden">
                <div className="h-80 bg-gray-200 relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709658!3d19.082177513379776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Office Location"
                  />
                </div>
              </div>

              {/* Office Hours */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Office Hours</h3>
                </div>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-semibold text-gray-900">9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-semibold text-gray-900">10:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold text-gray-900">Closed</span>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="card p-6 bg-primary-50 border-primary-200">
                <div className="flex items-start gap-3">
                  <Building2 className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Need Immediate Assistance?</h4>
                    <p className="text-sm text-gray-600">
                      For urgent matters, please call our 24/7 support line or use the live chat feature in your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Quick answers to common questions
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
