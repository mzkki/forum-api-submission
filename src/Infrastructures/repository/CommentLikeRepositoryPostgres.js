const CommentLikeRepository = require('../../Domains/comment_likes/CommentLikesRepository');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(addLike) {
    const { userId, commentId } = addLike;
    const id = `comment-like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comment_likes VALUES($1,$2,$3)',
      values: [id, userId, commentId],
    };

    await this._pool.query(query);
  }

  async isAlreadyLike(newLike) {
    const { userId, commentId } = newLike;

    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount !== 0) {
      return true;
    }
    return false;
  }

  async deleteLike(newLike) {
    const { userId, commentId } = newLike;

    const query = {
      text: 'DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }

  async getLikesCount(threadId) {
    const query = {
      text: `SELECT comment_id,  COUNT(comment_id)::int FROM comment_likes 
      LEFT JOIN comments ON comments.id = comment_likes.comment_id
      LEFT JOIN threads ON threads.id = comments.thread_id
      WHERE threads.id = $1 GROUP BY comment_id`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = CommentLikeRepositoryPostgres;
