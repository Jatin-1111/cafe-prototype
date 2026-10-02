"use client";

import { useState } from "react";

const fieldClass =
  "w-full h-12 px-3 bg-paper border border-line text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none transition-colors";

const labelClass = "eyebrow block mb-2";

const slots = [
  "8:00 am",
  "9:30 am",
  "11:00 am",
  "12:30 pm",
  "2:00 pm",
  "4:30 pm",
  "6:00 pm",
  "7:30 pm",
  "9:00 pm",
];

export function ReserveForm() {
  const [booking, setBooking] = useState<{ name: string; when: string; ref: string } | null>(null);

  if (booking) {
    return (
      <div className="rounded-card bg-brand text-cream p-8 sm:p-10">
        <p className="eyebrow text-cream/60">Table held</p>
        <p className="font-display text-2xl mt-3 leading-tight">
          See you {booking.when.toLowerCase()}, {booking.name.split(" ")[0]}.
        </p>
        <p className="mt-3 text-sm text-cream/80 max-w-[46ch]">
          We hold the table for fifteen minutes past the hour. If you are running later than
          that, call the counter and we will do our best.
        </p>
        <p className="mt-6 eyebrow text-cream/60">
          Reference <span className="text-brass-soft tnum">{booking.ref}</span>
        </p>
        <button
          type="button"
          onClick={() => setBooking(null)}
          className="mt-6 text-sm font-semibold underline underline-offset-4 text-cream/80 hover:text-brass-soft transition-colors"
        >
          Book another table
        </button>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = String(data.get("name") ?? "Guest");
        const day = String(data.get("date") ?? "");
        const time = String(data.get("time") ?? "");
        const pretty = day
          ? new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })
          : "soon";
        setBooking({
          name,
          when: `${pretty} at ${time}`,
          ref: `KH-${Math.floor(1000 + Math.random() * 8999)}`,
        });
      }}
    >
      <div>
        <label className={labelClass} htmlFor="rf-name">
          Name
        </label>
        <input id="rf-name" name="name" required className={fieldClass} placeholder="Who is the table for?" />
      </div>

      <div>
        <label className={labelClass} htmlFor="rf-phone">
          Phone
        </label>
        <input
          id="rf-phone"
          name="phone"
          type="tel"
          required
          className={fieldClass}
          placeholder="+91"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="rf-date">
          Date
        </label>
        <input id="rf-date" name="date" type="date" required className={fieldClass} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="rf-time">
            Time
          </label>
          <select id="rf-time" name="time" className={fieldClass} defaultValue="6:00 pm">
            {slots.map((slot) => (
              <option key={slot}>{slot}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="rf-party">
            Guests
          </label>
          <select id="rf-party" name="party" className={fieldClass} defaultValue="2">
            {[1, 2, 3, 4, 5, 6, 8].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor="rf-note">
          Anything we should know
        </label>
        <textarea
          id="rf-note"
          name="note"
          rows={3}
          className="w-full p-3 bg-paper border border-line text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none transition-colors resize-y"
          placeholder="Birthday, quiet corner, pram — tell us and we will sort it."
        />
      </div>

      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-brand text-cream font-medium tracking-wide hover:bg-brand-deep transition-colors"
        >
          Request the table
        </button>
        <p className="text-sm text-muted">
          We confirm by phone within the hour, between 8 am and 9 pm.
        </p>
      </div>
    </form>
  );
}
