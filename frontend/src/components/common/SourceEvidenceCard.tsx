import React from 'react';
import { ExternalLink, CheckCircle2, BookOpen, Calendar, ShieldCheck } from 'lucide-react';
import { SourceCitation } from '../../types';

interface SourceEvidenceCardProps {
  citation: SourceCitation;
  onOpenStandard?: (isNumber: string) => void;
}

export const SourceEvidenceCard: React.FC<SourceEvidenceCardProps> = ({
  citation,
  onOpenStandard,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #D6E4F8',
        borderRadius: '8px',
        padding: '14px 16px',
        boxShadow: '0 1px 3px rgba(57, 82, 123, 0.05)',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#3A74C2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BookOpen size={14} />
          </div>
          <div>
            <h4
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#2A3C5B',
                lineHeight: 1.3,
              }}
            >
              {citation.documentTitle}
            </h4>
            <div style={{ fontSize: '12px', color: '#3A74C2', fontWeight: 600 }}>
              {citation.isNumber}{citation.versionYear ? ` (${citation.versionYear})` : ''}
            </div>
          </div>
        </div>

        <span
          className="badge badge-verified"
          style={{ fontSize: '11px', padding: '2px 8px', flexShrink: 0 }}
        >
          <ShieldCheck size={12} />
          Verified Source
        </span>
      </div>

      {(citation.clause || citation.page) && (
        <div
          style={{
            backgroundColor: '#F7FAFD',
            border: '1px solid #E2EAF5',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '12px',
            color: '#39527B',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {citation.clause && (
            <span>
              <strong>Clause Reference:</strong> {citation.clause}
            </span>
          )}
          {citation.page && (
            <span>
              <strong>Location:</strong> {citation.page}
            </span>
          )}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #EDF3FB',
          paddingTop: '8px',
          marginTop: '6px',
          fontSize: '11.5px',
          color: '#64748B',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {citation.retrievedDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} />
            <span>Retrieved: {citation.retrievedDate}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onOpenStandard && citation.isNumber && (
            <button
              onClick={() => onOpenStandard(citation.isNumber!)}
              style={{
                color: '#3A74C2',
                fontWeight: 600,
                fontSize: '11.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Open Standard &rarr;
            </button>
          )}

          {citation.sourceUrl && (
            <a
              href={citation.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#3A74C2',
                fontWeight: 600,
                fontSize: '11.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              BIS Portal <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
