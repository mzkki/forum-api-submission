const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');

// data support purpose
// user data
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

// thread data
const ThreadsTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const AddThread = require('../../../Domains/threads/entites/AddThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommmentRepositoryPostgres', () => {
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
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return addedComment correctly', async () => {
      const commentPayload = new AddComment({
        content: 'this is comment',
        owner: 'user-213',
        threadId: 'thread-213',
      });

      const fakeIdGenerator = () => '123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(commentPayload);

      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      const commentPayload = new AddComment({
        content: 'this is comment',
        owner: 'user-213',
        threadId: 'thread-213',
      });

      const fakeIdGenerator = () => '123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const addedComment = await commentRepositoryPostgres.addComment(commentPayload);

      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'this is comment',
        owner: 'user-213',
      }));
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError if comment not available', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool);
      const payload = {
        commentId: 'comment',
        owner: 'user-123',
      };

      await expect(commentRepository.verifyCommentOwner(payload))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if it wasn\'t the comment owner', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool);
      const comment = {
        content: 'test',
        owner: 'user-213',
        threadId: 'thread-213',
      };
      await CommentsTableTestHelper.addComment(comment);

      const payload = {
        commentId: 'comment-123',
        owner: 'user-123',
      };

      await expect(commentRepository.verifyCommentOwner(payload))
        .rejects
        .toThrow(AuthorizationError);
    });

    it('should not throw NotFoundError and AuthorizationError if comment are verified', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool);
      const comment = {
        content: 'test',
        owner: 'user-213',
        threadId: 'thread-213',
      };
      await CommentsTableTestHelper.addComment(comment);

      const payload = {
        commentId: 'comment-123',
        owner: 'user-213',
      };

      await expect(commentRepository.verifyCommentOwner(payload))
        .resolves
        .not.toThrow(NotFoundError);
      await expect(commentRepository.verifyCommentOwner(payload))
        .resolves
        .not.toThrow(AuthorizationError);
    });
  });

  describe('softDeleteComment', () => {
    it('should persist implement soft delete to comments, is update must be true', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool);
      const comment = {
        content: 'test',
        owner: 'user-213',
        threadId: 'thread-213',
      };
      await CommentsTableTestHelper.addComment(comment);

      const commentId = 'comment-123';
      await commentRepository.softDeleteComment(commentId);
      const commentAfterDelete = await CommentsTableTestHelper.findCommentById(commentId);

      expect(commentAfterDelete[0].is_delete).toEqual(true);
    });
  });

  describe('getCommentsFromThread', () => {
    it('should return thread\'s comments correctly', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-444',
        content: 'this is comment content',
        owner: 'user-213',
        threadId: 'thread-213',
        isDelete: true,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      const threadComments = await commentRepositoryPostgres.getCommentsFromThread('thread-213');
      expect(threadComments).toStrictEqual([
        {
          id: 'comment-444',
          username: 'test_purpose_only',
          content: 'this is comment content',
          date: new Date('2023-08-17T00:00:00.000Z').toISOString(),
          is_delete: true,
        },
      ]);
    });
  });

  describe('checkAvaibilityComment', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkAvaibilityComment('comment-null'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError if comment available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '123');
      const comment = await commentRepositoryPostgres.addComment({
        content: 'isi komen',
        owner: 'user-213',
        threadId: 'thread-213',
      });

      await expect(commentRepositoryPostgres.checkAvaibilityComment(comment.id))
        .resolves.not.toThrowError(NotFoundError);
    });
  });
});
