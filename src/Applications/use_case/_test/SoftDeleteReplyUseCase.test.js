const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const SoftDeleteReplyUseCase = require('../SoftDeleteReplyUseCase');

describe('SoftDeleteReplyUseCase', () => {
  it('should orhestrating the soft delete reply action correctly', async () => {
    const useCasePayload = {
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockUserRepository = new UserRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockUserRepository.getUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.checkAvaibilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvaibilityComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.softDeleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const resultSoftDeleteReplyUseCase = new SoftDeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    await resultSoftDeleteReplyUseCase.execute(useCasePayload);

    expect(mockUserRepository.getUserById).toBeCalledWith(useCasePayload.owner);
    expect(mockThreadRepository.checkAvaibilityThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvaibilityComment).toBeCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(useCasePayload);
    expect(mockReplyRepository.softDeleteReply).toBeCalledWith(useCasePayload.replyId);
  });
});
