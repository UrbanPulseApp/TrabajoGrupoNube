import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const MODE = __ENV.MODE || 'vus';
const RATE = Number(__ENV.RATE || 10);
const VUS_LEVELS = (__ENV.VUS_LEVELS || '10,25,50,100').split(',').map(Number);
const RAMP_SECONDS = Number(__ENV.RAMP_SECONDS || 30);
const HOLD_SECONDS = Number(__ENV.HOLD_SECONDS || 60);
const SLEEP_SECONDS = Number(__ENV.SLEEP_SECONDS ?? 1);
const VUS_STAGES = VUS_LEVELS.flatMap((target) => [
    { duration: `${RAMP_SECONDS}s`, target },
    { duration: `${HOLD_SECONDS}s`, target },
]);
VUS_STAGES.push({ duration: `${RAMP_SECONDS}s`, target: 0 });
const endpoint = `${BASE_URL}/api/incidents?page=0&size=20&sort=-createdAt`;

const vusScenario = {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: VUS_STAGES,
};

const constantRateScenario = {
    executor: 'constant-arrival-rate',
    rate: RATE,
    timeUnit: '1s',
    duration: __ENV.DURATION || '1m',
    preAllocatedVUs: Number(__ENV.PREALLOCATED_VUS || 25),
    maxVUs: Number(__ENV.MAX_VUS || 100),
};

const rampingRateScenario = {
    executor: 'ramping-arrival-rate',
    startRate: 10,
    timeUnit: '1s',
    preAllocatedVUs: Number(__ENV.PREALLOCATED_VUS || 25),
    maxVUs: Number(__ENV.MAX_VUS || 100),
    stages: [
        { duration: '1m', target: 10 },
        { duration: '1m', target: 25 },
        { duration: '1m', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 0 },
    ],
};

const scenarios = {
    vus: vusScenario,
    constant: constantRateScenario,
    ramping: rampingRateScenario,
};

if (!scenarios[MODE]) {
    throw new Error(`MODE debe ser vus, constant o ramping; recibido: ${MODE}`);
}
if (VUS_LEVELS.some((vus) => !Number.isInteger(vus) || vus < 1)
    || !Number.isInteger(RAMP_SECONDS) || RAMP_SECONDS < 1
    || !Number.isInteger(HOLD_SECONDS) || HOLD_SECONDS < 1
    || !Number.isFinite(SLEEP_SECONDS) || SLEEP_SECONDS < 0
    || !Number.isFinite(RATE) || RATE < 1) {
    throw new Error('VUS_LEVELS, RATE, RAMP_SECONDS, HOLD_SECONDS y SLEEP_SECONDS deben tener valores válidos.');
}

export const options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
    scenarios: { carga: scenarios[MODE] },
    thresholds: {
        checks: ['rate>0.99'],
        http_req_failed: ['rate<0.01'],
        'http_req_duration{operation:listado_incidencias}': ['p(95)<500'],
        ...(MODE !== 'vus' ? { dropped_iterations: ['count==0'] } : {}),
    },
};

export default function () {
    const response = http.get(endpoint, { tags: { operation: 'listado_incidencias' } });
    check(response, { 'listado de incidencias responde 200': (r) => r.status === 200 });

    if (MODE === 'vus' && SLEEP_SECONDS > 0) {
        sleep(SLEEP_SECONDS);
    }
}
