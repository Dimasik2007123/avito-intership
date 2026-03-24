import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import placeholder from "../assets/images/placeholder.png";
import type { RootState } from "../store";
import { getItem } from "../api/items";
import { useParams } from "react-router-dom";
import { categoryFields, paramLabels } from "../types";
import {
  fetchAdStart,
  fetchAdSuccess,
  fetchAdFailure,
  clearCurrentItem,
} from "../store/adsStore";
import edit from "../assets/images/Edit.svg";
import rect from "../assets/images/Rectangle (1).svg";
import circle from "../assets/images/exclamation-circle.svg";

function AdDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentItem, loading, error } = useSelector(
    (state: RootState) => state.ads,
  );

  const electronicsTypes: Record<string, string> = {
    phone: "Телефон",
    laptop: "Ноутбук",
    misc: "Другое",
  };

  const realEstateTypes: Record<string, string> = {
    flat: "Квартира",
    house: "Дом",
    room: "Комната",
  };

  const transmissionTypes: Record<string, string> = {
    automatic: "Автомат",
    manual: "Механика",
  };

  const conditionTypes: Record<string, string> = {
    new: "Новый",
    used: "Б/У",
  };
  const getDisplayValue = (key: string, value: string, category: string) => {
    if (category === "electronics" && key === "type") {
      return electronicsTypes[value] || value;
    }
    if (category === "electronics" && key === "condition") {
      return conditionTypes[value] || value;
    }
    if (category === "real_estate" && key === "type") {
      return realEstateTypes[value] || value;
    }
    if (category === "auto" && key === "transmission") {
      return transmissionTypes[value] || value;
    }
    return value;
  };
  useEffect(() => {
    if (!id) return;
    const loadAd = async () => {
      dispatch(fetchAdStart());
      try {
        const numericId = parseInt(id, 10);
        const data = await getItem(numericId);
        dispatch(fetchAdSuccess(data));
      } catch {
        dispatch(fetchAdFailure());
      }
    };

    loadAd();

    return () => {
      dispatch(clearCurrentItem());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }
  if (!currentItem) {
    return null;
  }

  const fieldsToShow = categoryFields[currentItem.category] || [];

  const labels = paramLabels[currentItem.category] || {};
  const params = currentItem.params || {};
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day} ${month} ${hours}:${minutes}`;
  };

  const createdAt = currentItem.createdAt
    ? formatDate(currentItem.createdAt)
    : "Дата не указана";

  const updatedAt = currentItem.updatedAt
    ? formatDate(currentItem.updatedAt)
    : null;

  return (
    <div>
      <div className="card detail-card">
        <div className="card-body detail-card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1 className="card-title detail-card-title">
                {currentItem.title || "Без названия"}
              </h1>
              <button
                className="edit-button mt-2"
                onClick={() => navigate(`/ads/${id}/edit`)}
              >
                Редактировать
                <span style={{ width: "8px", display: "inline-block" }}></span>
                <img src={edit} alt="Edit" />
              </button>
            </div>
            <div className="d-flex flex-column align-items-end">
              <h1 className="card-title detail-card-title">
                {currentItem.price.toLocaleString()} ₽
              </h1>
              <div className="d-flex flex-column align-items-end gap-0">
                <p className="date-text mb-0">Опубликовано: {createdAt}</p>
                {updatedAt !== createdAt && (
                  <p className="date-text mb-0">Отредактировано: {updatedAt}</p>
                )}
              </div>
            </div>
          </div>
          <img src={rect} style={{ height: "1px" }}></img>

          <div className="detail-row d-flex gap-4 mt-4">
            <div className="left-column" style={{ flexShrink: 0 }}>
              <div className="detail-image">
                <img
                  src={placeholder}
                  className="img-fluid rounded"
                  alt={currentItem.title || "Без названия"}
                  style={{ width: "480px", height: "360px" }}
                />
              </div>

              <h5 className="descript-title">Описание</h5>
              <p className="descript-text">
                {currentItem.description || "Нет описания"}
              </p>
            </div>

            <div className="right-column" style={{ flex: 1 }}>
              {currentItem.needsRevision && (
                <div className="alert-block">
                  <img src={circle}></img>
                  <div className="right-alert">
                    <strong className="require-title">
                      Требуются доработки
                    </strong>
                    <div className="error-fields">
                      У объявления не заполнены поля:
                    </div>
                    <ul className="error-list mt-0">
                      {!currentItem.description && (
                        <li className="error-item">Описание</li>
                      )}
                      {fieldsToShow.map((field) => {
                        const value = (params as Record<string, unknown>)[
                          field
                        ];
                        if (!value) {
                          return (
                            <li className="error-item" key={field}>
                              {labels[field] || field}
                            </li>
                          );
                        }
                        return null;
                      })}
                    </ul>
                  </div>
                </div>
              )}

              <h4 className="params-title">Характеристики</h4>
              <div className="params-table">
                {Object.entries(params).map(([key, value]) => {
                  if (!value) return null;
                  const displayValue = getDisplayValue(
                    key,
                    String(value),
                    currentItem.category,
                  );
                  return (
                    <div key={key} className="params-row">
                      <div className="params-label">{labels[key] || key}</div>
                      <div className="params-value">{displayValue}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdDetail;
