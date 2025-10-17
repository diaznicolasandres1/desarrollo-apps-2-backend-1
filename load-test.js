#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuración
const BASE_URL = 'https://cultura.diaznicolasandres.com';
const API_PREFIX = '/api/v1';
const DURATION_MINUTES = 5;
const REQUEST_INTERVAL_MS = 1000; // 1000ms entre requests (1 request por segundo) - MÁS LENTO PARA DEBUG

// Endpoints disponibles (exitosos y con errores)
const endpoints = [
  // App endpoints (exitosos)
  { path: '/', method: 'GET', weight: 5 },
  { path: '/health', method: 'GET', weight: 3 },
  { path: '/docs', method: 'GET', weight: 2 },
  
  // Cultural Places endpoints (exitosos)
  { path: `${API_PREFIX}/cultural-places`, method: 'GET', weight: 10 },
  { path: `${API_PREFIX}/cultural-places?category=museo`, method: 'GET', weight: 3 },
  { path: `${API_PREFIX}/cultural-places?isActive=true`, method: 'GET', weight: 3 },
  { path: `${API_PREFIX}/cultural-places?minRating=4`, method: 'GET', weight: 2 },
  { path: `${API_PREFIX}/cultural-places/nearby?lat=-34.6037&lng=-58.3816&radius=5`, method: 'GET', weight: 4 },
  { path: `${API_PREFIX}/cultural-places/category/museo`, method: 'GET', weight: 3 },
  { path: `${API_PREFIX}/cultural-places/category/teatro`, method: 'GET', weight: 3 },
  { path: `${API_PREFIX}/cultural-places/category/galeria`, method: 'GET', weight: 2 },
  { path: `${API_PREFIX}/cultural-places/open/lunes`, method: 'GET', weight: 2 },
  { path: `${API_PREFIX}/cultural-places/open/martes`, method: 'GET', weight: 2 },
  
  // Events endpoints (exitosos)
  { path: `${API_PREFIX}/events`, method: 'GET', weight: 8 },
  { path: `${API_PREFIX}/events?isActive=true`, method: 'GET', weight: 4 },
  { path: `${API_PREFIX}/events?startDate=2024-01-01&endDate=2024-12-31`, method: 'GET', weight: 3 },
  { path: `${API_PREFIX}/events/active`, method: 'GET', weight: 5 },
  
  // Tickets endpoints (exitosos)
  { path: `${API_PREFIX}/tickets`, method: 'GET', weight: 3 },
  
  // Users endpoints (exitosos)
  { path: `${API_PREFIX}/users`, method: 'GET', weight: 2 },
  
  // 🔥 ENDPOINTS QUE GENERAN ERRORES 4XX (Client Errors)
  { path: `${API_PREFIX}/cultural-places/999999`, method: 'GET', weight: 2, expectError: '4XX' }, // 404 Not Found
  { path: `${API_PREFIX}/events/invalid-id`, method: 'GET', weight: 2, expectError: '4XX' }, // 404 Not Found
  { path: `${API_PREFIX}/users/nonexistent`, method: 'GET', weight: 2, expectError: '4XX' }, // 404 Not Found
  { path: `${API_PREFIX}/tickets/invalid`, method: 'GET', weight: 2, expectError: '4XX' }, // 404 Not Found
  { path: `${API_PREFIX}/cultural-places`, method: 'POST', weight: 1, expectError: '4XX' }, // 400 Bad Request (sin body)
  { path: `${API_PREFIX}/events`, method: 'POST', weight: 1, expectError: '4XX' }, // 400 Bad Request (sin body)
  { path: `${API_PREFIX}/users`, method: 'POST', weight: 1, expectError: '4XX' }, // 400 Bad Request (sin body)
  { path: `${API_PREFIX}/cultural-places?invalidParam=test`, method: 'GET', weight: 1, expectError: '4XX' }, // 400 Bad Request
  { path: `${API_PREFIX}/events?malformed=true`, method: 'GET', weight: 1, expectError: '4XX' }, // 400 Bad Request
  
  // 🔥 ENDPOINTS QUE PODRÍAN GENERAR ERRORES 5XX (Server Errors)
  { path: `${API_PREFIX}/cultural-places?forceError=true`, method: 'GET', weight: 1, expectError: '5XX' }, // Posible 500
  { path: `${API_PREFIX}/events?crash=true`, method: 'GET', weight: 1, expectError: '5XX' }, // Posible 500
];

