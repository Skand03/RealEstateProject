import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Shield, CheckCircle, Clock, XCircle, Upload, FileText,
  Image, X, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  submitVerification,
  fetchMyVerificationStatus,
  selectMyVerification,
  selectVerificationLoading,
  selectVerificationError,
} from '../../features/sellerVerification/sellerVerificationSlice';
import { useAuth } from '../../hooks/useAuth';
import { VERIFICATION_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const FileUploadBox = ({ label, hint, file, onChange, onClear, error }) => {
  const inputRef = useRef(null);

  const isImage = file && file.type.startsWith('image/');

  return (
    <div>
      <label className="label">{label}</label>
      <p className="text-xs text-gray-500 mb-2">{hint}</p>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
        >
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">Click to upload</p>
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG, or PDF · max 10MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            className="hidden"
            onChange={onChange}
          />
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            {isImage ? (
              <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-14 w-14 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <FileText className="h-7 w-7 text-red-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
              title="Remove file"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const StatusCard = ({ status, verification }) => {
  if (status === VERIFICATION_STATUS.APPROVED) {
    return (
      <div className="card text-center py-12">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">You are a Verified Seller!</h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Your identity and ownership documents have been approved. You can now list properties on HaikyuuHeights.
        </p>
        {verification?.approvedAt && (
          <p className="text-xs text-gray-400 mt-4">
            Approved on {formatDate(verification.approvedAt)}
          </p>
        )}
      </div>
    );
  }

  if (status === VERIFICATION_STATUS.PENDING) {
    return (
      <div className="card text-center py-12">
        <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-yellow-600 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Documents Under Review</h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Our team is reviewing your submitted documents. This usually takes 1–2 business days.
          We'll notify you once the review is complete.
        </p>
        {verification?.submittedAt && (
          <p className="text-xs text-gray-400 mt-4">
            Submitted on {formatDate(verification.submittedAt || verification.createdAt)}
          </p>
        )}
      </div>
    );
  }

  return null;
};

const SellerVerification = () => {
  const dispatch = useDispatch();
  const { verificationStatus } = useAuth();
  const myVerification = useSelector(selectMyVerification);
  const loading = useSelector(selectVerificationLoading);
  const sliceError = useSelector(selectVerificationError);

  const [identityFile, setIdentityFile] = useState(null);
  const [ownershipFile, setOwnershipFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchMyVerificationStatus());
  }, [dispatch]);

  const validateFile = (file, field) => {
    if (!file) return `${field} is required.`;
    if (!ALLOWED_TYPES.includes(file.type)) return 'Only JPEG, PNG, or PDF files are allowed.';
    if (file.size > MAX_FILE_SIZE) return 'File size must not exceed 10MB.';
    return null;
  };

  const handleFileChange = (setter, fieldKey) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file, fieldKey);
    setFieldErrors((prev) => ({ ...prev, [fieldKey]: err }));
    if (!err) setter(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const identityErr = validateFile(identityFile, 'Identity Proof');
    const ownershipErr = validateFile(ownershipFile, 'Ownership Proof');
    if (identityErr || ownershipErr) {
      setFieldErrors({ identity: identityErr, ownership: ownershipErr });
      return;
    }

    const formData = new FormData();
    formData.append('identityProof', identityFile);
    formData.append('ownershipProof', ownershipFile);

    setSubmitting(true);
    const result = await dispatch(submitVerification(formData));
    setSubmitting(false);

    if (submitVerification.fulfilled.match(result)) {
      toast.success('Documents submitted successfully! Awaiting review.');
      setIdentityFile(null);
      setOwnershipFile(null);
    } else {
      toast.error(result.payload || 'Submission failed. Please try again.');
    }
  };

  if (loading && !myVerification) return <LoadingSpinner fullScreen />;

  const showForm =
    !verificationStatus ||
    verificationStatus === VERIFICATION_STATUS.NOT_SUBMITTED ||
    verificationStatus === VERIFICATION_STATUS.REJECTED;

  return (
    <div className="page-container py-8 max-w-2xl">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Verification</h1>
          <p className="text-gray-500 text-sm">Submit your documents to get verified and list properties.</p>
        </div>
      </div>

      {/* Status cards for APPROVED / PENDING */}
      {(verificationStatus === VERIFICATION_STATUS.APPROVED ||
        verificationStatus === VERIFICATION_STATUS.PENDING) && (
        <StatusCard status={verificationStatus} verification={myVerification} />
      )}

      {/* Upload form for NOT_SUBMITTED / REJECTED */}
      {showForm && (
        <div className="card">
          {/* Rejection reason */}
          {verificationStatus === VERIFICATION_STATUS.REJECTED && myVerification?.rejectionReason && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 text-sm font-semibold">Previous submission rejected</p>
                <p className="text-red-700 text-sm mt-0.5">
                  Reason: {myVerification.rejectionReason}
                </p>
                <p className="text-red-600 text-xs mt-1">
                  Please upload corrected documents and resubmit.
                </p>
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">What documents do I need?</p>
              <ul className="text-xs space-y-0.5 text-blue-600 list-disc list-inside">
                <li>Identity Proof: Aadhaar card, PAN card, or passport</li>
                <li>Ownership Proof: Property deed, sale agreement, or utility bill</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FileUploadBox
              label="Identity Proof *"
              hint="Government-issued ID (Aadhaar, PAN, Passport) · JPEG, PNG, PDF · max 10MB"
              file={identityFile}
              onChange={handleFileChange(setIdentityFile, 'identity')}
              onClear={() => { setIdentityFile(null); setFieldErrors((p) => ({ ...p, identity: null })); }}
              error={fieldErrors.identity}
            />

            <FileUploadBox
              label="Ownership Proof *"
              hint="Property deed, sale agreement, or utility bill · JPEG, PNG, PDF · max 10MB"
              file={ownershipFile}
              onChange={handleFileChange(setOwnershipFile, 'ownership')}
              onClear={() => { setOwnershipFile(null); setFieldErrors((p) => ({ ...p, ownership: null })); }}
              error={fieldErrors.ownership}
            />

            {sliceError && (
              <p className="text-red-500 text-sm">{sliceError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Submitting…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {verificationStatus === VERIFICATION_STATUS.REJECTED
                    ? 'Resubmit Documents'
                    : 'Submit for Verification'}
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SellerVerification;
