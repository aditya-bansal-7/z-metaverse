const axios2 = require("axios");

const WebSocket = require("ws");

const BACKEND_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:3001";
const axios = {
  post: async (...args) => {
    try {
      const res = await axios2.post(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  get: async (...args) => {
    try {
      const res = await axios2.get(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  put: async (...args) => {
    try {
      const res = await axios2.put(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  delete: async (...args) => {
    try {
      const res = await axios2.delete(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
};
const signUpUser = async (username, password) => {
  const res = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
    username,
    password,
    type: "user",
  });
  return res;
};

const signUpAdmin = async (username, password) => {
  const url = `${BACKEND_URL}/api/v1/auth/signup`
  
  const res = await axios.post(url, {
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

// skip below tests for now

describe.skip("Authentication endpoint", () => {
  test("User is able to sign up only once", async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    const res = await signUpAdmin(username, password);
    expect(res.status).toBe(200);

    const updatedRes = await signUpAdmin(username, password);
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

    await signUpAdmin(username, password);

    const res = await signInMethod(username, password);
    expect(res.status).toBe(200);
    expect(res.data.token).toBeDefined();
  });

  test("Signin fails if the username and password are incorrect", async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    await signUpAdmin(username, password);

    const response = await signInMethod("WrongUsername", password);

    expect(response.status).toBe(403);
  });
});

describe.skip("User metadata endpoint", () => {
  let token = "";
  let avtarId = "";
  beforeAll(async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    await signUpAdmin(username, password);

    const response = await signInMethod(username, password);

    token = response.data.token;

    // need to create a admin end point to get the avatar id

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        name: "Timmy",
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } 
    );
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
        avatarId : avtarId,
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

describe.skip("User avatar information", () => {
  let userId;
  let avatarId;
  let token;

  beforeAll(async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    const signUpRes = await signUpAdmin(username, password);

    userId = signUpRes.data.userId;

    const response = await signInMethod(username, password);

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

    avatarId = avatarResponse.data.avatarId;

    await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId,
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
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

describe.skip("Space information", () => {
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

    const signUpRes = await signUpAdmin(username, password);

    adminId = signUpRes.data.userId;

    const response = await signInMethod(username, password);

    adminToken = response.data.token;

    const username1 = "Aditya" + Math.random();

    const signUpRes1 = await signUpUser(username1, password);

    userId = signUpRes1.data.userId;

    const response1 = await signInMethod(username1, password);

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
    expect(res.status).toBe(403);
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
    const filteredRes = res.data.spaces.find((x) => x.id == spaceRes.data.spaceId);
    expect(res.data.spaces.length).toBe(1);
    expect(filteredRes).toBeDefined();
  });
});

describe.skip("Arena endpoints", () => {
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

    const signUpRes = await signUpAdmin(username, password);
    adminId = signUpRes.data.userId;

    const response = await signInMethod(username, password);

    adminToken = response.data.token;

    const username1 = "Aditya" + Math.random();

    const signUpRes1 = await signUpUser(username1, password);

    userId = signUpRes1.data.userId;

    const response1 = await signInMethod(username1, password);

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
    await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      data: {
        id: res.data.elements[0].id,
      },
    });    
    const newRes = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    expect(newRes.data.elements.length).toBe(2);
  });
  test("Adding an element works as expected", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/api/v1/space/element`,
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
      `${BACKEND_URL}/api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 500,
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

describe.skip("Admin endpoints", () => {
  let userId;
  let userToken;
  let adminId;
  let adminToken;

  beforeAll(async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    const signUpRes = await signUpAdmin(username, password);

    adminId = signUpRes.data.userId;

    const response = await signInMethod(username, password);

    adminToken = response.data.token;

    const username1 = "Aditya" + Math.random();

    const signUpRes1 = await signUpUser(username1, password);

    userId = signUpRes1.data.userId;

    const response1 = await signInMethod(username1, password);

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

    expect(resElement.status).toBe(200);

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
    expect(resMap.status).toBe(200);

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
    expect(resAvatar.status).toBe(200);
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
describe("Websocket tests", () => {
  let adminToken;
  let adminUserId;
  let userToken;
  let adminId;
  let userId;
  let mapId;
  let element1Id;
  let element2Id;
  let spaceId;
  let ws1; 
  let ws2;
  let ws1Messages = []
  let ws2Messages = []
  let userX;
  let userY;
  let adminX;
  let adminY;

  function waitForAndPopLatestMessage(messageArray) {
      return new Promise(resolve => {
          if (messageArray.length > 0) {
              resolve(messageArray.shift())
          } else {
              let interval = setInterval(() => {
                  if (messageArray.length > 0) {
                      resolve(messageArray.shift())
                      clearInterval(interval)
                  }
              }, 100)
          }
      })
  }

  async function setupHTTP() {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";
      const adminSignupResponse = await signUpAdmin(username, password);

      const adminSigninResponse = await signInMethod(username, password);
      
      adminUserId = adminSignupResponse.data.userId;
      adminToken = adminSigninResponse.data.token;
      
      const userSignupResponse = await signUpUser(username + `-user`, password);

      const userSigninResponse = await signInMethod(username + `-user`, password);

      userId = userSignupResponse.data.userId
      userToken = userSigninResponse.data.token
      const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
          "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
          "width": 1,
          "height": 1,
        "static": true
      }, {
          headers: {
              authorization: `Bearer ${adminToken}`
          }
      });

      const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
          "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
          "width": 1,
          "height": 1,
        "static": true
      }, {
          headers: {
              authorization: `Bearer ${adminToken}`
          }
      })
      element1Id = element1Response.data.id
      element2Id = element2Response.data.id

      const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
          "thumbnail": "https://thumbnail.com/a.png",
          "dimensions": "100x200",
          "name": "Defaul space",
          "defaultElements": [{
                  elementId: element1Id,
                  x: 20,
                  y: 20
              }, {
                elementId: element1Id,
                  x: 18,
                  y: 20
              }, {
                elementId: element2Id,
                  x: 19,
                  y: 20
              }
          ]
       }, {
          headers: {
              authorization: `Bearer ${adminToken}`
          }
       })
       mapId = mapResponse.data.id

      const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
          "name": "Test",
          "dimensions": "100x200",
          "mapId": mapId
      }, {headers: {
          "authorization": `Bearer ${userToken}`
      }})

      spaceId = spaceResponse.data.spaceId
  }
  async function setupWs() {
      ws1 = new WebSocket(WS_URL)

      ws1.onmessage = (event) => {          
          ws1Messages.push(JSON.parse(event.data))
      }
      await new Promise(r => {
        ws1.onopen = r
      })

      ws2 = new WebSocket(WS_URL)

      ws2.onmessage = (event) => {
          ws2Messages.push(JSON.parse(event.data))
      }
      await new Promise(r => {
          ws2.onopen = r  
      })
  }
  
  beforeAll(async () => {
      await setupHTTP()
      await setupWs()
  })

  test("Get back ack for joining the space", async () => {
      ws1.send(JSON.stringify({
          "type": "join",
          "payload": {
              "spaceId": spaceId,
              "token": adminToken
          }
      }))
      const message1 = await waitForAndPopLatestMessage(ws1Messages);
      ws2.send(JSON.stringify({
          "type": "join",
          "payload": {
              "spaceId": spaceId,
              "token": userToken
          }
      }))

      const message2 = await waitForAndPopLatestMessage(ws2Messages);
      const message3 = await waitForAndPopLatestMessage(ws1Messages);

      expect(message1.type).toBe("space-joined")
      expect(message2.type).toBe("space-joined")
      expect(message1.payload.users.length).toBe(0)
      expect(message2.payload.users.length).toBe(1)
      expect(message3.type).toBe("user-joined");
      expect(message3.payload.x).toBe(message2.payload.spawn.x);
      expect(message3.payload.y).toBe(message2.payload.spawn.y);
      expect(message3.payload.userId).toBe(userId);

      adminX = message1.payload.spawn.x
      adminY = message1.payload.spawn.y

      userX = message2.payload.spawn.x
      userY = message2.payload.spawn.y
  })

  test("User should not be able to move across the boundary of the wall", async () => {
      ws1.send(JSON.stringify({
          type: "move",
          payload: {
              x: 1000000,
              y: 10000
          }
      }));

      const message = await waitForAndPopLatestMessage(ws1Messages);
      expect(message.type).toBe("movement-rejected")
      expect(message.payload.x).toBe(adminX)
      expect(message.payload.y).toBe(adminY)
  })

  test("User should not be able to move two blocks at the same time", async () => {
      ws1.send(JSON.stringify({
          type: "move",
          payload: {
              x: adminX + 2,
              y: adminY
          }
      }));

      const message = await waitForAndPopLatestMessage(ws1Messages);
      expect(message.type).toBe("movement-rejected")
      expect(message.payload.x).toBe(adminX)
      expect(message.payload.y).toBe(adminY)
  })

  test("Correct movement should be broadcasted to the other sockets in the room",async () => {
      ws1.send(JSON.stringify({
          type: "move",
          payload: {
              x: adminX + 1,
              y: adminY,
              userId: adminId
          }
      }));

      const message = await waitForAndPopLatestMessage(ws2Messages);
      expect(message.type).toBe("movement")
      expect(message.payload.x).toBe(adminX + 1)
      expect(message.payload.y).toBe(adminY)
  })

  test("If a user leaves, the other user receives a leave event", async () => {
      ws1.close()
      const message = await waitForAndPopLatestMessage(ws2Messages);
      expect(message.type).toBe("user-left")
      expect(message.payload.userId).toBe(adminUserId)
  })
})