import { 
  SpeechAttemptResult, 
  ChildPhonemeProfile, 
  ChildWordProfile, 
  RecurringPattern, 
  MasteryState, 
  SoundPosition 
} from '../types/speech';

export class EvidencePatternEngine {
  /**
   * Recompute child phoneme profile from all historical valid attempts
   */
  public static updatePhonemeProfile(
    phoneme: string,
    history: SpeechAttemptResult[]
  ): ChildPhonemeProfile {
    const attempts = history.filter(a => a.target.targetPhoneme === phoneme);
    const totalAttempts = attempts.length;
    const validAttempts = attempts.filter(a => a.isValidAttempt && a.audioQuality.classification !== 'INVALID');

    if (validAttempts.length === 0) {
      return {
        phoneme,
        totalAttempts,
        validAttempts: 0,
        successfulAttempts: 0,
        possibleErrors: 0,
        likelyErrors: 0,
        initialAccuracy: 0,
        medialAccuracy: 0,
        finalAccuracy: 0,
        practiceAccuracy: 0,
        readingAccuracy: 0,
        naturalSpeechAccuracy: 0,
        recentAccuracy: 0,
        trend: 'insufficient_data',
        patternConfidence: 0,
        masteryState: 'INSUFFICIENT_DATA',
        updatedAt: new Date().toISOString()
      };
    }

    const successfulAttempts = validAttempts.filter(a => {
      const targetRes = a.phonemeResults.find(p => p.phoneme === phoneme);
      return targetRes && (targetRes.assessment === 'CORRECT' || targetRes.assessment === 'LIKELY_CORRECT');
    }).length;

    const possibleErrors = validAttempts.filter(a => {
      const targetRes = a.phonemeResults.find(p => p.phoneme === phoneme);
      return targetRes && targetRes.assessment === 'POSSIBLE_ERROR';
    }).length;

    const likelyErrors = validAttempts.filter(a => {
      const targetRes = a.phonemeResults.find(p => p.phoneme === phoneme);
      return targetRes && targetRes.assessment === 'LIKELY_ERROR';
    }).length;

    // Position-specific accuracy calculations
    const getPosAccuracy = (pos: SoundPosition): number => {
      const posAttempts = validAttempts.filter(a => a.target.targetPosition === pos);
      if (posAttempts.length === 0) return 0;
      const success = posAttempts.filter(a => {
        const targetRes = a.phonemeResults.find(p => p.phoneme === phoneme);
        return targetRes && (targetRes.assessment === 'CORRECT' || targetRes.assessment === 'LIKELY_CORRECT');
      }).length;
      return Math.round((success / posAttempts.length) * 100);
    };

    const initialAccuracy = getPosAccuracy('initial');
    const medialAccuracy = getPosAccuracy('medial');
    const finalAccuracy = getPosAccuracy('final');

    // Context-specific accuracy
    const practiceAttempts = validAttempts.filter(a => a.activityType === 'PRACTICE');
    const readingAttempts = validAttempts.filter(a => a.activityType === 'READING');
    const speechAttempts = validAttempts.filter(a => a.activityType === 'CONVERSATION' || a.activityType === 'SPEECH');

    const calcSubsetAcc = (list: SpeechAttemptResult[]) => {
      if (list.length === 0) return 0;
      const succ = list.filter(a => {
        const targetRes = a.phonemeResults.find(p => p.phoneme === phoneme);
        return targetRes && (targetRes.assessment === 'CORRECT' || targetRes.assessment === 'LIKELY_CORRECT');
      }).length;
      return Math.round((succ / list.length) * 100);
    };

    const practiceAccuracy = calcSubsetAcc(practiceAttempts);
    const readingAccuracy = calcSubsetAcc(readingAttempts);
    const naturalSpeechAccuracy = calcSubsetAcc(speechAttempts);

    // Recent Accuracy (Weighted last 5 attempts)
    const recent = validAttempts.slice(-5);
    let weightedSum = 0;
    let weightTotal = 0;
    recent.forEach((a, idx) => {
      const w = idx + 1; // 1, 2, 3, 4, 5
      const targetRes = a.phonemeResults.find(p => p.phoneme === phoneme);
      const isSuccess = targetRes && (targetRes.assessment === 'CORRECT' || targetRes.assessment === 'LIKELY_CORRECT') ? 1 : 0;
      weightedSum += isSuccess * w;
      weightTotal += w;
    });
    const recentAccuracy = weightTotal > 0 ? Math.round((weightedSum / weightTotal) * 100) : 0;

    // Trend determination
    let trend: 'improving' | 'stable' | 'needs_practice' | 'insufficient_data' = 'insufficient_data';
    if (validAttempts.length >= 3) {
      const overallAcc = Math.round((successfulAttempts / validAttempts.length) * 100);
      if (recentAccuracy >= overallAcc + 15) {
        trend = 'improving';
      } else if (recentAccuracy <= 40) {
        trend = 'needs_practice';
      } else {
        trend = 'stable';
      }
    }

    // Pattern Confidence Calculation based on volume and diversity of words
    const uniqueWords = new Set(validAttempts.map(a => a.target.word)).size;
    let patternConfidence = 0.2;
    if (validAttempts.length >= 2) patternConfidence += 0.2;
    if (validAttempts.length >= 5) patternConfidence += 0.25;
    if (uniqueWords >= 3) patternConfidence += 0.2;
    if (validAttempts.some(a => a.target.isUnseenProbe)) patternConfidence += 0.15;
    patternConfidence = Math.min(0.99, Number(patternConfidence.toFixed(2)));

    // Mastery State Engine
    let masteryState: MasteryState = 'LEARNING';
    const totalValid = validAttempts.length;

    if (totalValid < 2) {
      masteryState = 'INSUFFICIENT_DATA';
    } else if (recentAccuracy >= 85 && totalValid >= 6 && uniqueWords >= 3) {
      // Check generalization evidence (e.g. phrases/unseen probes)
      const hasGeneralizationEvidence = validAttempts.some(a => a.target.isUnseenProbe || a.ladderStage >= 5);
      if (hasGeneralizationEvidence && recentAccuracy >= 90) {
        masteryState = 'MASTERED';
      } else {
        masteryState = 'ALMOST_MASTERED';
      }
    } else if (recentAccuracy >= 65 && totalValid >= 4) {
      masteryState = 'IMPROVING';
    } else if (recentAccuracy < 45 && totalValid >= 3) {
      masteryState = 'NEEDS_REVIEW';
    } else {
      masteryState = 'PRACTICING';
    }

    return {
      phoneme,
      totalAttempts,
      validAttempts: validAttempts.length,
      successfulAttempts,
      possibleErrors,
      likelyErrors,
      initialAccuracy,
      medialAccuracy,
      finalAccuracy,
      practiceAccuracy,
      readingAccuracy,
      naturalSpeechAccuracy,
      recentAccuracy,
      trend,
      patternConfidence,
      masteryState,
      lastAttemptDate: attempts[attempts.length - 1]?.timestamp,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Detect recurring phonological patterns across multiple attempts & words
   */
  public static detectRecurringPatterns(
    history: SpeechAttemptResult[]
  ): RecurringPattern[] {
    const patterns: RecurringPattern[] = [];
    const validAttempts = history.filter(a => a.isValidAttempt && a.audioQuality.classification !== 'INVALID');

    // Group by phoneme + position
    const groupKey = (phoneme: string, pos: SoundPosition) => `${phoneme}_${pos}`;
    const grouped: Record<string, SpeechAttemptResult[]> = {};

    validAttempts.forEach(a => {
      const k = groupKey(a.target.targetPhoneme, a.target.targetPosition);
      if (!grouped[k]) grouped[k] = [];
      grouped[k].push(a);
    });

    Object.entries(grouped).forEach(([key, items]) => {
      const [phoneme, position] = key.split('_') as [string, SoundPosition];
      if (items.length < 2) return; // Need at least 2 attempts for pattern detection

      // Count substitutions / errors
      const errorItems = items.filter(a => {
        const targetRes = a.phonemeResults.find(p => p.phoneme === phoneme);
        return targetRes && (targetRes.assessment === 'POSSIBLE_ERROR' || targetRes.assessment === 'LIKELY_ERROR');
      });

      if (errorItems.length >= 2) {
        const uniqueWords = Array.from(new Set(errorItems.map(a => a.target.word)));
        const substitutedSounds = errorItems
          .map(a => a.phonemeResults.find(p => p.phoneme === phoneme)?.observedSound)
          .filter(Boolean) as string[];

        const primarySub = substitutedSounds[0] || 'different sound';
        const consistencyRate = substitutedSounds.filter(s => s === primarySub).length / substitutedSounds.length;

        const patternConfidence = Math.min(
          0.95,
          Number((0.35 + errorItems.length * 0.15 + (uniqueWords.length > 1 ? 0.2 : 0) + consistencyRate * 0.15).toFixed(2))
        );

        patterns.push({
          id: `pattern_${phoneme}_${position}`,
          phoneme,
          position,
          patternDescription: `Observed recurring pattern: /${phoneme}/ in ${position} position frequently substituted with [${primarySub}] across multiple words (${uniqueWords.join(', ')}).`,
          errorType: 'SUBSTITUTION',
          substitutedSound: primarySub,
          evidenceCount: errorItems.length,
          patternConfidence,
          observedWords: uniqueWords,
          lastObserved: errorItems[errorItems.length - 1].timestamp
        });
      }
    });

    return patterns;
  }

  /**
   * Recompute word profile
   */
  public static updateWordProfile(
    word: string,
    history: SpeechAttemptResult[]
  ): ChildWordProfile {
    const attempts = history.filter(a => a.target.word.toLowerCase() === word.toLowerCase() && a.isValidAttempt);
    const total = attempts.length;

    if (total === 0) {
      return {
        word,
        targetPhoneme: 'r',
        attempts: 0,
        successfulAttempts: 0,
        difficultyAttempts: 0,
        recentAccuracy: 0,
        longTermAccuracy: 0,
        confidence: 0,
        errorPatterns: [],
        phonemesInvolved: [],
        practiceCount: 0,
        masteryState: 'INSUFFICIENT_DATA'
      };
    }

    const first = attempts[0];
    const successfulAttempts = attempts.filter(a => a.phonemeResults.every(p => p.assessment === 'CORRECT' || p.assessment === 'LIKELY_CORRECT')).length;
    const difficultyAttempts = total - successfulAttempts;
    const longTermAccuracy = Math.round((successfulAttempts / total) * 100);

    const recent = attempts.slice(-3);
    const recentSuccess = recent.filter(a => a.phonemeResults.every(p => p.assessment === 'CORRECT' || p.assessment === 'LIKELY_CORRECT')).length;
    const recentAccuracy = Math.round((recentSuccess / recent.length) * 100);

    let masteryState: MasteryState = 'PRACTICING';
    if (total < 2) masteryState = 'INSUFFICIENT_DATA';
    else if (recentAccuracy >= 85 && total >= 3) masteryState = 'MASTERED';
    else if (recentAccuracy >= 60) masteryState = 'IMPROVING';
    else masteryState = 'NEEDS_REVIEW';

    return {
      word,
      targetPhoneme: first.target.targetPhoneme,
      attempts: total,
      successfulAttempts,
      difficultyAttempts,
      recentAccuracy,
      longTermAccuracy,
      confidence: Math.min(0.95, Number((0.4 + total * 0.15).toFixed(2))),
      errorPatterns: Array.from(new Set(attempts.flatMap(a => a.phonemeResults.map(p => p.errorType)).filter(e => e !== 'NONE'))),
      phonemesInvolved: first.target.expectedPhonemes,
      practiceCount: attempts.filter(a => a.activityType === 'PRACTICE').length,
      masteryState,
      lastPracticed: attempts[attempts.length - 1]?.timestamp,
      lastAssessed: attempts.filter(a => a.activityType === 'ASSESSMENT').slice(-1)[0]?.timestamp
    };
  }
}
