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

describe("User avatar information", () => {
  let userId;
  let avatarId;
  let token;

  beforeAll(async () => {
    const username = "Aditya" + Math.random();
    const password = "Pass@123";

    const signUpRes = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    userId = signUpRes.data.userId;

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

    const signUpRes = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    adminId = signUpRes.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    adminToken = response.data.token;

    const username1 = "Aditya" + Math.random();
    const password1 = "Pass@123";

    const signUpRes1 = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username1,
      password1,
      type: "user",
    });

    userId = signUpRes1.data.userId;

    const response1 = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username1,
      password1,
    });

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

    const resMap = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": [{
          elementId: element1Id,
          x: 20,
          y: 20
        }, {
          elementId: element1Id,
          x: 18,
          y: 20
        } ,
        {
          elementId: element2Id,
          x: 19,
          y: 20
        }
      ]
   },{
    headers:{
      authorization: `Bearer ${adminToken}`
    }
   })
    mapId = resMap.data.id;
  });

  test("User is able to create a space", async () => {
    const res = await axios.post(`${BACKEND_URL}/api/v1/space` ,{
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
    },
    {
      headers:{
        authorization: `Bearer ${userToken}`
      }
    }
  )

    expect(res.data.spaceId).toBeDefined();
  })

  test("User is able to create a space without mapId (empty space)", async () => {
    const res = await axios.post(`${BACKEND_URL}/api/v1/space` ,{
      "name": "Test",
      "dimensions": "100x200",
    },{
      headers:{
        authorization: `Bearer ${userToken}`
      }
    })

    expect(res.data.spaceId).toBeDefined();

  })

  test("Without dimensions and map id user is not able to create a space", async () => {
      const res = await axios.post(`${BACKEND_URL}/api/v1/space` ,{
        "name": "Test",
      },{
        headers:{
          authorization: `Bearer ${userToken}`
        }
      })
      
      expect(res.status).toBe(400);
  })

  test("User is not able to delete a space that doesnt exist", async () => {
      const res = await axios.delete(`${BACKEND_URL}/api/v1/space/randomSpaceId`,{
        headers:{
          authorization: `Bearer ${userToken}`
        }
      })
      expect(res.status).toBe(400);
  })

  test("User is able to delete a space that does exist", async () => {
    const spaceRes = await axios.post(`${BACKEND_URL}/api/v1/space` ,{
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
    },{
      headers:{
        authorization: `Bearer ${userToken}`
      }
    })

      const res = await axios.delete(`${BACKEND_URL}/api/v1/space/${spaceRes.data.spaceId}`,{
        headers:{
          authorization: `Bearer ${userToken}`
        }
      })
      expect(res.status).toBe(200);
  })
  test("User should not be able to delete a space which is created by other user " , async () => {
    const spaceRes = await axios.post(`${BACKEND_URL}/api/v1/space` ,{
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
    },{
      headers:{
        authorization: `Bearer ${userToken}`
      }
    })

      const res = await axios.delete(`${BACKEND_URL}/api/v1/space/${spaceRes.data.spaceId}`,{
        headers:{
          authorization: `Bearer ${adminToken}`
        }
      })
      expect(res.status).toBe(400);
  })

  test("Admin has no spaces initially." , async () => {
    const res = await axios.get(`${BACKEND_URL}/api/v1/space/all` , {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    })
    expect(res.data.spaces.length).toBe(0);
  })

  test("Admin has created a spaces should have one space." , async () => {
    const spaceRes = await axios.post(`${BACKEND_URL}/api/v1/space` ,{
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
    },
    {
      headers:{
        authorization: `Bearer ${adminToken}`
      }
    }
  )
    

    const res = await axios.get(`${BACKEND_URL}/api/v1/space/all` , {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    })
    const filteredRes = res.spaces.find(x => x.id == spaceRes.data.spaceId);
    expect(res.data.spaces.length).toBe(1);
    expect(filteredRes).toBeDefined();
  })
})
