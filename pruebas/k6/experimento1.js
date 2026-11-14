import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const DURATION_SECONDS = Number(__ENV.DURATION_SECONDS || 120);
const STAGE_DURATION = `${DURATION_SECONDS}s`;
const STAGE_SPACING_SECONDS = DURATION_SECONDS + 2;

if (!Number.isInteger(DURATION_SECONDS) || DURATION_SECONDS < 1) {
    throw new Error('DURATION_SECONDS debe ser un entero positivo.');
}

const operationMetrics = {
    listado: {
        latency: new Trend('listado_incidencias_latency', true),
        requests: new Counter('listado_incidencias_requests'),
        errors: new Counter('listado_incidencias_errors'),
    },
    duplicados: {
        latency: new Trend('busqueda_duplicados_latency', true),
        requests: new Counter('busqueda_duplicados_requests'),
        errors: new Counter('busqueda_duplicados_errors'),
    },
    detalle: {
        latency: new Trend('detalle_incidencia_latency', true),
        requests: new Counter('detalle_incidencia_requests'),
        errors: new Counter('detalle_incidencia_errors'),
    },
};

function recordOperation(operation, response) {
    operationMetrics[operation].latency.add(response.timings.duration);
    operationMetrics[operation].requests.add(1);
    operationMetrics[operation].errors.add(response.status === 200 ? 0 : 1);
}

export const options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
    thresholds: {
        checks: ['rate>0.99'],
        http_req_failed: ['rate<0.01'],
        listado_incidencias_latency: ['p(95)<500'],
        busqueda_duplicados_latency: ['p(95)<500'],
        detalle_incidencia_latency: ['p(95)<500'],
    },
    scenarios: {
        listado_incidencias: {
            executor: 'constant-vus',
            vus: 10,
            duration: STAGE_DURATION,
            gracefulStop: '2s',
            exec: 'listadoIncidencias',
        },
        busqueda_duplicados: {
            executor: 'constant-vus',
            vus: 10,
            duration: STAGE_DURATION,
            startTime: `${STAGE_SPACING_SECONDS}s`,
            gracefulStop: '2s',
            exec: 'busquedaDuplicados',
        },
        detalle_incidencia: {
            executor: 'constant-vus',
            vus: 10,
            duration: STAGE_DURATION,
            startTime: `${2 * STAGE_SPACING_SECONDS}s`,
            gracefulStop: '2s',
            exec: 'detalleIncidencia',
        },
    },
};

export function setup() {
    const response = http.get(
        `${BASE_URL}/api/incidents?page=0&size=1&sort=-createdAt`,
        { tags: { operation: 'setup' } },
    );
    if (!check(response, { 'preparación encuentra incidencias': (r) => r.status === 200 })) {
        throw new Error('No se pudo consultar el listado; comprueba que el backend está iniciado.');
    }

    const page = response.json();
    if (!page.content || page.content.length === 0 || !page.content[0].id) {
        throw new Error('No hay incidencias para la prueba. Inicia el backend para que cargue los datos iniciales.');
    }

    return { incidentId: page.content[0].id };
}

export function listadoIncidencias() {
    const response = http.get(
        `${BASE_URL}/api/incidents?page=0&size=20&sort=-createdAt`,
        { tags: { operation: 'listado_incidencias' } },
    );
    recordOperation('listado', response);
    check(response, { 'listado de incidencias responde 200': (r) => r.status === 200 });
    sleep(1);
}

export function busquedaDuplicados() {
    const response = http.get(
        `${BASE_URL}/api/incidents/duplicates?latitude=36.7201&longitude=-4.4214&category=STREET&radiusMeters=50`,
        { tags: { operation: 'busqueda_duplicados' } },
    );
    recordOperation('duplicados', response);
    check(response, { 'búsqueda de duplicados responde 200': (r) => r.status === 200 });
    sleep(1);
}

export function detalleIncidencia(data) {
    const response = http.get(
        `${BASE_URL}/api/incidents/${data.incidentId}`,
        { tags: { operation: 'detalle_incidencia' } },
    );
    recordOperation('detalle', response);
    check(response, { 'detalle de incidencia responde 200': (r) => r.status === 200 });
    sleep(1);
}
