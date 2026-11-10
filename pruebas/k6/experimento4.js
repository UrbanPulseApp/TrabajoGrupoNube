import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export const options = {
    vus: 15,
    duration: '1m30s',
    thresholds: {
        http_req_duration: ['p(95)<1500'],
    },
};

export default function () {

    group('Búsqueda filtrada y paginada', function () {
        const res = http.get(`${BASE_URL}/api/incidencias?categoria=TRAFICO&page=0&size=20&sort=fechaCreacion,desc`);
        check(res, { 'status es 200': (r) => r.status === 200 });
    });

    
    group('Estadísticas agregadas', function () {
        const res = http.get(`${BASE_URL}/api/incidencias/estadisticas`);
        check(res, { 'status es 200': (r) => r.status === 200 });
    });

    sleep(1);
}