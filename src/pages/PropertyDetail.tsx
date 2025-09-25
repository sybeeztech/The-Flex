// PropertyDetail.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  Utensils,
  Loader2,
  AlertCircle,
  Clock,
  Home,
  Shield,
  Calendar as CalendarIcon,
  XCircle,
  Filter,
  Baby,
  PersonStanding,
  Heater,
  AlarmSmoke
} from "lucide-react";
import { useProperty } from "@/hooks/useProperties";
import { useProperties } from "@/hooks/useProperties";
import { useReviews } from "@/hooks/useReviews"; // Import the useReviews hook
import { convertRatingTo5Point } from "@/lib/mock-data";

// Image Modal Component
const ImageModal = ({ images, currentIndex, onClose, onIndexChange }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <XCircle className="h-8 w-8" />
      </button>
      
      <div className="relative w-full max-w-6xl h-full flex items-center">
        <button 
          onClick={() => onIndexChange((currentIndex - 1 + images.length) % images.length)}
          className="absolute left-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src={images[currentIndex].url} 
            alt={images[currentIndex].caption || `Property image ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        
        <button 
          onClick={() => onIndexChange((currentIndex + 1) % images.length)}
          className="absolute right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2"
        >
          <ArrowLeft className="h-6 w-6 rotate-180" />
        </button>
      </div>
      
      {/* Thumbnail strip */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onIndexChange(index)}
            className={`w-16 h-16 border-2 transition-all ${
              index === currentIndex ? 'border-white' : 'border-transparent'
            }`}
          >
            <img 
              src={image.url} 
              alt=""
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

const PropertyDetail = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [imageIndex, setImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [nextPropertyId, setNextPropertyId] = useState(null);
  
  const { data: propertyData, isLoading: isPropertyLoading, error: propertyError } = useProperty(propertyId || '');
  // Fetch all properties to get the next property
  const { data: propertiesData } = useProperties();
  
  // Fetch reviews specifically for this property with isApproved filter
  const { data: reviewsData, isLoading: isReviewsLoading } = useReviews({
    propertyId: propertyId,
    isApproved: true, // Only show approved reviews
    limit: 50 // Increase limit to show more reviews if needed
  });

   // Find next property when properties data loads
   useEffect(() => {
    if (propertiesData?.data && propertyId) {
      const properties = propertiesData.data;
      const currentIndex = properties.findIndex(prop => prop.id.toString() === propertyId);
      
      if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % properties.length;
        setNextPropertyId(properties[nextIndex]?.id);
      }
    }
  }, [propertiesData, propertyId]);

  if (isPropertyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (propertyError || !propertyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const property = propertyData.data;
  const images = property.listingImages || [];
  
  // Use reviews from the useReviews hook instead of property.reviews
  const approvedReviews = reviewsData?.data || [];
  const reviewsSummary = reviewsData?.pagination || { total: 0 };
  
  // Calculate metrics based on approved reviews
  const calculateMetrics = () => {
    if (approvedReviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0
      };
    }

    const ratingsWithValues = approvedReviews.filter(r => r.rating !== null);
    const averageRating = ratingsWithValues.length > 0 
      ? ratingsWithValues.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingsWithValues.length 
      : 0;

    return {
      averageRating,
      totalReviews: approvedReviews.length
    };
  };

  const metrics = calculateMetrics();
  const averageRating = convertRatingTo5Point(metrics.averageRating || property.averageReviewRating || 0);

  // Map amenities from listingAmenities
  const getAmenityIcon = (amenityId) => {
    const amenityMap = {
      1: Wifi,      // WiFi
      2: Tv,        // TV
      3: Car,       // Parking
      4: Wind,      // Air Conditioning
      5: Utensils,  // Kitchen
      6: Coffee,    // Coffee Machine
      13: Wind,      // Air Conditioning
      16: Utensils,  // Kitchen
      17: Coffee,    // Coffee Machine
      18: Heater ,  // Heating
      25: AlarmSmoke , // Smake detector
      48: PersonStanding ,  // Suitable for Children
      49: Baby,    // Suitable for Infants
    };
    return amenityMap[amenityId] || Home;
  };

  const getAmenityLabel = (amenityId) => {
    const amenityLabels = {
      1: "Free WiFi",
      2: "Smart TV",
      3: "Parking",
      4: "Air Conditioning",
      5: "Full Kitchen",
      6: "Coffee Machine",
      13: "Air Conditioning",
      16: "Full Kitchen",
      17: "Coffee Machine",
      18: "Heating",
      25: "Smoke Detection",
      48: "Suitable for Children",
      49: "Suitable for Infants",
    };
    return amenityLabels[amenityId] || "Amenity";
  };

  const formatTime = (time24: string | number): string => {
    const hour = typeof time24 === 'string' ? parseInt(time24, 10) : time24;
    
    if (isNaN(hour) || hour < 0 || hour > 23) {
      return 'Invalid time';
    }
  
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert 0 to 12, 13 to 1, etc.
    
    return `${hour12} ${period}`;
  };

  // Get cancellation policy text
  const getCancellationPolicy = () => {
    const policyMap = {
      flexible: "Free cancellation up to 24 hours before check-in",
      moderate: "Free cancellation up to 5 days before check-in",
      strict: "50% refund up to 7 days before check-in, then non-refundable",
      super_strict: "Non-refundable"
    };
    return policyMap[property.cancellationPolicy] || property.cancellationPolicy;
  };

  // Handle navigation to next property
  const handleNextProperty = () => {
    if (nextPropertyId) {
      navigate(`/property/${nextPropertyId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Image Modal */}
      {showImageModal && (
        <ImageModal 
          images={images}
          currentIndex={imageIndex}
          onClose={() => setShowImageModal(false)}
          onIndexChange={setImageIndex}
        />
      )}

      {/* Header */}
      <div className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="text-sm text-muted-foreground">
              Property Details
            </div>
          </div>

          {/* Next Property Navigation Button */}
          {nextPropertyId && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextProperty}
                className="flex items-center gap-2"
              >
                Next Property
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
        </div>
      </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Image Gallery */}
        <div className="mb-8">
          {images.length > 0 ? (
            <>
              {/* Desktop Layout - Two Columns (only if more than 1 image) */}
              {images.length > 1 ? (
                <div className="hidden lg:grid lg:grid-cols-4 gap-4">
                  {/* Left - Big Square Image */}
                  <div 
                    className="col-span-2 aspect-square relative overflow-hidden group cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  >
                    <img 
                      src={images[imageIndex]?.url} 
                      alt={images[imageIndex]?.caption || property.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  </div>
                  
                  {/* Right - 4 Square Images Grid */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    {images.slice(1, 5).map((image, index) => (
                      <div 
                        key={index + 1}
                        className="aspect-square relative overflow-hidden cursor-pointer group"
                        onClick={() => {
                          setImageIndex(index + 1);
                          setShowImageModal(true);
                        }}
                      >
                        <img 
                          src={image.url} 
                          alt={image.caption || `${property.name} - Image ${index + 2}`}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                        {index === 3 && images.length > 5 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-sm">+{images.length - 5} more</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="hidden lg:block max-w-2xl mx-auto">
                  <div 
                    className="aspect-square relative overflow-hidden group cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  >
                    <img 
                      src={images[0]?.url} 
                      alt={images[0]?.caption || property.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  </div>
                </div>
              )}

              {/* Mobile Layout - Carousel */}
              <div className="lg:hidden">
                <div 
                  className="aspect-square relative overflow-hidden rounded-lg mb-4 cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                >
                  <img 
                    src={images[imageIndex]?.url} 
                    alt={property.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                
                {/* Only show carousel indicators and thumbnails if more than 1 image */}
                {images.length > 1 && (
                  <>
                    {/* Carousel Indicators */}
                    <div className="flex justify-center gap-2 mb-4">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === imageIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                          }`}
                          onClick={() => setImageIndex(index)}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                    
                    {/* Thumbnail Strip */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((image, index) => (
                        <div 
                          key={index}
                          className={`flex-shrink-0 w-20 h-20 relative overflow-hidden rounded-lg cursor-pointer border-2 transition-all ${
                            index === imageIndex ? 'border-primary' : 'border-transparent'
                          }`}
                          onClick={() => setImageIndex(index)}
                        >
                          <img 
                            src={image.url} 
                            alt={image.caption || `${property.name} - Image ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <Home className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{property.name || property.publicAddress}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{property.publicAddress || property.address}</span>
              </div>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{property.personCapacity} Guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  <span>{property.bedroomsNumber} Bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-4 w-4" />
                  <span>{property.bathroomsNumber} Bathrooms</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-5 w-5 ${star <= averageRating ? 'text-warning fill-warning' : 'text-muted-foreground'}`} 
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({metrics.totalReviews} reviews)</span>
                </div>
                <Badge variant="secondary">{property.propertyType || "Property"}</Badge>
                {/* {approvedReviews.length > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    Approved Reviews Only
                  </Badge>
                )} */}
              </div>
            </div>

            <Separator />

            {/* About */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">About this property</h2>
              <p className="text-foreground leading-relaxed">
                {property.description || property.airbnbSummary || "No description available."}
              </p>
            </div>

            <Separator />

            {/* Stay Policies */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Stay Policies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Check-in & Check-out */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Check-in & Check-out
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Check-in</div>
                      <div className="font-semibold">
                        {formatTime(property.checkInTimeStart)} - {formatTime(property.checkInTimeEnd)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Check-out</div>
                      <div className="font-semibold">{formatTime(property.checkOutTime)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Minimum Stay</div>
                      <div className="font-semibold">{property.minNights} nights</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cancellation Policy */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Cancellation Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">{getCancellationPolicy()}</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* House Rules */}
            {property.houseRules && (
              <>
                <div>
                  <h2 className="text-2xl font-semibold mb-4">House Rules</h2>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="prose prose-sm max-w-none">
                        {property.houseRules.split('\n').map((rule, index) => (
                          <p key={index} className="mb-2">{rule}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Separator />
              </>
            )}

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.listingAmenities && property.listingAmenities.length > 0 ? (
                  property.listingAmenities.slice(0, 6).map((amenity) => {
                    const AmenityIcon = getAmenityIcon(amenity.amenityId);
                    return (
                      <div key={amenity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <AmenityIcon className="h-5 w-5 text-primary" />
                        <span>{getAmenityLabel(amenity.amenityId)}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-3 text-center text-muted-foreground py-8">
                    No amenities listed
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Guest Reviews</h2>
                <div className="flex items-center gap-2">
                  {/* <Badge variant="outline" className="px-3 py-1">
                    {metrics.totalReviews} Approved Reviews
                  </Badge> */}
                  {isReviewsLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              {isReviewsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : approvedReviews.length > 0 ? (
                <div className="space-y-6">
                  {approvedReviews.map((review) => (
                    <ReviewDisplayCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <Card className="shadow-soft">
                  <CardContent className="py-12 text-center">
                    <div className="text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Approved Reviews Yet</h3>
                      <p>This property hasn't received any approved reviews yet.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle className="text-center">Book Your Stay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">${property.price}</div>
                  <div className="text-sm text-muted-foreground">per night</div>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 border rounded-lg">
                      <div className="text-xs text-muted-foreground">CHECK-IN</div>
                      <div className="font-semibold">Add date</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-xs text-muted-foreground">CHECK-OUT</div>
                      <div className="font-semibold">Add date</div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-muted-foreground">GUESTS</div>
                    <div className="font-semibold">{property.guestsIncluded} guests included</div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-primary hover:bg-primary-hover transition-all duration-200">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Book Your Stay
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  You won't be charged yet
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cleaning fee</span>
                    <span>${property.cleaningFee || 0}</span>
                  </div>
                  {property.priceForExtraPerson > 0 && (
                    <div className="flex justify-between">
                      <span>Extra person fee</span>
                      <span>${property.priceForExtraPerson}/person</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total (approx.)</span>
                    <span>${property.price + (property.cleaningFee || 0)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-metric-positive">
                  <CheckCircle className="h-4 w-4" />
                  <span>Free cancellation for 48 hours</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Review Display Component
const ReviewDisplayCard = ({ review }) => {
  const rating5Point = convertRatingTo5Point(review.rating);
  
  return (
    <Card className="shadow-soft">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
            {review.guestName?.charAt(0) || 'G'}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold">{review.guestName || 'Guest'}</h4>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${star <= rating5Point ? 'text-warning fill-warning' : 'text-muted-foreground'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Badge variant="outline">{review.channel}</Badge>
            </div>
            <p className="text-foreground leading-relaxed mb-3">{review.publicReview || review.reviewText}</p>
            
            {/* Category Ratings */}
            {review.categories && review.categories.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2 text-muted-foreground">Category Ratings:</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {review.categories.map((category) => (
                    <div key={category.category} className="flex items-center justify-between text-xs">
                      <span className="capitalize text-muted-foreground">
                        {category.category.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-warning fill-warning" />
                        <span>{convertRatingTo5Point(category.rating)}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyDetail;