const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadWithCommentsByIdUseCase = require('../GetThreadWithCommentsByIdUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadWithCommentsByIdUseCase', () => {
  it('should throw error if use case payload not contain threadId', async () => {
    const useCasePayload = {};

    const getThreadByIdUseCase = new GetThreadWithCommentsByIdUseCase({});

    await expect(getThreadByIdUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREADID');
  });

  it('should throw error if threadId not a string', async () => {
    const useCasePayload = {
      threadId: 123,
    };

    const getThreadWithCommentsByIdUseCase = new GetThreadWithCommentsByIdUseCase({});

    await expect(getThreadWithCommentsByIdUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the get detail thread action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockGetDetailThread = {
      id: 'thread-123',
      title: 'contoh title',
      body: 'contoh body',
      date: 'contoh date',
      username: 'dicoding',
    };

    const mockGetDetailComment = [
      {
        id: 'comment-123',
        username: 'dicoding2',
        date: 'contoh date',
        content: 'this is the content',
      },
      {
        id: 'comment-213',
        username: 'dicoding3',
        date: 'anggap aja date',
        content: 'this is the content',
        is_delete: true,
      },
    ];

    const mockGetReplies = [
      {
        id: 'reply-123',
        username: 'dicoding2',
        date: 'contoh date',
        content: 'this is the reply',
        comment_id: 'comment-123',
      },
      {
        id: 'reply-812',
        username: 'dicoding2',
        date: 'contoh date',
        content: 'this is the second reply',
        comment_id: 'comment-123',
        is_delete: true,
      },
    ];

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkAvaibilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.getCommentsFromThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockGetDetailComment));
    mockReplyRepository.getRepliesFromThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockGetReplies));
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockGetDetailThread));

    const getThreadWithCommentsByIdUseCase = new GetThreadWithCommentsByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const threadWithComments = await getThreadWithCommentsByIdUseCase
      .execute(useCasePayload);

    expect(mockThreadRepository.checkAvaibilityThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsFromThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getRepliesFromThread).toBeCalledWith(useCasePayload.threadId);
    expect(threadWithComments).toStrictEqual({
      id: 'thread-123',
      title: 'contoh title',
      body: 'contoh body',
      date: 'contoh date',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding2',
          date: 'contoh date',
          replies: [
            {
              id: 'reply-123',
              username: 'dicoding2',
              date: 'contoh date',
              content: 'this is the reply',
            },
            {
              id: 'reply-812',
              username: 'dicoding2',
              date: 'contoh date',
              content: '**balasan telah dihapus**',
            },
          ],
          content: 'this is the content',
        },
        {
          id: 'comment-213',
          username: 'dicoding3',
          date: 'anggap aja date',
          replies: [],
          content: '**komentar telah dihapus**',
        },
      ],
    });
  });
});
