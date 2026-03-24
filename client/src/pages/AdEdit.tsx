import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { updateItem, getItem } from "../api/items";
import {
  fetchAdStart,
  fetchAdSuccess,
  fetchAdFailure,
  updateAdFailure,
  updateAdStart,
  updateAdSuccess,
  clearCurrentItem,
} from "../store/adsStore";
import type {
  AutoItemParams,
  RealEstateItemParams,
  ElectronicsItemParams,
} from "../types";
import { paramLabels } from "../types";
import { type Item, categoryFields } from "../types";
import { saveDraft, clearDraft } from "../store/draftsStore";
import { generateDescription, suggestPrice } from "../api/llm";
import AITooltip from "../components/AITooltip";
import { showNotification } from "../store/notificationStore";
import arrowDown from "../assets/images/icon.svg";
import rect from "../assets/images/Rectangle (1).svg";
import close from "../assets/images/close.svg";
import bulb from "../assets/images/Bulb.svg";
import redo from "../assets/images/Redo.svg";
import load from "../assets/images/load.svg";

function AdEdit() {
  const descriptionButtonRef = useRef<HTMLDivElement>(null);
  const priceButtonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { loading, updating } = useSelector((state: RootState) => state.ads);
  const [formData, setFormData] = useState<Item | null>(null);
  const [generating, setGenerating] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const saveDraftTimer = useRef<number | null>(null);
  const isEditingDescription = useRef(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [aiTooltip, setAiTooltip] = useState<{
    show: boolean;
    message: string;
    targetRef: React.RefObject<HTMLElement | null>;
    type: "description" | "price";
    onApply: () => void;
  } | null>(null);
  const [hasAiResponse, setHasAiResponse] = useState<
    "description" | "price" | null
  >(null);
  const [openParamSelects, setOpenParamSelects] = useState<
    Record<string, boolean>
  >({});

  const toggleParamSelect = (key: string) => {
    setOpenParamSelects((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

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

  //загрузка товара
  useEffect(() => {
    if (!id) return;
    const loadAd = async () => {
      dispatch(fetchAdStart());
      try {
        const numericId = parseInt(id, 10);
        const data = await getItem(numericId);
        dispatch(fetchAdSuccess(data));
        const savedDraft = localStorage.getItem(`draft_${id}`);
        if (savedDraft) {
          const draftData = JSON.parse(savedDraft);
          const mergedData = { ...data, ...draftData };
          setFormData(mergedData);
        } else {
          setFormData(data);
        }
      } catch {
        dispatch(fetchAdFailure());
      }
    };

    loadAd();

    return () => {
      dispatch(clearCurrentItem());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!formData || !id) return;
    if (saveDraftTimer.current) {
      window.clearTimeout(saveDraftTimer.current);
    }
    saveDraftTimer.current = setTimeout(() => {
      dispatch(saveDraft({ id: String(id), data: formData }));
    }, 600) as unknown as number;

    return () => {
      if (saveDraftTimer.current) {
        window.clearTimeout(saveDraftTimer.current);
        saveDraftTimer.current = null;
      }
    };
  }, [dispatch, id, formData]);

  // Валидация
  const showInputError = (inputElement: HTMLElement, errorMessage: string) => {
    const errorElement = document.getElementById(`${inputElement.id}-error`);
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.classList.add("d-block");
    }
    inputElement.classList.add("is-invalid");
  };

  const hideInputError = (inputElement: HTMLElement) => {
    const errorElement = document.getElementById(`${inputElement.id}-error`);
    if (errorElement) {
      errorElement.classList.remove("d-block");
      errorElement.textContent = "";
    }
    inputElement.classList.remove("is-invalid");
  };

  const getLabelText = (inputElement: HTMLElement) => {
    const id = inputElement.id;
    if (!id || !formRef.current) return "Поле";
    const label = formRef.current.querySelector(`label[for="${id}"]`);
    if (label) return (label.textContent || "Поле").replace("*", "").trim();
    return "Поле";
  };

  const checkInputValidity = (
    inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  ) => {
    const customMessage = inputElement.getAttribute("data-validation-message");
    if (inputElement.required && String(inputElement.value).trim() === "") {
      const message =
        customMessage ||
        `${getLabelText(inputElement as HTMLElement)} должно быть заполнено`;
      inputElement.setCustomValidity(message);
    } else if (
      inputElement.type === "number" &&
      parseFloat(inputElement.value) < 0
    ) {
      inputElement.setCustomValidity("Цена не может быть отрицательной");
    } else {
      inputElement.setCustomValidity("");
    }

    if (!inputElement.validity.valid) {
      showInputError(
        inputElement as HTMLElement,
        inputElement.validationMessage,
      );
    } else {
      hideInputError(inputElement as HTMLElement);
    }

    if (!inputElement.required && String(inputElement.value).trim() === "") {
      inputElement.classList.add("input-warning");
    } else {
      inputElement.classList.remove("input-warning");
    }
  };

  // Навешивание обработчиков валидации
  useEffect(() => {
    if (!formRef.current || !formData) return;
    const formElement = formRef.current;

    const allElements = Array.from(
      formElement.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >(".edit-control"),
    );

    const buttonElement =
      formElement.querySelector<HTMLButtonElement>(".btn-save");
    if (!buttonElement) return;

    const handlersMap = new Map<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
      {
        handleInput: () => void;
        handleFocus: () => void;
        handleBlur: () => void;
      }
    >();

    const updateButtonStateLocal = () => {
      const hasErrors = allElements.some((el) => !el.validity.valid);
      buttonElement.disabled = hasErrors;
      setIsFormValid(!hasErrors);
    };

    allElements.forEach((inputElement) => {
      const handleInput = () => {
        const newValue = inputElement.value;
        if (inputElement.validity.valid) {
          hideInputError(inputElement as HTMLElement);
        }

        setFormData((prev) => {
          if (!prev) return null;
          const fieldId = inputElement.id;
          if (fieldId === "title") {
            return { ...prev, title: newValue };
          }
          if (fieldId === "price") {
            const numValue = parseInt(newValue);
            return { ...prev, price: isNaN(numValue) ? 0 : numValue };
          }
          if (fieldId === "description") {
            return { ...prev, description: newValue };
          }
          if (fieldId?.startsWith("param-")) {
            const paramKey = fieldId.replace("param-", "");
            return {
              ...prev,
              params: { ...prev.params, [paramKey]: newValue },
            };
          }
          return prev;
        });
        updateButtonStateLocal();
      };
      const handleFocus = () => {
        hideInputError(inputElement as HTMLElement);
      };

      const handleBlur = () => {
        checkInputValidity(inputElement);
        updateButtonStateLocal();
      };

      inputElement.addEventListener("focus", handleFocus);
      inputElement.addEventListener("input", handleInput);
      inputElement.addEventListener("blur", handleBlur);

      handlersMap.set(inputElement, { handleInput, handleFocus, handleBlur });
    });

    allElements.forEach((input) => {
      if (input.required && String(input.value).trim() === "") {
        input.setCustomValidity(
          `${getLabelText(input as HTMLElement)} должно быть заполнено`,
        );
      } else {
        input.setCustomValidity("");
      }
    });
    updateButtonStateLocal();

    return () => {
      handlersMap.forEach((handlers, inputElement) => {
        inputElement.removeEventListener("input", handlers.handleInput);
        inputElement.removeEventListener("focus", handlers.handleFocus);
        inputElement.removeEventListener("blur", handlers.handleBlur);
      });
    };
  }, [formData]);

  //Принудительная валидация
  useEffect(() => {
    if (!formRef.current || !formData) return;

    const timer = setTimeout(() => {
      const form = formRef.current;
      if (!form) return;

      const controls = form.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >(".edit-control");

      controls.forEach((el) => {
        checkInputValidity(el);
      });

      const button = form.querySelector<HTMLButtonElement>(".btn-save");
      if (button) {
        const hasErrors = Array.from(controls).some((el) => !el.validity.valid);
        button.disabled = hasErrors || updating;
        setIsFormValid(!hasErrors);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [formData, updating]);

  // Обработчики
  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleSave = async () => {
    if (!formData || !id) return;
    dispatch(updateAdStart());
    try {
      const numericId = parseInt(id, 10);
      const payload = {
        category: formData.category,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        params: { ...formData.params },
      };
      if (payload.category === "real_estate") {
        const params = payload.params as RealEstateItemParams;

        if (typeof params.area === "string") {
          params.area = params.area ? parseFloat(params.area) : undefined;
        }
        if (typeof params.floor === "string") {
          params.floor = params.floor ? parseInt(params.floor, 10) : undefined;
        }
        if (!params.address) params.address = undefined;
        if (!params.type) params.type = undefined;
      }

      if (payload.category === "auto") {
        const params = payload.params as AutoItemParams;

        if (typeof params.yearOfManufacture === "string") {
          params.yearOfManufacture = params.yearOfManufacture
            ? parseInt(params.yearOfManufacture, 10)
            : undefined;
        }
        if (typeof params.mileage === "string") {
          params.mileage = params.mileage
            ? parseInt(params.mileage, 10)
            : undefined;
        }
        if (typeof params.enginePower === "string") {
          params.enginePower = params.enginePower
            ? parseInt(params.enginePower, 10)
            : undefined;
        }

        if (!params.brand) params.brand = undefined;
        if (!params.model) params.model = undefined;
        if (!params.transmission) params.transmission = undefined;
      }

      if (payload.category === "electronics") {
        const params = payload.params as ElectronicsItemParams;
        if (!params.type) params.type = undefined;
        if (!params.brand) params.brand = undefined;
        if (!params.model) params.model = undefined;
        if (!params.condition) params.condition = undefined;
        if (!params.color) params.color = undefined;
      }

      await updateItem(numericId, payload);
      const updatedItem = await getItem(numericId);
      dispatch(updateAdSuccess(updatedItem));
      dispatch(clearDraft(id));
      dispatch(
        showNotification({
          type: "success",
        }),
      );
      navigate(`/ads/${id}`);
    } catch {
      dispatch(updateAdFailure());
      dispatch(
        showNotification({
          type: "error",
        }),
      );
    }
  };

  const handleGenerateDescription = async () => {
    if (aiTooltip?.type === "description") {
      setAiTooltip(null);
    }
    if (!formData) return;
    setGenerating(true);
    try {
      const aiResponse = await generateDescription(formData);
      setHasAiResponse("description");
      setAiTooltip({
        show: true,
        message: aiResponse,
        targetRef: descriptionButtonRef,
        type: "description",
        onApply: () => {
          const input = document.getElementById(
            "description",
          ) as HTMLInputElement;
          if (input) {
            input.value = aiResponse;
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.blur();
          }
          handleChange("description", aiResponse);
          if (id && formData) {
            const updatedFormData = { ...formData, description: aiResponse };
            dispatch(saveDraft({ id: String(id), data: updatedFormData }));
          }
          setAiTooltip(null);
          setHasAiResponse(null);
        },
      });
    } catch {
      setAiTooltip({
        show: true,
        message:
          "Ошибка при запросе к AI. Попробуйте повторить запрос или закройте уведомление.",
        targetRef: descriptionButtonRef,
        type: "description",
        onApply: () => {},
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSuggestPrice = async () => {
    if (aiTooltip?.type === "price") {
      setAiTooltip(null);
    }
    if (!formData) return;
    setSuggesting(true);
    try {
      const aiResponse = await suggestPrice(formData);
      setHasAiResponse("price");
      let extractedPrice: number | null = null;
      const priceMatch = aiResponse.match(
        /(\d[\d\s]*)\s*[–-]\s*(\d[\d\s]*)\s*₽/,
      );
      if (priceMatch) {
        const priceStr = priceMatch[1].replace(/\s/g, "");
        extractedPrice = parseInt(priceStr, 10);
      }
      setAiTooltip({
        show: true,
        message: aiResponse,
        type: "price",
        targetRef: priceButtonRef,
        onApply: () => {
          if (extractedPrice && extractedPrice > 0) {
            const input = document.getElementById("price") as HTMLInputElement;
            if (input) {
              input.value = String(extractedPrice);
              input.dispatchEvent(new Event("input", { bubbles: true }));
              if (id && formData) {
                const updatedFormData = {
                  ...formData,
                  price: extractedPrice,
                };
                dispatch(saveDraft({ id: String(id), data: updatedFormData }));
              }
              input.blur();
            }
          }
          setAiTooltip(null);
          setHasAiResponse(null);
        },
      });
    } catch {
      setAiTooltip({
        show: true,
        message:
          "Ошибка при запросе к AI. Попробуйте повторить запрос или закройте уведомление.",
        targetRef: priceButtonRef,
        type: "price",
        onApply: () => {},
      });
    } finally {
      setSuggesting(false);
    }
  };

  const getEmptyParams = (
    category: string,
  ): Record<string, string | number> => {
    const fields = categoryFields[category] || [];
    return fields.reduce(
      (acc, field) => {
        acc[field] = "";
        return acc;
      },
      {} as Record<string, string | number>,
    );
  };

  const handleCategoryChange = (newCategory: string) => {
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        category: newCategory as "auto" | "real_estate" | "electronics",
        params: getEmptyParams(newCategory),
      };
    });
  };

  if (loading || !formData) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }
  const labels = paramLabels[formData.category] || {};
  const getSelectValidationClass = (key: string) => {
    const value = formData?.params[key as keyof typeof formData.params] ?? "";
    const strValue = String(value).trim();
    if (strValue === "") {
      return "input-warning";
    }
    return "";
  };

  return (
    <div>
      {aiTooltip?.show && (
        <AITooltip
          message={aiTooltip.message}
          targetRef={aiTooltip.targetRef}
          onApply={aiTooltip.onApply}
          onClose={() => setAiTooltip(null)}
        />
      )}
      <div className="row">
        <div className={"d-flex"}>
          <div className="card edit">
            <div className="card-body edit-body p-1px">
              <h2 className="card-title edit-title">
                Редактирование объявления
              </h2>

              <form ref={formRef} className="d-flex flex-column gap-2">
                <div
                  className="d-flex flex-column gap-1 mb-2"
                  style={{ position: "relative" }}
                >
                  <label className="edit-label mb-0">Категория</label>
                  <div
                    className="custom-select"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  >
                    <span className="custom-select__value">
                      {formData.category === "electronics" && "Электроника"}
                      {formData.category === "auto" && "Транспорт"}
                      {formData.category === "real_estate" && "Недвижимость"}
                    </span>
                    <img
                      src={arrowDown}
                      alt="▼"
                      className={`custom-select__arrow ${isCategoryOpen ? "rotate" : ""}`}
                    />
                  </div>
                  {isCategoryOpen && (
                    <div className="custom-select__dropdown">
                      <div
                        className="custom-select__option"
                        onClick={() => {
                          handleCategoryChange("electronics");
                          setIsCategoryOpen(false);
                        }}
                      >
                        Электроника
                      </div>
                      <div
                        className="custom-select__option"
                        onClick={() => {
                          handleCategoryChange("auto");
                          setIsCategoryOpen(false);
                        }}
                      >
                        Транспорт
                      </div>
                      <div
                        className="custom-select__option"
                        onClick={() => {
                          handleCategoryChange("real_estate");
                          setIsCategoryOpen(false);
                        }}
                      >
                        Недвижимость
                      </div>
                    </div>
                  )}
                </div>
                <img
                  src={rect}
                  style={{ height: "1px", marginBottom: "6px" }}
                ></img>

                <div className="mb-2">
                  <label htmlFor="title" className="edit-label">
                    <span className="text-danger">*</span> Название
                  </label>
                  <div className="input-wrapper">
                    <input
                      placeholder="MacBook 16"
                      id="title"
                      type="text"
                      className="edit-control edit-input"
                      defaultValue={formData.title}
                      data-validation-message="Название должно быть заполнено"
                      required
                    />
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => {
                        const input = document.getElementById(
                          "title",
                        ) as HTMLInputElement;
                        if (input) {
                          input.value = "";
                          input.dispatchEvent(
                            new Event("input", { bubbles: true }),
                          );
                          input.focus();
                        }
                      }}
                    >
                      <img src={close} alt="Очистить" />
                    </button>
                  </div>
                  <div id="title-error" className="invalid-feedback"></div>
                </div>
                <img
                  src={rect}
                  style={{ height: "1px", marginBottom: "6px" }}
                ></img>

                <div className="mb-2">
                  <label htmlFor="price" className="edit-label">
                    <span className="text-danger">*</span> Цена
                  </label>
                  <div className="price-wrapper">
                    <div className="input-wrapper">
                      <input
                        id="price"
                        type="number"
                        className="edit-control edit-input"
                        data-validation-message="Цена должна быть заполнена"
                        defaultValue={formData.price}
                        required
                        min="0"
                      />
                      <button
                        type="button"
                        className="input-clear-btn"
                        onClick={() => {
                          const input = document.getElementById(
                            "price",
                          ) as HTMLInputElement;
                          if (input) {
                            input.value = "0";
                            input.dispatchEvent(
                              new Event("input", { bubbles: true }),
                            );
                            input.focus();
                          }
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
                        {suggesting ? (
                          <div className="search-ai-wrapper">
                            <img
                              src={load}
                              alt="Выполняется запрос"
                              className="spinning"
                            />
                            Выполняется запрос
                          </div>
                        ) : hasAiResponse === "price" ? (
                          <div className="search-ai-wrapper">
                            <img src={redo} alt="Повторить запрос" />
                            Повторить запрос
                          </div>
                        ) : (
                          <div className="search-ai-wrapper">
                            <img src={bulb} alt="Узнать рыночную цену" />
                            Узнать рыночную цену
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                  <div id="price-error" className="invalid-feedback"></div>
                </div>

                <img
                  src={rect}
                  style={{ height: "1px", marginBottom: "6px" }}
                ></img>

                <div className="mb-0">
                  <label className="edit-label mb-0">Характеристики</label>
                  {categoryFields[formData.category]?.map((key) => {
                    const value =
                      formData.params[key as keyof typeof formData.params];

                    let optionsKey = key;
                    if (key === "type" && formData.category === "real_estate") {
                      optionsKey = "type_real_estate";
                    }

                    const options = fieldOptions[optionsKey];
                    const isSelect = !!options;
                    const placeholderText = labels[key] || key;

                    return (
                      <div key={key} className="mb-2">
                        <label className="form-label small">
                          {labels[key] || key}
                        </label>
                        <div className="input-wrapper">
                          {isSelect ? (
                            <div
                              className={`custom-select ${getSelectValidationClass(key)}`}
                              style={{ marginTop: "4px", minWidth: "456px" }}
                            >
                              <input
                                type="hidden"
                                id={`param-${key}-hidden`}
                                name={`param-${key}`}
                                value={String(value ?? "")}
                                data-validation-message={`Поле "${labels[key] || key}" должно быть заполнено`}
                              />
                              <div
                                className="custom-select__trigger d-flex align-items-center gap-2"
                                onClick={() => toggleParamSelect(key)}
                                style={{ minWidth: "100%" }}
                              >
                                <span className="custom-select__value">
                                  {options.find(
                                    (opt) => opt.value === String(value || ""),
                                  )?.label || "Не выбрано"}
                                </span>
                                <img
                                  src={arrowDown}
                                  alt="▼"
                                  className={`custom-select__arrow ms-auto mb-0 ${openParamSelects[key] ? "rotate" : ""}`}
                                />
                              </div>
                              {openParamSelects[key] && (
                                <div
                                  className="custom-select__dropdown"
                                  style={{ minWidth: "456px" }}
                                >
                                  <div
                                    className="custom-select__option"
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev!,
                                        params: { ...prev!.params, [key]: "" },
                                      }));
                                      toggleParamSelect(key);
                                    }}
                                  >
                                    Не выбрано
                                  </div>
                                  {options.map((opt) => (
                                    <div
                                      key={opt.value}
                                      className={`custom-select__option ${String(value || "") === opt.value ? "active" : ""}`}
                                      onClick={() => {
                                        setFormData((prev) => ({
                                          ...prev!,
                                          params: {
                                            ...prev!.params,
                                            [key]: opt.value,
                                          },
                                        }));
                                        toggleParamSelect(key);
                                      }}
                                    >
                                      {opt.label}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <input
                              id={`param-${key}`}
                              type="text"
                              placeholder={placeholderText}
                              className="edit-control edit-input"
                              defaultValue={String(value || "")}
                              data-field={`params.${key}`}
                            />
                          )}
                          {!isSelect && (
                            <button
                              type="button"
                              className="input-clear-btn"
                              onClick={() => {
                                const input = document.getElementById(
                                  `param-${key}`,
                                ) as HTMLInputElement;
                                if (input) {
                                  input.value = "";
                                  input.dispatchEvent(
                                    new Event("input", { bubbles: true }),
                                  );
                                  input.focus();
                                }
                              }}
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
                ></img>

                <div
                  className="mb-2"
                  style={{
                    position: "relative",
                    maxWidth: "calc(100% - 97px)",
                  }}
                >
                  <label className="edit-label">Описание</label>
                  <textarea
                    id="description"
                    className="edit-control edit-input edit-input--description mb-2"
                    defaultValue={formData.description || ""}
                    maxLength={1000}
                    onFocus={() => (isEditingDescription.current = true)}
                    onBlur={() => (isEditingDescription.current = false)}
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
                        {generating ? (
                          <div className="search-ai-wrapper">
                            <img
                              src={load}
                              alt="Выполняется запрос"
                              className=" spinning"
                            />
                            Выполняется запрос
                          </div>
                        ) : hasAiResponse === "description" ? (
                          <div className="search-ai-wrapper">
                            <img src={redo} alt="Повторить запрос" />
                            Повторить запрос
                          </div>
                        ) : formData.description ? (
                          <div className="search-ai-wrapper">
                            <img src={bulb} alt="Улучшить описание" />
                            Улучшить описание
                          </div>
                        ) : (
                          <div className="search-ai-wrapper">
                            <img src={bulb} alt="Придумать описание" />
                            Придумать описание
                          </div>
                        )}
                      </button>
                    </div>
                    <small className="count-simb">
                      {formData.description?.length || 0}/1000
                    </small>
                  </div>
                </div>

                <div className="d-flex gap-2 justify-content-start mt-3">
                  <button
                    type="button"
                    className="btn-save"
                    style={{ cursor: "pointer" }}
                    onClick={handleSave}
                    disabled={!isFormValid || updating}
                  >
                    Сохранить
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/ads/${id}`)}
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

export default AdEdit;
