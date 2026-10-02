import { ChildProfile, SpeechAttemptResult, PracticeSession } from '../types/speech';

const STORAGE_KEY_CHILDREN = 'articulearn_children_v1';
const STORAGE_PREFIX_ATTEMPTS = 'articulearn_attempts_';
const STORAGE_PREFIX_SESSIONS = 'articulearn_sessions_';
const STORAGE_ACTIVE_CHILD = 'articulearn_active_child_id';

export class PrivacyStorageEngine {
  /**
   * Retrieve all child profiles
   */
  public static getChildren(): ChildProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CHILDREN);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Create a new child profile.
   * STRICT ENFORCEMENT: A new child starts with ZERO historical records, ZERO demo attempts.
   */
  public static createChild(name: string, age: number, avatarSeed: string = 'fox'): ChildProfile {
    const children = this.getChildren();
    const newId = `child_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const newChild: ChildProfile = {
      id: newId,
      name: name.trim(),
      age,
      avatarSeed,
      createdAt: new Date().toISOString()
    };

    children.push(newChild);
    localStorage.setItem(STORAGE_KEY_CHILDREN, JSON.stringify(children));
    
    // Explicitly guarantee an empty partition for the new child
    localStorage.setItem(`${STORAGE_PREFIX_ATTEMPTS}${newId}`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_PREFIX_SESSIONS}${newId}`, JSON.stringify([]));

    return newChild;
  }

  /**
   * Get active child ID
   */
  public static getActiveChildId(): string | null {
    return localStorage.getItem(STORAGE_ACTIVE_CHILD);
  }

  /**
   * Set active child ID
   */
  public static setActiveChildId(childId: string): void {
    localStorage.setItem(STORAGE_ACTIVE_CHILD, childId);
  }

  /**
   * Get historical attempts strictly scoped by childId
   */
  public static getAttempts(childId: string): SpeechAttemptResult[] {
    if (!childId) return [];
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX_ATTEMPTS}${childId}`);
      if (!raw) return [];
      const list: SpeechAttemptResult[] = JSON.parse(raw);
      // Ensure zero cross-child contamination
      return list.filter(item => item.childId === childId);
    } catch {
      return [];
    }
  }

  /**
   * Save a single speech attempt scoped strictly by childId
   */
  public static saveAttempt(attempt: SpeechAttemptResult): void {
    if (!attempt.childId) throw new Error('Attempt missing mandatory childId isolation tag.');
    const current = this.getAttempts(attempt.childId);
    current.push(attempt);
    localStorage.setItem(`${STORAGE_PREFIX_ATTEMPTS}${attempt.childId}`, JSON.stringify(current));
  }

  /**
   * Get practice sessions for child
   */
  public static getSessions(childId: string): PracticeSession[] {
    if (!childId) return [];
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX_SESSIONS}${childId}`);
      if (!raw) return [];
      const list: PracticeSession[] = JSON.parse(raw);
      return list.filter(s => s.childId === childId);
    } catch {
      return [];
    }
  }

  /**
   * Save practice session
   */
  public static saveSession(session: PracticeSession): void {
    const current = this.getSessions(session.childId);
    const existingIdx = current.findIndex(s => s.id === session.id);
    if (existingIdx >= 0) {
      current[existingIdx] = session;
    } else {
      current.push(session);
    }
    localStorage.setItem(`${STORAGE_PREFIX_SESSIONS}${session.childId}`, JSON.stringify(current));
  }

  /**
   * Delete all data for a specific child (Privacy GDPR compliance)
   */
  public static deleteChild(childId: string): void {
    let children = this.getChildren();
    children = children.filter(c => c.id !== childId);
    localStorage.setItem(STORAGE_KEY_CHILDREN, JSON.stringify(children));
    localStorage.removeItem(`${STORAGE_PREFIX_ATTEMPTS}${childId}`);
    localStorage.removeItem(`${STORAGE_PREFIX_SESSIONS}${childId}`);
    
    if (this.getActiveChildId() === childId) {
      localStorage.removeItem(STORAGE_ACTIVE_CHILD);
    }
  }

  /**
   * Export all data for child
   */
  public static exportChildData(childId: string): string {
    const children = this.getChildren();
    const child = children.find(c => c.id === childId);
    const attempts = this.getAttempts(childId);
    const sessions = this.getSessions(childId);

    return JSON.stringify({
      child,
      attempts,
      sessions,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
}
