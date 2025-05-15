import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { 
  Search, 
  Star, 
  ThumbsUp, 
  MessageCircle, 
  Filter,
  ChevronDown,
  X
} from 'lucide-react';

interface Review {
  review_id: string;
  booking_id: string;
  user_id: string;
  vendor_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  review_visibility: string;
  user_name?: string;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<'all' | 'positive' | 'negative'>('all');
  const { vendorProfile } = useAuth();
  
  useEffect(() => {
    if (vendorProfile?.vendor_id) {
      fetchReviews();
    }
  }, [vendorProfile]);
  
  useEffect(() => {
    filterReviews();
  }, [reviews, searchQuery, currentTab]);
  
  const fetchReviews = async () => {
    if (!vendorProfile?.vendor_id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          review_id,
          booking_id,
          user_id,
          vendor_id,
          rating,
          comment,
          created_at,
          review_visibility
        `)
        .eq('vendor_id', vendorProfile.vendor_id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // For demo purposes, create some sample data if no reviews exist
      const reviewsData = data && data.length > 0 ? data : generateSampleReviews();
      
      // Fetch user names for each review
      const reviewsWithUserInfo = await Promise.all(
        reviewsData.map(async (review) => {
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('display_name')
              .eq('supabase_auth_uid', review.user_id)
              .single();
              
            return {
              ...review,
              user_name: userData?.display_name || 'Anonymous User'
            };
          } catch (error) {
            return {
              ...review,
              user_name: 'Anonymous User'
            };
          }
        })
      );
      
      setReviews(reviewsWithUserInfo);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Could not load reviews",
        variant: "destructive",
      });
      
      // For demo purposes, generate sample data
      setReviews(generateSampleReviews());
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterReviews = () => {
    let filtered = [...reviews];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(review => 
        review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply tab filter
    if (currentTab === 'positive') {
      filtered = filtered.filter(review => review.rating >= 4);
    } else if (currentTab === 'negative') {
      filtered = filtered.filter(review => review.rating < 4);
    }
    
    setFilteredReviews(filtered);
  };
  
  const generateSampleReviews = () => {
    // Sample reviews for demo purposes
    const sampleReviews: Review[] = [
      {
        review_id: 'sample-review-1',
        booking_id: 'sample-booking-1',
        user_id: 'user-1',
        vendor_id: vendorProfile?.vendor_id || '',
        rating: 5,
        comment: 'Amazing service! The vendor was professional, punctual, and exceeded our expectations. Would definitely recommend to anyone planning their wedding.',
        created_at: new Date('2023-04-15').toISOString(),
        review_visibility: 'public',
        user_name: 'Priya Sharma',
      },
      {
        review_id: 'sample-review-2',
        booking_id: 'sample-booking-2',
        user_id: 'user-2',
        vendor_id: vendorProfile?.vendor_id || '',
        rating: 4,
        comment: 'Great experience overall. The quality was excellent, though there was a slight delay in delivery. Would still recommend.',
        created_at: new Date('2023-05-02').toISOString(),
        review_visibility: 'public',
        user_name: 'Arjun Patel',
      },
      {
        review_id: 'sample-review-3',
        booking_id: 'sample-booking-3',
        user_id: 'user-3',
        vendor_id: vendorProfile?.vendor_id || '',
        rating: 3,
        comment: 'Service was acceptable but there were some communication issues. The end result was good but the process could have been smoother.',
        created_at: new Date('2023-06-12').toISOString(),
        review_visibility: 'public',
        user_name: 'Meera Reddy',
      },
      {
        review_id: 'sample-review-4',
        booking_id: 'sample-booking-4',
        user_id: 'user-4',
        vendor_id: vendorProfile?.vendor_id || '',
        rating: 5,
        comment: 'Absolute perfection! They made our special day even more magical. Every detail was handled with care and professionalism.',
        created_at: new Date('2023-07-22').toISOString(),
        review_visibility: 'public',
        user_name: 'Vikram Singh',
      },
      {
        review_id: 'sample-review-5',
        booking_id: 'sample-booking-5',
        user_id: 'user-5',
        vendor_id: vendorProfile?.vendor_id || '',
        rating: 2,
        comment: 'Disappointed with the service. There were delays and the quality was not as promise in our initial meetings.',
        created_at: new Date('2023-08-05').toISOString(),
        review_visibility: 'public',
        user_name: 'Neha Kapoor',
      }
    ];
    
    return sampleReviews;
  };
  
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };
  
  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };
  
  const getRatingCount = (rating: number) => {
    return reviews.filter(review => Math.floor(review.rating) === rating).length;
  };
  
  const getRatingPercentage = (rating: number) => {
    if (reviews.length === 0) return 0;
    return (getRatingCount(rating) / reviews.length * 100).toFixed(0);
  };
  
  // Ensure this specific helper function is updated to always return a string
  const formatReviewId = (id: string | number): string => {
    // Convert any number (including 0) to a string
    return id.toString();
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Reviews & Ratings</h1>
        <p className="text-muted-foreground mt-1">
          See what clients are saying about your services
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ratings Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Overall Rating</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="text-5xl font-bold text-sanskara-red">
                {getAverageRating()}
              </div>
              <div className="flex items-center mt-2">
                {renderStars(parseFloat(getAverageRating()))}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </div>
            </div>
            
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="text-sm font-medium w-2">{rating}</div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-sanskara-red h-2 rounded-full" 
                      style={{ width: `${getRatingPercentage(rating)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-muted-foreground w-10">
                    {getRatingCount(rating)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Reviews List */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Client Reviews</CardTitle>
              <Tabs 
                defaultValue="all" 
                value={currentTab} 
                onValueChange={(value) => setCurrentTab(value as 'all' | 'positive' | 'negative')}
                className="w-full md:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="positive">Positive</TabsTrigger>
                  <TabsTrigger value="negative">Critical</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search reviews..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
                <p className="ml-3 text-sanskara-maroon">Loading reviews...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-1">No Reviews Found</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  {searchQuery 
                    ? "No reviews match your search criteria" 
                    : "You haven't received any reviews yet."}
                </p>
                {searchQuery && (
                  <Button 
                    variant="link" 
                    onClick={() => setSearchQuery('')}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {filteredReviews.map((review) => (
                  <div key={formatReviewId(review.review_id)} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-sanskara-red/10 text-sanskara-red">
                            {review.user_name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{review.user_name}</h3>
                            <Badge variant="outline" className="bg-gray-100 border-gray-200 text-gray-600 text-xs">
                              {review.booking_id.substring(0, 8)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-xs text-muted-foreground ml-1">
                              • {format(new Date(review.created_at), 'MMMM d, yyyy')}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="mt-2 text-muted-foreground">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 justify-end">
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Thank
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reviews;
