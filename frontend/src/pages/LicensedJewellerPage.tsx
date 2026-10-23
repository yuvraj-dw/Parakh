import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  MapPin,
  Phone,
  CheckCircle2,
  ChevronLeft,
  Filter,
} from 'lucide-react';
import { NavRoute, LicensedJeweller, NavigationPayload } from '../types';
import { ApiError } from '../api/client';
import { jewellersService } from '../services/jewellersService';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

interface LicensedJewellerPageProps {
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
}

export const LicensedJewellerPage: React.FC<LicensedJewellerPageProps> = ({
  onNavigate,
}) => {
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [jewellers, setJewellers] = useState<LicensedJeweller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const states = ['ALL', 'Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Telangana', 'Rajasthan', 'West Bengal', 'Gujarat'];
  const statuses = ['ALL', 'VALID', 'SUSPENDED', 'CANCELLED'];

  const fetchJewellers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await jewellersService.getPaginatedJewellers({
        state: selectedState !== 'ALL' ? selectedState : undefined,
        city: selectedCity.trim() || undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        page: currentPage,
        pageSize: 20,
      });
      setJewellers(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Unable to connect to BIS Parakh jewellers service.';
      setError(message);
      setJewellers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedState, selectedCity, selectedStatus]);

  useEffect(() => {
    fetchJewellers();
  }, [selectedState, selectedCity, selectedStatus, currentPage]);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
        <button
          onClick={() => onNavigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#3A74C2',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={16} /> Home
        </button>
        <span>/</span>
        <span style={{ color: '#1D2B42', fontWeight: 700 }}>Licensed Jewellers</span>
      </div>

      {/* Header */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(180deg, #F0F6FE 0%, #FFFFFF 100%)',
          border: '1px solid #D6E4F8',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#EAF2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3A74C2',
              border: '1px solid #C4DCFA',
            }}
          >
            <Store size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1D2B42' }}>
              BIS Licensed Jewellers Registry
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              Directory of jewellers holding valid BIS hallmarking registrations for gold and silver jewellery.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters (Per Section 10) */}
      <div
        className="card"
        style={{
          padding: '18px 20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D6E4F8',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3A74C2' }} />
          <input
            type="text"
            placeholder="Search jewellers by city (e.g. Mumbai, New Delhi)..."
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              width: '100%',
              height: '44px',
              paddingLeft: '44px',
              paddingRight: '14px',
              fontSize: '14px',
              backgroundColor: '#F8FAFD',
              border: '1px solid #C4DCFA',
              borderRadius: '10px',
              color: '#1D2B42',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#39527B' }}>State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                border: '1px solid #D6E4F8',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
              }}
            >
              {states.map((s) => (
                <option key={s} value={s}>{s === 'ALL' ? 'All States' : s}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#39527B' }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                border: '1px solid #D6E4F8',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
              }}
            >
              {statuses.map((st) => (
                <option key={st} value={st}>{st === 'ALL' ? 'All Statuses' : st}</option>
              ))}
            </select>
          </div>

          <span style={{ fontSize: '12px', color: '#64748B', marginLeft: 'auto' }}>
            Showing <strong>{jewellers.length}</strong> licensed jewellers
          </span>
        </div>
      </div>

      {/* Content Area */}
      {error ? (
        <ErrorState
          title="Unable to Load Licensed Jewellers"
          message={error}
          apiEndpoint="/api/v1/jewellers"
          onRetry={fetchJewellers}
        />
      ) : isLoading ? (
        <LoadingSkeleton type="table" count={3} message="Loading licensed jewellers from BIS registry..." />
      ) : jewellers.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No licensed jeweller records found"
          description="Try broadening your search or resetting the state filter."
          actionText="Reset Filters"
          onAction={() => {
            setSelectedState('ALL');
            setSelectedCity('');
            setSelectedStatus('ALL');
            setCurrentPage(1);
          }}
        />
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Jeweller Name</th>
                  <th>Licence Number</th>
                  <th>City & State</th>
                  <th>Address</th>
                  <th>Product / Metal Category</th>
                  <th>Contact Information</th>
                  <th>Status</th>
                  <th>Validity</th>
                </tr>
              </thead>
              <tbody>
                {jewellers.map((j) => (
                  <tr key={j.id}>
                    <td style={{ fontWeight: 800, color: '#1D2B42' }}>
                      {j.jewellerName}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#3A74C2', fontSize: '13px' }}>
                        {j.licenceNo}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>{j.city}</span>, {j.state}
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B', maxWidth: '240px' }}>
                      {j.address}
                    </td>
                    <td>
                      <span className="badge badge-sky">{j.metalCategory}</span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>
                      {j.contact || 'Not available'}
                    </td>
                    <td>
                      <span className="badge badge-verified">{j.status}</span>
                    </td>
                    <td style={{ fontSize: '12.5px', color: j.validTill ? '#166534' : '#64748B', fontWeight: j.validTill ? 700 : 500 }}>
                      {j.validTill || 'Not available'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                padding: '12px 18px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #D6E4F8',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Showing page <strong style={{ color: '#1D2B42' }}>{currentPage}</strong> of{' '}
                <strong style={{ color: '#1D2B42' }}>{totalPages}</strong> ({totalItems} licensed jewellers)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '12px', opacity: currentPage <= 1 ? 0.5 : 1 }}
                >
                  &larr; Previous
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '12px', opacity: currentPage >= totalPages ? 0.5 : 1 }}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
