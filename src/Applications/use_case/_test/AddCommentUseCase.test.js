const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should throw error if use case payload not contain content', async () => {
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const addCommentUseCase = new AddCommentUseCase({});

    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_COMMENT_USE_CASE.NOT_CONTAIN_CONTENT');
  });

  it('should throw error if content not a string', async () => {
    const useCasePayload = {
      owner: 'user-123',
      content: 123,
      threadId: 'thread-123',
    };

    const addCommentUseCase = new AddCommentUseCase({});

    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      content: 'isi komen',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    mockUserRepository.getUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.checkAvaibilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    const addedComment = await getCommentUseCase.execute(useCasePayload);

    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));

    expect(mockUserRepository.getUserById).toBeCalledWith(useCasePayload.owner);
    expect(mockThreadRepository.checkAvaibilityThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(new AddComment({
      content: useCasePayload.content,
      owner: useCasePayload.owner,
      threadId: useCasePayload.threadId,
    }));
  });
});
