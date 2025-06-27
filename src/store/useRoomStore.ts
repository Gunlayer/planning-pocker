import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Participant } from '@types';

interface RoomState {
  self: Participant | null;
  roomId: string | null;
  participants: Participant[];
  cards: string[];
  timer: number;
  setSelf: (name: string) => void;
  setRoomId: (id: string) => void;
  setParticipants: (p: Participant[]) => void;
  vote: (card: string) => void;
  reset: () => void;
  tick: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  self: null,
  roomId: null,
  participants: [],
  cards: ['1', '2', '3', '5', '8', '13', '?'] as const,
  timer: 60,
  setSelf: (name) => {
    const newSelf = { id: uuid(), name, card: undefined };
    set({ self: newSelf });
  },
  setRoomId: (id) => set({ roomId: id }),
  setParticipants: (participants) => set({ participants }),
  vote: (card) => {
    const self = get().self;
    if (!self) return;
    self.card = card;
  },
  reset: () => {
    set((state) => ({
      participants: state.participants.map((p) => ({
        ...p,
        card: undefined,
      })),
      self: { ...state.self, card: undefined } as Participant,
      timer: 60,
    }));
  },
  tick: () => set((state) => ({ timer: state.timer - 1 })),
}));
