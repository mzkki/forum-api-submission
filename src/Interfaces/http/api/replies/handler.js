const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const SoftDeleteReplyUseCase = require('../../../../Applications/use_case/SoftDeleteReplyUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { content } = request.payload;
    const { threadId, commentId } = request.params;
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute({
      content, owner, threadId, commentId,
    });
    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;
    const softDeleteReplyUseCase = this._container.getInstance(SoftDeleteReplyUseCase.name);
    await softDeleteReplyUseCase.execute({
      owner, threadId, commentId, replyId,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
