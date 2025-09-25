// Mock review data matching Hostaway API format
// Simulating realistic review data from Hostaway API

export interface HostawayReviewCategory {
  category: string;
  rating: number; // 1-10 scale
}

export interface HostawayReview {
  id: number;
  type: string;
  status: 'published' | 'pending' | 'draft';
  rating: number | null; // Overall rating 1-10 or null
  publicReview: string;
  reviewCategory: HostawayReviewCategory[];
  submittedAt: string;
  guestName: string;
  listingName: string;
  // Additional fields for dashboard functionality
  channel?: 'Airbnb' | 'Booking.com' | 'Expedia' | 'Direct' | 'VRBO';
  isApproved: boolean;
  listingId: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  averageRating: number;
  totalReviews: number;
  imageUrl: string;
  description: string;
}

// Mock properties
export const mockProperties: Property[] = [
  {
    id: "85974",
    name: "Immaculate 2 Bed Flat in West Kensington",
    address: "West Kensington, London",
    city: "London",
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 5,
    averageRating: 4.7,
    totalReviews: 127,
    imageUrl: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/23248-85974-sApb8MN7Xg9vrwWSla0IZuuSlGSco-sX0oyQcQFktiw-66335e3aacb13",
    description: "Experience modern living in this beautifully appointed 2-bedroom flat in West Kensington. Perfect for families or business travelers seeking comfort and convenience."
  },
  {
    id: "78234",
    name: "Luxury Studio in Central London",
    address: "Covent Garden, London",
    city: "London",
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    averageRating: 4.5,
    totalReviews: 89,
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    description: "A stylish studio apartment in the heart of London, perfect for couples looking to explore the city."
  },
  {
    id: "92156",
    name: "Modern 3BR House in Shoreditch",
    address: "Shoreditch, London",
    city: "London",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    averageRating: 4.8,
    totalReviews: 156,
    imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    description: "Contemporary house in trendy Shoreditch with modern amenities and easy access to London's creative quarter."
  },
  {
    id: "66789",
    name: "Elegant Apartment in Marylebone",
    address: "Marylebone, London",
    city: "London",
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    averageRating: 4.6,
    totalReviews: 203,
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2158&q=80",
    description: "Sophisticated apartment in prestigious Marylebone, offering luxury and convenience in central London."
  }
];

