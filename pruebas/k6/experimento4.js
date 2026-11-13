import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const USER_EMAIL = __ENV.USER_EMAIL || 'juan.perez@ciudadano.es';
const USER_PASSWORD = __ENV.USER_PASSWORD || 'contrasenasegura123';
const VUS = Number(__ENV.VUS || 15);
const STAGE_DURATION = __ENV.DURATION || '1m';

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
    agregada: {
        latency: new Trend('consulta_opendata_latency', true),
        requests: new Counter('consulta_opendata_requests'),
        errors: new Counter('consulta_opendata_errors'),
    },
    escritura: {
        latency: new Trend('escritura_incidencia_latency', true),
        requests: new Counter('escritura_incidencia_requests'),
        errors: new Counter('escritura_incidencia_errors'),
    },
};

function record(op, response, expectedStatuses = [200]) {
    const ok = expectedStatuses.includes(response.status);
    operationMetrics[op].latency.add(response.timings.duration);
    operationMetrics[op].requests.add(1);
    operationMetrics[op].errors.add(ok ? 0 : 1);
    return ok;
}

export const options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
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
            startTime: '1m5s',
            gracefulStop: '2s',
            exec: 'paginacionProfunda',
        },
        consulta_opendata: {
            executor: 'constant-vus',
            vus: VUS,
            duration: STAGE_DURATION,
            startTime: '2m10s',
            gracefulStop: '2s',
            exec: 'consultaOpenData',
        },
        escritura_concurrente: {
            executor: 'constant-vus',
            vus: VUS,
            duration: STAGE_DURATION,
            startTime: '3m15s',
            gracefulStop: '2s',
            exec: 'escrituraConcurrente',
        },
    },
};

export function setup() {
    const loginRes = http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify({ email: USER_EMAIL, password: USER_PASSWORD }),
        {
            headers: { 'Content-Type': 'application/json' },
            tags: { operation: 'setup_login' },
        },
    );

    if (!check(loginRes, { 'login de prueba correcto (200)': (r) => r.status === 200 })) {
        throw new Error(`Fallo en login (${loginRes.status}): ${loginRes.body}`);
    }

    const sessionCookie = loginRes.cookies['JSESSIONID'];
    const sessionId = sessionCookie && sessionCookie.length > 0 ? sessionCookie[0].value : null;
    if (!sessionId) {
        throw new Error('No se recibió cookie JSESSIONID tras iniciar sesión.');
    }

    const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`, {
        cookies: { JSESSIONID: sessionId },
        tags: { operation: 'setup_csrf' },
    });

    if (!check(csrfRes, { 'token CSRF obtenido (200)': (r) => r.status === 200 })) {
        throw new Error(`Fallo obteniendo token CSRF (${csrfRes.status})`);
    }

    const xsrfToken = csrfRes.json('token')
        || (csrfRes.cookies['XSRF-TOKEN'] && csrfRes.cookies['XSRF-TOKEN'][0].value);

    return { sessionId, xsrfToken };
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

export function consultaOpenData() {
    const response = http.get(
        `${BASE_URL}/api/opendata/incidents`,
        { tags: { operation: 'consulta_opendata' } },
    );
    const ok = record('agregada', response, [200]);
    check(response, { 'consulta opendata responde 200': () => ok });
    sleep(1);
}

export function escrituraConcurrente(data) {
    const latitude = Number((36.7201 + (Math.random() - 0.5) * 0.03).toFixed(6));
    const longitude = Number((-4.4214 + (Math.random() - 0.5) * 0.03).toFixed(6));

    const payload = JSON.stringify({
        title: 'Incidencia de prueba de volumen',
        description: 'Registro generado para evaluar coste de inserción e índices en PostgreSQL',
        category: 'STREET',
        latitude,
        longitude,
    });

    const response = http.post(
        `${BASE_URL}/api/incidents`,
        payload,
        {
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': data.xsrfToken,
            },
            cookies: {
                JSESSIONID: data.sessionId,
                'XSRF-TOKEN': data.xsrfToken,
            },
            tags: { operation: 'escritura_concurrente' },
        },
    );
    const ok = record('escritura', response, [200, 201]);
    check(response, { 'escritura responde 201': () => ok });
    sleep(1);
}