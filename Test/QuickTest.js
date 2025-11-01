import http from 'k6/http';
import { check, sleep } from 'k6';

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzBhYmU0NC0wMDMyLTQ4ZDctYTQ4OC02OTc3M2FkMmY5YTUiLCJyb2xlIjoidmVuZG9yIiwiZXhwIjoxNzYxOTg5MTg3fQ.6GkhC3hTm2HL5zP4yTp3K0wYbH0GkaniHvC7BSA5yEM";
const TARGET_URL = "http://localhost/api/users/info";

export const options = {
  stages: [
    { duration: '10s', target: 10 }, 
  ],
  thresholds: {
    'http_req_duration': ['p(95)<3000'], // 95% responses under 3s
    'checks': ['rate>0.95'],             // 95% successful responses
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

  sleep(1);
}
