import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  // Parse markdown lines and blocks
  const parseMarkdown = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLanguage = '';
    let tableBuffer: string[] = [];
    let inList = false;
    let listBuffer: string[] = [];
    let isOrderedList = false;

    const flushList = (key: string) => {
      if (listBuffer.length > 0) {
        if (isOrderedList) {
          elements.push(
            <ol key={key} style={{ paddingLeft: '22px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {listBuffer.map((item, idx) => (
                <li key={idx} style={{ fontSize: '13.5px', lineHeight: 1.55 }}>
                  {formatInline(item)}
                </li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={key} style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {listBuffer.map((item, idx) => (
                <li key={idx} style={{ fontSize: '13.5px', lineHeight: 1.55 }}>
                  {formatInline(item)}
                </li>
              ))}
            </ul>
          );
        }
        listBuffer = [];
        inList = false;
      }
    };

    const flushTable = (key: string) => {
      if (tableBuffer.length > 0) {
        const headerRow = tableBuffer[0];
        const bodyRows = tableBuffer.slice(2); // Skip separator row
        const parseRow = (row: string) =>
          row
            .split('|')
            .map((c) => c.trim())
            .filter((c, i, arr) => (i === 0 && c === '' ? false : i === arr.length - 1 && c === '' ? false : true));

        const headers = parseRow(headerRow);

        elements.push(
          <div
            key={key}
            style={{
              overflowX: 'auto',
              margin: '12px 0',
              border: '1px solid #D6E4F8',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F6FD', borderBottom: '1px solid #D6E4F8' }}>
                  {headers.map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        fontWeight: 700,
                        color: '#1D2B42',
                      }}
                    >
                      {formatInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((r, rIdx) => {
                  const cells = parseRow(r);
                  return (
                    <tr
                      key={rIdx}
                      style={{
                        borderBottom: rIdx < bodyRows.length - 1 ? '1px solid #E2EAF5' : 'none',
                        backgroundColor: rIdx % 2 === 1 ? '#FAFCFE' : '#FFFFFF',
                      }}
                    >
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: '8px 12px', color: '#334155' }}>
                          {formatInline(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        tableBuffer = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block toggles
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div
              key={`code-${i}`}
              style={{
                backgroundColor: '#1E293B',
                color: '#E2E8F0',
                padding: '12px 16px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '12.5px',
                margin: '10px 0',
                overflowX: 'auto',
              }}
            >
              {codeLanguage && (
                <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {codeLanguage}
                </div>
              )}
              <pre style={{ margin: 0 }}>{codeBuffer.join('\n')}</pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          flushList(`pre-list-${i}`);
          flushTable(`pre-table-${i}`);
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Tables
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        flushList(`pre-list-tbl-${i}`);
        tableBuffer.push(line.trim());
        continue;
      } else if (tableBuffer.length > 0) {
        flushTable(`table-${i}`);
      }

      // Lists
      const unorderedMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
      const orderedMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);

      if (unorderedMatch) {
        if (!inList || isOrderedList) {
          flushList(`flush-${i}`);
          inList = true;
          isOrderedList = false;
        }
        listBuffer.push(unorderedMatch[2]);
        continue;
      } else if (orderedMatch) {
        if (!inList || !isOrderedList) {
          flushList(`flush-${i}`);
          inList = true;
          isOrderedList = true;
        }
        listBuffer.push(orderedMatch[2]);
        continue;
      } else {
        flushList(`list-${i}`);
      }

      // Empty line
      if (!line.trim()) {
        continue;
      }

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h4
            key={`h4-${i}`}
            style={{
              fontSize: '14.5px',
              fontWeight: 700,
              color: '#1D2B42',
              marginTop: '12px',
              marginBottom: '6px',
            }}
          >
            {formatInline(line.slice(4))}
          </h4>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h3
            key={`h3-${i}`}
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#1D2B42',
              marginTop: '14px',
              marginBottom: '8px',
            }}
          >
            {formatInline(line.slice(3))}
          </h3>
        );
        continue;
      }
      if (line.startsWith('# ')) {
        elements.push(
          <h2
            key={`h2-${i}`}
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#1D2B42',
              marginTop: '16px',
              marginBottom: '10px',
            }}
          >
            {formatInline(line.slice(2))}
          </h2>
        );
        continue;
      }

      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(
          <hr
            key={`hr-${i}`}
            style={{
              border: 'none',
              borderTop: '1px solid #D6E4F8',
              margin: '12px 0',
            }}
          />
        );
        continue;
      }

      // Standard Paragraph
      elements.push(
        <p
          key={`p-${i}`}
          style={{
            fontSize: '13.5px',
            lineHeight: 1.6,
            color: '#1E293B',
            margin: '6px 0',
          }}
        >
          {formatInline(line)}
        </p>
      );
    }

    flushList('final-list');
    flushTable('final-table');

    return elements;
  };

  // Format inline bold, italic, inline-code
  const formatInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > cursor) {
        parts.push(text.substring(cursor, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(<strong key={match.index} style={{ fontWeight: 700, color: '#0F172A' }}>{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(<em key={match.index} style={{ fontStyle: 'italic' }}>{token.slice(1, -1)}</em>);
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            style={{
              backgroundColor: '#EAF2FE',
              color: '#1E40AF',
              padding: '1px 5px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      cursor = regex.lastIndex;
    }

    if (cursor < text.length) {
      parts.push(text.substring(cursor));
    }

    return parts.length > 0 ? parts : text;
  };

  return <div className={`markdown-body ${className}`}>{parseMarkdown(content)}</div>;
};
