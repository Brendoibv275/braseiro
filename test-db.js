import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

console.log('Testando conexão Supabase...')
console.log('URL:', url)
console.log('Key (primeiros 10 chars):', key?.substring(0, 10) + '...')

if (!url || !key) {
    console.error('❌ Erro: Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes no .env')
    process.exit(1)
}

const supabase = createClient(url, key)

async function testConnection() {
    try {
        const { data, error } = await supabase.from('produtos').select('count', { count: 'exact', head: true })

        if (error) {
            console.error('❌ Erro de conexão:', error.message)
        } else {
            console.log('✅ Conexão bem sucedida!')
        }
    } catch (e) {
        console.error('❌ Erro inesperado:', e)
    }
}

testConnection()
