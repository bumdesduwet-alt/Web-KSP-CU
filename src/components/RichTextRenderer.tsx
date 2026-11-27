import React from 'react';

interface RichTextRendererProps {
  content: string;
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
}) => {
  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-5 text-slate-700 leading-[1.75] text-[15px] md:text-base">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={index}
              className="font-serif text-2xl font-semibold text-navy-900 pt-3"
            >
              {trimmed.slice(3)}
            </h2>
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={index}
              className="font-serif text-xl font-semibold text-navy-900 pt-2"
            >
              {trimmed.slice(4)}
            </h3>
          );
        }

        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={index}
              className="py-5 px-6 bg-slate-50 border-y border-slate-200 font-serif italic text-lg text-navy-900"
            >
              {renderInlineFormatting(trimmed.slice(2))}
            </blockquote>
          );
        }

        const lines = trimmed.split('\n');
        if (lines.every((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={index} className="space-y-2 pl-5 list-disc marker:text-gold-600">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="pl-1">
                  {renderInlineFormatting(line.trim().slice(2))}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="whitespace-pre-line">
            {renderInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
};
