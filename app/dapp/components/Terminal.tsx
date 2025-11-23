'use client';

import DecoderText from './DecoderText';

interface TerminalProps {
  output: string[];
  title?: string;
}

export default function Terminal({ output, title = 'Terminal' }: TerminalProps) {
  const renderLine = (line: string, index: number) => {
    const lowerLine = line.toLowerCase();
    const contractMatches = [...lowerLine.matchAll(/contract/gi)];
    
    if (contractMatches.length > 0) {
      // Split line by all instances of "contract" and render each with decoder effect
      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      
      contractMatches.forEach((match, matchIndex) => {
        const matchIndex_actual = match.index!;
        
        // Add text before the match
        if (matchIndex_actual > lastIndex) {
          parts.push(line.substring(lastIndex, matchIndex_actual));
        }
        
        // Add decoder text for "contract"
        parts.push(
          <DecoderText 
            key={`contract-${index}-${matchIndex}`} 
            text="contract" 
            delay={0} 
          />
        );
        
        lastIndex = matchIndex_actual + 8; // "contract" is 8 characters
      });
      
      // Add remaining text after last match
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
      
      return (
        <div key={index} className="terminal-line">
          {line.startsWith('>') ? (
            <span className="terminal-prompt">
              {parts.map((part, i) => (
                <span key={i}>{typeof part === 'string' ? part : part}</span>
              ))}
            </span>
          ) : line.startsWith('✓') ? (
            <span className="terminal-success">
              {parts.map((part, i) => (
                <span key={i}>{typeof part === 'string' ? part : part}</span>
              ))}
            </span>
          ) : (
            <>
              {parts.map((part, i) => (
                <span key={i}>{typeof part === 'string' ? part : part}</span>
              ))}
            </>
          )}
        </div>
      );
    }
    
    return (
      <div key={index} className="terminal-line">
        {line.startsWith('>') ? (
          <span className="terminal-prompt">{line}</span>
        ) : line.startsWith('✓') ? (
          <span className="terminal-success">{line}</span>
        ) : (
          <span>{line}</span>
        )}
      </div>
    );
  };

  return (
    <div className="terminal">
      <div className="terminal-header">
        <span className="terminal-title">{title}</span>
      </div>
      <div className="terminal-content">
        {output.length === 0 ? (
          <div className="terminal-empty">
            <span className="terminal-prompt">$</span> {title === '0G Storage Status' ? 'Ready to save models to 0G Storage' : 'Ready to compile and deploy'}
          </div>
        ) : (
          output.map((line, index) => renderLine(line, index))
        )}
      </div>
    </div>
  );
}

