import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Calendar, Download, Filter, Home, Check } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import Badge from '../../components/common/Badge'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { Link } from 'react-router-dom'

const CommissionSummary = () => {
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [dateRange, setDateRange] = useState('ALL_TIME')
  const [summary, setSummary] = useState({
    totalEarned: 0,
    totalPending: 0,
    totalPaid: 0,
    transactionCount: 0
  })

  useEffect(() => {
    fetchCommissions()
  }, [dateRange])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/commissions/seller/mine')
      const data = response.data.data
      setCommissions(data.commissions || [])
      setSummary({
        totalEarned: data.totals?.totalSellerCommission || 0,
        totalPending: (data.commissions || []).filter((c) => c.status === 'PENDING').reduce((sum, c) => sum + (c.sellerCommissionAmount || 0), 0),
        totalPaid: (data.commissions || []).filter((c) => c.status === 'PAID').reduce((sum, c) => sum + (c.sellerCommissionAmount || 0), 0),
        transactionCount: data.totals?.count || 0,
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch commission data')
      toast.error('Failed to load commission summary')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    try {
      toast.success('Downloading report...')
      // Download a CSV generated from the real commission records already fetched from the API.
      const csvContent = generateCSV(commissions)
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `commission_report_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast.error('Failed to download report')
    }
  }

  const generateCSV = (data) => {
    const headers = ['Date', 'Property', 'Buyer', 'Amount', 'Commission', 'Status']
    const rows = data.map(c => [
      new Date(c.createdAt).toLocaleDateString('en-IN'),
      c.property?.title || 'N/A',
      c.buyer?.fullName || 'N/A',
      `₹${c.transactionAmount?.toLocaleString('en-IN')}`,
      `₹${c.sellerCommissionAmount?.toLocaleString('en-IN')}`,
      c.status
    ])
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'Pending' },
      PAID: { variant: 'success', label: 'Paid' },
      PROCESSING: { variant: 'info', label: 'Processing' }
    }
    return statusMap[status] || { variant: 'gray', label: status }
  }

  const filteredCommissions = commissions.filter(commission => 
    filter === 'ALL' ? true : commission.status === filter
  )

  const filterOptions = [
    { value: 'ALL', label: 'All Transactions', count: commissions.length },
    { value: 'PAID', label: 'Paid', count: commissions.filter(c => c.status === 'PAID').length },
    { value: 'PENDING', label: 'Pending', count: commissions.filter(c => c.status === 'PENDING').length },
    { value: 'PROCESSING', label: 'Processing', count: commissions.filter(c => c.status === 'PROCESSING').length }
  ]

  const dateRangeOptions = [
    { value: 'ALL_TIME', label: 'All Time' },
    { value: 'THIS_MONTH', label: 'This Month' },
    { value: 'LAST_MONTH', label: 'Last Month' },
    { value: 'THIS_YEAR', label: 'This Year' }
  ]

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage message={error} />
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Commission Summary</h1>
          <p className="text-gray-600">Track your earnings and commission payments</p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="btn-outline mt-4 md:mt-0 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 opacity-80" />
            <TrendingUp className="h-5 w-5 opacity-80" />
          </div>
          <p className="text-green-100 text-sm mb-1">Total Earned</p>
          <h3 className="text-3xl font-bold">
            ₹{summary.totalEarned?.toLocaleString('en-IN') || 0}
          </h3>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <Check className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-blue-100 text-sm mb-1">Paid Amount</p>
          <h3 className="text-3xl font-bold">
            ₹{summary.totalPaid?.toLocaleString('en-IN') || 0}
          </h3>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-yellow-100 text-sm mb-1">Pending Amount</p>
          <h3 className="text-3xl font-bold">
            ₹{summary.totalPending?.toLocaleString('en-IN') || 0}
          </h3>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <Home className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-purple-100 text-sm mb-1">Total Transactions</p>
          <h3 className="text-3xl font-bold">{summary.transactionCount || 0}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="font-semibold text-gray-700">Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>

          <div className="ml-auto">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field py-2"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Commission Table */}
      {filteredCommissions.length === 0 ? (
        <div className="card p-12 text-center">
          <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No commission data</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'ALL' 
              ? 'Commission data will appear here when properties are sold'
              : `No ${filter.toLowerCase()} commissions found`}
          </p>
          <Link to="/seller/my-properties" className="btn-primary inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            View My Properties
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Property Price
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Commission (2.5%)
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCommissions.map(commission => {
                  const statusBadge = getStatusBadge(commission.status)
                  return (
                    <tr key={commission._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(commission.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/properties/${commission.property?._id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          {commission.property?.title || 'N/A'}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {commission.property?.city}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {commission.buyer?.fullName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{commission.transactionAmount?.toLocaleString('en-IN') || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-green-600">
                          ₹{commission.sellerCommissionAmount?.toLocaleString('en-IN') || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commission Info */}
      <div className="mt-8 card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <DollarSign className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-blue-900 mb-2">Commission Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Platform charges 2.5% commission on successful property sales</li>
              <li>• Commission is calculated based on the final property sale price</li>
              <li>• Payments are processed within 7-10 business days after transaction completion</li>
              <li>• All commissions are subject to applicable taxes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommissionSummary
