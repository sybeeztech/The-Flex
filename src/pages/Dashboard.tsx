/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  BarChart3,
  Eye,
  FileText,
  Loader2,
  AlertCircle,
  Home,
  Bed,
  Clock
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Link } from "react-router-dom";
import {
  useReviews,
  useReviewsSummary,
  useUpdateReviewApproval
} from "@/hooks/useReviews";
import { useProperties } from "@/hooks/useProperties";
import { convertRatingTo5Point } from "@/lib/mock-data";

// Review approval status enum
type ReviewStatus = 'pending' | 'approved' | 'disapproved';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterApproval, setFilterApproval] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  // API calls with real-time refetching - include Google reviews only on first load
  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError, refetch: refetchReviews } = useReviews({}, true);
  const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useReviewsSummary();
  const { data: propertiesData, isLoading: propertiesLoading, refetch: refetchProperties } = useProperties();
  const updateReviewApproval = useUpdateReviewApproval();

  const reviews = reviewsData?.data || [];
  const summary = summaryData?.data || {};
  const properties = propertiesData?.data || [];

  // Real-time data refresh effect (reduced frequency)
  useEffect(() => {
    const interval = setInterval(() => {
      refetchReviews();
      refetchSummary();
      refetchProperties();
    }, 300000); // Refresh every 5 minutes instead of 30 seconds

    return () => clearInterval(interval);
  }, [refetchReviews, refetchSummary, refetchProperties]);

  // Helper function to get review status
  const getReviewStatus = (review: any): ReviewStatus => {
    if (review.approvalStatus) {
      return review.approvalStatus as ReviewStatus;
    }
    // Fallback to existing isApproved logic
    if (review.isApproved === true) return 'approved';
    if (review.isApproved === false && review.disapproved === true) return 'disapproved';
    return 'pending';
  };

  // Calculate real-time metrics with three states
  const realTimeMetrics = useMemo(() => {
    if (!reviews.length) return {
      totalReviews: 0,
      averageRating: 0,
      approvalRate: 0,
      approvedReviews: 0,
      pendingReviews: 0,
      disapprovedReviews: 0
    };

    const approvedReviews = reviews.filter((r: any) => getReviewStatus(r) === 'approved').length;
    const pendingReviews = reviews.filter((r: any) => getReviewStatus(r) === 'pending').length;
    const disapprovedReviews = reviews.filter((r: any) => getReviewStatus(r) === 'disapproved').length;
    const totalReviews = reviews.length;
    const approvalRate = totalReviews > 0 ? (approvedReviews / totalReviews) * 100 : 0;

    const totalRating = reviews.reduce((sum: number, review: any) => {
      return sum + convertRatingTo5Point(review.rating);
    }, 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    return {
      totalReviews,
      averageRating,
      approvalRate,
      approvedReviews,
      pendingReviews,
      disapprovedReviews
    };
  }, [reviews]);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    if (!reviews) return [];

    return reviews
      .filter((review: any) => {
        const matchesSearch = review.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.reviewText.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesChannel = filterChannel === "all" || review.channel === filterChannel;
        const rating5Point = convertRatingTo5Point(review.rating);
        const matchesRating = filterRating === "all" ||
          (filterRating === "5" && rating5Point === 5) ||
          (filterRating === "4+" && rating5Point >= 4) ||
          (filterRating === "3-" && rating5Point <= 3);
        
        const reviewStatus = getReviewStatus(review);
        const matchesApproval = filterApproval === "all" || reviewStatus === filterApproval;

        return matchesSearch && matchesChannel && matchesRating && matchesApproval;
      })
      .sort((a: any, b: any) => {
        switch (sortBy) {
          case "rating":
            return (b.rating || 0) - (a.rating || 0);
          case "property":
            return a.propertyName.localeCompare(b.propertyName);
          default:
            return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        }
      });
  }, [reviews, searchTerm, filterChannel, filterRating, filterApproval, sortBy]);

  // Approval handler - remove manual refetch since React Query handles it
  const handleApprovalAction = async (reviewId: number, action: 'approve' | 'disapprove') => {
    try {
      await updateReviewApproval.mutateAsync({ 
        id: reviewId,
        isApproved: action === 'approve'
      });
      // React Query will automatically invalidate and refetch via onSettled
    } catch (error) {
      console.error('Failed to update review approval:', error);
    }
  };

  // Loading state
  if (reviewsLoading || summaryLoading || propertiesLoading) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  // Chart data
  const channelData = Object.entries(
    reviews.reduce((acc: Record<string, number>, review: any) => {
      const channel = review.channel;
      acc[channel] = (acc[channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([channel, count]) => ({ channel, count }));

  const ratingData = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating} Star`,
    count: reviews.filter((r: any) => convertRatingTo5Point(r.rating) === rating).length
  }));

  // Property metrics
  const propertiesWithMetrics = properties.map((property: any) => {
    const propertyReviews = reviews.filter((r: any) => r.propertyId === property.id);
    const approvedPropertyReviews = propertyReviews.filter((r: any) => getReviewStatus(r) === 'approved');
    const pendingPropertyReviews = propertyReviews.filter((r: any) => getReviewStatus(r) === 'pending');
    const disapprovedPropertyReviews = propertyReviews.filter((r: any) => getReviewStatus(r) === 'disapproved');

    const totalRating = propertyReviews.reduce((sum: number, review: any) => {
      return sum + convertRatingTo5Point(review.rating);
    }, 0);

    return {
      ...property,
      metrics: {
        totalReviews: propertyReviews.length,
        approvedReviews: approvedPropertyReviews.length,
        pendingReviews: pendingPropertyReviews.length,
        disapprovedReviews: disapprovedPropertyReviews.length,
        averageRating: propertyReviews.length > 0 ? totalRating / propertyReviews.length : 0,
        approvalRate: propertyReviews.length > 0 ? (approvedPropertyReviews.length / propertyReviews.length) * 100 : 0
      }
    };
  });

  const COLORS = ['hsl(175, 64%, 26%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(215, 16%, 47%)'];

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Header - The Flex Style */}
      <div className="border-b bg-nav-bg shadow-soft">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">The Flex Reviews</h1>
              </div>
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                Professional Dashboard
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="border-primary/20 hover:bg-primary/5" asChild>
                <Link to="/property/155613">
                  <Eye className="h-4 w-4 mr-2" />
                  View Properties
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Overview Cards - The Flex Professional Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-primary text-primary-foreground shadow-medium border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <FileText className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeMetrics.totalReviews}</div>
              <p className="text-xs opacity-90 mt-1">Professional Properties</p>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0 bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2 text-foreground">
                {realTimeMetrics.averageRating.toFixed(1)}
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${star <= realTimeMetrics.averageRating ? 'text-warning fill-warning' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {realTimeMetrics.averageRating >= 4.5 ? (
                  <span className="flex items-center gap-1 text-success">
                    <TrendingUp className="h-3 w-3" /> Excellence Standard
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-metric-neutral">
                    <TrendingDown className="h-3 w-3" /> Enhancement Opportunity
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0 bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{realTimeMetrics.approvedReviews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {realTimeMetrics.approvalRate.toFixed(1)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0 bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{realTimeMetrics.pendingReviews}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting moderation</p>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0 bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Declined</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{realTimeMetrics.disapprovedReviews}</div>
              <p className="text-xs text-muted-foreground mt-1">Quality standards</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-secondary">
            <TabsTrigger value="reviews" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Review Management</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Analytics Dashboard</TabsTrigger>
            <TabsTrigger value="properties" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Properties Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-6">
            {/* Filters - Professional Style */}
            <Card className="shadow-medium border-0 bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Filter className="h-5 w-5 text-primary" />
                  Advanced Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reviews, guests, properties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-primary/20 focus:border-primary"
                    />
                  </div>
                  <Select value={filterChannel} onValueChange={setFilterChannel}>
                    <SelectTrigger className="border-primary/20 focus:border-primary">
                      <SelectValue placeholder="All Channels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="Direct">Direct Booking</SelectItem>
                      <SelectItem value="Google">Google Reviews</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterRating} onValueChange={setFilterRating}>
                    <SelectTrigger className="border-primary/20 focus:border-primary">
                      <SelectValue placeholder="All Ratings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4+">4+ Stars</SelectItem>
                      <SelectItem value="3-">3 Stars or Less</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterApproval} onValueChange={setFilterApproval}>
                    <SelectTrigger className="border-primary/20 focus:border-primary">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reviews</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="disapproved">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-primary/20 focus:border-primary">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Latest First</SelectItem>
                      <SelectItem value="rating">Highest Rating</SelectItem>
                      <SelectItem value="property">Property Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <span>Showing {filteredReviews.length} of {reviews.length} reviews</span>
                  {filterApproval !== "all" && (
                    <Badge variant="outline" className={
                      filterApproval === "approved" ? "border-success text-success" :
                      filterApproval === "pending" ? "border-warning text-warning" :
                      "border-destructive text-destructive"
                    }>
                      {filterApproval === "approved" ? "Approved" : 
                       filterApproval === "pending" ? "Pending" : "Declined"}: {filteredReviews.length}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.map((review: any) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onApprovalAction={handleApprovalAction}
                  isUpdating={updateReviewApproval.isPending}
                  getReviewStatus={getReviewStatus}
                />
              ))}
              {filteredReviews.length === 0 && (
                <Card className="shadow-medium border-0 bg-gradient-card">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No reviews found matching your filters.</p>
                    {filterApproval !== "all" && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Try adjusting the status filter to see more reviews.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-medium border-0 bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Reviews by Channel
                    <Badge variant="outline" className="ml-2 border-primary/30 text-primary">Live Data</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={channelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="channel" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-medium border-0 bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    Rating Distribution
                    <Badge variant="outline" className="ml-2 border-primary/30 text-primary">Live Data</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ratingData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ rating, count }) => `${rating}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {ratingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-medium border-0 bg-gradient-card">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Approval Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Approved Reviews</span>
                      <span className="font-semibold text-success">{realTimeMetrics.approvedReviews}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Pending Reviews</span>
                      <span className="font-semibold text-warning">{realTimeMetrics.pendingReviews}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Declined Reviews</span>
                      <span className="font-semibold text-destructive">{realTimeMetrics.disapprovedReviews}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full transition-all duration-500"
                        style={{ width: `${realTimeMetrics.approvalRate}%` }}
                      />
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      {realTimeMetrics.approvalRate.toFixed(1)}% Approval Rate
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-medium border-0 bg-gradient-card">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reviews.slice(0, 3).map((review: any, index) => (
                      <div key={review.id} className="flex items-center gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full ${
                          getReviewStatus(review) === 'approved' ? 'bg-success' : 
                          getReviewStatus(review) === 'disapproved' ? 'bg-destructive' : 'bg-warning'
                        }`} />
                        <span className="flex-1 truncate text-foreground">{review.guestName}</span>
                        <Badge variant={
                          getReviewStatus(review) === 'approved' ? "default" : 
                          getReviewStatus(review) === 'disapproved' ? "destructive" : "secondary"
                        } className="text-xs">
                          {getReviewStatus(review) === 'approved' ? 'Approved' : 
                           getReviewStatus(review) === 'disapproved' ? 'Declined' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-medium border-0 bg-gradient-card">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-foreground">Highest Rated</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-warning fill-warning" />
                        <span className="font-semibold">5.0</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-foreground">Most Active Channel</span>
                      <span className="font-semibold">
                        {channelData.length > 0 ? channelData.reduce((prev, current) => (prev.count > current.count) ? prev : current).channel : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-foreground">Properties with Reviews</span>
                      <span className="font-semibold">
                        {propertiesWithMetrics.filter(p => p.metrics.totalReviews > 0).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Properties Portfolio</h2>
              <Badge variant="outline" className="border-primary/30 text-primary">Live Metrics</Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {propertiesWithMetrics.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Review Card Component - The Flex Professional Style
const ReviewCard = ({
  review,
  onApprovalAction,
  isUpdating,
  getReviewStatus
}: {
  review: any;
  onApprovalAction: (id: number, action: 'approve' | 'disapprove') => void;
  isUpdating: boolean;
  getReviewStatus: (review: any) => ReviewStatus;
}) => {
  const rating5Point = convertRatingTo5Point(review.rating);
  const reviewStatus = getReviewStatus(review);
  const propertyImage = review.propertyImage || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-success text-success-foreground border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'disapproved':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        );
      default:
        return (
          <Badge className="bg-warning text-warning-foreground border-0">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getBorderColor = (status: ReviewStatus) => {
    switch (status) {
      case 'approved':
        return 'border-l-4 border-success';
      case 'disapproved':
        return 'border-l-4 border-destructive';
      default:
        return 'border-l-4 border-warning';
    }
  };

  return (
    <Card className={`shadow-medium border-0 bg-gradient-card transition-all duration-300 hover:shadow-strong ${getBorderColor(reviewStatus)}`}>
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted">
              <img
                src={propertyImage}
                alt={review.propertyName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground">Review #{review.id}</h3>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating5Point ? 'text-warning fill-warning' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({review.rating}/10)</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-1">
              <span className="font-medium">{review.guestName}</span>
              <Badge variant="outline" className="border-primary/30 text-primary">{review.channel}</Badge>
              <Badge variant="outline">{review.type}</Badge>
              <span>{new Date(review.submittedAt).toLocaleDateString('en-GB')}</span>
            </div>
            <p className="text-sm font-bold text-foreground">{review.propertyName}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusBadge(reviewStatus)}
            <div className="flex gap-1">
              {reviewStatus === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onApprovalAction(review.id, 'approve')}
                    disabled={isUpdating}
                    className="bg-success hover:bg-success/90 text-success-foreground border-0"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onApprovalAction(review.id, 'disapprove')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </>
                    )}
                  </Button>
                </>
              )}
              {reviewStatus === 'approved' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onApprovalAction(review.id, 'disapprove')}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </>
                  )}
                </Button>
              )}
              {reviewStatus === 'disapproved' && (
                <Button
                  size="sm"
                  onClick={() => onApprovalAction(review.id, 'approve')}
                  disabled={isUpdating}
                  className="bg-success hover:bg-success/90 text-success-foreground border-0"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground leading-relaxed">{review.reviewText}</p>

        {review.categories && review.categories.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 text-foreground">Category Ratings:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {review.categories.map((category: any) => (
                <div key={category.category} className="flex items-center justify-between p-2 bg-secondary rounded-lg text-sm">
                  <span className="capitalize text-foreground">{category.category.replace('_', ' ')}</span>
                  <Badge variant="outline" className="border-primary/30 text-primary">{category.rating}/10</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Property Card Component - The Flex Professional Style
const PropertyCard = ({ property }: { property: any }) => {
  const metrics = property.metrics || {};
  const primaryImage = property.listingImages?.[0]?.url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80";
  const propertyName = property.name || property.publicAddress || property.externalListingName || "Unnamed Property";
  const propertyAddress = property.publicAddress || property.address || "Address not available";
  const averageRating = metrics.averageRating || 0;

  return (
    <Card className="shadow-medium border-0 bg-gradient-card hover:shadow-strong transition-all duration-300">
      <div className="aspect-video relative overflow-hidden rounded-t-xl">
        <img
          src={primaryImage}
          alt={property.listingImages?.[0]?.caption || propertyName}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        />
        {property.listingImages && property.listingImages.length > 1 && (
          <Badge className="absolute top-3 right-3 bg-black/70 text-white border-0">
            {property.listingImages.length} photos
          </Badge>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-primary text-primary-foreground border-0">
            {metrics.totalReviews || 0} reviews
          </Badge>
          {metrics.approvalRate > 0 && (
            <Badge className="bg-success text-success-foreground border-0">
              {metrics.approvalRate.toFixed(0)}% approved
            </Badge>
          )}
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">{propertyName}</CardTitle>
        <p className="text-sm text-muted-foreground">{propertyAddress}</p>
        {property.propertyType && (
          <Badge variant="outline" className="w-fit border-primary/30 text-primary">
            {property.propertyType}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= averageRating ? 'text-warning fill-warning' : 'text-muted-foreground'}`}
                />
              ))}
            </div>
            <span className="font-semibold text-foreground">{averageRating.toFixed(1)}</span>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 border-success text-success">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Live
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <div className="font-semibold text-foreground">{property.bedroomsNumber || 0}</div>
            <div className="text-muted-foreground">Bedrooms</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">{property.bathroomsNumber || 0}</div>
            <div className="text-muted-foreground">Bathrooms</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">{property.personCapacity || 0}</div>
            <div className="text-muted-foreground">Guests</div>
          </div>
        </div>

        <div className="pt-2 border-t border-border space-y-2">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Approved</div>
              <div className="font-semibold text-success">{metrics.approvedReviews || 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Pending</div>
              <div className="font-semibold text-warning">{metrics.pendingReviews || 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Declined</div>
              <div className="font-semibold text-destructive">{metrics.disapprovedReviews || 0}</div>
            </div>
          </div>

          {metrics.totalReviews > 0 && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Approval Rate</span>
                <span className="font-semibold text-foreground">{metrics.approvalRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-success h-2 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.approvalRate}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {property.price && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Starting from</span>
              <span className="font-bold text-lg text-foreground">£{property.price}</span>
            </div>
            <div className="text-xs text-muted-foreground">per night</div>
          </div>
        )}

        <Button variant="outline" className="w-full border-primary/30 hover:bg-primary/5" asChild>
          <Link to={`/property/${property.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Property
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default Dashboard;