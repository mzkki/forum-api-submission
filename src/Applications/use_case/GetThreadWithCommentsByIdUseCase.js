class GetThreadWithCommentsByIdUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({ threadId }) {
    this._verifyPayload(threadId);
    await this._threadRepository.checkAvaibilityThread(threadId);
    const comments = await this._commentRepository.getCommentsFromThread(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const replies = await this._replyRepository.getRepliesFromThread(threadId);
    const threadData = {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: comments.map((comment) => ({
        id: comment.id,
        username: comment.username,
        date: comment.date,
        replies: replies.filter((reply) => reply.comment_id === comment.id).map((reply) => ({
          id: reply.id,
          content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
          // content: reply.content,
          date: reply.date,
          username: reply.username,
        })),
        content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
      })),
    };
    return threadData;
  }

  _verifyPayload(threadId) {
    if (!threadId) {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREADID');
    }
    if (typeof threadId !== 'string') {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetThreadWithCommentsByIdUseCase;
