"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  type Order,
  type OrderLine,
} from "@/lib/orders";

function useSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useOrders(): Order[] {
  return useSnapshot().orders;
}

export function useOrder(id: string): Order | undefined {
  return useSnapshot().orders.find((order) => order.id === id);
}

const EMPTY_LINES: OrderLine[] = [];

export function useCart(table: string): OrderLine[] {
  const carts = useSnapshot().carts;
  return carts[table] ?? EMPTY_LINES;
}

/** Item ids the counter has taken off the board today. */
export function useSoldOut(): string[] {
  return useSnapshot().soldOut;
}

/** Whether the last read of the order database succeeded, and whether one has landed yet. */
export function useConnection(): { online: boolean; loaded: boolean } {
  const snapshot = useSnapshot();
  return { online: snapshot.online, loaded: snapshot.loaded };
}

/* ------------------------------------------------------------
   A single shared clock, rather than one interval per component.
   Elapsed timers on the counter board all tick off this.
   ------------------------------------------------------------ */

const tickListeners = new Set<() => void>();
let currentTime = 0;
let timer: number | null = null;

function subscribeToClock(listener: () => void) {
  tickListeners.add(listener);

  if (timer === null) {
    currentTime = Date.now();
    timer = window.setInterval(() => {
      currentTime = Date.now();
      for (const cb of tickListeners) cb();
    }, 1000);
  }

  return () => {
    tickListeners.delete(listener);
    if (tickListeners.size === 0 && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
}

function readClock() {
  if (currentTime === 0) currentTime = Date.now();
  return currentTime;
}

function readClockOnServer() {
  return 0;
}

/** Current time, refreshed every second. Returns 0 during server render. */
export function useNow(): number {
  return useSyncExternalStore(subscribeToClock, readClock, readClockOnServer);
}

/* ------------------------------------------------------------ */

const noopSubscribe = () => () => {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;

/** True only after hydration — used to avoid rendering storage-backed UI on the server. */
export function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, alwaysTrue, alwaysFalse);
}
