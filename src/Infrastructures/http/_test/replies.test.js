const pool = require('../../database/postgres/pool');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const LoginUserUseCase = require('../../../Applications/use_case/LoginUserUseCase');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');

describe('/threads endpoint', () => {
  let threadId;
  let commentId;
  let replyId;
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

    const replyPayload = {
      content: 'fot test putpose only',
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

    const replyResp = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      payload: replyPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const replyResponseJson = JSON.parse(replyResp.payload);
    replyId = replyResponseJson.data.addedReply.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ReplyTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      const userLoginPayload = {
        username: 'for_test_only',
        password: 'secret',
      };
      const loginUserUseCase = container.getInstance(LoginUserUseCase.name);
      const { accessToken } = await loginUserUseCase.execute(userLoginPayload);

      const replyPayload = {
        content: 'test reply',
      };

      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: replyPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and persisted softdelete the reply', async () => {
      const userLoginPayload = {
        username: 'for_test_only',
        password: 'secret',
      };
      const loginUserUseCase = container.getInstance(LoginUserUseCase.name);
      const { accessToken } = await loginUserUseCase.execute(userLoginPayload);

      const server = await createServer(container);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
