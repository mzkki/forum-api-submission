const CommentLikesRepository = require('../../../Domains/comment_likes/CommentLikesRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');
const NewLike = require('../../../Domains/comment_likes/entities/NewLike');

describe('LikeCommentUseCase', () => {
  it('should throw error if use case payload not contain needed property', async () => {
    const useCasePayload = {
      userId: 'user-123',
      threadId: 'thread-123',
    };

    const likeCommentUseCase = new LikeCommentUseCase({});

    await expect(likeCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if comment id not a string', async () => {
    const useCasePayload = {
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 123,
    };

    const likeCommentUseCase = new LikeCommentUseCase({});

    await expect(likeCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('LIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating like the comment when user has not like the comment', async () => {
    const useCasePayload = {
      userId: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockCommentLikeRepository = new CommentLikesRepository();
    const mockUserRepository = new UserRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockUserRepository.getUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.checkAvaibilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvaibilityComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.isAlreadyLike = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockCommentLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const getLikeCommentUseCase = new LikeCommentUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
    });

    await getLikeCommentUseCase.execute(useCasePayload);

    expect(mockUserRepository.getUserById).toBeCalledWith(useCasePayload.userId);
    expect(mockThreadRepository.checkAvaibilityThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvaibilityComment).toBeCalledWith(useCasePayload.commentId);
    expect(mockCommentLikeRepository.isAlreadyLike).toBeCalledWith(useCasePayload);
    expect(mockCommentLikeRepository.addLike).toBeCalledWith(new NewLike({
      userId: useCasePayload.userId,
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    }));
  });

  it('should orchestrating dislike the comment when user has like the comment', async () => {
    const useCasePayload = {
      userId: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockCommentLikeRepository = new CommentLikesRepository();
    const mockUserRepository = new UserRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockUserRepository.getUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.checkAvaibilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvaibilityComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.isAlreadyLike = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const getLikeCommentUseCase = new LikeCommentUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
    });

    await getLikeCommentUseCase.execute(useCasePayload);

    expect(mockUserRepository.getUserById).toBeCalledWith(useCasePayload.userId);
    expect(mockThreadRepository.checkAvaibilityThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvaibilityComment).toBeCalledWith(useCasePayload.commentId);
    expect(mockCommentLikeRepository.isAlreadyLike).toBeCalledWith(useCasePayload);
    expect(mockCommentLikeRepository.deleteLike).toBeCalledWith(new NewLike({
      userId: useCasePayload.userId,
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    }));
  });
});
