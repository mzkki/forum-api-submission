const AddThread = require('../../../Domains/threads/entites/AddThread');
const AddedThread = require('../../../Domains/threads/entites/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add user action correctly', async () => {
    const useCasePayload = {
      title: 'its a title',
      body: 'its thread\'s body',
      owner: 'user-123',
    };

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    mockUserRepository.getUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    const addedThread = await getThreadUseCase.execute(useCasePayload);

    expect(addedThread).toStrictEqual(new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    }));

    expect(mockUserRepository.getUserById).toBeCalledWith(useCasePayload.owner);
    expect(mockThreadRepository.addThread).toBeCalledWith(new AddThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    }));
  });
});
