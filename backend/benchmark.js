const axios = require('axios');
const colors = require('colors');

// CONFIGURACIÓN
const BASE_URL = 'http://localhost:3001';
const ITERATIONS = 20; // Número de veces que repetiremos cada prueba para sacar el promedio

// Variable global para guardar IDs reales y usarlos en las pruebas de detalle
let testData = {
    userId: 'USER-001', // Fallback
    pinId: null,
    boardId: null
};

// Función auxiliar para medir tiempo
const measure = async (name, url, method = 'GET', body = null) => {
    let times = [];
    let errors = 0;

    process.stdout.write(`Probando ${name.cyan} (${ITERATIONS} veces)... `);

    for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        try {
            if (method === 'GET') await axios.get(url);
            else await axios.post(url, body);
            
            const end = performance.now();
            times.push(end - start);
        } catch (e) {
            errors++;
            // Si falla, agregamos un tiempo alto penalizado o lo ignoramos
            // console.error(e.message); 
        }
    }

    if (times.length === 0) {
        console.log(`[FALLÓ TOTALMENTE]`.red);
        return null;
    }

    // Cálculos
    const min = Math.min(...times).toFixed(2);
    const max = Math.max(...times).toFixed(2);
    const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
    
    // Percentil 95 (para descartar picos locos)
    times.sort((a, b) => a - b);
    const p95 = times[Math.floor(times.length * 0.95)].toFixed(2);

    console.log(`OK`.green);
    
    // Colorear el promedio según velocidad
    let avgColored = avg < 100 ? `${avg}ms`.green : avg < 300 ? `${avg}ms`.yellow : `${avg}ms`.red;

    return {
        Endpoint: name,
        'Min (ms)': min,
        'Max (ms)': max,
        'Avg (ms)': avg,
        'P95 (ms)': p95, // El 95% de las peticiones fueron más rápidas que esto
        'Errores': errors
    };
};

const runBenchmark = async () => {
    console.log('\n🚀 INICIANDO TEST DE RENDIMIENTO DE NEO4J BACKEND'.bold.white);
    console.log('===================================================='.gray);
    
    // 1. Obtener datos reales para las pruebas (Setup)
    try {
        const usersReq = await axios.get(`${BASE_URL}/api/users`);
        if (usersReq.data.length > 0) testData.userId = usersReq.data[0].id;

        const pinsReq = await axios.get(`${BASE_URL}/api/pins`);
        if (pinsReq.data.length > 0) testData.pinId = pinsReq.data[0].id_pin;
        
        const boardsReq = await axios.get(`${BASE_URL}/api/boards`);
        if (boardsReq.data.length > 0) testData.boardId = boardsReq.data[0].id;

        console.log(`Datos obtenidos para test: User[${testData.userId}], Pin[${testData.pinId}]`.gray);
    } catch (e) {
        console.log('⚠️ Error obteniendo datos iniciales. Asegúrate que el servidor corre en puerto 3001.'.red);
        process.exit(1);
    }

    const results = [];

    // --- BLOQUE 1: LECTURAS BÁSICAS ---
    results.push(await measure('GET Users (Lista simple)', `${BASE_URL}/api/users`));
    results.push(await measure('GET Boards (Lista simple)', `${BASE_URL}/api/boards`));

    // --- BLOQUE 2: QUERIES COMPLEJAS (JOINs) ---
    results.push(await measure('GET Feed Pins (Heavy Join)', `${BASE_URL}/api/pins?userId=${testData.userId}`));
    
    if (testData.pinId) {
        // Esta es la query que optimizamos (Detalle + Sugerencias)
        results.push(await measure('GET Pin Detail + Sugerencias', `${BASE_URL}/api/pin/${testData.pinId}?userId=${testData.userId}`));
    }

    // --- BLOQUE 3: ANALÍTICA (Graph Algorithms simulados) ---
    results.push(await measure('Analytics: Usuarios Similares (Jaccard)', `${BASE_URL}/api/users/${testData.userId}/similar`));
    results.push(await measure('Analytics: Centralidad', `${BASE_URL}/api/analytics/centrality/users`));
    results.push(await measure('Search: Búsqueda Texto', `${BASE_URL}/api/search?q=foto&type=all`));

    // --- BLOQUE 4: ESCRITURA (Creación de nodos/relaciones) ---
    // Solo probamos LIKE para no llenar la DB de basura
    if (testData.pinId) {
        results.push(await measure('POST Like (Escritura)', `${BASE_URL}/api/pins/${testData.pinId}/like`, 'POST', { userId: testData.userId }));
    }

    // MOSTRAR TABLA
    console.log('\n📊 RESULTADOS FINALES:'.bold.white);
    console.table(results.filter(r => r !== null));
    console.log('\nInterpretación:'.gray);
    console.log('🟢 < 100ms: Excelente. Respuesta instantánea.'.green);
    console.log('🟡 100ms - 300ms: Aceptable. El usuario nota una ligera carga.'.yellow);
    console.log('🔴 > 300ms: Lento. Requiere optimización (Índices o query tuning).'.red);
};

runBenchmark();