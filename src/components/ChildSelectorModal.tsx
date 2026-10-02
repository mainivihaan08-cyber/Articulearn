import React, { useState } from 'react';
import { ChildProfile } from '../types/speech';
import { PrivacyStorageEngine } from '../engines/PrivacyStorageEngine';
import { X, UserPlus, Check, Trash2, ShieldCheck, Sparkles } from 'lucide-react';

interface ChildSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChild: ChildProfile | null;
  childrenList: ChildProfile[];
  onSelectChild: (child: ChildProfile) => void;
  onRefreshChildren: () => void;
}

export const ChildSelectorModal: React.FC<ChildSelectorModalProps> = ({
  isOpen,
  onClose,
  activeChild,
  childrenList,
  onSelectChild,
  onRefreshChildren
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState(5);
  const [avatarSeed, setAvatarSeed] = useState('owl');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Creates new child with 100% empty partitions (Child Isolation guarantee)
    const newChild = PrivacyStorageEngine.createChild(name.trim(), age, avatarSeed);
    onRefreshChildren();
    onSelectChild(newChild);
    setName('');
    setAge(5);
    setIsCreating(false);
    onClose();
  };

  const handleDelete = (childId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this child profile and all associated speech attempts? This action is permanent and compliant with privacy retention rules.')) {
      PrivacyStorageEngine.deleteChild(childId);
      onRefreshChildren();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-child">Child Profiles</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Strict data isolation per child
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCreating ? (
          <form onSubmit={handleCreate} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Child's Name or Nickname</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Leo, Maya, Sam"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50"
                autoFocus
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  min={3}
                  max={14}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar Character</label>
                <select
                  value={avatarSeed}
                  onChange={(e) => setAvatarSeed(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50"
                >
                  <option value="owl">🦉 Wise Owl</option>
                  <option value="fox">🦊 Cheerful Fox</option>
                  <option value="rabbit">🐰 Fluffy Rabbit</option>
                  <option value="bear">🐻 Friendly Bear</option>
                  <option value="tiger">🐯 Roaring Tiger</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-800">
              <span className="font-semibold">Privacy Note:</span> New child profiles start with completely zero historical data, zero practice attempts, and zero test leakage.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs"
              >
                Create Profile
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {childrenList.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">No child profiles yet</p>
                  <p className="text-xs text-slate-400 mt-1">Create a profile to start tracking speech progress cleanly.</p>
                </div>
              ) : (
                childrenList.map((child) => {
                  const isSelected = activeChild?.id === child.id;
                  return (
                    <div
                      key={child.id}
                      onClick={() => {
                        onSelectChild(child);
                        onClose();
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-base font-child">
                          {child.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 font-child flex items-center gap-2">
                            {child.name}
                            {isSelected && (
                              <span className="text-[11px] font-sans font-medium text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Check className="w-3 h-3" /> Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {child.age} years old · Created {new Date(child.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDelete(child.id, e)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Child Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add New Child
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
