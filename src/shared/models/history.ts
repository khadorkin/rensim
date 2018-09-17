import { cloneStack, createField, Pair, setPair, Stack } from './stack';
import { Move } from "./move";
import { fieldCols, fieldRows } from "../utils/constants";
import { createChainPlan } from "./chainPlanner";
import index from "../reducers";

export type HistoryRecord = {
  move: Move | null,
  pair: Pair | null,
  numHands: number,
  stack: Stack,
  score: number,
  chain: number,
  chainScore: number,
  prev: number | null,
  next: number[],
  defaultNext: number | null
}

export type History = {
  version: number;
  records: Array<HistoryRecord>;
  currentIndex: number;
}

/**
 * 最小限のデータだけ保存する形式の履歴レコード。
 * URL にシリアライズする際に利用する。
 */
export type MinimumHistoryRecord = {
  move: Move,
  next: number[]
}

export type MinimumHistory = {
  records: MinimumHistoryRecord[];
  currentIndex: number;
}

function isEqualMove(a: Move | null, b: Move | null) {
  if (a === null || b === null) {
    return false;
  }
  return a.col === b.col && a.rotation === b.rotation;
}

export function createInitialHistoryRecord(stack: Stack): HistoryRecord {
  return {
    move: null,
    pair: null,
    numHands: 0,
    stack: stack,
    score: 0,
    chain: 0,
    chainScore: 0,
    prev: null,
    next: [],
    defaultNext: null
  };
}

export function createHistoryRecord(
  move: Move, pair: Pair, numHands: number, stack: Stack,
  chain: number, score: number, chainScore: number): HistoryRecord {
  return {
    move,
    pair,
    numHands,
    stack,
    score,
    chain,
    chainScore,
    prev: null,
    next: [],
    defaultNext: null
  };
}

export function appendHistoryRecord(history: History, record: HistoryRecord): History {

  const nextIndex = history.records.length;
  const lastState = history.records[history.currentIndex];

  // 同じ Record があったら新たに増やさない
  if (history.records.length > 0) {
    for (let nextIndex of lastState.next) {
      if (isEqualMove(history.records[nextIndex].move, record.move)) {
        lastState.defaultNext = nextIndex;
        history.currentIndex = nextIndex;
        return history;
      }
    }
  }

  // update next of previous record
  lastState.defaultNext = nextIndex;
  lastState.next.push(nextIndex);

  // update prev of current record
  record.prev = history.currentIndex;

  // append record
  history.records.push(record);
  history.currentIndex = nextIndex;
  return history;
}

export function createHistoryFromMinimumHistory(minimumHistory: MinimumHistory, queue: number[]): History {
  let stack = createField(fieldRows, fieldCols);
  let resultRecords: HistoryRecord[] = [
    createInitialHistoryRecord(stack)
  ];
  let backtrack: { [_: number]: number } = {};
  let index = 1;

  for (const record of minimumHistory.records) {
    const prev = index in backtrack ? backtrack[index] : 0;
    const numHands = resultRecords[prev].numHands + 1;
    const queuePosition = ((numHands - 1) * 2) % queue.length;
    const pair = queue.slice(queuePosition, queuePosition + 2);
    const currentStack = setPair(resultRecords[prev].stack, record.move, pair);
    const chainResult = createChainPlan(currentStack, fieldRows, fieldCols);

    for (const nextPosition of record.next) {
      backtrack[nextPosition + 1] = index;
    }

    if (!(index in backtrack)) {
      resultRecords[0].next.push(index);
      if (resultRecords[0].next.length === 1) {
        resultRecords[0].defaultNext = index;
      }
    }

    resultRecords.push({
      move: record.move,
      pair: pair,
      numHands: numHands,
      stack: currentStack,
      score: chainResult.score + resultRecords[prev].score,
      chain: chainResult.chain,
      chainScore: chainResult.score,
      next: record.next.map(n => n + 1),
      defaultNext: record.next.length > 0 ? record.next[0] + 1 : null,
      prev: prev
    });

    index += 1;
  }

  return {
    version: 1,
    records: resultRecords,
    currentIndex: minimumHistory.currentIndex
  }
}

export function serialize(history: History): string {
  return JSON.stringify(history);
}

export function deserialize(serialized: string): History {
  return JSON.parse(serialized);
}

