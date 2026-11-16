import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { login } from './lib/auth.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const USER_EMAIL = __ENV.USER_EMAIL || 'juan.perez@ciudadano.es';
const USER_PASSWORD = __ENV.USER_PASSWORD || 'contrasenasegura123';
const MAP_VUS = Number(__ENV.MAP_VUS || 30);
const BASELINE_RATE = Number(__ENV.BASELINE_RATE || 2);
const SPIKE_RATE = Number(__ENV.SPIKE_RATE || 200);
const RECOVERY_RATE = Number(__ENV.RECOVERY_RATE || 2);
const BASELINE_SECONDS = Number(__ENV.BASELINE_SECONDS || 30);
const SPIKE_RAMP_SECONDS = Number(__ENV.SPIKE_RAMP_SECONDS || 15);
const SPIKE_HOLD_SECONDS = Number(__ENV.SPIKE_HOLD_SECONDS || 75);
const RECOVERY_SECONDS = Number(__ENV.RECOVERY_SECONDS || 75);
const PREALLOCATED_VUS = Number(__ENV.PREALLOCATED_VUS || 100);
const SPIKE_PREALLOCATED_VUS = Number(__ENV.SPIKE_PREALLOCATED_VUS || PREALLOCATED_VUS);
const MAX_VUS = Number(__ENV.MAX_VUS || 1500);
const INCLUDE_MAP = __ENV.INCLUDE_MAP !== 'false';
const VARIANT = INCLUDE_MAP ? 'with-map' : 'control';

const PRELUDE_SECONDS = Number(__ENV.PRELUDE_SECONDS || 30);
const SPIKE_START_SECONDS = PRELUDE_SECONDS + BASELINE_SECONDS;
const RECOVERY_START_SECONDS = SPIKE_START_SECONDS + SPIKE_RAMP_SECONDS + SPIKE_HOLD_SECONDS;
const TOTAL_SECONDS = RECOVERY_START_SECONDS + RECOVERY_SECONDS;

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

if (!Number.isInteger(MAP_VUS) || MAP_VUS < 1
    || !Number.isInteger(BASELINE_RATE) || BASELINE_RATE < 1
    || !Number.isInteger(SPIKE_RATE) || SPIKE_RATE <= BASELINE_RATE
    || !Number.isInteger(RECOVERY_RATE) || RECOVERY_RATE < 1
    || !Number.isInteger(BASELINE_SECONDS) || BASELINE_SECONDS < 1
    || !Number.isInteger(SPIKE_RAMP_SECONDS) || SPIKE_RAMP_SECONDS < 1
    || !Number.isInteger(SPIKE_HOLD_SECONDS) || SPIKE_HOLD_SECONDS < 1
    || !Number.isInteger(RECOVERY_SECONDS) || RECOVERY_SECONDS < 1
    || !Number.isInteger(PRELUDE_SECONDS) || PRELUDE_SECONDS < 1
    || !Number.isInteger(PREALLOCATED_VUS) || PREALLOCATED_VUS < 1
    || !Number.isInteger(SPIKE_PREALLOCATED_VUS) || SPIKE_PREALLOCATED_VUS < 1
    || !Number.isInteger(MAX_VUS) || MAX_VUS < Math.max(PREALLOCATED_VUS, SPIKE_PREALLOCATED_VUS)) {
    throw new Error('Revisa los valores de carga y duración del experimento 3.');
}

const scenarios = {};
if (INCLUDE_MAP) {
    scenarios.consulta_mapa = {
        executor: 'constant-vus',
        vus: MAP_VUS,
        duration: `${TOTAL_SECONDS}s`,
        gracefulStop: '5s',
        exec: 'consultarMapa',
        tags: { variant: VARIANT },
    };
}

