import http from 'k6/http';
import { check, sleep } from 'k6';

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzBhYmU0NC0wMDMyLTQ4ZDctYTQ4OC02OTc3M2FkMmY5YTUiLCJyb2xlIjoidmVuZG9yIiwiZXhwIjoxNzYxOTg5MTg3fQ.6GkhC3hTm2HL5zP4yTp3K0wYbH0GkaniHvC7BSA5yEM";
const TARGET_URL = "http://localhost/api/users/info";

export const options = {
  stages: [
    { duration: '1m', target: 50 },    // moderate load
    { duration: '2m', target: 100 },   // normal operating load
    { duration: '2m', target: 200 },   // stress beyond normal
    { duration: '1m', target: 0 },     // cool down
  ],
  thresholds: {
    'http_req_failed': ['rate<0.1'],  // <10% request failures
    'http_req_duration': ['p(95)<3000'],
  },
};

export default function () {
  const params = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  const res = http.get(TARGET_URL, params);

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
  });

  if (success) {
    check(res, {
      'id exists': (r) => r.json('id') !== undefined,
      'role is vendor': (r) => r.json('role') === 'vendor',
    });
  } else {
    console.error(`Failed with status ${res.status}`);
  }

  sleep(3);
}
