const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, userRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._userRepository = userRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { content, owner, threadId } = useCasePayload;
    this._verifyPayload(content);
    await this._userRepository.getUserById(owner);
    await this._threadRepository.checkAvaibilityThread(threadId);
    const addComment = new AddComment(useCasePayload);
    return this._commentRepository.addComment(addComment);
  }

  _verifyPayload(content) {
    if (!content) {
      throw new Error('ADD_COMMENT_USE_CASE.NOT_CONTAIN_CONTENT');
    }

    if (typeof content !== 'string') {
      throw new Error('ADD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddCommentUseCase;
