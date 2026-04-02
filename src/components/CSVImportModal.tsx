import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Category } from '../types';
import { parseCSV, generateCSVTemplate } from '../utils/csvParser';

interface CSVImportModalProps {
  open: boolean;
  onImport: (categories: Category[]) => void;
  onClose: () => void;
}

export default function CSVImportModal({ open, onImport, onClose }: CSVImportModalProps) {
  const [csvText, setCsvText] = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof parseCSV> | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParse = (text: string) => {
    setCsvText(text);
    if (text.trim()) {
      setPreview(parseCSV(text));
    } else {
      setPreview(null);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      handleParse(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'text/plain')) {
      handleFileUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const handleImport = () => {
    if (!preview || preview.categories.length === 0) return;
    onImport(preview.categories);
    setCsvText('');
    setPreview(null);
    onClose();
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([generateCSVTemplate()], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jeopardy_questions_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setCsvText('');
    setPreview(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-[#0a0a3a] border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-xl font-bold">Import Questions from CSV</h3>
                <p className="text-white/40 text-sm mt-1">
                  Format: Category, Points, Question, Choice A, Choice B, Choice C, Choice D, Correct (A/B/C/D)
                </p>
              </div>
              <button onClick={handleClose} className="text-white/40 hover:text-white text-2xl cursor-pointer">&times;</button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
              {/* Upload area */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                  dragOver ? 'border-jeopardy-gold bg-jeopardy-gold/10' : 'border-white/20 hover:border-white/40'
                }`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-3xl mb-2 opacity-40">&#x1F4C4;</div>
                <p className="text-white/60">Drag & drop a CSV file here, or click to browse</p>
                <p className="text-white/30 text-sm mt-1">Accepts .csv and .txt files</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>

              {/* Or paste */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white/50 text-sm">Or paste CSV text directly:</label>
                  <button
                    onClick={handleDownloadTemplate}
                    className="text-jeopardy-gold hover:text-yellow-400 text-sm cursor-pointer underline"
                  >
                    Download template CSV
                  </button>
                </div>
                <textarea
                  value={csvText}
                  onChange={e => handleParse(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm font-mono resize-none h-32 focus:outline-none focus:border-jeopardy-gold"
                  placeholder={`Category,Points,Question,Choice A,Choice B,Choice C,Choice D,Correct\nScience,200,What planet is the Red Planet?,Venus,Mars,Jupiter,Saturn,B`}
                />
              </div>

              {/* Preview */}
              {preview && (
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-400">{preview.validRows} valid questions</span>
                    <span className="text-white/40">{preview.categories.length} categories</span>
                    {preview.errors.length > 0 && (
                      <span className="text-red-400">{preview.errors.length} errors</span>
                    )}
                  </div>

                  {/* Errors */}
                  {preview.errors.length > 0 && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 max-h-32 overflow-y-auto">
                      {preview.errors.map((err, i) => (
                        <p key={i} className="text-red-300 text-sm">{err}</p>
                      ))}
                    </div>
                  )}

                  {/* Category preview */}
                  {preview.categories.map(cat => (
                    <div key={cat.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-white/5 font-bold text-sm flex items-center justify-between">
                        <span>{cat.name}</span>
                        <span className="text-white/40 text-xs">{cat.questions.length} questions</span>
                      </div>
                      <div className="divide-y divide-white/5">
                        {cat.questions.map(q => (
                          <div key={q.id} className="px-4 py-2 text-sm flex items-center gap-3">
                            <span className="text-jeopardy-gold font-bold w-14 shrink-0">${q.pointValue}</span>
                            <span className="flex-1 truncate text-white/80">{q.questionText}</span>
                            <span className="text-green-400 text-xs shrink-0">
                              {['A', 'B', 'C', 'D'][q.correctChoice]}: {q.answer}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 shrink-0">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!preview || preview.categories.length === 0}
                className="px-5 py-2.5 rounded-lg bg-jeopardy-gold text-black font-bold hover:bg-yellow-400 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Import {preview ? `${preview.validRows} Questions` : ''}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
