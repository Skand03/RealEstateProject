import { useSelector, useDispatch } from 'react-redux';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectVerificationStatus,
  selectUserRole,
  logout,
} from '../features/auth/authSlice';
import { ROLES, VERIFICATION_STATUS } from '../utils/constants';

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const verificationStatus = useSelector(selectVerificationStatus);
  const role = useSelector(selectUserRole);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    verificationStatus,
    role,
    isBuyer: role === ROLES.BUYER,
    isSeller: role === ROLES.SELLER,
    isAdmin: role === ROLES.ADMIN,
    isVerifiedSeller: role === ROLES.SELLER && verificationStatus === VERIFICATION_STATUS.APPROVED,
    logout: () => dispatch(logout()),
  };
};
