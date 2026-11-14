import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const USER_EMAIL = __ENV.USER_EMAIL || 'juan.perez@ciudadano.es';
const USER_PASSWORD = __ENV.USER_PASSWORD || 'contrasenasegura123';
const MAP_VUS = Number(__ENV.MAP_VUS || 30);
const SPIKE_RATE = Number(__ENV.SPIKE_RATE || 60);

const metrics = {
    mapa: {
        latency: new Trend('consulta_mapa_latency', true),
        requests: new Counter('consulta_mapa_requests'),
        errors: new Counter('consulta_mapa_errors'),
    },
    creacion: {
        latency: new Trend('creacion_incidencia_latency', true),
        requests: new Counter('creacion_incidencia_requests'),
        errors: new Counter('creacion_incidencia_errors'),
    },
};

export const options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
    scenarios: {
        // Tráfico de fondo: ciudadanos consultando continuamente las incidencias en el mapa
        consulta_mapa: {
            executor: 'constant-vus',
            vus: MAP_VUS,
            duration: '3m30s',
            gracefulStop: '5s',
            exec: 'consultarMapa',
        },
        // Pico repentino de nuevas incidencias por lluvias intensas en Málaga
        pico_incidencias: {
            executor: 'ramping-arrival-rate',
            startRate: 2,
            timeUnit: '1s',
            startTime: '30s',
            preAllocatedVUs: Number(__ENV.PREALLOCATED_VUS || 30),
            maxVUs: Number(__ENV.MAX_VUS || 120),
            stages: [
                { duration: '15s', target: SPIKE_RATE },   // Subida brusca por emergencia
                { duration: '1m15s', target: SPIKE_RATE }, // Mantenimiento del pico
                { duration: '15s', target: 2 },            // Caída de la sobrecarga
                { duration: '1m15s', target: 2 },          // Ventana de recuperación
            ],
            exec: 'crearIncidencia',
        },
    },
    thresholds: {
        checks: ['rate>0.99'],
        http_req_failed: ['rate<0.01'],
        dropped_iterations: ['count==0'],
    },
};

export function setup() {
    // 1. Autenticación para obtener la cookie de sesión JSESSIONID
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

    // 2. Obtener token CSRF asociado a la sesión
    const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`, {
        cookies: { JSESSIONID: sessionId },
        tags: { operation: 'setup_csrf' },
    });

    if (!check(csrfRes, { 'token CSRF obtenido (200)': (r) => r.status === 200 })) {
        throw new Error(`Fallo obteniendo token CSRF (${csrfRes.status})`);
    }

    const xsrfToken = csrfRes.json('token')
        || (csrfRes.cookies['XSRF-TOKEN'] && csrfRes.cookies['XSRF-TOKEN'][0].value);

    if (!xsrfToken) {
        throw new Error('No se pudo extraer el token XSRF-TOKEN.');
    }

    return { sessionId, xsrfToken };
}

export function consultarMapa() {
    const response = http.get(
        `${BASE_URL}/api/incidents?page=0&size=50&sort=-createdAt`,
        { tags: { operation: 'consulta_mapa' } },
    );

    metrics.mapa.latency.add(response.timings.duration);
    metrics.mapa.requests.add(1);
    metrics.mapa.errors.add(response.status === 200 ? 0 : 1);

    check(response, {
        'consulta de mapa responde 200': (r) => r.status === 200,
    });

    sleep(1);
}

export function crearIncidencia(data) {
    // Dispersión geográfica en torno al centro de Málaga
    const latitude = Number((36.7201 + (Math.random() - 0.5) * 0.02).toFixed(6));
    const longitude = Number((-4.4214 + (Math.random() - 0.5) * 0.02).toFixed(6));

    const payload = JSON.stringify({
        title: 'Inundación y alcantarilla obstruida por lluvias',
        description: 'Acumulación de agua en calzada durante episodio de lluvias intensas en Málaga',
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
            tags: { operation: 'creacion_incidencia' },
        },
    );

    const ok = response.status === 201 || response.status === 200;
    metrics.creacion.latency.add(response.timings.duration);
    metrics.creacion.requests.add(1);
    metrics.creacion.errors.add(ok ? 0 : 1);

    if (!ok) {
        console.error(`Error creando incidencia (HTTP ${response.status}): ${response.body}`);
    }

    check(response, {
        'creación de incidencia responde 201': () => ok,
    });
}
