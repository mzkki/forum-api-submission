const AddComment = require('../AddComment');

describe('A AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'content',
      owner: 'user-123',
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: 'isi komen',
      owner: 'user-123',
      threadId: ['thread-123'],
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addComment object correctly', () => {
    const payload = {
      content: 'isi komen',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const { content, owner, threadId } = new AddComment(payload);

    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
    expect(threadId).toEqual(payload.threadId);
  });
});
