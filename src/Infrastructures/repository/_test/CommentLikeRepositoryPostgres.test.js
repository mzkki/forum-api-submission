const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');
const NewLike = require('../../../Domains/comment_likes/entities/NewLike');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
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

// comment data
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentLikeRepositoryPostgres', () => {
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
    await CommentLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('AddLike funciton', () => {
    it('should persist like the comment', async () => {
      const likePayload = new NewLike({
        userId: 'user-213',
        threadId: 'thread-213',
        commentId: 'comment-213',
      });

      const fakeIdGenerator = () => '123';

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      await commentLikeRepositoryPostgres.addLike(likePayload);

      const like = await CommentLikesTableTestHelper.findLikeById('comment-like-123');
      expect(like).toHaveLength(1);
    });
  });

  describe('isAlreadyLike function', () => {
    it('should return true if user already like the comment', async () => {
      await CommentLikesTableTestHelper.addLike({
        id: 'comment-like-213',
        userId: 'user-213',
        commentId: 'comment-213',
        threadId: 'thread-213',
      });

      const likePayload = {
        userId: 'user-213',
        commentId: 'comment-213',
      };

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool);

      const isAlreadyLike = await commentLikeRepositoryPostgres.isAlreadyLike(likePayload);
      expect(isAlreadyLike).toEqual(true);
    });

    it('should return false if user haven\'t like the comment', async () => {
      const likePayload = {
        userId: 'user-213',
        commentId: 'comment-213',
      };

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool);

      const isAlreadyLike = await commentLikeRepositoryPostgres.isAlreadyLike(likePayload);
      expect(isAlreadyLike).toEqual(false);
    });
  });

  describe('deleteLike function', () => {
    it('should delete like from database', async () => {
      await CommentLikesTableTestHelper.addLike({
        id: 'comment-like-213',
        userId: 'user-213',
        commentId: 'comment-213',
        threadId: 'thread-213',
      });

      const likePayload = {
        userId: 'user-213',
        commentId: 'comment-213',
      };

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool);

      await commentLikeRepositoryPostgres.deleteLike(likePayload);
      const like = await CommentLikesTableTestHelper.findLikeById('comment-like-213');
      expect(like).toHaveLength(0);
    });
  });

  describe('getLikesCount', () => {
    it('should return total likes of a comment', async () => {
      await CommentLikesTableTestHelper.addLike({
        id: 'comment-like-213',
        userId: 'user-213',
        commentId: 'comment-213',
        threadId: 'thread-213',
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool);
      const likesCount = await commentLikeRepositoryPostgres.getLikesCount('thread-213');
      expect(likesCount).toStrictEqual([
        {
          comment_id: 'comment-213',
          count: 1,
        },
      ]);
    });
  });
});
