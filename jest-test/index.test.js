const axios = require("axios");

const BACKEND_URL = "http://localhost:5173";
const WebSocket_URL = "http://localhost:3000";

const signUpUser = async (username, password) => {
  const res = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
    username,
    password,
    type: "user",
  });
  return res;
};

const signUpAdmin = async (username, password) => {
  const res = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
    username,
    password,
    type: "admin",
  });
  return res;
};

const signInMethod = async (username, password) => {
  const res = await axios.post(`${BACKEND_URL}/api/v1/auth/signin`, {
    username,
    password,
  });
  return res;
};
describe("Authentication endpoint", () => {
  test("User is able to sign up only once", async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    const res = signUpAdmin(username, password);
    expect(res.status).toBe(200);

    const updatedRes = signUpAdmin(username, password);
    expect(updatedRes.status).toBe(400);
  });

  test("Signup request fails if the username is empty", async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    const res = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
      password,
      type: "admin",
    });
    expect(res.status).toBe(400);
  });

  test("Signin succeeds if the username and password are correct ", async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    signUpAdmin(username, password);

    const res = signInMethod(username, password);
    expect(res.status).toBe(200);
    expect(response.data.token).toBeDefined();
  });

  test("Signin fails if the username and password are incorrect", async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    signUpAdmin(username, password);

    const response = signInMethod("WrongUsername", password);

    expect(response.status).toBe(403);
  });
});

describe("User metadata endpoint", () => {
  let token = "";
  let avtarId = "";
  beforeAll(async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    signUpAdmin(username, password);

    const response = signInMethod(username, password);

    token = response.data.token;

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

describe("User avatar information", () => {
  let userId;
  let avatarId;
  let token;

  beforeAll(async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    const signUpRes = signUpAdmin(username, password);

    userId = signUpRes.data.userId;

    const response = signInMethod(username, password);

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

  test("Get back avatar infomation for a user", async () => {
    const res = await axios.get(
      `${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`
    );

    expect(res.data.avatars.length).toBe(1);
    expect(res.data.avatars[0].userId).toBe(userId);
  });

  test("Available avatars lists the recently created avatar", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
    expect(response.data.avatars.length).not.toBe(0);

    const curAvatar = response.data.avatars.find((x) => x.id == avatarId);
    expect(curAvatar).toBeDefined();
  });
});

describe("Space information", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let userId;
  let userToken;
  let adminId;
  let adminToken;

  beforeAll(async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    const signUpRes = signUpAdmin(username, password);

    adminId = signUpRes.data.userId;

    const response = signInMethod(username, password);

    adminToken = response.data.token;

    const username1 = "Aditya" + Math.random();

    const signUpRes1 = signUpUser(username1, password);

    userId = signUpRes1.data.userId;

    const response1 = signInMethod(username1, password);

    userToken = response1.data.token;

    const resElement1 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const resElement2 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    element1Id = resElement1.data.id;
    element2Id = resElement2.data.id;

    const resMap = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    mapId = resMap.data.id;
  });

  test("User is able to create a space", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(res.data.spaceId).toBeDefined();
  });

  test("User is able to create a space without mapId (empty space)", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(res.data.spaceId).toBeDefined();
  });

  test("Without dimensions and map id user is not able to create a space", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(res.status).toBe(400);
  });

  test("User is not able to delete a space that doesnt exist", async () => {
    const res = await axios.delete(
      `${BACKEND_URL}/api/v1/space/randomSpaceId`,
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(res.status).toBe(400);
  });

  test("User is able to delete a space that does exist", async () => {
    const spaceRes = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const res = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${spaceRes.data.spaceId}`,
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(res.status).toBe(200);
  });
  test("User should not be able to delete a space which is created by other user ", async () => {
    const spaceRes = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const res = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${spaceRes.data.spaceId}`,
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    expect(res.status).toBe(400);
  });

  test("Admin has no spaces initially.", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.data.spaces.length).toBe(0);
  });

  test("Admin has created a spaces should have one space.", async () => {
    const spaceRes = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const res = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });
    const filteredRes = res.spaces.find((x) => x.id == spaceRes.data.spaceId);
    expect(res.data.spaces.length).toBe(1);
    expect(filteredRes).toBeDefined();
  });
});

