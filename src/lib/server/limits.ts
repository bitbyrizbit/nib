import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./store";

export const guestbookLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "10 m"), prefix: "nib:rl:gb" })
  : null;
