'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Normalize date to DD-MM-YYYY format (handles both YYYY-MM-DD and DD-MM-YYYY input)
function normalizeDateFormat(dateStr: string): string {
    if (!dateStr) return dateStr;
    
    // Check if it's already DD-MM-YYYY format
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        return dateStr;
    }
    
    // Convert YYYY-MM-DD to DD-MM-YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
    }
    
    // Return as-is if unknown format
    return dateStr;
}

export async function saveReservation(data: {
    name: string;
    phone: string;
    date: string;
    time: string;
    people: string;
}) {
    // Normalize date format to DD-MM-YYYY
    const normalizedDate = normalizeDateFormat(data.date);
    console.log("Saving reservation:", { ...data, date: normalizedDate });
    
    try {
        // Create reservation directly (no duplicate checking)
        const reservation = await prisma.reservation.create({
            data: {
                name: data.name,
                phone: data.phone,
                date: normalizedDate,
                time: data.time,
                people: String(data.people),
            },
        });
        return { success: true, id: reservation.id };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: 'Failed to create reservation' };
    }
}

export async function getReservations(dateStr?: string) {
    // Normalize the date format before querying
    const normalizedDate = dateStr ? normalizeDateFormat(dateStr) : undefined;
    const whereClause = normalizedDate ? { date: normalizedDate } : {};
    
    return await prisma.reservation.findMany({
        where: whereClause,
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function getAllBookedDates() {
    const reservations = await prisma.reservation.findMany({
        select: {
            date: true
        },
        distinct: ['date']
    });
    return reservations.map(r => r.date);
}

export async function deleteReservation(id: number) {
    try {
        await prisma.reservation.delete({ where: { id } });
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}
