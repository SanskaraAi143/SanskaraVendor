
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Star,
  MessageSquare,
  Edit,
  Trash2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { format } from 'date-fns';

interface Review {
  review_id: string;
  booking_id: string;
  user_id: string;
  vendor_id: string;
  rating: number;
  comment: string;
  created_at: string;
  review_visibility: string;
  user_name?: string;
  service_name?: string;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<string | null>(null);
  const { vendorProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (vendorProfile?.vendor_id) {
      fetchReviews();
    }
  }, [vendorProfile, filterRating]);

  const fetchReviews = async () => {
    if (!vendorProfile?.vendor_id) return;
    
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('vendor_id', vendorProfile.vendor_id);
        
      if (filterRating) {
        query = query.eq('rating', parseInt(filterRating));
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Fetch user names for each review
      const enhancedReviews = await Promise.all(
        (data || []).map(async (review) => {
          // Get user info
          const { data: userData } = await supabase
            .from('users')
            .select('display_name')
            .eq('user_id', review.user_id)
            .single();
            
          // Get service info from bookings
          const { data: bookingData } = await supabase
            .from('bookings')
            .select(`
              booking_id,
              booking_services (
                vendor_service_id
              )
            `)
            .eq('booking_id', review.booking_id)
            .single();
            
          let serviceName = "Unknown Service";
          
          if (bookingData?.booking_services && bookingData.booking_services.length > 0) {
            const { data: serviceData } = await supabase
              .from('vendor_services')
              .select('service_name')
              .eq('service_id', bookingData.booking_services[0].vendor_service_id)
              .single();
              
            if (serviceData) {
              serviceName = serviceData.service_name;
            }
          }
          
          return {
            ...review,
            user_name: userData?.display_name || 'Anonymous User',
            service_name: serviceName
          };
        })
      );
      
      setReviews(enhancedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('review_id', reviewId);
        
      if (error) throw error;
      
      setReviews(reviews.filter(review => review.review_id !== reviewId));
      
      toast({
        title: "Review deleted",
        description: "The review has been successfully deleted",
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const handleVisibilityChange = async (reviewId: string, visibility: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ review_visibility: visibility })
        .eq('review_id', reviewId);
        
      if (error) throw error;
      
      setReviews(reviews.map(review => 
        review.review_id === reviewId 
          ? { ...review, review_visibility: visibility } 
          : review
      ));
      
      toast({
        title: "Visibility updated",
        description: `Review is now ${visibility.toLowerCase()}`,
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const formatReviewId = (id: string | number): string => {
    return String(id).substring(0, 8);
  };

  const getStarRating = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? 'text-sanskara-amber fill-sanskara-amber'
              : 'text-gray-300'
          }`}
        />
      ));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Reviews</h1>
        <p className="text-muted-foreground mt-1">
          Manage and respond to customer reviews
        </p>
      </div>

      <div className="flex items-center">
        <Select 
          value={filterRating || "all"} 
          onValueChange={(value) => setFilterRating(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
          <p className="ml-3 text-sanskara-maroon">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-sanskara-amber/20 p-3 mb-4">
              <MessageSquare className="h-8 w-8 text-sanskara-amber" />
            </div>
            <h3 className="text-xl font-medium mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {filterRating 
                ? `No ${filterRating}-star reviews found. Try selecting a different rating filter.`
                : "You haven't received any reviews yet. Reviews will appear here once customers rate your services."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <Card key={review.review_id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-sanskara-red/10 text-sanskara-red">
                        {review.user_name?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{review.user_name}</h3>
                        <Badge 
                          variant="outline"
                          className={
                            review.review_visibility === 'public'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        >
                          {review.review_visibility}
                        </Badge>
                      </div>
                      <div className="flex text-sm text-muted-foreground gap-4 mb-2">
                        <span>Review #{formatReviewId(review.review_id)}</span>
                        <span>•</span>
                        <span>{formatDate(review.created_at)}</span>
                        <span>•</span>
                        <span>{review.service_name}</span>
                      </div>
                      <div className="flex mb-4">{getStarRating(review.rating)}</div>
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  </div>
                  <div className="flex">
                    <Select
                      value={review.review_visibility}
                      onValueChange={(value) => handleVisibilityChange(review.review_id, value)}
                    >
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-2"
                      onClick={() => handleDeleteReview(review.review_id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
