require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User.model');
const SellerVerification = require('../src/models/SellerVerification.model');
const Property = require('../src/models/Property.model');
const Booking = require('../src/models/Booking.model');
const Review = require('../src/models/Review.model');
const Conversation = require('../src/models/Conversation.model');
const Message = require('../src/models/Message.model');
const Commission = require('../src/models/Commission.model');
const Favorite = require('../src/models/Favorite.model');

const {
  ROLES,
  VERIFICATION_STATUS,
  PROPERTY_STATUS,
  BOOKING_STATUS,
  COMMISSION_RATES,
  COMMISSION_STATUS,
} = require('../src/utils/constants');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      SellerVerification.deleteMany({}),
      Property.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Commission.deleteMany({}),
      Favorite.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data.');

    // ── USERS ──────────────────────────────────────────────
    const adminUser = await User.create({
      fullName: 'Admin User',
      email: 'admin@haikyuuheights.com',
      phone: '+91-9000000001',
      password: 'Admin@123',
      role: ROLES.ADMIN,
    });

    const approvedSeller = await User.create({
      fullName: 'Rajesh Kumar',
      email: 'seller@haikyuuheights.com',
      phone: '+91-9000000002',
      password: 'Seller@123',
      role: ROLES.SELLER,
    });

    const pendingSeller = await User.create({
      fullName: 'Priya Sharma',
      email: 'seller2@haikyuuheights.com',
      phone: '+91-9000000003',
      password: 'Seller@123',
      role: ROLES.SELLER,
    });

    const buyer1 = await User.create({
      fullName: 'Amit Patel',
      email: 'buyer1@haikyuuheights.com',
      phone: '+91-9000000004',
      password: 'Buyer@123',
      role: ROLES.BUYER,
    });

    const buyer2 = await User.create({
      fullName: 'Sneha Joshi',
      email: 'buyer2@haikyuuheights.com',
      phone: '+91-9000000005',
      password: 'Buyer@123',
      role: ROLES.BUYER,
    });

    console.log('👤 Users created.');

    // ── SELLER VERIFICATIONS ──────────────────────────────
    await SellerVerification.create({
      seller: approvedSeller._id,
      identityProof: {
        url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        publicId: 'demo/identity_proof_1',
        fileType: 'image/jpeg',
        originalName: 'aadhar_card.jpg',
      },
      ownershipProof: {
        url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        publicId: 'demo/ownership_proof_1',
        fileType: 'image/jpeg',
        originalName: 'property_deed.jpg',
      },
      status: VERIFICATION_STATUS.APPROVED,
      adminNote: 'Documents verified successfully.',
      reviewedBy: adminUser._id,
      reviewedAt: new Date(),
    });

    await SellerVerification.create({
      seller: pendingSeller._id,
      identityProof: {
        url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        publicId: 'demo/identity_proof_2',
        fileType: 'image/jpeg',
        originalName: 'pan_card.jpg',
      },
      ownershipProof: {
        url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        publicId: 'demo/ownership_proof_2',
        fileType: 'image/jpeg',
        originalName: 'registry_doc.jpg',
      },
      status: VERIFICATION_STATUS.PENDING,
    });

    console.log('✅ Seller verifications created.');

    // ── PROPERTIES ────────────────────────────────────────
    const sampleImages = [
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        publicId: 'demo/property_img_1',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
        publicId: 'demo/property_img_2',
        isPrimary: false,
      },
    ];

    const property1 = await Property.create({
      title: 'Spacious 3 BHK Apartment in Bandra West',
      description:
        'A beautifully furnished 3 BHK apartment located in the prime area of Bandra West. The property boasts modern interiors, ample natural light, and breathtaking views of the city. Walking distance from schools, hospitals, and shopping malls.',
      propertyType: 'Apartment',
      listingType: 'SALE',
      price: 8500000,
      city: 'Mumbai',
      state: 'Maharashtra',
      address: '42A, Perry Cross Road, Bandra West, Mumbai',
      latitude: 19.0596,
      longitude: 72.8295,
      bedrooms: 3,
      bathrooms: 2,
      area: 1450,
      furnishingStatus: 'Furnished',
      amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Lift'],
      images: sampleImages,
      seller: approvedSeller._id,
      status: PROPERTY_STATUS.ACTIVE,
      averageRating: 4.5,
      reviewCount: 2,
    });

    const property2 = await Property.create({
      title: 'Modern 2 BHK Flat for Rent in Koramangala',
      description:
        'Stylish 2 BHK flat available for rent in the heart of Koramangala. Perfect for young professionals and small families. The apartment comes with high-speed internet connectivity and modular kitchen.',
      propertyType: 'Apartment',
      listingType: 'RENT',
      price: 35000,
      city: 'Bangalore',
      state: 'Karnataka',
      address: '15, 5th Block, Koramangala, Bangalore',
      latitude: 12.9352,
      longitude: 77.6245,
      bedrooms: 2,
      bathrooms: 2,
      area: 1100,
      furnishingStatus: 'Semi-Furnished',
      amenities: ['Parking', 'Security', 'Power Backup'],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          publicId: 'demo/property_img_3',
          isPrimary: true,
        },
      ],
      seller: approvedSeller._id,
      status: PROPERTY_STATUS.ACTIVE,
    });

    const property3 = await Property.create({
      title: 'Luxury Villa with Private Pool in Jubilee Hills',
      description:
        'An exquisite luxury villa spread over 5000 sq ft in the prestigious Jubilee Hills locality. Features a private swimming pool, landscaped garden, home theatre, and smart home automation. A perfect blend of luxury and comfort.',
      propertyType: 'Villa',
      listingType: 'SALE',
      price: 45000000,
      city: 'Hyderabad',
      state: 'Telangana',
      address: '8-2-293/82, Road No. 78, Jubilee Hills, Hyderabad',
      latitude: 17.4239,
      longitude: 78.4070,
      bedrooms: 5,
      bathrooms: 5,
      area: 5000,
      furnishingStatus: 'Furnished',
      amenities: [
        'Swimming Pool',
        'Garden',
        'Parking',
        'Security',
        'Home Theatre',
        'Gym',
        'Smart Home',
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
          publicId: 'demo/property_img_4',
          isPrimary: true,
        },
      ],
      seller: approvedSeller._id,
      status: PROPERTY_STATUS.ACTIVE,
    });

    const property4 = await Property.create({
      title: 'Commercial Office Space in Cyber City',
      description:
        'Premium Grade-A office space available in the prestigious Cyber City business district. Fully equipped with high-speed internet, conference rooms, and 24/7 security. Ideal for IT companies and startups.',
      propertyType: 'Office',
      listingType: 'RENT',
      price: 85000,
      city: 'Gurgaon',
      state: 'Haryana',
      address: 'Tower B, DLF Cyber City, Sector 24, Gurgaon',
      latitude: 28.4949,
      longitude: 77.0878,
      bedrooms: 0,
      bathrooms: 4,
      area: 3000,
      furnishingStatus: 'Furnished',
      amenities: ['Parking', 'Security', 'Power Backup', 'Cafeteria', 'Lift'],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
          publicId: 'demo/property_img_5',
          isPrimary: true,
        },
      ],
      seller: approvedSeller._id,
      status: PROPERTY_STATUS.ACTIVE,
    });

    const property5 = await Property.create({
      title: 'Cozy 1 BHK Studio Apartment in Andheri East',
      description:
        'A compact and well-maintained 1 BHK studio apartment ideal for bachelors and young couples. Located in the heart of Andheri East with easy access to metro, restaurants, and entertainment.',
      propertyType: 'Apartment',
      listingType: 'RENT',
      price: 22000,
      city: 'Mumbai',
      state: 'Maharashtra',
      address: '201, Skylark Building, Marol Naka, Andheri East, Mumbai',
      latitude: 19.1136,
      longitude: 72.8697,
      bedrooms: 1,
      bathrooms: 1,
      area: 550,
      furnishingStatus: 'Furnished',
      amenities: ['Security', 'Lift', 'Power Backup'],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          publicId: 'demo/property_img_6',
          isPrimary: true,
        },
      ],
      seller: approvedSeller._id,
      status: PROPERTY_STATUS.ACTIVE,
    });

    console.log('🏠 Properties created.');

    // ── COMMISSIONS ───────────────────────────────────────
    await Commission.create({
      property: property1._id,
      seller: approvedSeller._id,
      transactionAmount: property1.price,
      sellerCommissionRate: COMMISSION_RATES.SELLER,
      sellerCommissionAmount: property1.price * COMMISSION_RATES.SELLER,
      buyerCommissionRate: COMMISSION_RATES.BUYER,
      buyerCommissionAmount: 0,
      transactionType: 'SALE',
      status: COMMISSION_STATUS.PENDING,
    });

    await Commission.create({
      property: property2._id,
      seller: approvedSeller._id,
      transactionAmount: property2.price,
      sellerCommissionRate: COMMISSION_RATES.SELLER,
      sellerCommissionAmount: property2.price * COMMISSION_RATES.SELLER,
      buyerCommissionRate: COMMISSION_RATES.BUYER,
      buyerCommissionAmount: 0,
      transactionType: 'RENT',
      status: COMMISSION_STATUS.PENDING,
    });

    console.log('💰 Commissions created.');

    // ── BOOKINGS ──────────────────────────────────────────
    const booking1 = await Booking.create({
      buyer: buyer1._id,
      seller: approvedSeller._id,
      property: property1._id,
      requestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      requestedTime: '10:00',
      message: 'I would like to visit this property on the requested date. Please confirm.',
      status: BOOKING_STATUS.COMPLETED,
    });

    await Booking.create({
      buyer: buyer2._id,
      seller: approvedSeller._id,
      property: property2._id,
      requestedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      requestedTime: '14:00',
      message: 'Interested in renting. Can we schedule a visit this weekend?',
      status: BOOKING_STATUS.PENDING,
    });

    await Booking.create({
      buyer: buyer1._id,
      seller: approvedSeller._id,
      property: property3._id,
      requestedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      requestedTime: '11:00',
      message: 'Looking for a family home. This looks perfect!',
      status: BOOKING_STATUS.ACCEPTED,
    });

    console.log('📅 Bookings created.');

    // ── REVIEWS ───────────────────────────────────────────
    const review1 = await Review.create({
      reviewer: buyer1._id,
      property: property1._id,
      seller: approvedSeller._id,
      rating: 5,
      comment:
        'Excellent property! The apartment is exactly as described. The seller was very cooperative and the location is perfect. Highly recommended!',
    });

    const review2 = await Review.create({
      reviewer: buyer2._id,
      property: property1._id,
      seller: approvedSeller._id,
      rating: 4,
      comment:
        'Good property with great amenities. The furnishings are of high quality. Minor issue with the water pressure but overall a great place to live.',
    });

    console.log('⭐ Reviews created.');

    // ── CONVERSATIONS & MESSAGES ──────────────────────────
    const conversation1 = await Conversation.create({
      property: property2._id,
      buyer: buyer1._id,
      seller: approvedSeller._id,
      lastMessage: 'I will confirm the visit timing shortly.',
      lastMessageAt: new Date(),
    });

    await Message.create({
      conversation: conversation1._id,
      sender: buyer1._id,
      content: 'Hello! I am interested in the 2 BHK flat in Koramangala. Is it still available?',
    });

    await Message.create({
      conversation: conversation1._id,
      sender: approvedSeller._id,
      content: 'Yes, the property is still available. When would you like to visit?',
    });

    await Message.create({
      conversation: conversation1._id,
      sender: buyer1._id,
      content: 'I can come this Saturday at 11 AM. Does that work for you?',
    });

    await Message.create({
      conversation: conversation1._id,
      sender: approvedSeller._id,
      content: 'I will confirm the visit timing shortly.',
    });

    console.log('💬 Conversations and messages created.');

    // ── FAVORITES ─────────────────────────────────────────
    await Favorite.create({ buyer: buyer1._id, property: property3._id });
    await Favorite.create({ buyer: buyer1._id, property: property4._id });
    await Favorite.create({ buyer: buyer2._id, property: property1._id });
    await Favorite.create({ buyer: buyer2._id, property: property5._id });

    console.log('❤️  Favorites created.');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('DEMO CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('Admin:');
    console.log('  Email:    admin@haikyuuheights.com');
    console.log('  Password: Admin@123');
    console.log('\nApproved Seller:');
    console.log('  Email:    seller@haikyuuheights.com');
    console.log('  Password: Seller@123');
    console.log('\nPending Seller:');
    console.log('  Email:    seller2@haikyuuheights.com');
    console.log('  Password: Seller@123');
    console.log('\nBuyer 1:');
    console.log('  Email:    buyer1@haikyuuheights.com');
    console.log('  Password: Buyer@123');
    console.log('\nBuyer 2:');
    console.log('  Email:    buyer2@haikyuuheights.com');
    console.log('  Password: Buyer@123');
    console.log('═══════════════════════════════════════\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
