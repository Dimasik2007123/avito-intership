import { useEffect, useState } from "react";
import type { MessageProps } from "../types";
import success from "../assets/images/success.svg";
import er from "../assets/images/er.svg";

function Message({ type, onClose, duration = 5000 }: MessageProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  useEffect(() => {
    const animTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 4000);
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(animTimer);
    };
  }, [duration, onClose]);

  return type === "success" ? (
    <div
      className={`position-fixed top-0 end-0 p-3 ${isFadingOut ? "message-fade-out" : ""}`}
      style={{ zIndex: 9999 }}
    >
      <div className="message-block">
        <div className="message-wrapper">
          <img src={success} alt="Успешное сохранение" />
          Изменения сохранены
        </div>
      </div>
    </div>
  ) : (
    <div
      className={`position-fixed top-0 end-0 p-3 ${isFadingOut ? "message-fade-out" : ""}`}
      style={{ zIndex: 9999 }}
    >
      <div className="message-block message-block-error">
        <div className="message-wrapper">
          <img src={er} alt="Ошибка сохранения" className="mb-auto" />
          <div className="message-wrapper-text">
            <p>Ошибка сохранения</p>
            <p>
              При попытке сохранить изменения произошла ошибка. Попробуйте ещё
              раз или зайдите позже.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message;
