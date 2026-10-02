"use client";

import { clockTime, type Order } from "@/lib/orderTypes";

/* ============================================================
   Kitchen order ticket.

   Printed from a hidden window rather than the page itself, so the
   board does not need a print stylesheet fighting its own layout,
   and a second ticket can be sent while the first is still spooling.
   Sized for 80mm thermal paper, which is what most Indian cafe
   kitchens already have.
   ============================================================ */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function kotHtml(order: Order): string {
  const where =
    order.orderType === "takeaway" ? "TAKEAWAY" : `TABLE ${escapeHtml(order.table)}`;

  const lines = order.lines
    .map((line) => {
      const options = line.options
        ? `<div class="opt">${escapeHtml(Object.values(line.options).join(" · "))}</div>`
        : "";
      const lineNote = line.note ? `<div class="linenote">${escapeHtml(line.note)}</div>` : "";
      return `<li><span class="qty">${line.qty}</span><span class="name">${escapeHtml(
        line.name,
      )}${options}${lineNote}</span></li>`;
    })
    .join("");

  const note = order.note
    ? `<p class="note">${escapeHtml(order.note)}</p>`
    : "";

  const guest = order.guest?.name
    ? `<p class="guest">${escapeHtml(order.guest.name)}</p>`
    : "";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(order.code)}</title>
<style>
  @page { size: 80mm auto; margin: 4mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: ui-monospace, "Courier New", monospace; color: #000; font-size: 13px; line-height: 1.35; }
  .code { font-size: 22px; font-weight: 700; letter-spacing: .04em; }
  .where { font-size: 18px; font-weight: 700; }
  .rule { border-top: 1px dashed #000; margin: 6px 0; }
  ul { list-style: none; margin: 0; padding: 0; }
  li { display: flex; gap: 8px; padding: 4px 0; border-bottom: 1px dotted #999; }
  .qty { font-weight: 700; min-width: 22px; }
  .name { font-weight: 700; }
  .opt { font-weight: 400; font-size: 11px; }
  .linenote { font-weight: 700; font-size: 12px; text-decoration: underline; }
  .note { border: 1px solid #000; padding: 4px 6px; margin: 6px 0 0; font-size: 12px; }
  .guest { margin: 2px 0 0; font-size: 12px; }
  .meta { font-size: 11px; display: flex; justify-content: space-between; }
</style></head>
<body>
  <div class="code">${escapeHtml(order.code)}</div>
  <div class="where">${where}</div>
  ${guest}
  <div class="rule"></div>
  <ul>${lines}</ul>
  <div class="rule"></div>
  ${note}
  <div class="meta">
    <span>Placed ${escapeHtml(clockTime(order.placedAt))}</span>
    <span>${order.readyBy ? `Due ${escapeHtml(clockTime(order.readyBy))}` : ""}</span>
  </div>
</body></html>`;
}

export function printKot(order: Order): void {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(frame);

  const doc = frame.contentDocument;
  if (!doc) {
    frame.remove();
    return;
  }

  doc.open();
  doc.write(kotHtml(order));
  doc.close();

  const run = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    // Give the print dialog time to take its snapshot before the frame goes.
    window.setTimeout(() => frame.remove(), 1000);
  };

  if (doc.readyState === "complete") run();
  else frame.addEventListener("load", run, { once: true });
}
