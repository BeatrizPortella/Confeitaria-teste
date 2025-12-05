
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // Fetch all orders
        const { data: orders, error } = await supabase
            .from('orders')
            .select('id, total, status, created_at')
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Calculate Metrics
        // "Confirmado" = Status 'DELIVERED'
        const confirmedOrders = orders.filter(o => o.status === 'DELIVERED');

        const totalRevenue = confirmedOrders.reduce((acc, curr) => acc + (curr.total || 0), 0);
        const totalOrdersToday = orders.filter(o => {
            const today = new Date().toDateString();
            const orderDate = new Date(o.created_at).toDateString();
            return orderDate === today;
        }).length;

        // Chart Data (Last 7 Days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
        }).reverse();

        const chartData = last7Days.map(dateLabel => {
            // Find orders for this date label
            // Note: This matches "Sáb, 05/12" format roughly. 
            // Better to match by YYYY-MM-DD for precision, but let's approximate locally.

            // Re-generate date object to match strictly
            const now = new Date();
            // This logic can be tricky with timezones. 
            // Let's simplified: Group by DD/MM/YYYY

            return {
                name: dateLabel,
                vendas: 0,
                pedidos: 0
            };
        });

        // Populate chart data
        // For simplicity in this iteration, we'll iterate orders and fill a map
        const salesByDate: Record<string, { vendas: number, pedidos: number }> = {};

        orders.forEach(order => {
            // Only count DELIVERED for sales 
            // Count ALL for "pedidos" volume? Or only delivered? 
            // Usually dashboard shows total volume of work vs finalized sales.
            // Let's count ALL interactions as "pedidos" volume, but only DELIVERED as "vendas" ($)

            const date = new Date(order.created_at);
            const key = date.toLocaleDateString('pt-BR', { weekday: 'short' }); // e.g., "Seg"

            if (!salesByDate[key]) salesByDate[key] = { vendas: 0, pedidos: 0 };

            salesByDate[key].pedidos += 1;

            if (order.status === 'DELIVERED') {
                salesByDate[key].vendas += (order.total || 0);
            }
        });

        const finalChartData = [
            { name: 'Seg', ...salesByDate['Seg'] || { vendas: 0, pedidos: 0 } },
            { name: 'Ter', ...salesByDate['Ter'] || { vendas: 0, pedidos: 0 } },
            { name: 'Qua', ...salesByDate['Qua'] || { vendas: 0, pedidos: 0 } },
            { name: 'Qui', ...salesByDate['Qui'] || { vendas: 0, pedidos: 0 } },
            { name: 'Sex', ...salesByDate['Sex'] || { vendas: 0, pedidos: 0 } },
            { name: 'Sáb', ...salesByDate['Sáb'] || { vendas: 0, pedidos: 0 } },
            { name: 'Dom', ...salesByDate['Dom'] || { vendas: 0, pedidos: 0 } },
        ];

        return NextResponse.json({
            metrics: {
                revenue: totalRevenue,
                ordersToday: totalOrdersToday,
                // Simple average ticket based on confirmed orders
                averageTicket: confirmedOrders.length > 0 ? totalRevenue / confirmedOrders.length : 0
            },
            chart: finalChartData
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}
