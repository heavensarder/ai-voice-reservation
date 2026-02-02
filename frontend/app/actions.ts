'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function saveReservation(data: {
    name: string;
    phone: string;
    date: string;
    time: string;
    people: string;
}) {
    console.log("Saving reservation:", data);
    try {
        // 1. Check for duplicates
        const existing = await prisma.reservation.findFirst({
            where: {
                date: data.date,
                time: data.time
            }
        });

        if (existing) {
            return { success: false, error: 'Duplicate: Time slot already booked' };
        }

        const reservation = await prisma.reservation.create({
            data: {
                name: data.name,
                phone: data.phone,
                date: data.date,
                time: data.time,
                people: String(data.people), // Ensure string
            },
        });
        return { success: true, id: reservation.id };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: 'Failed to create reservation' };
    }
}

export async function getReservations(dateStr?: string) {
    const whereClause = dateStr ? { date: dateStr } : {};
    
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
