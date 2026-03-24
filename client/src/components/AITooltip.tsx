import { useEffect, useState, useRef } from "react";
import type { AITooltipProps } from "../types";

export const AITooltip = ({
  message,
  targetRef,
  onApply,
  onClose,
}: AITooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updatePosition = () => {
      if (targetRef.current && tooltipRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const top = rect.top - tooltipRect.height - 4;
        const left = rect.left;

        if (top < 0) {
          onClose();
        }

        if (left + tooltipRect.width > viewportWidth) {
          onClose();
        }
        if (left < 0) {
          onClose();
        }

        const fitsInWindow =
          top >= 0 &&
          top + tooltipRect.height <= viewportHeight &&
          left >= 0 &&
          left + tooltipRect.width <= viewportWidth;

        if (!fitsInWindow) {
          onClose();
          return;
        }

        setPosition({ top, left });
      }
    };

    updatePosition();

    const scrollableElements = document.querySelectorAll(
      ".browser-window .ad-detail-content",
    );

    const handleScroll = () => {
      requestAnimationFrame(updatePosition);
    };

    scrollableElements.forEach((el) => {
      el.addEventListener("scroll", handleScroll);
    });

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      scrollableElements.forEach((el) => {
        el.removeEventListener("scroll", handleScroll);
      });
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [targetRef, onClose]);

  const isError = message.startsWith("Ошибка");

  return !isError ? (
    <div
      ref={tooltipRef}
      className="position-fixed"
      style={{
        top: position.top,
        left: position.left,
        zIndex: 9999,
        width: "332px",
        maxWidth: "332px",
        border: "none",
      }}
    >
      <div
        className="card border-0"
        style={{
          filter: "drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.15))",
          borderRadius: "2px",
        }}
      >
        <div className="card-body p-2 d-flex flex-column gap-2">
          <div className="answer-title">Ответ AI:</div>
          <div
            className="answer-text"
            style={{
              whiteSpace: "pre-wrap",
              maxHeight: "200px",
              overflow: "auto",
            }}
          >
            {message.replace(/- /g, "  • ")}
          </div>
          <div className="d-flex gap-2">
            <button className="apply-button" onClick={onApply}>
              Применить
            </button>
            <button className="decline-button" onClick={onClose}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
      {/* Стрелка */}
      <div
        style={{
          position: "absolute",
          bottom: "-4px",
          left: "16px",
          transform: "translateX(0)",
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "8px solid white",
        }}
      />
    </div>
  ) : (
    <div
      ref={tooltipRef}
      className="position-fixed"
      style={{
        top: position.top,
        left: position.left,
        zIndex: 9999,
        width: "332px",
        maxWidth: "332px",
        border: "none",
      }}
    >
      <div
        className="card border-0"
        style={{
          filter: "drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.15))",
          borderRadius: "2px",
        }}
      >
        <div className="card-body p-2 d-flex flex-column gap-2 error-tool">
          <div className="answer-title answer-title--error">
            Произошла ошибка при запросе к AI
          </div>
          <div
            className="answer-text answer-text"
            style={{
              whiteSpace: "pre-wrap",
              maxHeight: "200px",
              overflow: "auto",
            }}
          >
            Попробуйте повторить запрос или закройте уведомление
          </div>
          <div className="d-flex gap-2">
            <button
              className="decline-button decline-button--error"
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
      {/* Стрелка */}
      <div
        style={{
          position: "absolute",
          bottom: "-4px",
          left: "16px",
          transform: "translateX(0)",
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "8px solid #FEE9E7",
        }}
      />
    </div>
  );
};

export default AITooltip;
