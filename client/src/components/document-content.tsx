import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { renderMathInElement, renderMathString } from "@/lib/math-renderer";
import { useTextSelection } from "@/hooks/use-text-selection";
import SelectionToolbar from "@/components/selection-toolbar";
import ChunkingModal from "@/components/chunking-modal";

import { bookContent as paperContent } from "@shared/book-content";
import { Copy, Lock } from "lucide-react";

interface DocumentContentProps {
  mathMode?: boolean;
  onTextSelectedForChat?: (text: string) => void;
  onRewriteFromSelection?: (text: string) => void;
  onPassageDiscussion?: (text: string) => void;
  onCreateStudyGuide?: (text: string) => void;
  onTestMe?: (text: string) => void;
  onCreatePodcast?: (text: string) => void;
}

export default function DocumentContent({ 
  mathMode = true, 
  onTextSelectedForChat, 
  onRewriteFromSelection, 
  onPassageDiscussion, 
  onCreateStudyGuide,
  onTestMe,
  onCreatePodcast
}: DocumentContentProps) {
  const { selection, isSelecting, clearSelection, highlightSelection, removeHighlights } = useTextSelection();
  const [showChunkingModal, setShowChunkingModal] = useState(false);
  const [selectedTextForChunking, setSelectedTextForChunking] = useState("");


  // Math rendering is handled in processContentForMathMode function

  const handleAskQuestion = (text: string) => {
    // Check if text is large and needs chunking
    const wordCount = text.split(/\s+/).length;
    
    if (wordCount > 1000) {
      // Open chunking modal for large selections
      setShowChunkingModal(true);
      setSelectedTextForChunking(text);
    } else {
      // For smaller texts, use normal selection
      if (onPassageDiscussion) {
        onPassageDiscussion(text);
      }
    }
    // Don't clear selection - let user choose other actions if needed
  };

  const handleSendToChat = (text: string) => {
    // Check if text is large and needs chunking
    const wordCount = text.split(/\s+/).length;
    
    if (wordCount > 1000) {
      // Open chunking modal for large selections
      setShowChunkingModal(true);
      setSelectedTextForChunking(text);
    } else {
      // For smaller texts, use normal selection
      if (onTextSelectedForChat) {
        onTextSelectedForChat(text);
      }
    }
    // Don't clear selection - let user choose other actions if needed
  };

  const handleRewrite = (text: string) => {
    // Check if text is large and needs chunking
    const wordCount = text.split(/\s+/).length;
    
    if (wordCount > 1000) {
      // Open chunking modal for large selections
      setShowChunkingModal(true);
      setSelectedTextForChunking(text);
    } else {
      // For smaller texts, use normal selection
      if (onRewriteFromSelection) {
        onRewriteFromSelection(text);
      }
    }
    // Don't clear selection - let user choose other actions if needed
  };



  const handleCreateStudyGuide = (text: string) => {
    if (onCreateStudyGuide) {
      onCreateStudyGuide(text);
    }
    // Don't clear selection - let user choose other actions if needed
  };

  const handleTestMe = (text: string) => {
    if (onTestMe) {
      onTestMe(text);
    }
    // Don't clear selection - let user choose other actions if needed
  };





  const handleHighlight = () => {
    highlightSelection();
    clearSelection();
  };

  const handleSelectAll = () => {
    const documentContent = document.querySelector('[data-document-content]');
    if (documentContent) {
      const range = document.createRange();
      range.selectNodeContents(documentContent);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Get the full document text
      const fullText = paperContent.sections.map((section: any) => 
        `${section.title}\n\n${section.content}`
      ).join('\n\n');
      
      // Check if text is large (over 1000 words) and needs chunking
      const wordCount = fullText.split(/\s+/).length;
      
      if (wordCount > 1000) {
        // Open chunking modal for large selections
        setShowChunkingModal(true);
        setSelectedTextForChunking(fullText);
      } else {
        // For smaller texts, use normal selection
        if (onTextSelectedForChat) {
          onTextSelectedForChat(fullText);
        }
      }
    }
  };

  // Function to convert raw text content to properly formatted HTML
  const processContentForMathMode = (content: string) => {
    try {
      if (!content || typeof content !== 'string') {
        return content || '';
      }
      
      // Convert plain text to HTML with proper formatting
      let processedContent = content
        // First, escape any existing HTML to prevent double processing
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        
        // Convert line breaks to proper paragraphs
        .split('\n\n')
        .map(paragraph => {
          if (!paragraph.trim()) return '';
          
          // Check if this is a heading and add appropriate ID for Ethics content
          if (paragraph.match(/^(\d+\.\d*\s)/)) {
            let headingId = '';
            const text = paragraph.trim();
            
            // Main concept mappings for Ethics content - all 16 sections
            if (text.includes('1.0') && text.includes('What is ethics')) headingId = 'section-1';
            else if (text.includes('2.0') && text.includes('Two kinds of goodness')) headingId = 'section-2';
            else if (text.includes('2.1') && text.includes('Instrumental and intrinsic goodness not mutually exclusive')) headingId = 'section-2-1';
            else if (text.includes('3.0') && text.includes('More meanings')) headingId = 'section-3';
            else if (text.includes('3.1') && text.includes('Two kinds of intrinsic badness')) headingId = 'section-3-1';
            else if (text.includes('4.0') && text.includes('morally complex structure')) headingId = 'section-4';
            else if (text.includes('5.0') && text.includes('non-privative character')) headingId = 'section-5';
            else if (text.includes('6.0') && text.includes('corollary')) headingId = 'section-6';
            else if (text.includes('6.1') && text.includes('moral obligation to outweigh')) headingId = 'section-6-1';
            else if (text.includes('6.2') && text.includes('right') && text.includes('good')) headingId = 'section-6-2';
            else if (text.includes('6.3') && text.includes('wrong') && text.includes('bad')) headingId = 'section-6-3';
            else if (text.includes('7.0') && text.includes('Ought') && text.includes('can')) headingId = 'section-7';
            else if (text.includes('8.0') && text.includes('Legality') && text.includes('morality')) headingId = 'section-8';
            else if (text.includes('9.0') && text.includes('moral status of passing judgment')) headingId = 'section-9';
            else if (text.includes('10.0') && text.includes('goodness of the act vs')) headingId = 'section-10';
            else if (text.includes('11.0') && text.includes('legal systems')) headingId = 'section-11';
            else if (text.includes('12.0') && text.includes('condemned even though')) headingId = 'section-12';
            else if (text.includes('13.0') && text.includes('act immorally towards oneself')) headingId = 'section-13';
            else if (text.includes('14.0') && text.includes('metaethical principles')) headingId = 'section-14';
            else if (text.includes('14.1') && text.includes('derive an') && text.includes('ought')) headingId = 'section-14-1';
            else if (text.includes('14.2') && text.includes('Moore') && text.includes('open question')) headingId = 'section-14-2';
            else if (text.includes('14.2.1') && text.includes('Commentary')) headingId = 'section-14-2-1';
            else if (text.includes('14.3') && text.includes('Ought') && text.includes('can')) headingId = 'section-14-3';
            else if (text.includes('14.4') && text.includes('Genetic questions')) headingId = 'section-14-4';
            else if (text.includes('14.5') && text.includes('use to which supposed moral truths')) headingId = 'section-14-5';
            else if (text.includes('14.6') && text.includes('implementation')) headingId = 'section-14-6';
            else if (text.includes('15.0') && text.includes('bad reasons to reject')) headingId = 'section-15';
            else if (text.includes('15.1') && text.includes('Discussion of (i)')) headingId = 'section-15-1';
            else if (text.includes('15.2') && text.includes('Discussion of (ii)')) headingId = 'section-15-2';
            else if (text.includes('15.3') && text.includes('Discussion of (iii)')) headingId = 'section-15-3';
            else if (text.includes('15.4') && text.includes('Discussion of (iv)')) headingId = 'section-15-4';
            else if (text.includes('16.0') && text.includes('What are ethical truths')) headingId = 'section-16';
            
            return `<h2 id="${headingId}" class="text-xl font-semibold mb-4 mt-8 text-slate-900 dark:text-slate-100">${text}</h2>`;
          }
          
          // Check if this is a subheading (shorter titles)
          if (paragraph.match(/^[A-Z][^.]{5,50}$/) && !paragraph.includes('|') && !paragraph.includes('=')) {
            return `<h3 class="text-lg font-medium mb-3 mt-6 text-foreground">${paragraph.trim()}</h3>`;
          }
          
          // Check if this is a code block (contains ASCII art or circuit diagrams)
          if (paragraph.includes('```') || paragraph.includes('---|') || paragraph.includes('|AND|') || paragraph.includes('|OR|') || paragraph.includes('|NOT|')) {
            return `<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-md my-4 overflow-x-auto text-sm font-mono text-slate-900 dark:text-slate-100">${paragraph.trim()}</pre>`;
          }
          
          // Check if this is a table (contains multiple | characters)
          if (paragraph.split('|').length > 4) {
            const lines = paragraph.trim().split('\n');
            const tableRows = lines.map(line => {
              if (line.includes('|')) {
                const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
                return `<tr>${cells.map(cell => `<td class="border border-slate-400 dark:border-slate-600 px-3 py-2 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">${cell}</td>`).join('')}</tr>`;
              }
              return '';
            }).filter(row => row);
            
            if (tableRows.length > 0) {
              return `<table class="border-collapse border border-slate-400 dark:border-slate-600 my-6 mx-auto bg-white dark:bg-slate-800 shadow-sm"><tbody>${tableRows.join('')}</tbody></table>`;
            }
          }
          
          // Regular paragraph with improved styling
          return `<p class="mb-4 leading-relaxed text-slate-800 dark:text-slate-200">${paragraph.trim()}</p>`;
        })
        .filter(p => p)
        .join('');
      
      if (!mathMode) {
        // Remove LaTeX notation when math mode is off
        return processedContent
          .replace(/\$\$([^$]+)\$\$/g, '$1') // Remove display math delimiters
          .replace(/\$([^$]+)\$/g, '$1') // Remove inline math delimiters
          .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)') // Convert sqrt notation
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)') // Convert fractions
          .replace(/\\text\{([^}]+)\}/g, '$1') // Remove text commands
          .replace(/\\mathbb\{([^}]+)\}/g, '$1') // Remove mathbb
          .replace(/\\forall/g, 'for all') // Convert universal quantifier
          .replace(/\\Rightarrow/g, 'implies') // Convert implication
          .replace(/\\ldots/g, '...') // Convert ellipsis
          .replace(/\\times/g, '×'); // Convert multiplication
      } else {
        // Process LaTeX notation for rendering
        let processed = processedContent;
        // Replace display math blocks
        processed = processed.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
          if (!match || !latex) return match || '';
          return renderMathString(latex, true);
        });
        // Replace inline math
        processed = processed.replace(/\$([^$]+)\$/g, (match, latex) => {
          if (!match || !latex) return match || '';
          return renderMathString(latex, false);
        });
        return processed;
      }
    } catch (error) {
      console.error('Error processing content for math mode:', error);
      return content || '';
    }
  };

  return (
    <div className="bg-card overflow-hidden relative">


      {/* Select All Button */}
      <div className="absolute top-16 right-6 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          className="bg-white/90 hover:bg-white border border-gray-300 shadow-sm text-xs px-2 py-1 h-7"
        >
          <Copy className="w-3 h-3 mr-1" />
          Select All
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-160px)]">
        <div className="p-8 w-full max-w-6xl mx-auto" data-document-content>
          <article className="prose prose-xl max-w-none text-slate-900 dark:text-slate-100 w-full leading-relaxed select-text">
            {/* Document Title */}
            <header className="text-center mb-12">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {paperContent.title}
              </h1>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300 text-center">
                by {paperContent.author}
              </p>
            </header>

            {/* Full Document Content - No Paywall */}
            {paperContent.sections.map((section: any, index: number) => (
              <section key={section.id} id={section.id} className="mb-12">
                <div 
                  className={`text-slate-800 dark:text-slate-200 leading-relaxed prose prose-lg max-w-none ${mathMode ? 'document-math-content' : 'document-text-content'}`}
                  dangerouslySetInnerHTML={{ 
                    __html: processContentForMathMode(section.content) 
                  }}
                />
              </section>
            ))}
          </article>
        </div>
      </ScrollArea>
      
      {/* Selection Toolbar */}
      {selection && isSelecting && (
        <SelectionToolbar
          selectedText={selection.text}
          onAskQuestion={handleAskQuestion}
          onSendToChat={handleSendToChat}
          onRewrite={handleRewrite}
          onCreateStudyGuide={handleCreateStudyGuide}
          onTestMe={handleTestMe}
          onCreatePodcast={onCreatePodcast}
          onHighlight={handleHighlight}
          onClear={clearSelection}
        />
      )}

      {/* Chunking Modal */}
      <ChunkingModal
        isOpen={showChunkingModal}
        onClose={() => setShowChunkingModal(false)}
        text={selectedTextForChunking}
        onChunkAction={(chunk: string, chunkIndex: number, action: 'quiz' | 'chat' | 'rewrite' | 'study-guide' | 'student-test') => {
          if (action === 'chat' && onTextSelectedForChat) {
            onTextSelectedForChat(chunk);
          } else if (action === 'rewrite' && onRewriteFromSelection) {
            onRewriteFromSelection(chunk);
          }
        }}
      />
      

    </div>
  );
}