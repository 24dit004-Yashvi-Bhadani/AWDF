const request = require("supertest");
const app = require("../server");

describe("Task Management API", () => {
  test("GET / returns status 201", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Task Manager API is running");
  });
});