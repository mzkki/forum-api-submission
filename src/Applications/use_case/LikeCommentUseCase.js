const NewLike = require('../../Domains/comment_likes/entities/NewLike');

class LikeCommentUseCase {
  constructor({
    commentLikeRepository, threadRepository, commentRepository, userRepository,
  }) {
    this._commentLikeRepository = commentLikeRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload) {
    this._verifyPayload(useCasePayload);
    const { userId, threadId, commentId } = useCasePayload;
    await this._userRepository.getUserById(userId);
    await this._threadRepository.checkAvaibilityThread(threadId);
    await this._commentRepository.checkAvaibilityComment(commentId);
    const isAlreadyLike = await this._commentLikeRepository.isAlreadyLike(useCasePayload);
    const newLike = new NewLike(useCasePayload);
    if (isAlreadyLike) {
      await this._commentLikeRepository.deleteLike(newLike);
    } else {
      await this._commentLikeRepository.addLike(newLike);
    }
  }

  _verifyPayload({ threadId, commentId }) {
    if (!threadId || !commentId) {
      throw new Error('LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (typeof threadId !== 'string' || typeof commentId !== 'string') {
      throw new Error('LIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = LikeCommentUseCase;
