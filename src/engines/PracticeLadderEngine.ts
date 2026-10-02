import { PracticeLadderStage, TargetWord, ChildPhonemeProfile } from '../types/speech';
import { TARGET_WORDS_CATALOG } from './PhonemeDictionary';

export interface LadderStageInfo {
  stage: PracticeLadderStage;
  title: string;
  description: string;
  example: string;
  icon: string;
}

export const LADDER_STAGES: LadderStageInfo[] = [
  {
    stage: 1,
    title: 'Stage 1: Isolated Sound',
    description: 'Practice the single target sound in isolation with articulatory cues.',
    example: '/r/ (Like a gentle tiger roar)',
    icon: 'Sparkles'
  },
  {
    stage: 2,
    title: 'Stage 2: Syllable Blends',
    description: 'Combine the sound with vowels into simple syllables.',
    example: 'ra · ree · roo · ray',
    icon: 'Layers'
  },
  {
    stage: 3,
    title: 'Stage 3: Single Word',
    description: 'Produce the sound in a single meaningful target word.',
    example: 'rabbit',
    icon: 'Type'
  },
  {
    stage: 4,
    title: 'Stage 4: Word Pairs & Sets',
    description: 'Practice multiple words with the target in sequence.',
    example: 'rabbit · rocket · rain',
    icon: 'Boxes'
  },
  {
    stage: 5,
    title: 'Stage 5: Short Phrase',
    description: 'Combine target words into natural 2-3 word phrases.',
    example: 'red rabbit',
    icon: 'MessageSquare'
  },
  {
    stage: 6,
    title: 'Stage 6: Complete Sentence',
    description: 'Express the sound in a fluent, structured sentence.',
    example: 'The red rabbit runs in the grass.',
    icon: 'AlignLeft'
  },
  {
    stage: 7,
    title: 'Stage 7: Story Reading',
    description: 'Read a short passage featuring natural sound occurrences.',
    example: 'A soft rabbit found a sweet red carrot near the river.',
    icon: 'BookOpen'
  },
  {
    stage: 8,
    title: 'Stage 8: Natural Conversation',
    description: 'Use the sound naturally in spontaneous dialogue.',
    example: 'Tell me about your favorite animal!',
    icon: 'MessagesSquare'
  }
];

export class PracticeLadderEngine {
  /**
   * Determine the recommended next practice target dynamically based on the child's observed phoneme profile
   */
  public static selectAdaptiveTarget(
    targetPhoneme: string,
    profile?: ChildPhonemeProfile,
    currentStage: PracticeLadderStage = 3
  ): { target: TargetWord; stage: PracticeLadderStage } {
    const candidates = TARGET_WORDS_CATALOG.filter(w => w.targetPhoneme === targetPhoneme && !w.isUnseenProbe);

    if (candidates.length === 0) {
      return {
        target: TARGET_WORDS_CATALOG[0],
        stage: currentStage
      };
    }

    // If profile indicates initial position is weakest, prioritize initial words
    if (profile && profile.validAttempts >= 2) {
      if (profile.initialAccuracy < profile.medialAccuracy && profile.initialAccuracy < profile.finalAccuracy) {
        const initialTargets = candidates.filter(w => w.targetPosition === 'initial');
        if (initialTargets.length > 0) {
          return { target: initialTargets[0], stage: currentStage };
        }
      }
    }

    return {
      target: candidates[0],
      stage: currentStage
    };
  }

  /**
   * Check if child is ready to advance up the ladder
   */
  public static canAdvanceLadder(stage: PracticeLadderStage, recentSuccessRate: number, attemptCount: number): boolean {
    if (stage >= 8) return false;
    return recentSuccessRate >= 75 && attemptCount >= 3;
  }
}
