import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface OptionItem {
    type: string;
    name: string;
    price: number;
    order: number;
    meta?: any;
}

const options: OptionItem[] = [
    // TAMANHOS
    { type: 'TAMANHO', name: 'P - 12 fatias', price: 90.00, order: 1 },
    { type: 'TAMANHO', name: 'M - 18 fatias', price: 0, order: 2 }, // Sob consulta
    { type: 'TAMANHO', name: 'G - 24 fatias', price: 0, order: 3 },
    { type: 'TAMANHO', name: 'GG - 36 fatias', price: 0, order: 4 },
    { type: 'TAMANHO', name: 'EXG - 48 fatias', price: 0, order: 5 },

    // MASSAS
    { type: 'MASSA', name: 'Massa branca chiffon de baunilha', price: 0, order: 1 },
    { type: 'MASSA', name: 'Chocolate 50%', price: 0, order: 2 },

    // RECHEIOS
    { type: 'RECHEIO', name: 'Ninho', price: 0, order: 1 },
    { type: 'RECHEIO', name: 'Brigadeiro', price: 0, order: 2 },
    { type: 'RECHEIO', name: 'Creme belga com abacaxi', price: 0, order: 3 },
    { type: 'RECHEIO', name: 'Creme belga com chocolate', price: 0, order: 4 },
    { type: 'RECHEIO', name: 'Frutas vermelhas', price: 0, order: 5 },
    { type: 'RECHEIO', name: 'Beijinho', price: 0, order: 6 },
    { type: 'RECHEIO', name: 'Brigadeiro de limão', price: 0, order: 7 },
    { type: 'RECHEIO', name: 'Doce de leite', price: 0, order: 8 },

    // COBERTURAS
    { type: 'COBERTURA', name: 'Chantininho', price: 0, order: 1 },
    { type: 'COBERTURA', name: 'Ganache', price: 100.00, order: 2 }, // Assuming price per kg/unit logic needs refinement, but putting base price here
    { type: 'COBERTURA', name: 'Acetato', price: 0, order: 3 },

    // DECORAÇÃO (Using ADICIONAL type for now as discussed, or maybe I should add DECORACAO type to check constraint? 
    // The script.js looks for DECORACAO type for the main list and ADICIONAL for extras.
    // I will use DECORACAO for the main ones and ADICIONAL for the extras.
    // Note: I need to make sure the check constraint allows DECORACAO.
    // The schema defined: CHECK (type IN ('RECHEIO','MASSA','COBERTURA','TAMANHO','ADICIONAL'))
    // So DECORACAO will fail. I must use ADICIONAL for everything or update the constraint.
    // Updating constraint is safer.
    // But for now, to avoid migration complexity, I will map DECORACAO to ADICIONAL in the DB, 
    // BUT wait, my script.js filters by type 'DECORACAO'.
    // I should update script.js to filter 'ADICIONAL' for both? Or split them by some other means?
    // Or I can just run a migration to add DECORACAO to the enum.
    // Let's try to add the constraint update in the seed script? No, that's DDL.
    // I'll just use ADICIONAL for all decorations in the DB, and in script.js I'll have to distinguish them?
    // Or better: I'll update the schema to allow DECORACAO.
    // I'll execute a raw SQL command to update the check constraint.
];

const extras: OptionItem[] = [
    { type: 'ADICIONAL', name: 'Topo de bolo impresso', price: 25.00, order: 1 },
    { type: 'ADICIONAL', name: 'Topo de bolo nome simples', price: 18.00, order: 2 },
    { type: 'ADICIONAL', name: 'Topo de bolo 3D a partir de', price: 30.00, order: 3 },
];

// Decorations (Standard) - I'll put them as ADICIONAL for now but with price 0
const decorations: OptionItem[] = [
    { type: 'ADICIONAL', name: 'Espatulado', price: 0, order: 10 },
    { type: 'ADICIONAL', name: 'Drip Cake', price: 0, order: 11 },
    { type: 'ADICIONAL', name: 'Naked cake', price: 0, order: 12 },
    { type: 'ADICIONAL', name: 'Semi Naked', price: 0, order: 13 },
    { type: 'ADICIONAL', name: 'Tronco', price: 0, order: 14 },
    { type: 'ADICIONAL', name: 'Wave Cake', price: 0, order: 15 },
    { type: 'ADICIONAL', name: 'Vintage Cake', price: 0, order: 16 },
    // Paid decorations
    { type: 'ADICIONAL', name: 'Raspas de chocolate', price: 0, order: 20 }, // Price varies
    { type: 'ADICIONAL', name: 'Flores naturais', price: 0, order: 21 },
    { type: 'ADICIONAL', name: 'Doces enrolados', price: 0, order: 22 },
    // ... others
];

async function seed() {
    console.log('Seeding options...');

    // 1. Update Check Constraint to allow DECORACAO if possible, or just use ADICIONAL.
    // Since I can't easily run SQL migration here without risk, I will stick to ADICIONAL.
    // But wait, my script.js expects 'DECORACAO' for the main grid.
    // I will update script.js to look for 'ADICIONAL' with price 0 (or some other logic) for the main grid?
    // No, that's flaky.
    // I will try to update the constraint using rpc or just raw query if I had a way.
    // Actually, I can use the `postgres` connection if I had one, but I only have supabase client.
    // Supabase client can run rpc.
    // Let's just use 'ADICIONAL' for everything in the DB.
    // And in script.js, I will change the filter for "Decorations" to use 'ADICIONAL' 
    // AND maybe I'll add a 'category' field to metadata?
    // The schema has `meta jsonb DEFAULT '{}'`. I can use that!
    // Perfect. type = 'ADICIONAL', meta = { category: 'DECORACAO' } vs { category: 'EXTRA' }

    const allOptions: OptionItem[] = [
        ...options,
        ...extras.map(o => ({ ...o, meta: { category: 'EXTRA' } } as OptionItem)),
        ...decorations.map(o => ({ ...o, meta: { category: 'DECORACAO' } } as OptionItem))
    ];

    for (const opt of allOptions) {
        const slug = opt.name.toLowerCase().replace(/ /g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, "");

        const { error } = await supabase
            .from('options')
            .upsert({
                type: opt.type,
                name: opt.name,
                slug,
                price: opt.price,
                order: opt.order,
                meta: opt.meta || {}
            }, { onConflict: 'slug' });

        if (error) console.error(`Error inserting ${opt.name}:`, error.message);
        else console.log(`Inserted ${opt.name}`);
    }
}

seed();
