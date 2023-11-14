class SoftDeleteCommentUseCase {
  constructor({ commentRepository, threadRepository, userRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload) {
    const { owner, threadId, commentId: id } = useCasePayload;
    await this._userRepository.getUserById(owner);
    await this._threadRepository.checkAvaibilityThread(threadId);
    await this._commentRepository.verifyCommentOwner(useCasePayload);
    await this._commentRepository.softDeleteComment(id);
  }
}

module.exports = SoftDeleteCommentUseCase;
