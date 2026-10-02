import React, { useState, useEffect } from 'react';
import { ChildProfile } from './types/speech';
import { PrivacyStorageEngine } from './engines/PrivacyStorageEngine';
import { TopNavigation, AppTab } from './components/TopNavigation';
import { ChildSelectorModal } from './components/ChildSelectorModal';
import { ChildStudio } from './components/child_studio/ChildStudio';
import { ReadingStudio } from './components/reading_mode/ReadingStudio';
import { ConversationStudio } from './components/conversation_mode/ConversationStudio';
import { ParentDashboard } from './components/parent_dashboard/ParentDashboard';
import { TherapistDashboard } from './components/specialist_dashboard/TherapistDashboard';
import { DiagnosticTestLab } from './components/test_lab/DiagnosticTestLab';

export function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('child_studio');
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);

  // Load existing children
  const loadChildren = () => {
    const list = PrivacyStorageEngine.getChildren();
    setChildrenList(list);

    const activeId = PrivacyStorageEngine.getActiveChildId();
    if (activeId) {
      const found = list.find(c => c.id === activeId);
      if (found) {
        setActiveChild(found);
        return;
      }
    }

    if (list.length > 0) {
      setActiveChild(list[0]);
      PrivacyStorageEngine.setActiveChildId(list[0].id);
    } else {
      // If none, prompt creation modal
      setIsChildModalOpen(true);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const handleSelectChild = (child: ChildProfile) => {
    setActiveChild(child);
    PrivacyStorageEngine.setActiveChildId(child.id);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* 3-Zone Top Navigation Contract */}
      <TopNavigation
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        activeChild={activeChild}
        childrenList={childrenList}
        onOpenChildModal={() => setIsChildModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'child_studio' && (
          <ChildStudio
            activeChild={activeChild}
            onOpenChildModal={() => setIsChildModalOpen(true)}
          />
        )}

        {currentTab === 'reading_studio' && (
          <ReadingStudio
            activeChild={activeChild}
            onOpenChildModal={() => setIsChildModalOpen(true)}
          />
        )}

        {currentTab === 'conversation' && (
          <ConversationStudio
            activeChild={activeChild}
            onOpenChildModal={() => setIsChildModalOpen(true)}
          />
        )}

        {currentTab === 'parent_portal' && (
          <ParentDashboard
            activeChild={activeChild}
            onOpenChildModal={() => setIsChildModalOpen(true)}
          />
        )}

        {currentTab === 'specialist_lab' && (
          <TherapistDashboard
            activeChild={activeChild}
            onOpenChildModal={() => setIsChildModalOpen(true)}
          />
        )}

        {currentTab === 'test_suite' && (
          <DiagnosticTestLab />
        )}
      </main>

      {/* Child Isolation Profile Selector Modal */}
      <ChildSelectorModal
        isOpen={isChildModalOpen}
        onClose={() => setIsChildModalOpen(false)}
        activeChild={activeChild}
        childrenList={childrenList}
        onSelectChild={handleSelectChild}
        onRefreshChildren={loadChildren}
      />

      {/* Clean, Non-Technical Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ArticuLearn Educational Speech Platform</span>
          <span className="text-slate-400">Child Speech Clarity & Pronunciation Practice Assistant</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
