import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createItem } from "../api/items";
import { generateDescription, suggestPrice } from "../api/llm";
import AITooltip from "../components/AITooltip";
import type { Category, Item, ItemUpdateIn } from "../types";
import { categoryFields, paramLabels } from "../types";
import arrowDown from "../assets/images/icon.svg";
import rect from "../assets/images/Rectangle (1).svg";
import close from "../assets/images/close.svg";
import bulb from "../assets/images/Bulb.svg";
import redo from "../assets/images/Redo.svg";
import load from "../assets/images/load.svg";

const categoryNames: Record<Category, string> = {
  electronics: "Электроника",
  auto: "Транспорт",
  real_estate: "Недвижимость",
};

const fieldOptions: Record<string, { value: string; label: string }[]> = {
  type: [
    { value: "phone", label: "Телефон" },
    { value: "laptop", label: "Ноутбук" },
    { value: "misc", label: "Другое" },
  ],
  condition: [
    { value: "new", label: "Новый" },
    { value: "used", label: "Б/У" },
  ],
  type_real_estate: [
    { value: "flat", label: "Квартира" },
    { value: "house", label: "Дом" },
    { value: "room", label: "Комната" },
  ],
  transmission: [
    { value: "automatic", label: "Автомат" },
    { value: "manual", label: "Механика" },
  ],
};

const numericFields = new Set([
  "area",
  "floor",
  "yearOfManufacture",
  "mileage",
  "enginePower",
]);

const getEmptyParams = (category: Category): Record<string, string> =>
  Object.fromEntries(
    (categoryFields[category] || []).map((field) => [field, ""]),
  );

