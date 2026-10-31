const variants = {
  ACTIVE: 'badge-success',
  APPROVED: 'badge-success',
  COMPLETED: 'badge-success',
  ACCEPTED: 'badge-info',
  PENDING: 'badge-warning',
  REJECTED: 'badge-danger',
  CANCELLED: 'badge-danger',
  SOLD: 'badge-gray',
  RENTED: 'badge-gray',
  INACTIVE: 'badge-gray',
  NOT_SUBMITTED: 'badge-gray',
  SALE: 'badge-info',
  RENT: 'badge-success',
};

const Badge = ({ text, variant }) => {
  const cls = variant ? variants[variant] || 'badge-gray' : 'badge-gray';
  return <span className={cls}>{text || variant}</span>;
};

export default Badge;
