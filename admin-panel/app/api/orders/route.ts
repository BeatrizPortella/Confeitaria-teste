import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseServer
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (status && status !== 'ALL') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function PUT(request: Request) {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
        return NextResponse.json({ error: 'ID and Status are required' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
