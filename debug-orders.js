import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(url, key)

async function debugOrders() {
    console.log('--- DEBUG ORDERS ---')

    // 1. Tentar buscar TODOS os clientes sem filtro
    console.log('1. Buscando todos os registros de hbn_clientes (limit 10)...')
    const { data: allData, error: allError } = await supabase
        .from('hbn_clientes')
        .select('*')
        .limit(10)

    if (allError) {
        console.error('❌ Erro ao buscar todos:', allError.message)
    } else {
        console.log(`✅ Encontrados ${allData.length} registros totais.`)
        if (allData.length > 0) {
            console.log('Exemplo de status:', allData.map(d => d.status_funil))
        } else {
            console.log('⚠️ Tabela parece vazia ou RLS está bloqueando leitura.')
        }
    }

    // 2. Testar query exata do useOrders
    console.log('\n2. Testando query do useOrders (anotacao, cozinha, entrega)...')
    const { data: filteredData, error: filteredError } = await supabase
        .from('hbn_clientes')
        .select('*')
        .in('status_funil', ['anotacao', 'cozinha', 'entrega'])

    if (filteredError) {
        console.error('❌ Erro na query filtrada:', filteredError.message)
    } else {
        console.log(`✅ Encontrados ${filteredData.length} registros filtrados.`)
    }

    // 3. Verificando sessão atual (anon vs auth)...
    console.log('\n3. Verificando sessão atual (anon vs auth)...')
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Sessão:', session ? `Logado como ${session.user.email}` : 'Anônimo (sem sessão no script)')

    // 4. Checar histórico
    console.log('\n4. Checar hbn_historico...')
    const { data: hist, error: histError } = await supabase.from('hbn_historico').select('count', { count: 'exact', head: true })
    if (histError) console.error('Erro historico:', histError.message)
    else console.log('Total histórico:', hist.length === null ? 'count returned in count property' : hist)
}

debugOrders()