describe("Arena endpoints", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let userId;
  let userToken;
  let adminId;
  let adminToken;
  let spaceId;

  beforeAll(async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    const signUpRes = signUpAdmin(username, password);
    adminId = signUpRes.data.userId;

    const response = signInMethod(username, password);

    adminToken = response.data.token;

    const username1 = "Aditya" + Math.random();

    const signUpRes1 = signUpUser(username1, password);

    userId = signUpRes1.data.userId;

    const response1 = signInMethod(username1, password);

    userToken = response1.data.token;

    const resElement1 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const resElement2 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    element1Id = resElement1.data.id;
    element2Id = resElement2.data.id;

    const resMap = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    mapId = resMap.data.id;

    const space = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    spaceId = space.data.spaceId;
  });

  test("Incorrect spaceId returns a 400", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/v1/space/123opsdijsoih`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    expect(res.status).toBe(400);
  });
  test("Correct spaceId returns all the elements ", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    expect(res.data.elements.length).toBe(3);
    expect(res.data.dimensions).toBe("100x200");
  });
  test("Delete endpoint is able to delete an element", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    await axios.delete(
      `${BACKEND_URL}/api/v1/space/element`,
      {
        spaceId,
        elementId: res.data.elements[0].id,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    const newRes = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    expect(newRes.data.elements.length).toBe(2);
  });
  test("Adding an element works as expected", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/api/v1/space/${spaceId}`,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 50,
        y: 20,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(res.status).toBe(200);
  });
  test("Adding an element will fails if the element lies outside the dimensions", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/api/v1/space/${spaceId}`,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 50,
        y: 20,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(res.status).toBe(400);
  });
});

describe("Admin endpoints", () => {
  let userId;
  let userToken;
  let adminId;
  let adminToken;

  beforeAll(async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    const signUpRes = signUpAdmin(username, password);

    adminId = signUpRes.data.userId;

    const response = signInMethod(username, password);

    adminToken = response.data.token;

    const username1 = "Aditya" + Math.random();

    const signUpRes1 = signUpUser(username1, password);

    userId = signUpRes1.data.userId;

    const response1 = signInMethod(username1, password);

    userToken = response1.data.token;
  });
  test("User is not able to hit admin endpoints", async () => {
    const resElement = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(resElement.status).toBe(403);

    const resMap = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [],
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(resMap.status).toBe(403);

    const resAvatar = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(resAvatar.status).toBe(403);

    const resUpdateElement = await axios.put(
      `${BACKEND_URL}/api/v1/admin/element/123`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(resUpdateElement.status).toBe(403);
  });
  test("Admin is able to hit admin endpoints", async () => {
    const resElement = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(resElement.status).toBe(403);

    const resMap = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    expect(resMap.status).toBe(403);

    const resAvatar = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    expect(resAvatar.status).toBe(403);
  });
  test("Admin is able to update an element", async () => {
    const resElement = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const resUpdateElement = await axios.put(
      `${BACKEND_URL}/api/v1/admin/element/${resElement.data.id}`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    expect(resUpdateElement.status).toBe(200);
  });
});

describe("WebSocket Tests", () => {
  let adminUserId;
  let adminToken;
  let userId;
  let userToken;
  let mapId;
  let element1Id;
  let element2Id;
  let spaceId;
  let ws1;
  let ws2;
  let ws1Msg = [];
  let ws2Msg = [];
  let userX;
  let userY;
  let adminX;
  let adminY;

  function waitForAndPopLatestMessage(messageArray) {
    return new Promise((r) => {
      if (messageArray.length > 0) {
        resolve(messageArray.shift());
      } else {
        let interval = setTimeout(() => {
          if (messageArray.length > 0) {
            resolve(messageArray.shift());
            clearInterval(interval);
          }
        }, 100);
      }
    });
  }

  async function setUpHTTP() {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    const signUpResponse = signUpAdmin(username, password);

    adminUserId = signUpResponse.data.userId;

    const signInResponse = signInMethod(username, password);

    adminToken = signInResponse.data.token;

    const userSignupRes = signUpUser(username + "-user", password);

    userId = userSignupRes.data.userId;

    const userSignInRes = signInMethod(username + "-user", password);

    userToken = userSignInRes.data.token;

    const resElement1 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const resElement2 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    element1Id = resElement1.data.id;
    element2Id = resElement2.data.id;

    const resMap = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    mapId = resMap.data.id;

    const space = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    spaceId = space.data.spaceId;
  }

  async function setUpWS() {
    ws1 = new WebSocket(WebSocket_URL);

    await new Promise((r) => {
      ws1.onopen = r;
    });
    ws1.onmessage = (event) => {
      ws1Msg.push(JSON.parse(event.data));
    };

    ws2 = new WebSocket(WebSocket_URL);

    await new Promise((r) => {
      ws2.onopen = r;
    });

    
    ws2.onmessage = (event) => {
      ws2Msg.push(JSON.parse(event.data));
    };
  }

  beforeAll(() => {
    setUpHTTP();
    setUpWS();
  });

  test("Get back ack for joining the space", async () => {
    ws1.send(
      JSON.stringify({
        type: "join",
        payload: {
          spaceId: spaceId,
          token: adminToken,
        },
      })
    );

    const message1 = await waitForAndPopLatestMessage(ws1Msg);

    ws2.send(
      JSON.stringify({
        type: "join",
        payload: {
          spaceId: spaceId,
          token: userToken,
        },
      })
    );

    
    const message2 = await waitForAndPopLatestMessage(ws2Msg);
    const message3 = await waitForAndPopLatestMessage(ws1Msg);

    expect(message1.type).toBe("space-joined");
    expect(message1.type).toBe("space-joined");
    expect(message1.payload.users.length).toBe(0);
    expect(message2.payload.users.length).toBe(1);
    expect(message3.type).toBe("user-joined");
    expect(message3.payload.y).toBe(message2.payload.spawn.y);
    expect(message3.payload.userId).toBe(userId);
    expect(message3.payload.x).toBe(message2.payload.spawn.x);

    adminX = message1.payload.spwan.x;
    adminY = message1.payload.spwan.y;
    userX = message2.payload.spwan.x;
    userY = message2.payload.spwan.y;
  });

  test("User should not be able to move across the boundary of the wall", async () => {
    ws1.send(
      JSON.stringify({
        type: "move",
        payload: {
          x: 100000,
          y: 10000,
        },
      })
    );

    const msg = await waitForAndPopLatestMessage(ws1Msg);
    expect(msg.type).toBe("movement-rejected");
    expect(msg.payload.x).toBe(adminX);
    expect(msg.payload.y).toBe(adminY);
  });

  test("User should not be able to move more than two block at the same tym", async () => {
    ws1.send(
      JSON.stringify({
        type: "move",
        payload: {
          x: adminX + 2,
          y: adminY + 3,
        },
      })
    );

    const msg = await waitForAndPopLatestMessage(ws1Msg);
    expect(msg.type).toBe("movement-rejected");
    expect(msg.payload.x).toBe(adminX);
    expect(msg.payload.y).toBe(adminY);
  });
  test("Correct movement should be broadcasted to the other sockets in the room",async () => {
    ws1.send(JSON.stringify({
        type: "move",
        payload: {
            x: adminX + 1,
            y: adminY
        }
    }));

    const message = await waitForAndPopLatestMessage(ws2Msg);
    expect(message.type).toBe("movement")
    expect(message.payload.x).toBe(adminX + 1)
    expect(message.payload.y).toBe(adminY)
})

test("If a user leaves, the other user receives a leave event", async () => {
    ws1.close()
    const message = await waitForAndPopLatestMessage(ws2Msg);
    expect(message.type).toBe("user-left")
    expect(message.payload.userId).toBe(adminUserId)
})
});
