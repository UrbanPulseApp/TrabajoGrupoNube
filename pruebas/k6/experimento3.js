import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export const options = {
    scenarios: {

        lectura_mapa: {
            executor: 'constant-vus',
            vus: 30,
            duration: '3m',
        },

        pico_incidencias: {
            executor: 'ramping-vus',
            startVUs: 2,
            stages: [
                { duration: '30s', target: 5 },   // Estado normal
                { duration: '15s', target: 100 }, // ¡Pico repentino de alertas!
                { duration: '1m', target: 100 },  // Duración de la tormenta
                { duration: '15s', target: 5 },   // Normalización
            ],
            startTime: '30s',
        },
    },
};

export default function () {

    const resMapa = http.get(`${BASE_URL}/api/incidencias/mapa`);
    check(resMapa, { 'Mapa status 200': (r) => r.status === 200 });


    const payload = JSON.stringify({
        tipo: 'EMERGENCIA_URBANA',
        descripcion: 'Inundación en vía pública por lluvias',
        ubicacion: 'Centro Histórico - Málaga',
    });
    const resPost = http.post(`${BASE_URL}/api/incidencias`, payload, {
        headers: { 'Content-Type': 'application/json' },
    });
    check(resPost, { 'Creación exitosa': (r) => r.status === 201 });

    sleep(0.5);
}