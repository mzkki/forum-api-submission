const pool = require('../../database/postgres/pool');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const LoginUserUseCase = require('../../../Applications/use_case/LoginUserUseCase');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  let threadId;
  let commentId;
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

    const commentPayload = {
      content: 'for test purpose',
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

    const commentResp = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: commentPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const commentResponseJson = JSON.parse(commentResp.payload);
    commentId = commentResponseJson.data.addedComment.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      const userLoginPayload = {
        username: 'for_test_only',
        password: 'secret',
      };
      const loginUserUseCase = container.getInstance(LoginUserUseCase.name);
      const { accessToken } = await loginUserUseCase.execute(userLoginPayload);

      const commentPayload = {
        content: 'test comment',
      };

      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and persisted softdelete the comment', async () => {
      const userLoginPayload = {
        username: 'for_test_only',
        password: 'secret',
      };
      const loginUserUseCase = container.getInstance(LoginUserUseCase.name);
      const { accessToken } = await loginUserUseCase.execute(userLoginPayload);

      const server = await createServer(container);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