function AdCreate() {
  const navigate = useNavigate();
  const priceButtonRef = useRef<HTMLDivElement>(null);
  const descriptionButtonRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<Category>("electronics");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [params, setParams] = useState(getEmptyParams("electronics"));
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [openSelects, setOpenSelects] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [aiResponse, setAiResponse] = useState<"description" | "price" | null>(
    null,
  );
  const [error, setError] = useState("");
  const [tooltip, setTooltip] = useState<{
    message: string;
    targetRef: React.RefObject<HTMLElement | null>;
    onApply: () => void;
  } | null>(null);

  const draft = {
    category,
    title,
    description,
    price: Number(price) || 0,
    params,
  } as Item;
  const labels = paramLabels[category] || {};
  const canSubmit = title.trim() !== "" && price !== "" && Number(price) >= 0;

  const validateField = (field: "title" | "price", value: string) => {
    let message = "";
    if (value.trim() === "") {
      message =
        field === "title"
          ? "Название должно быть заполнено"
          : "Цена должна быть заполнена";
    } else if (field === "price" && Number(value) < 0) {
      message = "Цена не может быть отрицательной";
    }

    setValidationErrors((previous) => ({ ...previous, [field]: message }));
    return message;
  };

  const updateParam = (key: string, value: string) => {
    setParams((previous) => ({ ...previous, [key]: value }));
  };

  const changeCategory = (nextCategory: Category) => {
    setCategory(nextCategory);
    setParams(getEmptyParams(nextCategory));
    setOpenSelects({});
    setCategoryOpen(false);
  };

  const getPayloadParams = (): ItemUpdateIn["params"] => {
    const result: Record<string, string | number | undefined> = { ...params };
    Object.keys(result).forEach((key) => {
      if (!result[key]) result[key] = undefined;
      else if (numericFields.has(key)) result[key] = Number(result[key]);
    });
    return result as ItemUpdateIn["params"];
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const titleError = validateField("title", title);
    const priceError = validateField("price", price);
    if (titleError || priceError) return;
    setSaving(true);
    setError("");
    try {
      await createItem({
        category,
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        params: getPayloadParams(),
      });
      navigate("/ads");
    } catch {
      setError("Не удалось создать объявление. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  };

  const handleSuggestPrice = async () => {
    setSuggesting(true);
    try {
      const response = await suggestPrice(draft);
      const match = response.match(/(\d[\d\s]*)\s*[–-]\s*(\d[\d\s]*)\s*₽/);
      const suggested = match
        ? parseInt(match[1].replace(/\s/g, ""), 10)
        : null;
      setAiResponse("price");
      setTooltip({
        message: response,
        targetRef: priceButtonRef,
        onApply: () => {
          if (suggested) setPrice(String(suggested));
          setTooltip(null);
          setAiResponse(null);
        },
      });
    } catch {
      setError("Ошибка при запросе к AI. Попробуйте ещё раз.");
    } finally {
      setSuggesting(false);
    }
  };

  const handleGenerateDescription = async () => {
    setGenerating(true);
    try {
      const response = await generateDescription(draft);
      setAiResponse("description");
      setTooltip({
        message: response,
        targetRef: descriptionButtonRef,
        onApply: () => {
          setDescription(response);
          setTooltip(null);
          setAiResponse(null);
        },
      });
    } catch {
      setError("Ошибка при запросе к AI. Попробуйте ещё раз.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      {tooltip && (
        <AITooltip
          message={tooltip.message}
          targetRef={tooltip.targetRef}
          onApply={tooltip.onApply}
          onClose={() => setTooltip(null)}
        />
      )}
      <div className="row">
        <div className="d-flex">
          <div className="card edit">
            <div className="card-body edit-body p-1px">
              <h2 className="card-title edit-title">Создание объявления</h2>
              <form
                className="d-flex flex-column gap-2"
                onSubmit={handleSubmit}
              >
                <div
                  className="d-flex flex-column gap-1 mb-2"
                  style={{ position: "relative" }}
                >
                  <label className="edit-label mb-0">Категория</label>
                  <div
                    className="custom-select"
                    onClick={() => setCategoryOpen(!categoryOpen)}
                  >
                    <span className="custom-select__value">
                      {categoryNames[category]}
                    </span>
                    <img
                      src={arrowDown}
                      alt="▼"
                      className={`custom-select__arrow ${categoryOpen ? "rotate" : ""}`}
                    />
                  </div>
                  {categoryOpen && (
                    <div className="custom-select__dropdown">
                      {Object.entries(categoryNames).map(([value, label]) => (
                        <div
                          key={value}
                          className="custom-select__option"
                          onClick={() => changeCategory(value as Category)}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <img
                  src={rect}
                  style={{ height: "1px", marginBottom: "6px" }}
                />

                <div className="mb-2">
                  <label htmlFor="create-title" className="edit-label">
                    <span className="text-danger">*</span> Название
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="create-title"
                      className={`edit-control edit-input ${validationErrors.title ? "is-invalid" : ""}`}
                      placeholder="MacBook 16"
                      value={title}
                      onChange={(event) => {
                        setTitle(event.target.value);
                        if (validationErrors.title)
                          validateField("title", event.target.value);
                      }}
                      onBlur={() => validateField("title", title)}
                      data-validation-message="Название должно быть заполнено"
                      required
                    />
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => {
                        setTitle("");
                        validateField("title", "");
                      }}
                    >
                      <img src={close} alt="Очистить" />
                    </button>
                  </div>
                  <div
                    id="create-title-error"
                    className={`invalid-feedback ${validationErrors.title ? "d-block" : ""}`}
                  >
                    {validationErrors.title}
                  </div>
                </div>
                <img
                  src={rect}
                  style={{ height: "1px", marginBottom: "6px" }}
                />

                <div className="mb-2">
                  <label htmlFor="create-price" className="edit-label">
                    <span className="text-danger">*</span> Цена
                  </label>
                  <div className="price-wrapper">
                    <div className="input-wrapper">
                      <input
                        id="create-price"
                        type="number"
                        min="0"
                        className={`edit-control edit-input ${validationErrors.price ? "is-invalid" : ""}`}
                        value={price}
                        onChange={(event) => {
                          setPrice(event.target.value);
                          if (validationErrors.price)
                            validateField("price", event.target.value);
                        }}
                        onBlur={() => validateField("price", price)}
                        data-validation-message="Цена должна быть заполнена"
                        required
                      />
                      <button
                        type="button"
                        className="input-clear-btn"
                        onClick={() => {
                          setPrice("");
                          validateField("price", "");
                        }}
                      >
                        <img src={close} alt="Очистить" />
                      </button>
                    </div>
                    <div className="price-suggest-wrapper" ref={priceButtonRef}>
                      <button
                        type="button"
                        className="price-suggest-btn"
                        onClick={handleSuggestPrice}
                        disabled={suggesting}
                      >
                        <div className="search-ai-wrapper">
                          <img
                            src={
                              suggesting
                                ? load
                                : aiResponse === "price"
                                  ? redo
                                  : bulb
                            }
                            alt="AI"
                            className={suggesting ? "spinning" : ""}
                          />
                          {suggesting
                            ? "Выполняется запрос"
                            : aiResponse === "price"
                              ? "Повторить запрос"
                              : "Узнать рыночную цену"}
                        </div>
                      </button>
                    </div>
                  </div>
                  <div
                    id="create-price-error"
                    className={`invalid-feedback ${validationErrors.price ? "d-block" : ""}`}
                  >
                    {validationErrors.price}
                  </div>
                </div>
                <img
                  src={rect}
                  style={{ height: "1px", marginBottom: "6px" }}
                />

                <div className="mb-0">
                  <label className="edit-label mb-0">Характеристики</label>
                  {categoryFields[category].map((key) => {
                    const optionKey =
                      key === "type" && category === "real_estate"
                        ? "type_real_estate"
                        : key;
                    const currentOptions = fieldOptions[optionKey];
                    return (
                      <div key={key} className="mb-2">
                        <label className="form-label small">
                          {labels[key] || key}
                        </label>
                        <div className="input-wrapper">
                          {currentOptions ? (
                            <div
                              className={`custom-select ${!params[key] ? "input-warning" : ""}`}
                              style={{ marginTop: "4px", minWidth: "456px" }}
                            >
                              <div
                                className="custom-select__trigger d-flex align-items-center gap-2"
                                onClick={() =>
                                  setOpenSelects((previous) => ({
                                    ...previous,
                                    [key]: !previous[key],
                                  }))
                                }
                              >
                                <span className="custom-select__value">
                                  {currentOptions.find(
                                    (option) => option.value === params[key],
                                  )?.label || "Не выбрано"}
                                </span>
                                <img
                                  src={arrowDown}
                                  alt="▼"
                                  className={`custom-select__arrow ms-auto mb-0 ${openSelects[key] ? "rotate" : ""}`}
                                />
                              </div>
                              {openSelects[key] && (
                                <div
                                  className="custom-select__dropdown"
                                  style={{ minWidth: "456px" }}
                                >
                                  <div
                                    className="custom-select__option"
                                    onClick={() => {
                                      updateParam(key, "");
                                      setOpenSelects((previous) => ({
                                        ...previous,
                                        [key]: false,
                                      }));
                                    }}
                                  >
                                    Не выбрано
                                  </div>
                                  {currentOptions.map((option) => (
                                    <div
                                      key={option.value}
                                      className="custom-select__option"
                                      onClick={() => {
                                        updateParam(key, option.value);
                                        setOpenSelects((previous) => ({
                                          ...previous,
                                          [key]: false,
                                        }));
                                      }}
                                    >
                                      {option.label}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <input
                              className="edit-control edit-input"
                              placeholder={labels[key] || key}
                              value={params[key] || ""}
                              onChange={(event) =>
                                updateParam(key, event.target.value)
                              }
                            />
                          )}
                          {!currentOptions && (
                            <button
                              type="button"
                              className="input-clear-btn"
                              onClick={() => updateParam(key, "")}
                            >
                              <img src={close} alt="Очистить" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <img
                  src={rect}
                  style={{ height: "1px", marginBottom: "6px" }}
                />

                <div
                  className="mb-2"
                  style={{
                    position: "relative",
                    maxWidth: "calc(100% - 97px)",
                  }}
                >
                  <label className="edit-label">Описание</label>
                  <textarea
                    className="edit-control edit-input edit-input--description mb-2"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={1000}
                  />
                  <div
                    className="d-flex justify-content-between"
                    style={{ maxHeight: "40px" }}
                  >
                    <div
                      className="price-suggest-wrapper"
                      ref={descriptionButtonRef}
                    >
                      <button
                        type="button"
                        className="price-suggest-btn"
                        onClick={handleGenerateDescription}
                        disabled={generating}
                      >
                        <div className="search-ai-wrapper">
                          <img
                            src={
                              generating
                                ? load
                                : aiResponse === "description"
                                  ? redo
                                  : bulb
                            }
                            alt="AI"
                            className={generating ? "spinning" : ""}
                          />
                          {generating
                            ? "Выполняется запрос"
                            : aiResponse === "description"
                              ? "Повторить запрос"
                              : description
                                ? "Улучшить описание"
                                : "Придумать описание"}
                        </div>
                      </button>
                    </div>
                    <small className="count-simb">
                      {description.length}/1000
                    </small>
                  </div>
                </div>

                {error && <div className="text-danger">{error}</div>}
                <div className="d-flex gap-2 justify-content-start mt-3">
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={!canSubmit || saving}
                  >
                    {saving ? "Создание..." : "Создать"}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => navigate("/ads")}
                  >
                    Отменить
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdCreate;
