class AddComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { userId, commentId, threadId } = payload;

    this.userId = userId;
    this.commentId = commentId;
    this.threadId = threadId;
  }

  _verifyPayload({ userId, commentId, threadId }) {
    if (!userId || !commentId || !threadId) {
      throw new Error('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof userId !== 'string' || typeof commentId !== 'string' || typeof threadId !== 'string') {
      throw new Error('NEW_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddComment;
