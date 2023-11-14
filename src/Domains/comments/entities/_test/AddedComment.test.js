const AddedComment = require('../AddedComment');

describe('A AddedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'comment-123',
      content: 'this is the comment',
    };

    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'comment-123',
      content: 123,
      owner: ['user-123'],
    };

    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedComment object correctly', () => {
    const payload = {
      id: 'comment-123',
      content: 'this is content',
      owner: 'user-123',
    };

    const { content } = new AddedComment(payload);
    expect(content).toEqual(payload.content);
  });
});
