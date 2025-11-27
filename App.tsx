import React, { useState, useCallback, useEffect } from 'react';
import { basicFormat, countSentences } from './services/formatterService';
import { smartFormatWithGemini } from './services/geminiService';
import { Button } from './components/Button';
import { TextArea } from './components/TextArea';
import { 
  Wand2, 
  ArrowRightLeft, 
  Trash2, 
  Copy, 
  Check, 
  Zap, 
  FileText 
} from 'lucide-react';

const App: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [autoFormat, setAutoFormat] = useState<boolean>(true);

  // Stats calculation
  const inputCount = input.length;
  // Calculate output paragraphs based on actual double newlines
  const outputParagraphs = output ? output.split(/\n\s*\n/).filter(line => line.trim().length > 0).length : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setInput(newVal);
    if (autoFormat) {
      setOutput(basicFormat(newVal));
    }
  };

  const handleBasicFormat = useCallback(() => {
    setIsProcessing(true);
    // Simulate tiny delay for UX feedback
    setTimeout(() => {
      setOutput(basicFormat(input));
      setIsProcessing(false);
    }, 200);
  }, [input]);

  const handleSmartFormat = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const result = await smartFormatWithGemini(input);
      setOutput(result);
    } catch (error) {
      alert("智能排版服务暂时不可用，请检查网络或API Key。");
      // Fallback to basic
      setOutput(basicFormat(input));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleClear = () => {
    if(window.confirm('确定要清空所有内容吗？')) {
      setInput('');
      setOutput('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <ArrowRightLeft className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Sentencify</h1>
            <p className="text-xs text-slate-500 font-medium">智能句号排版助手</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-2 bg-slate-100 rounded-full px-1 py-1 border border-slate-200">
              <button
                onClick={() => setAutoFormat(!autoFormat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  autoFormat ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                实时模式
              </button>
           </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-grow flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
        
        {/* Input Column */}
        <section className="flex-1 flex flex-col min-h-[300px]">
          <TextArea
            label="输入文本"
            placeholder="在此粘贴包含句号的文章..."
            value={input}
            onChange={handleInputChange}
            stats={`${inputCount} 字`}
            className="flex-grow"
          />
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Button 
              variant="secondary" 
              onClick={handleClear} 
              disabled={!input}
              icon={<Trash2 size={16} />}
            >
              清空
            </Button>
            
            <div className="flex-grow"></div>

            <Button 
              variant="secondary" 
              onClick={handleBasicFormat}
              disabled={!input || autoFormat} // Disabled if auto-format is on, as it's already done
              icon={<Zap size={16} className="text-yellow-500" />}
            >
              快速排版
            </Button>
            
            <Button 
              variant="primary" 
              onClick={handleSmartFormat}
              disabled={!input || isProcessing}
              isLoading={isProcessing}
              icon={<Wand2 size={16} />}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 border-none"
            >
              AI 智能精准排版
            </Button>
          </div>
        </section>

        {/* Divider for Mobile */}
        <div className="md:hidden h-px bg-slate-300 w-full my-2"></div>

        {/* Output Column */}
        <section className="flex-1 flex flex-col min-h-[300px]">
           <TextArea
            label="排版结果"
            placeholder="排版后的结果将显示在这里..."
            value={output}
            readOnly
            stats={output ? `${outputParagraphs} 个段落` : ''}
            className="flex-grow"
            style={{ backgroundColor: '#fafafa' }} // Slightly different bg to distinguish output
          />
          
          <div className="mt-4 flex justify-end">
            <Button 
              variant={copied ? "primary" : "secondary"} // Visual feedback
              onClick={handleCopy}
              disabled={!output}
              className={copied ? "bg-green-600 hover:bg-green-700 ring-green-500" : ""}
              icon={copied ? <Check size={16} /> : <Copy size={16} />}
            >
              {copied ? "已复制" : "复制结果"}
            </Button>
          </div>
        </section>

      </main>

      {/* Footer Info */}
      <footer className="px-6 py-3 text-center md:text-right text-xs text-slate-400 border-t border-slate-200 bg-slate-50">
        识别中文(。)与英文(.)句号 • 自动保护引号内容
      </footer>
    </div>
  );
};

export default App;