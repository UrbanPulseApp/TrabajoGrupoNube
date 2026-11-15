import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { login } from './lib/auth.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const USER_EMAIL = __ENV.USER_EMAIL || 'carlos.rodriguez@urbanpulse.es';
const USER_PASSWORD = __ENV.USER_PASSWORD || 'contrasenasegura123';
const VUS = Number(__ENV.VUS || 15);
const WRITER_VUS = Number(__ENV.WRITER_VUS || 3);
const STAGE_SECONDS = Number(__ENV.STAGE_SECONDS || 60);
const STAGE_DURATION = `${STAGE_SECONDS}s`;
const STAGE_SPACING_SECONDS = STAGE_SECONDS + 5;
const TOTAL_SECONDS = (3 * STAGE_SECONDS) + 10;

if (!Number.isInteger(VUS) || VUS < 1
    || !Number.isInteger(WRITER_VUS) || WRITER_VUS < 1
    || !Number.isInteger(STAGE_SECONDS) || STAGE_SECONDS < 1) {
    throw new Error('VUS, WRITER_VUS y STAGE_SECONDS deben ser enteros positivos.');
}

function startTimeForStage(index) {
    return `${index * STAGE_SPACING_SECONDS}s`;
}

const operationMetrics = {
    filtrada: {
        latency: new Trend('consulta_filtrada_latency', true),
        requests: new Counter('consulta_filtrada_requests'),
        errors: new Counter('consulta_filtrada_errors'),
    },
    paginacion: {
        latency: new Trend('paginacion_profunda_latency', true),
        requests: new Counter('paginacion_profunda_requests'),
        errors: new Counter('paginacion_profunda_errors'),
    },
    analitica: {
        latency: new Trend('consulta_analitica_latency', true),
        requests: new Counter('consulta_analitica_requests'),
        errors: new Counter('consulta_analitica_errors'),
    },
    escritura: {
        latency: new Trend('escritura_incidencia_latency', true),
        requests: new Counter('escritura_incidencia_requests'),
        errors: new Counter('escritura_incidencia_errors'),
    },
    modificacion: {
        latency: new Trend('modificacion_incidencia_latency', true),
        requests: new Counter('modificacion_incidencia_requests'),
        errors: new Counter('modificacion_incidencia_errors'),
    },
};

function record(operation, response, expectedStatuses = [200]) {
    const ok = expectedStatuses.includes(response.status);
    operationMetrics[operation].latency.add(response.timings.duration);
    operationMetrics[operation].requests.add(1);
    operationMetrics[operation].errors.add(ok ? 0 : 1);
    return ok;
}

export const options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
    thresholds: {
        checks: ['rate>0.99'],
        http_req_failed: ['rate<0.01'],
        'consulta_filtrada_latency': ['p(95)<500'],
        'paginacion_profunda_latency': ['p(95)<500'],
        'consulta_analitica_latency': ['p(95)<500'],
        'escritura_incidencia_latency': ['p(95)<500'],
        'modificacion_incidencia_latency': ['p(95)<500'],
    },
    scenarios: {
        consulta_filtrada: {
            executor: 'constant-vus',
            vus: VUS,
            duration: STAGE_DURATION,
            gracefulStop: '2s',
            exec: 'consultaFiltradaOrdenada',
        },
        paginacion_profunda: {
            executor: 'constant-vus',
            vus: VUS,
            duration: STAGE_DURATION,
            startTime: startTimeForStage(1),
            gracefulStop: '2s',
            exec: 'paginacionProfunda',
        },
        consulta_analitica: {
            executor: 'constant-vus',
            vus: VUS,
            duration: STAGE_DURATION,
            startTime: startTimeForStage(2),
            gracefulStop: '2s',
            exec: 'consultaAnalitica',
        },
        escritura_y_modificacion_concurrentes: {
            executor: 'constant-vus',
            vus: WRITER_VUS,
            duration: `${TOTAL_SECONDS}s`,
            gracefulStop: '2s',
            exec: 'escrituraYModificacion',
        },
    },
};

export function setup() {
    return login(BASE_URL, USER_EMAIL, USER_PASSWORD);
}

export function consultaFiltradaOrdenada() {
    const response = http.get(
        `${BASE_URL}/api/incidents?status=REPORTED&category=STREET&page=0&size=20&sort=-createdAt`,
        { tags: { operation: 'consulta_filtrada' } },
    );
    const ok = record('filtrada', response, [200]);
    check(response, { 'consulta filtrada responde 200': () => ok });
    sleep(1);
}

export function paginacionProfunda() {
    const response = http.get(
        `${BASE_URL}/api/incidents?page=50&size=20&sort=-createdAt`,
        { tags: { operation: 'paginacion_profunda' } },
    );
    const ok = record('paginacion', response, [200]);
    check(response, { 'paginación profunda responde 200': () => ok });
    sleep(1);
}

export function consultaAnalitica(data) {
    const response = http.get(`${BASE_URL}/api/analytics/summary`, {
        cookies: { JSESSIONID: data.sessionId },
        tags: { operation: 'consulta_analitica' },
    });
    const ok = record('analitica', response, [200]);
    check(response, { 'consulta analítica responde 200': () => ok });
    sleep(1);
}

export function escrituraYModificacion(data) {
    const latitude = Number((36.7201 + (Math.random() - 0.5) * 0.03).toFixed(6));
    const longitude = Number((-4.4214 + (Math.random() - 0.5) * 0.03).toFixed(6));
    const payload = JSON.stringify({
        title: 'Incidencia de prueba k6 de volumen',
        description: 'Registro para medir creación y modificación concurrentes con consultas.',
        category: 'STREET',
        latitude,
        longitude,
    });

    const createResponse = http.post(`${BASE_URL}/api/incidents`, payload, {
        headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': data.xsrfToken,
        },
        cookies: {
            JSESSIONID: data.sessionId,
            'XSRF-TOKEN': data.xsrfToken,
        },
        tags: { operation: 'escritura_incidencia' },
    });
    const created = record('escritura', createResponse, [201]);
    check(createResponse, { 'creación concurrente responde 201': () => created });

    if (created) {
        const incidentId = createResponse.json('id');
        if (!incidentId) {
            check(createResponse, { 'creación devuelve UUID para modificar': () => false });
        } else {
            const updateResponse = http.patch(
                `${BASE_URL}/api/incidents/${incidentId}`,
                JSON.stringify({ status: 'VALIDATED', reason: 'Cambio de estado generado por prueba k6' }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': data.xsrfToken,
                    },
                    cookies: {
                        JSESSIONID: data.sessionId,
                        'XSRF-TOKEN': data.xsrfToken,
                    },
                    tags: { operation: 'modificacion_incidencia' },
                },
            );
            const updated = record('modificacion', updateResponse, [200]);
            check(updateResponse, { 'modificación de estado responde 200': () => updated });
        }
    }

    sleep(1);
}