// Mock reviews matching Hostaway API format
export const mockHostawayReviews: HostawayReview[] = [
  // Reviews for Property 85974 (West Kensington)
  {
    id: 7453,
    type: "guest-to-host",
    status: "published",
    rating: 9,
    publicReview: "The flat exceeded all our expectations. Spotlessly clean, beautifully decorated, and in a fantastic location. The host was incredibly responsive and helpful. The kitchen was fully equipped and the beds were so comfortable. Would definitely stay again!",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 10 },
      { category: "respect_house_rules", rating: 9 },
      { category: "location", rating: 10 },
      { category: "value", rating: 9 }
    ],
    submittedAt: "2024-01-21 10:30:14",
    guestName: "Sarah Johnson",
    listingName: "Immaculate 2 Bed Flat in West Kensington",
    channel: "Airbnb",
    isApproved: true,
    listingId: "85974",
    checkInDate: "2024-01-15",
    checkOutDate: "2024-01-20"
  },
  {
    id: 7454,
    type: "guest-to-host",
    status: "published",
    rating: 8,
    publicReview: "Very nice apartment with excellent transport links. The space was clean and well-maintained. Only minor issue was that the WiFi was a bit slow, but overall a great stay. The area felt safe and there were plenty of restaurants nearby.",
    reviewCategory: [
      { category: "cleanliness", rating: 9 },
      { category: "communication", rating: 8 },
      { category: "respect_house_rules", rating: 8 },
      { category: "location", rating: 10 },
      { category: "value", rating: 8 }
    ],
    submittedAt: "2024-02-15 14:20:33",
    guestName: "Michael Chen",
    listingName: "Immaculate 2 Bed Flat in West Kensington",
    channel: "Booking.com",
    isApproved: true,
    listingId: "85974",
    checkInDate: "2024-02-10",
    checkOutDate: "2024-02-14"
  },
  {
    id: 7455,
    type: "guest-to-host",
    status: "published",
    rating: 10,
    publicReview: "This flat is absolutely wonderful! The attention to detail is incredible, from the quality linens to the fully stocked kitchen. The location is perfect for both business and leisure travel. Host communication was excellent throughout our stay.",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 10 },
      { category: "respect_house_rules", rating: 10 },
      { category: "location", rating: 10 },
      { category: "value", rating: 9 }
    ],
    submittedAt: "2024-03-13 09:15:42",
    guestName: "Emma Thompson",
    listingName: "Immaculate 2 Bed Flat in West Kensington",
    channel: "Direct",
    isApproved: true,
    listingId: "85974",
    checkInDate: "2024-03-05",
    checkOutDate: "2024-03-12"
  },
  {
    id: 7456,
    type: "guest-to-host",
    status: "pending",
    rating: 6,
    publicReview: "The flat is in a good location and generally clean. However, we had some issues with the heating system and it took a while to get it resolved. The space is smaller than it appears in photos. Customer service could be more responsive.",
    reviewCategory: [
      { category: "cleanliness", rating: 8 },
      { category: "communication", rating: 4 },
      { category: "respect_house_rules", rating: 7 },
      { category: "location", rating: 8 },
      { category: "value", rating: 5 }
    ],
    submittedAt: "2024-02-26 16:45:18",
    guestName: "David Rodriguez",
    listingName: "Immaculate 2 Bed Flat in West Kensington",
    channel: "Expedia",
    isApproved: false,
    listingId: "85974",
    checkInDate: "2024-02-20",
    checkOutDate: "2024-02-25"
  },
  
  // Reviews for Property 78234 (Covent Garden Studio)
  {
    id: 7457,
    type: "guest-to-host",
    status: "published",
    rating: 9,
    publicReview: "This studio is absolutely perfect for a couple's getaway to London. The location in Covent Garden is unbeatable - everything is within walking distance. The studio is beautifully designed and has everything you need.",
    reviewCategory: [
      { category: "cleanliness", rating: 9 },
      { category: "communication", rating: 10 },
      { category: "respect_house_rules", rating: 9 },
      { category: "location", rating: 10 },
      { category: "value", rating: 8 }
    ],
    submittedAt: "2024-01-13 11:20:25",
    guestName: "Sophie Martin",
    listingName: "Luxury Studio in Central London",
    channel: "Airbnb",
    isApproved: true,
    listingId: "78234",
    checkInDate: "2024-01-08",
    checkOutDate: "2024-01-12"
  },
  {
    id: 7458,
    type: "guest-to-host",
    status: "published",
    rating: 8,
    publicReview: "The studio itself is lovely and modern. Location is fantastic for sightseeing. Can get quite noisy at night due to the central location, but that's expected in Covent Garden. Overall a good stay.",
    reviewCategory: [
      { category: "cleanliness", rating: 8 },
      { category: "communication", rating: 8 },
      { category: "respect_house_rules", rating: 8 },
      { category: "location", rating: 10 },
      { category: "value", rating: 7 }
    ],
    submittedAt: "2024-03-04 13:10:15",
    guestName: "James Wilson",
    listingName: "Luxury Studio in Central London",
    channel: "Booking.com",
    isApproved: true,
    listingId: "78234",
    checkInDate: "2024-02-28",
    checkOutDate: "2024-03-03"
  },

  // Reviews for Property 92156 (Shoreditch House)
  {
    id: 7459,
    type: "guest-to-host",
    status: "published",
    rating: 10,
    publicReview: "This house is perfect for group stays! So much space, modern amenities, and the location in Shoreditch is fantastic. Easy access to restaurants, bars, and transport. The host thought of everything - from extra towels to local recommendations.",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 10 },
      { category: "respect_house_rules", rating: 10 },
      { category: "location", rating: 10 },
      { category: "value", rating: 9 }
    ],
    submittedAt: "2024-01-30 15:30:42",
    guestName: "Lisa Anderson",
    listingName: "Modern 3BR House in Shoreditch",
    channel: "VRBO",
    isApproved: true,
    listingId: "92156",
    checkInDate: "2024-01-25",
    checkOutDate: "2024-01-29"
  },
  {
    id: 7460,
    type: "guest-to-host",
    status: "published",
    rating: 8,
    publicReview: "Beautiful house with great facilities. The area is vibrant and full of character. Had a small issue with one of the bedroom locks but it was quickly resolved. Would recommend for groups visiting London.",
    reviewCategory: [
      { category: "cleanliness", rating: 9 },
      { category: "communication", rating: 8 },
      { category: "respect_house_rules", rating: 8 },
      { category: "location", rating: 9 },
      { category: "value", rating: 8 }
    ],
    submittedAt: "2024-03-20 10:45:33",
    guestName: "Robert Taylor",
    listingName: "Modern 3BR House in Shoreditch",
    channel: "Airbnb",
    isApproved: true,
    listingId: "92156",
    checkInDate: "2024-03-15",
    checkOutDate: "2024-03-19"
  },

  // Reviews for Property 66789 (Marylebone)
  {
    id: 7461,
    type: "guest-to-host",
    status: "published",
    rating: 9,
    publicReview: "This apartment is absolutely stunning! The luxury finishes, comfortable beds, and prime Marylebone location make it perfect for a special London trip. Walking distance to Oxford Street and Regent's Park. Impeccable service throughout.",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 9 },
      { category: "respect_house_rules", rating: 9 },
      { category: "location", rating: 10 },
      { category: "value", rating: 8 }
    ],
    submittedAt: "2024-02-17 12:00:15",
    guestName: "Catherine Brown",
    listingName: "Elegant Apartment in Marylebone",
    channel: "Direct",
    isApproved: true,
    listingId: "66789",
    checkInDate: "2024-02-12",
    checkOutDate: "2024-02-16"
  },
  {
    id: 7462,
    type: "guest-to-host",
    status: "pending",
    rating: 4,
    publicReview: "While the location is great, we had several issues during our stay. The apartment wasn't cleaned properly upon arrival, and the shower had poor water pressure. For the price point, we expected much better quality and service.",
    reviewCategory: [
      { category: "cleanliness", rating: 4 },
      { category: "communication", rating: 5 },
      { category: "respect_house_rules", rating: 6 },
      { category: "location", rating: 9 },
      { category: "value", rating: 3 }
    ],
    submittedAt: "2024-03-12 14:30:22",
    guestName: "Mark Davis",
    listingName: "Elegant Apartment in Marylebone",
    channel: "Booking.com",
    isApproved: false,
    listingId: "66789",
    checkInDate: "2024-03-08",
    checkOutDate: "2024-03-11"
  }
];

