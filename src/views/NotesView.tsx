import React, { useState } from 'react';
import {
  StickyNote,
  Plus,
  Pin,
  Trash2,
  Edit3,
  Search,
  X,
  Check,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Note } from '../types';

const colorOptions = [
  { id: 'amber', name: 'হলুদ (Amber)', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-400' },
  { id: 'emerald', name: 'সবুজ (Emerald)', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-400' },
  { id: 'sky', name: 'আকাশি (Sky)', bg: 'bg-sky-50 dark:bg-sky-950/40', border: 'border-sky-200 dark:border-sky-800', dot: 'bg-sky-400' },
  { id: 'indigo', name: 'নীল (Indigo)', bg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-200 dark:border-indigo-800', dot: 'bg-indigo-400' },
  { id: 'rose', name: 'গোলাপি (Rose)', bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-400' },
  { id: 'slate', name: 'ধূসর (Slate)', bg: 'bg-slate-50 dark:bg-slate-800/80', border: 'border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' },
];

export const NotesView: React.FC = () => {
  const { notesList, addNote, updateNote, deleteNote, togglePinNote } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // New Note state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('emerald');
  const [category, setCategory] = useState('সাধারণ');
  const [isPinned, setIsPinned] = useState(false);
  const [isExpandingNew, setIsExpandingNew] = useState(false);

  const categories = Array.from(new Set(['সাধারণ', 'ইনভেন্টরি', 'অর্ডার', 'মার্কেটিং', 'টাস্ক', ...notesList.map((n) => n.category || 'সাধারণ')]));

  const filteredNotes = notesList.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      (n.category && n.category.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    addNote({
      title: title.trim() || 'শিরোনামহীন নোট',
      content: content.trim(),
      color,
      category,
      isPinned,
    });

    setTitle('');
    setContent('');
    setIsExpandingNew(false);
    setIsPinned(false);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    updateNote(editingNote);
    setEditingNote(null);
  };

  const getColorStyles = (colorKey: string) => {
    return colorOptions.find((c) => c.id === colorKey) || colorOptions[1];
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <StickyNote className="w-6 h-6 text-amber-500" />
            বিজনেস নোটস (Google Keep Style)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            দ্রুত গুরুত্বপূর্ণ টাস্ক, স্টক রিমাইন্ডার, ক্যাম্পেইন প্ল্যান বা মিটিং নোটস গুগল কিপের মতো পিন করে রাখুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">
            মোট নোটস: <strong className="text-amber-500 font-bold">{notesList.length} টি</strong>
          </span>
        </div>
      </div>

      {/* New Note Creator Input Box */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-4 transition-all">
        {!isExpandingNew ? (
          <div
            onClick={() => setIsExpandingNew(true)}
            className="flex items-center justify-between text-slate-400 text-xs font-medium cursor-pointer p-2 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <span>নতুন কোনো নোট লিখুন...</span>
            <Plus className="w-5 h-5 text-amber-500" />
          </div>
        ) : (
          <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <input
                type="text"
                placeholder="নোটের শিরোনাম লিখুন..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full font-bold text-sm bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isPinned ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isPinned ? 'পিন করা আছে' : 'পিন করুন'}
              >
                <Pin className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={3}
              placeholder="বিস্তারিত নোট ও মেসেজ লিখুন..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 resize-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Color & Category Selector */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setColor(opt.id)}
                      className={`w-5 h-5 rounded-full ${opt.dot} transition-transform cursor-pointer ${
                        color === opt.id ? 'scale-125 ring-2 ring-slate-800 dark:ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-transparent text-slate-700 dark:text-slate-300 font-medium text-xs focus:outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-white dark:bg-slate-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpandingNew(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  সেভ করুন
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="নোট খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            সব ক্যাটাগরি
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PINNED NOTES SECTION */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5" /> পিন করা গুরুত্বপূর্ণ নোটস ({pinnedNotes.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => {
              const cStyle = getColorStyles(note.color);
              return (
                <div
                  key={note.id}
                  className={`p-4 rounded-2xl border ${cStyle.border} ${cStyle.bg} shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative group`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">{note.title}</h4>
                      <button
                        onClick={() => togglePinNote(note.id)}
                        className="text-amber-500 hover:text-amber-600 cursor-pointer p-1"
                        title="পিন আনডু করুন"
                      >
                        <Pin className="w-4 h-4 fill-amber-500" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-white/60 dark:bg-slate-900/60 font-semibold border border-slate-200/50">
                      {note.category || 'সাধারণ'}
                    </span>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => setEditingNote(note)}
                        className="p-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                        title="ডিলিট করুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OTHER NOTES SECTION */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && (
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            অন্যান্য নোটস ({unpinnedNotes.length})
          </h3>
        )}

        {unpinnedNotes.length === 0 && pinnedNotes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
            <StickyNote className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-semibold">কোনো নোটস পাওয়া যায়নি। নতুন একটি তৈরি করুন!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpinnedNotes.map((note) => {
              const cStyle = getColorStyles(note.color);
              return (
                <div
                  key={note.id}
                  className={`p-4 rounded-2xl border ${cStyle.border} ${cStyle.bg} shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">{note.title}</h4>
                      <button
                        onClick={() => togglePinNote(note.id)}
                        className="text-slate-400 hover:text-amber-500 cursor-pointer p-1"
                        title="পিন করুন"
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-white/60 dark:bg-slate-900/60 font-semibold border border-slate-200/50">
                      {note.category || 'সাধারণ'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingNote(note)}
                        className="p-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                        title="ডিলিট করুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT NOTE MODAL */}
      {editingNote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" /> নোট সম্পাদনা
              </h3>
              <button onClick={() => setEditingNote(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">বিস্তারিত নোট</label>
                <textarea
                  rows={5}
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">কালার</label>
                  <select
                    value={editingNote.color}
                    onChange={(e) => setEditingNote({ ...editingNote, color: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200"
                  >
                    {colorOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={editingNote.category || ''}
                    onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
