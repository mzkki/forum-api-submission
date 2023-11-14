const NewLike = require('../NewLike');

describe('A NewLike entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      userId: 'user-123',
      threadId: 'thread-123',
    };

    expect(() => new NewLike(payload)).toThrowError('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      userId: 'user-123',
      threadId: ['thread-123'],
      commentId: 'comment-123',
    };

    expect(() => new NewLike(payload)).toThrowError('NEW_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addComment object correctly', () => {
    const payload = {
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const { userId, threadId, commentId } = new NewLike(payload);

    expect(userId).toEqual(payload.userId);
    expect(commentId).toEqual(payload.commentId);
    expect(threadId).toEqual(payload.threadId);
  });
});
