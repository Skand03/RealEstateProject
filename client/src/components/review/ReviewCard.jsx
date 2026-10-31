import { formatDate } from '../../utils/formatters';
import RatingStars from '../common/RatingStars';

const ReviewCard = ({ review }) => {
  const reviewer = review.reviewer || review.buyer || {};
  const avatarUrl = reviewer.avatar;
  const initials = reviewer.fullName?.[0]?.toUpperCase() || '?';

  return (
    <div className="card">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={reviewer.fullName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-semibold text-sm">{initials}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 text-sm">
              {reviewer.fullName || 'Anonymous'}
            </p>
            <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
          </div>

          <RatingStars rating={review.rating} size="sm" />

          {review.comment && (
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
