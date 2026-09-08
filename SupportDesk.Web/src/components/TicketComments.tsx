import { useEffect, useState } from "react";

import {
  getCommentsByTicket,
  createComment,
  deleteComment,
} from "../services/commentService";

import {
  useAuth,
} from "../contexts/AuthContext";

import type {
  CommentDetailResponse,
} from "../types/comment";

interface TicketCommentsProps {
  ticketId: number;
}

function TicketComments({
  ticketId,
}: TicketCommentsProps) {
  const { user } = useAuth();

  const [comments, setComments] =
    useState<CommentDetailResponse[]>([]);

  const [
    commentContent,
    setCommentContent,
  ] = useState("");

  // ========================================
  // CARGAR COMENTARIOS
  // ========================================

  const loadComments = async () => {
    try {
      const result =
        await getCommentsByTicket(
          ticketId
        );

      setComments(result);
    } catch (error) {
      console.error(
        "Error al cargar comentarios:",
        error
      );
    }
  };

  useEffect(() => {
    loadComments();
  }, [ticketId]);

  // ========================================
  // CREAR COMENTARIO
  // ========================================

  const handleCreateComment =
    async () => {
      const content =
        commentContent.trim();

      if (!content) {
        return;
      }

      try {
        await createComment({
          content,
          ticketId,
        });

        setCommentContent("");

        await loadComments();
      } catch (error) {
        console.error(
          "Error al crear comentario:",
          error
        );
      }
    };

  // ========================================
  // ELIMINAR COMENTARIO
  // ========================================

  const handleDeleteComment =
    async (
      commentId: number
    ) => {
      try {
        await deleteComment(
          commentId
        );

        await loadComments();
      } catch (error) {
        console.error(
          "Error al eliminar comentario:",
          error
        );
      }
    };

  // ========================================
  // JSX
  // ========================================

  return (
    <section className="ticket-comments-card">
      <div className="ticket-section-header">
        <h2>Comentarios</h2>

        <p>
          Conversación y seguimiento del ticket.
        </p>
      </div>

      <div className="ticket-comments-list">
        {comments.length === 0 ? (
          <p className="ticket-empty-message">
            Todavía no hay comentarios.
          </p>
        ) : (
          comments.map(
            (comment) => (
              <article
                key={comment.id}
                className="ticket-comment"
              >
                <div className="ticket-comment-header">
                  <div>
                    <strong>
                      {comment.user?.name ??
                        "Usuario desconocido"}
                    </strong>

                    <span className="ticket-comment-role">
                      {comment.user?.role ??
                        ""}
                    </span>
                  </div>

                  <span className="ticket-comment-date">
                    {new Date(
                      comment.createdAt
                    ).toLocaleString()}
                  </span>
                </div>

                <p className="ticket-comment-content">
                  {comment.content}
                </p>

                {(user?.userId ===
                  comment.user?.id ||
                  user?.role ===
                    "Admin") && (
                  <button
                    type="button"
                    className="ticket-comment-delete"
                    onClick={() =>
                      handleDeleteComment(
                        comment.id
                      )
                    }
                  >
                    Eliminar
                  </button>
                )}
              </article>
            )
          )
        )}
      </div>

      <div className="ticket-comment-form">
        <label htmlFor="commentContent">
          Agregar comentario
        </label>

        <textarea
          id="commentContent"
          value={commentContent}
          onChange={(event) =>
            setCommentContent(
              event.target.value
            )
          }
          placeholder="Escribe un comentario..."
          rows={4}
        />

        <button
          type="button"
          onClick={
            handleCreateComment
          }
        >
          Agregar comentario
        </button>
      </div>
    </section>
  );
}

export default TicketComments;