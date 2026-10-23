import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Search,
  MapPin,
  ExternalLink,
  ChevronLeft,
  CheckCircle2,
  Phone,
  Mail,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { NavRoute, NavigationPayload, TestingLab } from '../types';
import { laboratoriesService } from '../services/laboratoriesService';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Modal } from '../components/common/Modal';

interface TestingLaboratoriesPageProps {
  initialFilter?: { standard?: string };
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
}

export const TestingLaboratoriesPage: React.FC<TestingLaboratoriesPageProps> = ({
  initialFilter,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialFilter?.standard || '');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStandard, setSelectedStandard] = useState(initialFilter?.standard || 'ALL');

  // User-Controlled Geolocation State (Problem 4)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  const [labs, setLabs] = useState<TestingLab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedLab, setSelectedLab] = useState<TestingLab | null>(null);

  const states = ['ALL', 'Uttar Pradesh', 'Delhi', 'Karnataka', 'Gujarat', 'Haryana', 'Tamil Nadu', 'Telangana', 'Maharashtra'];
  const standardsList = ['ALL', 'IS 17803', 'IS 1417', 'IS 1293', 'IS 16046', 'IS 13252'];

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationNotice(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
        setLocationNotice(`Location active (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}) — Proximity sorted by backend.`);
        setCurrentPage(1);
      },
      (err) => {
        setIsLocating(false);
        setUserCoords(null);
        setLocationNotice(`Location permission denied or unavailable (${err.message}). Continuing without proximity.`);
      },
      { timeout: 10000 }
    );
  };

  const handleClearLocation = () => {
    setUserCoords(null);
    setLocationNotice(null);
    setCurrentPage(1);
  };

  const fetchLabs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await laboratoriesService.getPaginatedLaboratories({
        query: searchQuery,
        state: selectedState !== 'ALL' ? selectedState : undefined,
        city: selectedCity.trim() || undefined,
        standard: selectedStandard !== 'ALL' ? selectedStandard : undefined,
        user_lat: userCoords?.lat,
        user_lng: userCoords?.lng,
        page: currentPage,
        pageSize: 20,
      });
      setLabs(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to connect to BIS Parakh laboratories service.');
      setLabs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedState, selectedCity, selectedStandard, userCoords]);

  useEffect(() => {
    fetchLabs();
  }, [searchQuery, selectedState, selectedCity, selectedStandard, userCoords, currentPage]);

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
        <span style={{ color: '#1D2B42', fontWeight: 700 }}>Testing Laboratories</span>
      </div>

      {/* Header Banner */}
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
            <FlaskConical size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1D2B42' }}>
              BIS Recognized Testing Laboratories
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              Locate central, regional, and recognized NABL testing facilities for conformity assessment and pre-audit evaluations.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls (Per Section 9) */}
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
        {/* Search */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3A74C2' }} />
          <input
            type="text"
            placeholder="Search laboratory name, city, registration code, or standard (e.g. IS 17526, IS 9873)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '44px',
              paddingLeft: '44px',
              paddingRight: '14px',
              fontSize: '14px',
              borderRadius: '10px',
              border: '1px solid #C4DCFA',
              backgroundColor: '#F8FAFD',
              color: '#1D2B42',
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* State */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#39527B' }}>State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #D6E4F8',
                backgroundColor: '#FFFFFF',
              }}
            >
              {states.map((s) => (
                <option key={s} value={s}>{s === 'ALL' ? 'All States' : s}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#39527B' }}>City:</span>
            <input
              type="text"
              placeholder="Filter city..."
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #D6E4F8',
                backgroundColor: '#FFFFFF',
                width: '130px',
              }}
            />
          </div>

          {/* Standard */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#39527B' }}>Standard:</span>
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #D6E4F8',
                backgroundColor: '#FFFFFF',
              }}
            >
              {standardsList.map((st) => (
                <option key={st} value={st}>{st === 'ALL' ? 'All Standards' : st}</option>
              ))}
            </select>
          </div>

          {/* Geolocation Button (Problem 4) & Capability Note (Problem 5) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={userCoords ? handleClearLocation : handleUseMyLocation}
              disabled={isLocating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '8px',
                cursor: 'pointer',
                border: userCoords ? '1px solid #86EFAC' : '1px solid #C4DCFA',
                backgroundColor: userCoords ? '#DCFCE7' : '#EAF2FE',
                color: userCoords ? '#166534' : '#1D2B42',
              }}
            >
              <MapPin size={14} color={userCoords ? '#166534' : '#3A74C2'} />
              {isLocating
                ? 'Acquiring GPS...'
                : userCoords
                ? 'Location Active (Reset)'
                : 'Use My Location'}
            </button>
          </div>

          <span style={{ fontSize: '12px', color: '#64748B', marginLeft: 'auto' }}>
            Found <strong>{totalItems || labs.length}</strong> facilities
          </span>
        </div>

        {locationNotice && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              backgroundColor: userCoords ? '#F0FDF4' : '#FFFBEB',
              border: userCoords ? '1px solid #BBF7D0' : '1px solid #FDE68A',
              color: userCoords ? '#166534' : '#92400E',
            }}
          >
            {locationNotice}
          </div>
        )}
      </div>

      {/* Laboratories Cards Grid */}
      {error ? (
        <ErrorState
          title="Unable to Load Testing Laboratories"
          message={error}
          apiEndpoint="/api/v1/laboratories"
          onRetry={fetchLabs}
        />
      ) : isLoading ? (
        <LoadingSkeleton type="card" count={3} message="Searching testing laboratories in BIS registry..." />
      ) : labs.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No testing laboratories match your filters"
          description="Try resetting state, city, or standard filters."
          actionText="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedState('ALL');
            setSelectedCity('');
            setSelectedStandard('ALL');
            setUserCoords(null);
            setLocationNotice(null);
            setCurrentPage(1);
          }}
        />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
            {labs.map((lab) => (
              <div
                key={lab.id}
                className="card"
                style={{
                  padding: '22px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D6E4F8',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  boxShadow: '0 2px 6px rgba(30, 41, 59, 0.04)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge badge-sky">{lab.code}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: lab.status === 'RECOGNIZED' ? '#DCFCE7' : '#FEF3C7',
                        color: lab.status === 'RECOGNIZED' ? '#166534' : '#92400E',
                      }}
                    >
                      {lab.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1D2B42', marginBottom: '6px' }}>
                    {lab.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12.5px', color: '#475569', marginBottom: '8px' }}>
                    <MapPin size={15} style={{ color: '#3A74C2', flexShrink: 0, marginTop: '2px' }} />
                    <span>{lab.address}</span>
                  </div>

                  {/* Capabilities */}
                  {lab.capabilities && lab.capabilities.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Testing Capabilities:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {lab.capabilities.map((c, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#F1F6FD',
                              color: '#39527B',
                              fontWeight: 500,
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Supported Standards */}
                  {lab.accreditedStandards && lab.accreditedStandards.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Accredited Standards:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {lab.accreditedStandards.map((st, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #D6E4F8',
                              color: '#3A74C2',
                              fontWeight: 600,
                            }}
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions & Details */}
                <div style={{ borderTop: '1px solid #E2EAF5', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Validity: {lab.validity || 'Not available'}
                    {lab.distanceKm != null && (
                      <strong style={{ color: '#166534', marginLeft: '8px' }}>
                        • {lab.distanceKm} km
                      </strong>
                    )}
                  </span>
                  <button
                    onClick={() => setSelectedLab(lab)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '6px' }}
                  >
                    View Details &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px',
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
                <strong style={{ color: '#1D2B42' }}>{totalPages}</strong> ({totalItems} testing facilities)
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

      {/* Laboratory Detail Modal (Per Section 9) */}
      {selectedLab && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLab(null)}
          title={selectedLab.name}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-sky">{selectedLab.code}</span>
              <span className="badge badge-verified">{selectedLab.status}</span>
            </div>

            <div style={{ padding: '14px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2EAF5' }}>
              <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>LOCATION</div>
              <div style={{ fontSize: '13.5px', color: '#1D2B42', fontWeight: 600, marginTop: '2px' }}>
                {selectedLab.address}
              </div>
              <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px' }}>
                City: <strong>{selectedLab.city}</strong> • State: <strong>{selectedLab.state}</strong>
              </div>
              {selectedLab.distanceKm != null && (
                <div style={{ fontSize: '12px', color: '#166534', fontWeight: 700, marginTop: '4px' }}>
                  Distance: {selectedLab.distanceKm} km
                </div>
              )}
              {selectedLab.mapsUrl && (
                <div style={{ marginTop: '8px' }}>
                  <a
                    href={selectedLab.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '12px', color: '#3A74C2', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    View on Google Maps <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {(selectedLab.contact || selectedLab.email) && (
              <div style={{ padding: '14px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2EAF5' }}>
                <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>CONTACT INFORMATION</div>
                {selectedLab.contact && (
                  <div style={{ fontSize: '13px', color: '#1D2B42', marginTop: '4px' }}>
                    Phone: <strong>{selectedLab.contact}</strong>
                  </div>
                )}
                {selectedLab.email && (
                  <div style={{ fontSize: '13px', color: '#1D2B42', marginTop: '2px' }}>
                    Email: <strong>{selectedLab.email}</strong>
                  </div>
                )}
              </div>
            )}

            {selectedLab.services && selectedLab.services.length > 0 && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1D2B42', marginBottom: '8px' }}>
                  Laboratory Services Offered
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedLab.services.map((srv, idx) => (
                    <div key={idx} style={{ fontSize: '12.5px', color: '#334155' }}>
                      • {srv}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedLab.accreditedStandards && selectedLab.accreditedStandards.length > 0 && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1D2B42', marginBottom: '8px' }}>
                  Accredited Standards
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedLab.accreditedStandards.map((st, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedLab(null);
                        onNavigate('/standards', st);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #3A74C2',
                        color: '#3A74C2',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {st} &rarr;
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(selectedLab.officialSource || selectedLab.lastVerified) && (
              <div style={{ borderTop: '1px solid #EDF3FB', paddingTop: '10px', fontSize: '11.5px', color: '#64748B' }}>
                {selectedLab.officialSource && <>Source: <strong>{selectedLab.officialSource}</strong></>}
                {selectedLab.officialSource && selectedLab.lastVerified && ' • '}
                {selectedLab.lastVerified && <>Last Verified: {selectedLab.lastVerified}</>}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
