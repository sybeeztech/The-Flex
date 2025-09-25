/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Star,
  Search,
  Filter,
  ArrowLeft,
  Home,
  Calendar,
  User,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useReviews } from "@/hooks/useReviews";
import { convertRatingTo5Point } from "@/lib/mock-data";

// Review approval status type (matching dashboard)
type ReviewStatus = 'pending' | 'approved' | 'disapproved';

const GuestReviews = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProperty, setFilterProperty] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  // API call for reviews
  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError, refetch: refetchReviews } = useReviews();

  // Helper function to get review status (matching dashboard logic)
  const getReviewStatus = (review: any): ReviewStatus => {
    if (review.approvalStatus) {
      return review.approvalStatus as ReviewStatus;
    }
    // Fallback to existing isApproved logic
    if (review.isApproved === true) return 'approved';
    if (review.isApproved === false && review.disapproved === true) return 'disapproved';
    return 'pending';
  };

  // Get reviews from location state or API - only show approved reviews
  const allReviews = reviewsData?.data || [];
  const approvedReviews = useMemo(() => {
    // If coming from dashboard with filtered reviews, use those but still filter for approved
    if (location.state?.reviews) {
      return location.state.reviews.filter((review: any) => getReviewStatus(review) === 'approved');
    }
    // Otherwise filter approved reviews from API
    return allReviews.filter((review: any) => getReviewStatus(review) === 'approved');
  }, [allReviews, location.state]);

  // Get unique properties for filter
  const uniqueProperties = useMemo(() => {
    const properties = approvedReviews.map((review: any) => review.propertyName);
    return Array.from(new Set(properties)).sort();
  }, [approvedReviews]);

  // Real-time data refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchReviews();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refetchReviews]);

  // Filter and sort approved reviews
  const filteredReviews = useMemo(() => {
    if (!approvedReviews) return [];

    return approvedReviews
      .filter((review: any) => {
        const matchesSearch = review.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.reviewText.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProperty = filterProperty === "all" || review.propertyName === filterProperty;
        const rating5Point = convertRatingTo5Point(review.rating);
        const matchesRating = filterRating === "all" ||
          (filterRating === "5" && rating5Point === 5) ||
          (filterRating === "4+" && rating5Point >= 4) ||
          (filterRating === "3-" && rating5Point <= 3);

        return matchesSearch && matchesProperty && matchesRating;
      })
      .sort((a: any, b: any) => {
        switch (sortBy) {
          case "rating":
            return convertRatingTo5Point(b.rating) - convertRatingTo5Point(a.rating);
          case "property":
            return a.propertyName.localeCompare(b.propertyName);
          case "date-oldest":
            return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          default:
            return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        }
      });
  }, [approvedReviews, searchTerm, filterProperty, filterRating, sortBy]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!approvedReviews.length) return {
      totalReviews: 0,
      averageRating: 0,
      totalProperties: 0,
      excellentReviews: 0
    };

    const totalReviews = approvedReviews.length;
    const totalProperties = uniqueProperties.length;

    const totalRating = approvedReviews.reduce((sum: number, review: any) => {
      return sum + convertRatingTo5Point(review.rating);
    }, 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    // Count excellent reviews (5 stars)
    const excellentReviews = approvedReviews.filter((review: any) => 
      convertRatingTo5Point(review.rating) === 5
    ).length;

    return {
      totalReviews,
      averageRating,
      totalProperties,
      excellentReviews
    };
  }, [approvedReviews, uniqueProperties]);

  if (reviewsLoading) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading guest reviews...</p>
        </div>
      </div>
    );
  }

  if (reviewsError) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-center text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-4" />
          <p>Failed to load reviews. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Header */}
      <div className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="hover:bg-muted">
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Guest Reviews</h1>
                <p className="text-sm text-muted-foreground mt-1">Showcasing approved guest feedback</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Updates
              </Badge>
              <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {approvedReviews.length} Approved Reviews
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Total Reviews</CardTitle>
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{summaryStats.totalReviews}</div>
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Approved guest reviews
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">Average Rating</CardTitle>
              <Star className="h-5 w-5 text-amber-600 fill-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2 text-amber-900">
                {summaryStats.averageRating.toFixed(1)}
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= summaryStats.averageRating ? 'text-amber-500 fill-amber-500' : 'text-amber-200'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-amber-600 mt-1">Across all properties</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Properties</CardTitle>
              <Home className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{summaryStats.totalProperties}</div>
              <p className="text-xs text-green-600 mt-1">With approved reviews</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">5-Star Reviews</CardTitle>
              <div className="flex">
                <Star className="h-5 w-5 text-purple-600 fill-purple-600" />
                <Star className="h-5 w-5 text-purple-600 fill-purple-600 -ml-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{summaryStats.excellentReviews}</div>
              <p className="text-xs text-purple-600 mt-1">
                {summaryStats.totalReviews > 0 ? 
                  `${((summaryStats.excellentReviews / summaryStats.totalReviews) * 100).toFixed(1)}% excellent` : 
                  '0% excellent'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-md mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Sort Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews, guests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterProperty} onValueChange={setFilterProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {uniqueProperties.map((property: string) => (
                    <SelectItem key={property} value={property}>
                      {property}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars Only</SelectItem>
                  <SelectItem value="4+">4+ Stars</SelectItem>
                  <SelectItem value="3-">3 Stars or Less</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Newest First</SelectItem>
                  <SelectItem value="date-oldest">Oldest First</SelectItem>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="property">Property Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Summary */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {filteredReviews.length} of {approvedReviews.length} approved reviews</span>
              </div>
              <div className="flex items-center gap-2">
                {filterProperty !== "all" && (
                  <Badge variant="outline" className="text-xs">
                    Property: {filterProperty}
                  </Badge>
                )}
                {filterRating !== "all" && (
                  <Badge variant="outline" className="text-xs">
                    Rating: {filterRating}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Grid */}
        {filteredReviews.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredReviews.map((review: any) => (
              <GuestReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <Card className="shadow-md">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
              <p className="text-muted-foreground mb-4">
                No approved reviews match your current filters.
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search criteria or check back later for new reviews.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Enhanced Guest Review Card Component
const GuestReviewCard = ({ review }: { review: any }) => {
  const rating5Point = convertRatingTo5Point(review.rating);

  // Get property image
  const propertyImage = review.propertyImage || review.property?.listingImages?.[0]?.url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

  // Format date
  const reviewDate = new Date(review.submittedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Get rating color
  const getRatingColor = (rating: number) => {
    if (rating === 5) return 'text-green-600';
    if (rating >= 4) return 'text-blue-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-0 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Property Image */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted shadow-sm border">
              <img
                src={propertyImage}
                alt={review.propertyName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Review Header Content */}
          <div className="flex-1 min-w-0">
            {/* Property Name - Bold as requested */}
            <h3 className="font-bold text-xl text-foreground mb-3 line-clamp-1">
              {review.propertyName}
            </h3>

            {/* Rating Display */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${star <= rating5Point ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
                <span className={`font-bold text-lg ${getRatingColor(rating5Point)}`}>
                  {rating5Point}.0
                </span>
              </div>
              <Badge variant="outline" className="text-xs font-medium">
                {review.channel}
              </Badge>
            </div>

            {/* Guest and Date Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium truncate">{review.guestName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>{reviewDate}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Review Text */}
        <div className="mb-4">
          <blockquote className="text-foreground leading-relaxed italic border-l-4 border-muted pl-4 py-2">
            "{review.reviewText}"
          </blockquote>
        </div>

        {/* Review Categories */}
        {review.categories && review.categories.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Category Ratings
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {review.categories.map((category: any) => {
                const categoryRating = convertRatingTo5Point(category.rating);
                return (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="capitalize text-sm font-medium text-muted-foreground">
                      {category.category.replace('_', ' ').toLowerCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{categoryRating}</span>
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GuestReviews;