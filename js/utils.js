/**
 * Shared utility helpers used across the application.
 * Consolidates functions that were previously duplicated in renderer.js,
 * datepicker.js, ui.js, editor.js, and engine.js.
 */

/**
 * Convert an ISO date string (YYYY-MM-DD) to display format (DD-MM-YYYY).
 * @param {string} iso - Date in ISO format, e.g. "2025-04-01".
 * @returns {string} Date in DD-MM-YYYY format, or the original string if not valid ISO.
 */
export function displayDate(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : String(iso || '');
}

/**
 * Round a number to 2 decimal places (paise precision).
 * @param {number} n - The number to round.
 * @returns {number} The rounded value.
 */
export const round2 = n => Math.round(n * 100) / 100;

/**
 * Escape a string for safe insertion into HTML.
 * @param {string} s - The string to escape.
 * @returns {string} The escaped string with &, <, >, " replaced by entities.
 */
export const escHtml = s => String(s == null ? '' : s)
  .replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
