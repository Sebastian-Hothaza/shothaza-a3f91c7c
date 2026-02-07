// Full end-to-end test. Tests the entire flow, from HTTP request to response, including routing, controllers, services, etc.
// This is the highest level of testing and should be the most minimal set of tests, just to verify that the entire system is wired up correctly.

import axios from 'axios';

describe('GET /api/hello', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api/hello`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});
