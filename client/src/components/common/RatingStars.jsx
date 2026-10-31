import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, size = 'sm', interactive = false, onChange }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizes[size]} transition-colors ${
            star <= rating
              ? 'fill-gold-400 text-gold-400'
              : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-gold-400' : ''}`}
          onClick={() => interactive && onChange && onChange(star)}
        />
      ))}
    </div>
  );
};

export default RatingStars;
