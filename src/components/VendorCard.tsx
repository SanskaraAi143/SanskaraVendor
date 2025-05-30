
import React from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface VendorCardProps {
  name: string;
  category: string;
  rating: number;
  image: string;
  location: string;
  price: string;
  description: string;
}

const VendorCard = ({
  name,
  category,
  rating,
  image,
  location,
  price,
  description,
}: VendorCardProps) => {
  return (
    <div className="glass-card overflow-hidden group">
      <div className="relative h-56 overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white bg-opacity-90 text-wedrose-600 text-xs font-semibold px-3 py-1 rounded-full">
            {category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-serif font-medium text-wedneutral-800">
            {name}
          </h3>
          <div className="flex items-center bg-wedgold-100 px-2 py-1 rounded">
            <Star size={14} className="text-wedgold-500 mr-1" />
            <span className="text-sm font-medium text-wedneutral-800">
              {rating}
            </span>
          </div>
        </div>

        <div className="flex items-center text-sm text-wedneutral-600 mb-3">
          <span>{location}</span>
          <span className="mx-2">•</span>
          <span className="font-medium text-wedrose-600">{price}</span>
        </div>

        <p className="text-wedneutral-600 text-sm mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" className="text-sm border-wedrose-300 text-wedrose-600 hover:bg-wedrose-50 hover:text-wedrose-700 hover:border-wedrose-400">
            View Profile
          </Button>
          <Button className="text-sm btn-primary">
            Contact Vendor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendorCard;
