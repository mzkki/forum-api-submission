const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadWithCommentsByIdUseCase = require('../../../../Applications/use_case/GetThreadWithCommentsByIdUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadWithCommentsHandler = this.getThreadWithCommentsHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { title, body } = request.payload;
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute({ title, body, owner });

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadWithCommentsHandler(request, h) {
    const getThreadwithCommentsByIdUseCase = this
      ._container.getInstance(GetThreadWithCommentsByIdUseCase.name);
    const data = await getThreadwithCommentsByIdUseCase.execute(request.params);

    const response = h.response({
      status: 'success',
      data: {
        thread: data,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
