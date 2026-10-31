import { Building2, Target, Users, Award, TrendingUp, Shield, Heart, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const About = () => {
  const features = [
    {
      icon: Shield,
      title: 'Broker-Free Platform',
      description: 'Connect directly with property owners and buyers, eliminating middlemen and saving on commission fees.'
    },
    {
      icon: Users,
      title: 'Verified Sellers',
      description: 'All sellers undergo thorough verification to ensure authenticity and build trust in every transaction.'
    },
    {
      icon: TrendingUp,
      title: 'Transparent Pricing',
      description: 'Fair and transparent commission structure with no hidden fees. Know exactly what you pay upfront.'
    },
    {
      icon: Heart,
      title: 'User-Friendly',
      description: 'Intuitive interface designed for seamless property search, listing, and communication.'
    }
  ]

  const stats = [
    { value: '10,000+', label: 'Properties Listed' },
    { value: '5,000+', label: 'Happy Customers' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '50+', label: 'Cities Covered' }
  ]

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop'
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop'
    },
    {
      name: 'Amit Patel',
      role: 'Technology Lead',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop'
    },
    {
      name: 'Sneha Reddy',
      role: 'Customer Success',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="h-16 w-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Building2 className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Haikyu<span className="text-accent-400">Heights</span>
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Revolutionizing real estate by connecting buyers and sellers directly, 
              making property transactions transparent, affordable, and hassle-free.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary-600 mb-4">
                <Target className="h-6 w-6" />
                <span className="font-semibold">Our Mission</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Making Real Estate Accessible to Everyone
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                HaikyuuHeights was founded with a simple yet powerful vision: to eliminate the complexities 
                and high costs associated with traditional real estate transactions.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We believe that buying or selling a property should be straightforward, transparent, 
                and affordable. By leveraging technology and creating a direct connection between 
                buyers and sellers, we're transforming the real estate industry.
              </p>
              <Link to="/properties" className="btn-primary inline-flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Explore Properties
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop"
                alt="Modern real estate"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                <Award className="h-8 w-8 text-primary-600 mb-2" />
                <p className="font-bold text-gray-900">Award Winning Platform</p>
                <p className="text-sm text-gray-600">Trusted by thousands</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best real estate experience with features designed for your success
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Passionate professionals dedicated to transforming your real estate experience
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card overflow-hidden group">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-primary-600 font-medium">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied users who have found their dream properties with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-secondary bg-white text-primary-600 hover:bg-gray-100 px-8 py-3">
              Create Account
            </Link>
            <Link to="/contact" className="btn-outline border-white text-white hover:bg-white/10 px-8 py-3">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
