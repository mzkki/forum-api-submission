const pool = require('../../database/postgres/pool');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const LoginUserUseCase = require('../../../Applications/use_case/LoginUserUseCase');

describe('/threads endpoint', () => {
  let threadId;
  beforeEach(async () => {
    const userPayload = {
      username: 'for_test_only',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };

    const threadPayload = {
      title: 'this is title',
      body: 'this is body',
    };

    // eslint-disable-next-line no-undef
    const server = await createServer(container);

    // Action
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: userPayload,
    });

    const userLoginPayload = {
      username: 'for_test_only',
      password: 'secret',
    };
    const loginUserUseCase = container.getInstance(LoginUserUseCase.name);
    const { accessToken } = await loginUserUseCase.execute(userLoginPayload);

    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: threadPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJson = JSON.parse(response.payload);
    threadId = responseJson.data.addedThread.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const userPayload = {
        username: 'for_test_only',
        password: 'secret',
      };
      const loginUserUseCase = container.getInstance(LoginUserUseCase.name);
      const { accessToken } = await loginUserUseCase.execute(userPayload);
      const requestPayload = {
        title: 'this is title',
        body: 'this is body',
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when not contain needed property', async () => {
      const userPayload = {
        username: 'for_test_only',
        password: 'secret',
      };
      const loginUserUseCase = container.getInstance(LoginUserUseCase.name);
      const { accessToken } = await loginUserUseCase.execute(userPayload);
      const requestPayload = {
        title: 'this is title',
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread karena properti yang dibutuhkan tidak terpenuhi');
    });
    it('should response 401 when not given access token', async () => {
      const requestPayload = {
        title: 'title',
        body: 'this is body',
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when payload not meet data type specification', async () => {
      const userPayload = {
        username: 'for_test_only',
        password: 'secret',
      };
      const loginUserUseCase = container.getInstance(LoginUserUseCase.name);
      const { accessToken } = await loginUserUseCase.execute(userPayload);
      const requestPayload = {
        title: 'this is title',
        body: 123,
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and give thread data with comments', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
    });
  });
});
