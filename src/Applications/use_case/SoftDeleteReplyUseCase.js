class SoftDeleteReplyUseCase {
  constructor({
    replyRepository, commentRepository, threadRepository, userRepository,
  }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload) {
    const {
      owner, threadId, commentId, replyId: id,
    } = useCasePayload;
    await this._userRepository.getUserById(owner);
    await this._threadRepository.checkAvaibilityThread(threadId);
    await this._commentRepository.checkAvaibilityComment(commentId);
    await this._replyRepository.verifyReplyOwner(useCasePayload);
    await this._replyRepository.softDeleteReply(id);
  }
}

module.exports = SoftDeleteReplyUseCase;
