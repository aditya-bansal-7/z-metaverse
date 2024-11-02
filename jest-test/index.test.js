const axios = require("axios");

const BACKEND_URL = "http://localhost:5173";

describe("Authentication endpoint", () => {
  test("User is able to sign up only once", async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    const res = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    expect(res.status).toBe(200);

    const updatedRes = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    expect(updatedRes.status).toBe(400);
  });

  test("Signup request fails if the username is empty", async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    const res = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password,
      type: "admin",
    });
    expect(res.status).toBe(400);
  });

  test("Signin succeeds if the username and password are correct ", async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });
    expect(res.status).toBe(200);
    expect(response.data.token).toBeDefined();
  });

  test("Signin fails if the username and password are incorrect", async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: "WrongUsername",
      password,
    });

    expect(response.status).toBe(403);
  });
});

describe("User metadata endpoint", () => {
  let token = "";
  let avtarId = "";
  beforeAll(async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    token = response.data.token;

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("avatarresponse is " + avatarResponse.data.avatarId);

    avtarId = avatarResponse.data.avatarId;
  });

  test("User cant update their metadata with a wrong avatar id", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId: "123123123",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(400);
  });
  test("User can update their metadata with the right avatar id", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avtarId,
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    expect(response.status).toBe(200);
  });
  test("User is not able to update their metadata if the auth header is not present", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avtarId,
    });
    expect(response.status).toBe(403);
  });
});
