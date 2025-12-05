import { supabaseServer } from '../lib/supabaseServer';

// Dados do admin solicitados
const ADMIN_EMAIL = 'admin@exemplo.com';
const ADMIN_PASSWORD = 'teste123';

async function createAdmin() {
    // Cria usuário no Auth usando a Service Role Key
    const { data: user, error: authError } = await supabaseServer.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
    });

    if (authError) {
        console.error('Erro ao criar usuário Auth:', authError.message);
        return;
    }

    // Insere a role na tabela users
    const { error: dbError } = await supabaseServer
        .from('users')
        .insert({
            id: user.user.id,
            email: ADMIN_EMAIL,
            role: 'admin',
        });

    if (dbError) {
        console.error('Erro ao inserir na tabela users:', dbError.message);
        return;
    }

    console.log('✅ Usuário admin criado com sucesso!');
}

createAdmin().catch((e) => console.error(e));
