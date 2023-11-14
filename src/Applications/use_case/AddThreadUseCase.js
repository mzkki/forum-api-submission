const AddThread = require('../../Domains/threads/entites/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository, userRepository }) {
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload) {
    await this._userRepository.getUserById(useCasePayload.owner);
    const addThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(addThread);
  }
}

module.exports = AddThreadUseCase;
