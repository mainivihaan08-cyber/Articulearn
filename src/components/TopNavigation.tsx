import React from 'react';
import { ChildProfile } from '../types/speech';
import { Volume2, UserPlus, Users, Sparkles } from 'lucide-react';

export type AppTab = 'child_studio' | 'reading_studio' | 'conversation' | 'parent_portal' | 'specialist_lab' | 'test_suite';

interface TopNavigationProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  activeChild: ChildProfile | null;
  childrenList: ChildProfile[];
  onOpenChildModal: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentTab,
  onSelectTab,
  activeChild,
  onOpenChildModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSelectTab('child_studio')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-teal-600 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm group-hover:bg-teal-700 transition-colors">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-child">ArticuLearn</span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2 font-normal">Speech & Pronunciation</span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => onSelectTab('child_studio')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              currentTab === 'child_studio'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Practice Studio
          </button>
          
          <button
            onClick={() => onSelectTab('reading_studio')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              currentTab === 'reading_studio'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reading Mode
          </button>

          <button
            onClick={() => onSelectTab('conversation')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              currentTab === 'conversation'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conversation
          </button>

          <button
            onClick={() => onSelectTab('parent_portal')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              currentTab === 'parent_portal'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Parent Progress
          </button>

          <button
            onClick={() => onSelectTab('specialist_lab')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              currentTab === 'specialist_lab'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Specialist Diagnostics
          </button>

          <button
            onClick={() => onSelectTab('test_suite')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              currentTab === 'test_suite'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Engine Test Suite
          </button>
        </nav>

        {/* Zone 3: Active Child Action */}
        <div className="flex items-center gap-2">
          {activeChild ? (
            <button
              onClick={onOpenChildModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs"
              title="Switch Child Profile"
            >
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold font-child">
                {activeChild.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 leading-none">{activeChild.name}</div>
                <div className="text-[10px] text-slate-500">{activeChild.age} years old</div>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenChildModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Select Child</span>
            </button>
          )}

          <button
            onClick={onOpenChildModal}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors md:hidden"
            aria-label="Manage Profiles"
          >
            <Users className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Mobile Nav strip */}
      <div className="md:hidden flex overflow-x-auto py-2 px-4 gap-1.5 bg-slate-50 border-t border-slate-200/80 text-xs no-scrollbar">
        <button
          onClick={() => onSelectTab('child_studio')}
          className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${currentTab === 'child_studio' ? 'bg-teal-600 text-white' : 'text-slate-600'}`}
        >
          Practice
        </button>
        <button
          onClick={() => onSelectTab('reading_studio')}
          className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${currentTab === 'reading_studio' ? 'bg-teal-600 text-white' : 'text-slate-600'}`}
        >
          Reading
        </button>
        <button
          onClick={() => onSelectTab('conversation')}
          className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${currentTab === 'conversation' ? 'bg-teal-600 text-white' : 'text-slate-600'}`}
        >
          Conversation
        </button>
        <button
          onClick={() => onSelectTab('parent_portal')}
          className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${currentTab === 'parent_portal' ? 'bg-teal-600 text-white' : 'text-slate-600'}`}
        >
          Parent
        </button>
        <button
          onClick={() => onSelectTab('specialist_lab')}
          className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${currentTab === 'specialist_lab' ? 'bg-teal-600 text-white' : 'text-slate-600'}`}
        >
          Specialist
        </button>
        <button
          onClick={() => onSelectTab('test_suite')}
          className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${currentTab === 'test_suite' ? 'bg-teal-600 text-white' : 'text-slate-600'}`}
        >
          Test Suite
        </button>
      </div>
    </header>
  );
};