// Helper functions for analytics
export const getPropertyMetrics = (propertyId: string) => {
  const propertyReviews = mockHostawayReviews.filter(r => r.listingId === propertyId);
  const approvedReviews = propertyReviews.filter(r => r.isApproved);
  
  const totalReviews = propertyReviews.length;
  const ratingsWithValues = propertyReviews.filter(r => r.rating !== null);
  const averageRating = ratingsWithValues.length > 0 
    ? ratingsWithValues.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingsWithValues.length 
    : 0;
  const approvalRate = totalReviews > 0 ? (approvedReviews.length / totalReviews) * 100 : 0;
  
  const channelBreakdown = propertyReviews.reduce((acc, review) => {
    const channel = review.channel || 'Unknown';
    acc[channel] = (acc[channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalReviews,
    averageRating: Number(averageRating.toFixed(1)),
    approvalRate: Number(approvalRate.toFixed(1)),
    channelBreakdown,
    recentReviews: propertyReviews.slice(-5)
  };
};

export const getAllPropertiesMetrics = () => {
  return mockProperties.map(property => ({
    ...property,
    ...getPropertyMetrics(property.id)
  }));
};

// Helper function to convert 10-point scale to 5-point scale for display
export const convertRatingTo5Point = (rating: number | null): number => {
  if (rating === null) return 0;
  return Math.round((rating / 10) * 5);
};

// Helper function to get average category rating
export const getAverageCategoryRating = (categories: HostawayReviewCategory[]): number => {
  if (categories.length === 0) return 0;
  const total = categories.reduce((sum, cat) => sum + cat.rating, 0);
  return total / categories.length;
};