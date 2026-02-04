import { format, parse } from 'date-fns';

/**
 * Formats a time string to 12-hour format (e.g., "02:30 PM").
 * Handles inputs like "14:30", "02:30", "14:30:00", "2:30 PM".
 * Returns the original string if parsing fails.
 */
export function formatTo12Hour(timeStr: string): string {
    if (!timeStr) return '';

    try {
        // clean string
        const cleanTime = timeStr.trim();

        // 1. Check if already AM/PM
        if (cleanTime.match(/AM|PM/i)) {
            // Ensure consistent casing/spacing if needed, but usually fine.
            // Let's try to parse it to standardise e.g. "2:30 pm" -> "02:30 PM"
            const date = parse(cleanTime, 'h:mm a', new Date());
            if (!isNaN(date.getTime())) {
                return format(date, 'hh:mm a');
            }
            // If strict parse failed (maybe "2:30PM" without space), try flexible
            return cleanTime;
        }

        // 2. Assume 24-hour format (HH:mm)
        // Handle "14:30" or "14:30:00"
        let date = parse(cleanTime, 'HH:mm', new Date());

        // If that fails, try HH:mm:ss
        if (isNaN(date.getTime())) {
            date = parse(cleanTime, 'HH:mm:ss', new Date());
        }

        if (!isNaN(date.getTime())) {
            return format(date, 'hh:mm a');
        }

        return cleanTime;
    } catch (error) {
        console.error("Error formatting time:", error);
        return timeStr;
    }
}

/**
 * Parses a 12-hour time string (e.g., "02:30 PM") into minutes from midnight.
 * Used for sorting.
 */
export function parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;

    // Normalize to 12-hour format first
    const standardTime = formatTo12Hour(timeStr);

    try {
        const parts = standardTime.trim().split(' ');
        if (parts.length < 2) return 0;

        const [hours, minutes] = parts[0].split(':').map(Number);
        const isPM = parts[1]?.toUpperCase() === 'PM';
        let totalHours = hours;

        if (isPM && hours !== 12) totalHours += 12;
        if (!isPM && hours === 12) totalHours = 0;

        return totalHours * 60 + (minutes || 0);
    } catch {
        return 0;
    }
}
