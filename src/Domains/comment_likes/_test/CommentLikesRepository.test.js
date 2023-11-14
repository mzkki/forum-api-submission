const CommentLikesRepository = require('../CommentLikesRepository');

describe('CommentLikesRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    const commentLikesRepository = new CommentLikesRepository();

    await expect(commentLikesRepository.addLike({})).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentLikesRepository.isAlreadyLike({})).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentLikesRepository.deleteLike('')).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentLikesRepository.getLikesCount('')).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
