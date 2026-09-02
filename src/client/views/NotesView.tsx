import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Edit2,
  X,
  Search,
  Copy,
  Check,
  Tag,
  Palette,
  CheckSquare,
  Square,
  Sparkles,
  Calendar,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Note } from '../../types';

const CATEGORIES = [
  'সকল নোটস',
  'সাধারণ',
  'জরুরী',
  'ইনভেন্টরি',
  'মার্কেটিং',
  'কাস্টমার ফলোআপ',
  'সাপ্লায়ার',
  'আইডিয়া',
];

const COLOR_OPTIONS: { id: string; name: string; bgClass: string; borderClass: string; badgeClass: string }[] = [
  {
    id: 'emerald',
    name: 'সবুজ (Emerald)',
    bgClass: 'bg-emerald-50/60 dark:bg-emerald-950/30',
    borderClass: 'border-emerald-300 dark:border-emerald-800/80',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
  },
  {
    id: 'amber',
    name: 'হলুদ (Amber)',
    bgClass: 'bg-amber-50/60 dark:bg-amber-950/30',
    borderClass: 'border-amber-300 dark:border-amber-800/80',
    badgeClass: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
  },
  {
    id: 'teal',
    name: 'টিল (Teal)',
    bgClass: 'bg-teal-50/60 dark:bg-teal-950/30',
    borderClass: 'border-teal-300 dark:border-teal-800/80',
    badgeClass: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300',
  },
  {
    id: 'indigo',
    name: 'নীল (Indigo)',
    bgClass: 'bg-indigo-50/60 dark:bg-indigo-950/30',
    borderClass: 'border-indigo-300 dark:border-indigo-800/80',
    badgeClass: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300',
  },
  {
    id: 'rose',
    name: 'গোলাপী (Rose)',
    bgClass: 'bg-rose-50/60 dark:bg-rose-950/30',
    borderClass: 'border-rose-300 dark:border-rose-800/80',
    badgeClass: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300',
  },
  {
    id: 'slate',
    name: 'ধূসর (Slate)',
    bgClass: 'bg-slate-50 dark:bg-slate-900',
    borderClass: 'border-slate-200 dark:border-slate-800',
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  },
];

export const NotesView: React.FC = () => {
  const { notesList, addNote, updateNote, deleteNote, togglePinNote } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সকল নোটস');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Copy Feedback Toast State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('সাধারণ');
  const [color, setColor] = useState('teal');
  const [isPinned, setIsPinned] = useState(false);

  const openAdd = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory('সাধারণ');
    setColor('teal');
    setIsPinned(false);
    setIsModalOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category || 'সাধারণ');
    setColor(note.color || 'teal');
    setIsPinned(note.isPinned || false);
    setIsModalOpen(true);
  };

  const handleCopy = (note: Note) => {
    const text = `${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(text);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date().toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (editingNote) {
      updateNote({
        ...editingNote,
        title: title.trim(),
        content: content.trim(),
        category,
        color,
        isPinned,
        updatedAt: now,
      });
    } else {
      addNote({
        title: title.trim(),
        content: content.trim(),
        category,
        color,
        isPinned,
        createdAt: now,
        updatedAt: now,
      });
    }
    setIsModalOpen(false);
  };

  // Filter logic
  const filteredNotes = notesList.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.category && n.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory =
      selectedCategory === 'সকল নোটস' || n.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  // Sort pinned notes to the top
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const pinnedCount = notesList.filter((n) => n.isPinned).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-teal-600" />
            ব্যবসার গুরুত্বপূর্ণ নোটস ও খসড়া
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মোট নোটস: <strong className="text-teal-600">{notesList.length}</strong> টি | পিন করা: <strong className="text-amber-600">{pinnedCount}</strong> টি
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন নোট তৈরি করুন</span>
        </button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নোট বা ট্যাগ দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto stroke-1" />
          <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-sm">কোনো নোট পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            আপনার প্রয়োজনীয় যেকোনো তথ্য, অর্ডারের খসড়া বা ইনভেন্টরির পরিকল্পনা যোগ করতে "নতুন নোট তৈরি করুন" বাটনে ক্লিক করুন।
          </p>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
          >
            নতুন নোট তৈরি
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedNotes.map((note) => {
            const theme =
              COLOR_OPTIONS.find((c) => c.id === note.color) || COLOR_OPTIONS[2];

            return (
              <div
                key={note.id}
                className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between space-y-4 relative transition-all duration-200 hover:shadow-md ${
                  note.isPinned ? 'ring-2 ring-amber-400/80 shadow-amber-500/10' : ''
                } ${theme.bgClass} ${theme.borderClass}`}
              >
                <div className="space-y-2.5">
                  {/* Card Top Meta */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${theme.badgeClass}`}>
                      {note.category || 'সাধারণ'}
                    </span>

                    <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs px-1.5 py-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                      <button
                        onClick={() => togglePinNote(note.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          note.isPinned ? 'text-amber-600 dark:text-amber-400 fill-amber-500' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={note.isPinned ? 'পিন আনডু করুন' : 'উপরে পিন করুন'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleCopy(note)}
                        className="p-1 rounded-lg text-slate-400 hover:text-teal-600 transition-colors cursor-pointer relative"
                        title="কপি করুন"
                      >
                        {copiedId === note.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => openEdit(note)}
                        className="p-1 rounded-lg text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
                        title="সম্পাদনা"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="ডিলিট"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                    {note.title}
                  </h3>

                  {/* Content Body */}
                  <p className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>

                {/* Footer Timestamp */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-teal-600" />
                    {note.updatedAt || note.createdAt}
                  </span>
                  {note.isPinned && (
                    <span className="text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-current" /> পিন করা
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                {editingNote ? 'নোট তথ্য সম্পাদনা' : 'নতুন ব্যবসার নোট তৈরি'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">নোট শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: আগামী সপ্তাহের স্টক অর্ডার লিস্ট"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold"
                  >
                    {CATEGORIES.filter((c) => c !== 'সকল নোটস').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">কালার থিম</label>
                  <div className="flex items-center gap-2 pt-1">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setColor(c.id)}
                        className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                          color === c.id ? 'border-teal-600 scale-110 shadow-md' : 'border-transparent opacity-70'
                        } ${c.badgeClass}`}
                        title={c.name}
                      >
                        {color === c.id && <Check className="w-3.5 h-3.5 text-teal-800 dark:text-teal-200 font-bold" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">নোটের বিষয়বস্তু & বিস্তারিত *</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!content) {
                        setContent('১. \n২. \n৩. ');
                      } else {
                        setContent(content + '\n• ');
                      }
                    }}
                    className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>লিস্ট বুলেট যোগ করুন</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="নোটের সকল বিস্তারিত তথ্য এখানে লিখুন..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white leading-relaxed font-sans"
                />
              </div>

              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-800/60">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded-md cursor-pointer"
                />
                <label htmlFor="pinCheck" className="text-xs font-bold text-amber-900 dark:text-amber-300 cursor-pointer flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  এই নোটটি ড্যাশবোর্ড ও পেজের একদম শুরুতে পিন করে রাখুন
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
