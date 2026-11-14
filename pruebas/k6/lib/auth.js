import http from 'k6/http';
import { check } from 'k6';

export function login(baseUrl, email, password) {
    const loginResponse = http.post(
        `${baseUrl}/api/auth/login`,
        JSON.stringify({ email, password }),
        {
            headers: { 'Content-Type': 'application/json' },
            tags: { operation: 'setup_login' },
        },
    );

    if (!check(loginResponse, { 'login de prueba correcto (200)': (response) => response.status === 200 })) {
        throw new Error(`Fallo en login (${loginResponse.status}): ${loginResponse.body}`);
    }

    const sessionCookie = loginResponse.cookies.JSESSIONID;
    const sessionId = sessionCookie && sessionCookie.length > 0 ? sessionCookie[0].value : null;
    if (!sessionId) {
        throw new Error('No se recibió cookie JSESSIONID tras iniciar sesión.');
    }

    const csrfResponse = http.get(`${baseUrl}/api/auth/csrf`, {
        cookies: { JSESSIONID: sessionId },
        tags: { operation: 'setup_csrf' },
    });
    if (!check(csrfResponse, { 'token CSRF obtenido (200)': (response) => response.status === 200 })) {
        throw new Error(`Fallo obteniendo token CSRF (${csrfResponse.status})`);
    }

    const xsrfToken = csrfResponse.json('token')
        || (csrfResponse.cookies['XSRF-TOKEN'] && csrfResponse.cookies['XSRF-TOKEN'][0].value);
    if (!xsrfToken) {
        throw new Error('No se pudo extraer el token XSRF-TOKEN.');
    }

    return { sessionId, xsrfToken };
}
