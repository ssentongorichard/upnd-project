import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communications } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const rows = await db.select().from(communications).orderBy(desc(communications.createdAt));
    const formatted = rows.map((r: any) => ({
      id: r.id,
      type: r.type,
      subject: r.subject,
      message: r.message,
      recipients_count: r.recipientsCount,
      sent_count: r.sentCount,
      failed_count: r.failedCount,
      status: r.status,
      sent_by: r.sentBy,
      sent_at: r.sentAt,
      created_at: r.createdAt,
    }));
    return NextResponse.json(formatted);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch communications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, subject, message, recipientFilter } = body || {};
    if (!type || !message) {
      return NextResponse.json({ error: 'type and message are required' }, { status: 400 });
    }
    const filter = recipientFilter || {};
    // For now, we are not counting recipients on the server
    const [row] = await db
      .insert(communications)
      .values({
        type,
        subject,
        message,
        recipientFilter: filter,
        recipientsCount: 0,
        sentCount: 0,
        failedCount: 0,
        status: 'Draft',
      })
      .returning();

    const formatted = {
      id: row.id,
      type: row.type,
      subject: row.subject,
      message: row.message,
      recipients_count: row.recipientsCount,
      sent_count: row.sentCount,
      failed_count: row.failedCount,
      status: row.status,
      sent_by: row.sentBy,
      sent_at: row.sentAt,
      created_at: row.createdAt,
    };
    return NextResponse.json(formatted, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create communication' }, { status: 500 });
  }
}
