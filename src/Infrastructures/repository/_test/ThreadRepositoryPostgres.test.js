const ThreadsTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const AddThread = require('../../../Domains/threads/entites/AddThread');
const AddedThread = require('../../../Domains/threads/entites/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    const fakeIdGenerator = () => '812';
    const userPayload = new RegisterUser({
      username: 'testing',
      fullname: 'testing name',
      password: 'test',
    });
    const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
    await userRepositoryPostgres.addUser(userPayload);
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return addedThread correctly', async () => {
      const threadData = new AddThread({
        title: 'ini title',
        body: 'ini body',
        owner: 'user-812',
      });
      const fakeIdGenerator = () => '123';

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await threadRepositoryPostgres.addThread(threadData);

      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      const addThread = new AddThread({
        title: 'ini title',
        body: 'ini body',
        owner: 'user-812',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'ini title',
        owner: 'user-812',
      }));
    });
  });

  describe('checkAvaibilityThread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.checkAvaibilityThread('thread-null'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError if thread available', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');
      const threads = await threadRepositoryPostgres.addThread({
        title: 'its title',
        body: 'its body',
        owner: 'user-812',
      });

      await expect(threadRepositoryPostgres.checkAvaibilityThread(threads.id))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.getThreadById('thread-null'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return thread\'s detail data correctly', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({
        title: 'its title',
        body: 'its body',
        owner: 'user-812',
      });
      const detailThread = await threadRepositoryPostgres.getThreadById('thread-123');

      expect(detailThread).toStrictEqual({
        id: 'thread-123',
        title: 'its title',
        body: 'its body',
        username: 'testing',
        date: detailThread.date,
      });
    });
  });
});
