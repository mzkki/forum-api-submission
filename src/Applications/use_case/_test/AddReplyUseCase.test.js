const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should throw error if use case payload not contain content', async () => {
    const useCasePayload = {
      owner: 'user-123',
      commentId: 'comment-123',
    };

    const addReplyUseCase = new AddReplyUseCase({});

    await expect(addReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLY_USE_CASE.NOT_CONTAIN_CONTENT');
  });
  it('should throw error if content not a string', async () => {
    const useCasePayload = {
      owner: 'user-123',
      content: 123,
      commentId: 'comment-123',
    };

    const addReplyUseCase = new AddReplyUseCase({});

    await expect(addReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the add reply action correctly', async () => {
    const useCasePayload = {
      content: 'isi reply',
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();

    mockUserRepository.getUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.checkAvaibilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvaibilityComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply));

    const getReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
    });

    const addedReply = await getReplyUseCase.execute(useCasePayload);

    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));

    expect(mockUserRepository.getUserById).toBeCalledWith(useCasePayload.owner);
    expect(mockThreadRepository.checkAvaibilityThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvaibilityComment).toBeCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply({
      content: useCasePayload.content,
      owner: useCasePayload.owner,
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    }));
  });
});
