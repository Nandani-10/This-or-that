import { Answer } from '../types';

export interface CompatibilityRecord {
  userAId: string;
  userAName: string;
  userBId: string;
  userBName: string;
  matches: number;
  mismatches: number;
  totalShared: number;
  matchPercent: number;
  matchedQuestionIds: string[];
  mismatchedQuestionIds: string[];
  correctGuessesCount: number;
  totalGuessesCount: number;
  guessPercent: number;
}

export function calculatePairCompatibility(
  answers: Answer[],
  userAId: string,
  userAName: string,
  userBId: string,
  userBName: string
): CompatibilityRecord {
  // Group answers by questionId
  const questionsMap = new Map<string, { ansA?: Answer; ansB?: Answer }>();

  answers.forEach((ans) => {
    if (ans.userId === userAId || ans.userId === userBId) {
      if (!questionsMap.has(ans.questionId)) {
        questionsMap.set(ans.questionId, {});
      }
      const entry = questionsMap.get(ans.questionId)!;
      if (ans.userId === userAId) entry.ansA = ans;
      if (ans.userId === userBId) entry.ansB = ans;
    }
  });

  let matches = 0;
  let mismatches = 0;
  const matchedQuestionIds: string[] = [];
  const mismatchedQuestionIds: string[] = [];

  let correctGuessesCount = 0;
  let totalGuessesCount = 0;

  questionsMap.forEach((entry, qId) => {
    if (entry.ansA && entry.ansB) {
      if (entry.ansA.choice === entry.ansB.choice) {
        matches++;
        matchedQuestionIds.push(qId);
      } else {
        mismatches++;
        mismatchedQuestionIds.push(qId);
      }

      // Guess checks
      if (entry.ansA.guessChoice) {
        totalGuessesCount++;
        if (entry.ansA.guessChoice === entry.ansB.choice) {
          correctGuessesCount++;
        }
      }
      if (entry.ansB.guessChoice) {
        totalGuessesCount++;
        if (entry.ansB.guessChoice === entry.ansA.choice) {
          correctGuessesCount++;
        }
      }
    }
  });

  const totalShared = matches + mismatches;
  const matchPercent = totalShared > 0 ? Math.round((matches / totalShared) * 100) : 0;
  const guessPercent = totalGuessesCount > 0 ? Math.round((correctGuessesCount / totalGuessesCount) * 100) : 0;

  return {
    userAId,
    userAName,
    userBId,
    userBName,
    matches,
    mismatches,
    totalShared,
    matchPercent,
    matchedQuestionIds,
    mismatchedQuestionIds,
    correctGuessesCount,
    totalGuessesCount,
    guessPercent
  };
}

export function getPairwiseCompatibilities(
  answers: Answer[],
  answerers: { id: string; name: string }[]
): CompatibilityRecord[] {
  const records: CompatibilityRecord[] = [];
  if (!answerers || answerers.length < 2) return records;

  for (let i = 0; i < answerers.length; i++) {
    for (let j = i + 1; j < answerers.length; j++) {
      const userA = answerers[i];
      const userB = answerers[j];
      records.push(calculatePairCompatibility(answers, userA.id, userA.name, userB.id, userB.name));
    }
  }

  return records;
}

export function getTopPairCompatibilityForUser(
  answers: Answer[],
  answerers: { id: string; name: string }[],
  currentUserId: string
): CompatibilityRecord | null {
  if (!answerers || answerers.length < 2) return null;

  const me = answerers.find((u) => u.id === currentUserId) || {
    id: currentUserId,
    name: 'You'
  };

  const otherUsers = answerers.filter((u) => u.id !== currentUserId);
  if (otherUsers.length === 0) return null;

  let bestRecord: CompatibilityRecord | null = null;

  otherUsers.forEach((other) => {
    const rec = calculatePairCompatibility(answers, me.id, me.name, other.id, other.name);
    if (!bestRecord || rec.totalShared > bestRecord.totalShared || rec.matchPercent > bestRecord.matchPercent) {
      bestRecord = rec;
    }
  });

  return bestRecord;
}
