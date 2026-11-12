import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const MODE = __ENV.MODE || 'vus';
const RATE = Number(__ENV.RATE || 10);
const endpoint = `${BASE_URL}/api/incidents?page=0&size=20&sort=-createdAt`;

const vusScenario = {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 25 },
        { duration: '1m', target: 25 },
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 0 },
    ],
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

export const options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
    scenarios: { carga: scenarios[MODE] },
    thresholds: {
        checks: ['rate>0.99'],
        http_req_failed: ['rate<0.01'],
        ...(MODE !== 'vus' ? { dropped_iterations: ['count==0'] } : {}),
    },
};

export default function () {
    const response = http.get(endpoint, { tags: { operation: 'listado_incidencias' } });
    check(response, { 'listado de incidencias responde 200': (r) => r.status === 200 });

    if (MODE === 'vus') {
        sleep(1);
    }
}
