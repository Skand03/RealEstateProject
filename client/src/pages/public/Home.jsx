import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Shield, DollarSign, Users, Building2, Star,
  CheckCircle, ArrowRight, MapPin, ChevronRight,
  Home as HomeIcon, TrendingUp, Zap,
} from 'lucide-react';
import { propertyService } from '../../services/property.service';
import { formatPrice, getPrimaryImage } from '../../utils/formatters';
import PropertyCard from '../../components/property/PropertyCard';
import { PROPERTY_TYPES } from '../../utils/constants';

// ── Mini skeleton for featured loading ──────────────────────────────────────
const PropertySkeleton = () => (
  <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-pulse">
    <div className="h-52 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

// ── Step card ────────────────────────────────────────────────────────────────
const StepCard = ({ number, title, description, icon: Icon }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="relative">
      <div className="h-16 w-16 rounded-2xl bg-primary-100 flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors duration-300">
        <Icon className="h-8 w-8 text-primary-600 group-hover:text-white transition-colors duration-300" />
      </div>
      <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
        {number}
      </span>
    </div>
    <h3 className="font-heading font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 max-w-xs">{description}</p>
  </div>
);

// ── Feature card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <div className="card hover:shadow-card-hover transition-all duration-300 group">
    <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="font-heading font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
  </div>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ value, label, icon: Icon }) => (
  <div className="text-center">
    <div className="flex items-center justify-center gap-2 mb-1">
      <Icon className="h-6 w-6 text-primary-300" />
      <span className="text-3xl font-bold font-heading text-white">{value}</span>
    </div>
    <p className="text-primary-200 text-sm">{label}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Fetch 6 latest active properties
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoadingFeatured(true);
        const res = await propertyService.getProperties({
          limit: 6,
          status: 'ACTIVE',
          sortBy: '-createdAt',
        });
        setFeaturedProperties(res.data.data.properties || []);
      } catch {
        // silently fail — not critical
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set('city', city.trim());
    if (propertyType) params.set('propertyType', propertyType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/30 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-900/40 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

        <div className="page-container relative z-10 py-24 sm:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6 border border-white/20">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span>India's First Broker-Free Real Estate Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-tight mb-6">
              Find Your Dream{' '}
              <span className="text-yellow-300">Home</span>{' '}
              Without the Broker
            </h1>

            <p className="text-primary-100 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl">
              Connect directly with verified property owners. No middlemen, transparent 2.5% platform fee, and 100% genuine listings across India.
            </p>

            {/* Search form */}
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl p-3 flex flex-col sm:flex-row gap-3 shadow-2xl max-w-2xl"
            >
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter city or location..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-gray-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="sm:w-44 px-3 py-2.5 text-gray-700 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">All Types</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <button
                type="submit"
                className="btn-primary px-6 py-2.5 flex items-center justify-center gap-2 rounded-xl whitespace-nowrap"
              >
                <Search className="h-4 w-4" />
                Find Properties
              </button>
            </form>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm text-primary-200">
              {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune'].map((c) => (
                <button
                  key={c}
                  onClick={() => navigate(`/properties?city=${c}`)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <MapPin className="h-3 w-3" />
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ROW ─────────────────────────────────────────────────────── */}
      <section className="bg-primary-700">
        <div className="page-container py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <StatCard value="500+" label="Active Properties" icon={Building2} />
            <StatCard value="1,000+" label="Happy Users" icon={Users} />
            <StatCard value="Zero" label="Brokers Involved" icon={Shield} />
            <StatCard value="100%" label="Verified Sellers" icon={CheckCircle} />
          </div>
        </div>
      </section>

      {/* ── WHY HAIKYUUHEIGHTS ────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="section-title">Why HaikyuuHeights?</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              We're redefining real estate in India — no brokers, no hidden charges, just direct connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Shield}
              title="Verified Sellers Only"
              description="Every seller on our platform goes through a thorough verification process including ID, address, and property ownership checks."
              color="bg-primary-600"
            />
            <FeatureCard
              icon={DollarSign}
              title="Zero Brokerage"
              description="No broker fees, no hidden charges. Just a transparent 2.5% platform fee — the same for buyers and sellers — charged only on successful deals."
              color="bg-green-600"
            />
            <FeatureCard
              icon={Users}
              title="Direct Connect"
              description="Message sellers directly, book property visits, and negotiate terms without any third-party involvement."
              color="bg-accent-600"
            />
          </div>
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ───────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">Featured Properties</h2>
              <p className="section-subtitle">Handpicked listings from verified sellers</p>
            </div>
            <Link
              to="/properties"
              className="hidden sm:flex items-center gap-1 text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <PropertySkeleton key={i} />)}
            </div>
          ) : featuredProperties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProperties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link to="/properties" className="btn-outline px-8 py-3 inline-flex items-center gap-2">
                  Browse All Properties <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No featured properties at the moment. Check back soon!</p>
              <Link to="/properties" className="btn-primary mt-4 inline-flex items-center gap-2">
                Browse All Properties
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle max-w-lg mx-auto">
              Getting started is simple — just four steps to your perfect property.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />

            <StepCard
              number="1"
              icon={Users}
              title="Register"
              description="Create your free account as a Buyer or Seller in under 2 minutes."
            />
            <StepCard
              number="2"
              icon={Shield}
              title="Verify"
              description="Sellers complete a one-time verification to prove ownership and identity."
            />
            <StepCard
              number="3"
              icon={Building2}
              title="List or Search"
              description="Sellers list properties with photos and details. Buyers search with powerful filters."
            />
            <StepCard
              number="4"
              icon={HomeIcon}
              title="Connect"
              description="Message directly, book a visit, and close the deal — all on one platform."
            />
          </div>
        </div>
      </section>

      {/* ── COMMISSION INFO ───────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="page-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="section-title">Transparent Platform Fee</h2>
              <p className="section-subtitle">No surprises, no hidden costs — ever.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buyer card */}
              <div className="card border border-primary-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-gray-900">For Buyers</h3>
                    <p className="text-xs text-gray-500">One-time platform fee</p>
                  </div>
                </div>
                <p className="text-4xl font-bold font-heading text-primary-600 mb-3">2.5%</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  {['Charged only on successful purchase/rental', 'No upfront fees', 'Covers buyer protection & platform services', 'Much less than traditional broker fees (2–5%)'].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Seller card */}
              <div className="card border border-primary-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-gray-900">For Sellers</h3>
                    <p className="text-xs text-gray-500">One-time platform fee</p>
                  </div>
                </div>
                <p className="text-4xl font-bold font-heading text-green-600 mb-3">2.5%</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  {['Charged only when property is sold/rented', 'Free to list unlimited properties', 'Covers seller verification & listing services', 'Way cheaper than broker commissions (1–3%)'].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-center text-sm text-gray-400 mt-6">
              Traditional brokers charge 1–5% commission per side. With HaikyuuHeights, the fee is fixed, transparent, and goes directly to platform maintenance.
            </p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS / SOCIAL PROOF ──────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-subtitle">Real stories from real people</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ananya Sharma',
                role: 'Buyer – Mumbai',
                quote: "Found my dream apartment in Bandra without paying a single rupee to a broker. The whole process was smooth and transparent!",
                rating: 5,
                avatar: 'AS',
              },
              {
                name: 'Rajan Mehta',
                role: 'Seller – Bangalore',
                quote: "Listed my property in 10 minutes. Got three genuine inquiries the same week. The verification process gave buyers confidence.",
                rating: 5,
                avatar: 'RM',
              },
              {
                name: 'Priya Nair',
                role: 'Buyer – Hyderabad',
                quote: "I was skeptical at first, but direct messaging with the seller made everything so much easier. No broker games!",
                rating: 5,
                avatar: 'PN',
              },
            ].map((t) => (
              <div key={t.name} className="card hover:shadow-card-hover transition-all duration-300">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="page-container text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-6 text-yellow-300" />
          <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-primary-200 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of Indians who've discovered a smarter, broker-free way to buy, sell, and rent property.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-primary-700 hover:bg-primary-50 font-semibold px-8 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              Register as Buyer <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="border border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              List Your Property
            </Link>
          </div>
          <p className="text-primary-300 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-white underline hover:no-underline">
              Login here
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
