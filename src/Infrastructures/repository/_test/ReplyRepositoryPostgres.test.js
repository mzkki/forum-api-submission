const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');
const pool = require('../../database/postgres/pool');

// exceptions
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

// data support purpose
// user data
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

// thread data
const ThreadsTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const AddThread = require('../../../Domains/threads/entites/AddThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

// comment data
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    const fakeIdGenerator = () => '213';
    const userPayload = new RegisterUser({
      username: 'test_purpose_only',
      fullname: 'for testing',
      password: 'test',
    });
    const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
    await userRepositoryPostgres.addUser(userPayload);

    const threadPayload = new AddThread({
      title: 'thread test',
      body: 'body thread',
      owner: 'user-213',
    });

    const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
    await threadRepositoryPostgres.addThread(threadPayload);

    const commentPayload = new AddComment({
      content: 'comment content',
      owner: 'user-213',
      threadId: 'thread-213',
    });

    const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
    await commentRepositoryPostgres.addComment(commentPayload);
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ReplyTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return addedReply correctly', async () => {
      const replyPayload = new AddReply({
        content: 'this is reply',
        owner: 'user-213',
        threadId: 'thread-213',
        commentId: 'comment-213',
      });

      const fakeIdGenerator = () => '123';

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      await replyRepositoryPostgres.addReply(replyPayload);

      const reply = await ReplyTableTestHelper.findReplyById('reply-123');
      expect(reply).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      const replyPayload = new AddReply({
        content: 'this is reply',
        owner: 'user-213',
        threadId: 'thread-213',
        commentId: 'comment-213',
      });

      const fakeIdGenerator = () => '123';

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      const addedReply = await replyRepositoryPostgres.addReply(replyPayload);

      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'this is reply',
        owner: 'user-213',
      }));
    });
  });

  describe('getRepliesFromThread', () => {
    it('should return thread\'s replies comment correctly', async () => {
      await ReplyTableTestHelper.addReply({
        id: 'reply-444',
        content: 'this is comment reply',
        owner: 'user-213',
        commentId: 'comment-213',
        isDelete: true,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      const threadComments = await replyRepositoryPostgres.getRepliesFromThread('thread-213');
      expect(threadComments).toStrictEqual([
        {
          id: 'reply-444',
          username: 'test_purpose_only',
          content: 'this is comment reply',
          date: new Date('2023-08-17T00:00:00.000Z').toISOString(),
          is_delete: true,
          comment_id: 'comment-213',
        },
      ]);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw NotFoundError if reply not available', async () => {
      const replyRepository = new ReplyRepositoryPostgres(pool);
      const payload = {
        replyId: 'comment',
        owner: 'user-123',
      };

      await expect(replyRepository.verifyReplyOwner(payload))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if it wasn\'t the reply owner', async () => {
      const replyRepository = new ReplyRepositoryPostgres(pool);
      const reply = {
        content: 'test',
        owner: 'user-213',
        threadId: 'thread-213',
        commentId: 'comment-213',
      };
      await ReplyTableTestHelper.addReply(reply);

      const payload = {
        replyId: 'reply-123',
        owner: 'user-123',
      };

      await expect(replyRepository.verifyReplyOwner(payload))
        .rejects
        .toThrow(AuthorizationError);
    });

    it('should not throw NotFoundError and AuthorizationError if reply are verified', async () => {
      const replyRepository = new ReplyRepositoryPostgres(pool);
      const reply = {
        content: 'test',
        owner: 'user-213',
        threadId: 'thread-213',
        commentId: 'comment-213',
      };
      await ReplyTableTestHelper.addReply(reply);

      const payload = {
        replyId: 'reply-123',
        owner: 'user-213',
      };

      await expect(replyRepository.verifyReplyOwner(payload))
        .resolves
        .not.toThrow(NotFoundError);
      await expect(replyRepository.verifyReplyOwner(payload))
        .resolves
        .not.toThrow(AuthorizationError);
    });
  });

  describe('softDeleteReply', () => {
    it('should persist implement soft delete to reply, is update must be true', async () => {
      const replyRepository = new ReplyRepositoryPostgres(pool);
      const reply = {
        content: 'test',
        owner: 'user-213',
        threadId: 'thread-213',
        commentId: 'comment-213',
      };
      await ReplyTableTestHelper.addReply(reply);

      const replyId = 'reply-123';
      await replyRepository.softDeleteReply(replyId);
      const replyAfterDelete = await ReplyTableTestHelper.findReplyById(replyId);

      expect(replyAfterDelete[0].is_delete).toEqual(true);
    });
  });
});
