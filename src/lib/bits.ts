import type { Mood } from "@/components/nib/nibBrain";

export const MOOD_BITS: Record<Mood, string> = {
  idle: "0001", curious: "0011", read: "0101", happy: "1111",
  pout: "1001", sleepy: "0100", asleep: "0000", grab: "0110",
};

export const toHex = (bits: string) => parseInt(bits, 2).toString(16).toUpperCase();
