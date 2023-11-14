const CommentRepository = require('../../../Domains/comments/CommentRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const SoftDeleteCommentUseCase = require('../SoftDeleteCommentUseCase');

describe('SoftDeleteCommentUseCase', () => {
  it('should orhestrating the soft delete comment action correctly', async () => {
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockUserRepository = new UserRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockUserRepository.getUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.checkAvaibilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.softDeleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const resultSoftDeleteUseCase = new SoftDeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    await resultSoftDeleteUseCase.execute(useCasePayload);

    expect(mockUserRepository.getUserById).toBeCalledWith(useCasePayload.owner);
    expect(mockThreadRepository.checkAvaibilityThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.softDeleteComment).toBeCalledWith(useCasePayload.commentId);
  });
});