// Función para hacer request
function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint.path}`;
    const startTime = Date.now();
    
    const options = {
      method: endpoint.method,
      timeout: 5000, // Timeout más agresivo
      headers: {
        'User-Agent': 'LoadTest-Script/1.0',
        'Accept': 'application/json',
        'Connection': 'keep-alive', // Reutilizar conexiones
      }
    };

    const req = https.request(url, options, (res) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          endpoint: endpoint.path,
          method: endpoint.method,
          statusCode: res.statusCode,
          duration: duration,
          responseSize: data.length,
          timestamp: new Date().toISOString()
        });
      });
    });

    req.on('error', (error) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      reject({
        endpoint: endpoint.path,
        method: endpoint.method,
        error: error.message,
        duration: duration,
        timestamp: new Date().toISOString()
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        endpoint: endpoint.path,
        method: endpoint.method,
        error: 'Request timeout',
        duration: 5000,
        timestamp: new Date().toISOString()
      });
    });

    // Para requests POST, enviar un body vacío para generar 400 Bad Request
    if (endpoint.method === 'POST') {
      req.write('');
    }

    req.end();
  });
}

// Función para seleccionar endpoint basado en peso
function selectEndpoint() {
  const totalWeight = endpoints.reduce((sum, endpoint) => sum + endpoint.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const endpoint of endpoints) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint;
    }
  }
  
  return endpoints[0]; // fallback
}

// Función principal
async function runLoadTest() {
  console.log(`🚀 Iniciando test de carga AGRESIVO por ${DURATION_MINUTES} minutos`);
  console.log(`📊 Base URL: ${BASE_URL}`);
  console.log(`⚡ Intervalo entre requests: ${REQUEST_INTERVAL_MS}ms (${Math.round(1000/REQUEST_INTERVAL_MS)} requests/segundo)`);
  console.log(`🎯 Total de endpoints: ${endpoints.length}`);
  console.log(`💥 Requests estimados: ~${Math.round((DURATION_MINUTES * 60 * 1000) / REQUEST_INTERVAL_MS)}`);
  console.log('─'.repeat(60));
  
  const startTime = Date.now();
  const endTime = startTime + (DURATION_MINUTES * 60 * 1000);
  let requestCount = 0;
  let successCount = 0;
  let error4xxCount = 0;
  let error5xxCount = 0;
  let otherErrorCount = 0;
  const results = [];
  
  const interval = setInterval(async () => {
    if (Date.now() >= endTime) {
      clearInterval(interval);
      printSummary(requestCount, successCount, error4xxCount, error5xxCount, otherErrorCount, results, startTime);
      return;
    }
    
    const endpoint = selectEndpoint();
    requestCount++;
    
    try {
      const result = await makeRequest(endpoint);
      results.push(result);
      
      // Clasificar por status code
      if (result.statusCode >= 200 && result.statusCode < 300) {
        successCount++;
        console.log(`✅ [${requestCount}] ${result.method} ${result.endpoint} - ${result.statusCode} (${result.duration}ms)`);
      } else if (result.statusCode >= 400 && result.statusCode < 500) {
        error4xxCount++;
        console.log(`⚠️  [${requestCount}] ${result.method} ${result.endpoint} - ${result.statusCode} (${result.duration}ms) - 4XX Client Error`);
      } else if (result.statusCode >= 500) {
        error5xxCount++;
        console.log(`🔥 [${requestCount}] ${result.method} ${result.endpoint} - ${result.statusCode} (${result.duration}ms) - 5XX Server Error`);
      } else {
        otherErrorCount++;
        console.log(`❓ [${requestCount}] ${result.method} ${result.endpoint} - ${result.statusCode} (${result.duration}ms) - Other`);
      }
    } catch (error) {
      otherErrorCount++;
      results.push(error);
      
      console.log(`❌ [${requestCount}] ${error.method} ${error.endpoint} - ERROR: ${error.error} (${error.duration}ms)`);
    }
  }, REQUEST_INTERVAL_MS);
}

// Función para imprimir resumen
function printSummary(totalRequests, successCount, error4xxCount, error5xxCount, otherErrorCount, results, startTime) {
  const duration = Date.now() - startTime;
  const durationMinutes = (duration / 1000 / 60).toFixed(2);
  
  console.log('\n' + '═'.repeat(70));
  console.log('📊 RESUMEN DEL TEST DE CARGA COMPLETO');
  console.log('═'.repeat(70));
  console.log(`⏱️  Duración: ${durationMinutes} minutos`);
  console.log(`📈 Total requests: ${totalRequests}`);
  console.log(`✅ 2XX Success: ${successCount} (${((successCount/totalRequests)*100).toFixed(1)}%)`);
  console.log(`⚠️  4XX Client Errors: ${error4xxCount} (${((error4xxCount/totalRequests)*100).toFixed(1)}%)`);
  console.log(`🔥 5XX Server Errors: ${error5xxCount} (${((error5xxCount/totalRequests)*100).toFixed(1)}%)`);
  console.log(`❓ Other Errors: ${otherErrorCount} (${((otherErrorCount/totalRequests)*100).toFixed(1)}%)`);
  
  if (results.length > 0) {
    const durations = results.map(r => r.duration).filter(d => d);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    console.log(`⏱️  Duración promedio: ${avgDuration.toFixed(0)}ms`);
    console.log(`⚡ Duración mínima: ${minDuration}ms`);
    console.log(`🐌 Duración máxima: ${maxDuration}ms`);
  }
  
  // Estadísticas por endpoint
  const endpointStats = {};
  results.forEach(result => {
    const key = `${result.method} ${result.endpoint}`;
    if (!endpointStats[key]) {
      endpointStats[key] = { count: 0, errors: 0, totalDuration: 0, statusCodes: {} };
    }
    endpointStats[key].count++;
    if (result.error) {
      endpointStats[key].errors++;
    } else {
      endpointStats[key].totalDuration += result.duration;
      const statusCode = result.statusCode.toString();
      endpointStats[key].statusCodes[statusCode] = (endpointStats[key].statusCodes[statusCode] || 0) + 1;
    }
  });
  
  console.log('\n📊 ESTADÍSTICAS POR ENDPOINT:');
  console.log('─'.repeat(70));
  Object.entries(endpointStats).forEach(([endpoint, stats]) => {
    const avgDuration = stats.totalDuration / (stats.count - stats.errors);
    const errorRate = ((stats.errors / stats.count) * 100).toFixed(1);
    const statusCodesStr = Object.entries(stats.statusCodes)
      .map(([code, count]) => `${code}(${count})`)
      .join(', ');
    
    console.log(`${endpoint}`);
    console.log(`  📊 Requests: ${stats.count} | ❌ Errores: ${stats.errors} (${errorRate}%) | ⏱️  Promedio: ${avgDuration.toFixed(0)}ms`);
    console.log(`  🎯 Status Codes: ${statusCodesStr}`);
  });
  
  console.log('\n🎉 Test de carga completado!');
  console.log('📊 Verifica en Grafana que ahora aparezcan datos en los paneles 4XX y 5XX!');
}

// Manejar señales de interrupción
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrumpido por el usuario');
  process.exit(0);
});

// Ejecutar el test
runLoadTest().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
