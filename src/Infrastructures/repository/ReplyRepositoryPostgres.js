const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply) {
    const { content, owner, commentId } = addReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, owner, commentId, date, false],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async verifyReplyOwner(payload) {
    const { replyId, owner } = payload;

    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Reply tidak ditemukan');
    }

    const reply = result.rows[0];

    if (reply.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak melakukan hal ini');
    }
  }

  async getRepliesFromThread(threadId) {
    const query = {
      text: `SELECT replies.id, replies.content, replies.date, users.username, replies.is_delete, replies.comment_id FROM replies
      LEFT JOIN users ON users.id = replies.owner 
      LEFT JOIN comments ON comments.id = replies.comment_id
      LEFT JOIN threads ON threads.id = comments.thread_id
      WHERE threads.id = $1 ORDER BY replies.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async softDeleteReply(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
