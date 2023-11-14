const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({
    replyRepository, threadRepository, commentRepository, userRepository,
  }) {
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload) {
    const {
      content, owner, threadId, commentId,
    } = useCasePayload;
    this._verifyPayload(content);
    await this._userRepository.getUserById(owner);
    await this._threadRepository.checkAvaibilityThread(threadId);
    await this._commentRepository.checkAvaibilityComment(commentId);
    const addReply = new AddReply(useCasePayload);
    return this._replyRepository.addReply(addReply);
  }

  _verifyPayload(content) {
    if (!content) {
      throw new Error('ADD_REPLY_USE_CASE.NOT_CONTAIN_CONTENT');
    }
    if (typeof content !== 'string') {
      throw new Error('ADD_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddReplyUseCase;