scenarios.base_creacion = {
    executor: 'constant-arrival-rate',
    rate: BASELINE_RATE,
    timeUnit: '1s',
    duration: `${BASELINE_SECONDS}s`,
    startTime: `${PRELUDE_SECONDS}s`,
    preAllocatedVUs: PREALLOCATED_VUS,
    maxVUs: MAX_VUS,
    exec: 'crearIncidenciaBase',
    tags: { phase: 'pre-pico', variant: VARIANT },
};
scenarios.pico_incidencias = {
    executor: 'ramping-arrival-rate',
    startRate: BASELINE_RATE,
    timeUnit: '1s',
    startTime: `${SPIKE_START_SECONDS}s`,
    preAllocatedVUs: SPIKE_PREALLOCATED_VUS,
    maxVUs: MAX_VUS,
    stages: [
        { duration: `${SPIKE_RAMP_SECONDS}s`, target: SPIKE_RATE },
        { duration: `${SPIKE_HOLD_SECONDS}s`, target: SPIKE_RATE },
    ],
    exec: 'crearIncidenciaPico',
    tags: { phase: 'pico', variant: VARIANT },
};
scenarios.recuperacion = {
    executor: 'constant-arrival-rate',
    rate: RECOVERY_RATE,
    timeUnit: '1s',
    duration: `${RECOVERY_SECONDS}s`,
    startTime: `${RECOVERY_START_SECONDS}s`,
    preAllocatedVUs: PREALLOCATED_VUS,
    maxVUs: MAX_VUS,
    exec: 'crearIncidenciaRecuperacion',
    tags: { phase: 'recuperacion', variant: VARIANT },
};

const thresholds = {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    dropped_iterations: ['count==0'],
    'creacion_incidencia_latency{phase:pre-pico}': ['p(95)<500'],
    'creacion_incidencia_latency{phase:pico}': ['p(95)<500'],
    'creacion_incidencia_latency{phase:recuperacion}': ['p(95)<500'],
};
if (INCLUDE_MAP) {
    thresholds['consulta_mapa_latency{phase:pre-pico}'] = ['p(95)<500'];
    thresholds['consulta_mapa_latency{phase:pico}'] = ['p(95)<500'];
    thresholds['consulta_mapa_latency{phase:recuperacion}'] = ['p(95)<500'];
}

export const options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
    scenarios,
    thresholds,
};

export function setup() {
    // t0 marks the start of the scenarios so map requests can be assigned to the creation phase running at that time.
    return { ...login(BASE_URL, USER_EMAIL, USER_PASSWORD), t0: Date.now() };
}

// The prelude counts as pre-pico: no creation load is applied yet.
function phaseAt(t0) {
    const elapsedSeconds = (Date.now() - t0) / 1000;
    if (elapsedSeconds < SPIKE_START_SECONDS) return 'pre-pico';
    if (elapsedSeconds < RECOVERY_START_SECONDS) return 'pico';
    return 'recuperacion';
}

export function consultarMapa(data) {
    const phase = phaseAt(data.t0);
    const tags = { phase, variant: VARIANT };
    const response = http.get(
        `${BASE_URL}/api/incidents?page=0&size=50&sort=-createdAt`,
        { tags: { operation: 'consulta_mapa', ...tags } },
    );

    metrics.mapa.latency.add(response.timings.duration, tags);
    metrics.mapa.requests.add(1, tags);
    metrics.mapa.errors.add(response.status === 200 ? 0 : 1, tags);
    check(response, { 'consulta de mapa responde 200': (r) => r.status === 200 });
    sleep(1);
}

export function crearIncidenciaBase(data) {
    crearIncidencia(data, 'pre-pico');
}

export function crearIncidenciaPico(data) {
    crearIncidencia(data, 'pico');
}

export function crearIncidenciaRecuperacion(data) {
    crearIncidencia(data, 'recuperacion');
}

function crearIncidencia(data, phase) {
    const latitude = Number((36.7201 + (Math.random() - 0.5) * 0.02).toFixed(6));
    const longitude = Number((-4.4214 + (Math.random() - 0.5) * 0.02).toFixed(6));
    const payload = JSON.stringify({
        title: `Incidencia k6 ${VARIANT} ${phase}`,
        description: 'Registro generado para evaluar el pico de incidencias urbanas.',
        category: 'STREET',
        latitude,
        longitude,
    });

    const response = http.post(`${BASE_URL}/api/incidents`, payload, {
        headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': data.xsrfToken,
        },
        cookies: {
            JSESSIONID: data.sessionId,
            'XSRF-TOKEN': data.xsrfToken,
        },
        tags: { operation: 'creacion_incidencia', phase, variant: VARIANT },
    });

    const ok = response.status === 201;
    const tags = { phase, variant: VARIANT };
    metrics.creacion.latency.add(response.timings.duration, tags);
    metrics.creacion.requests.add(1, tags);
    metrics.creacion.errors.add(ok ? 0 : 1, tags);
    check(response, { 'creación de incidencia responde 201': () => ok });
}
