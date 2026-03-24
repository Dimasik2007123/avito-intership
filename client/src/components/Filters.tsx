import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import type { Category } from "../types";
import { toggleCategory, setNeedsRevision, reset } from "../store/filtersStore";
import arrowDown from "../assets/images/arrow-down.svg";
import rectangle from "../assets/images/Rectangle.svg";

const categories: { value: Category; label: string }[] = [
  { value: "auto", label: "Авто" },
  { value: "electronics", label: "Электроника" },
  { value: "real_estate", label: "Недвижимость" },
];

function Filters() {
  const dispatch = useDispatch();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { categories: selectedCategories, needsRevisionOnly } = useSelector(
    (state: RootState) => state.filters,
  );
  return (
    <div className="card filters">
      <div className="card-body filters-body">
        <h5 className="card-title filters">Фильтры</h5>

        <div className="filters-section">
          <div
            className="filters-section-header"
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
          >
            <span>Категория</span>
            <img
              src={arrowDown}
              alt="▼"
              className={isCategoriesOpen ? "rotate" : ""}
            />
          </div>

          {isCategoriesOpen && (
            <div className="filters-section-content">
              {categories.map((cat) => (
                <div key={cat.value} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedCategories.includes(cat.value)}
                    onChange={() => dispatch(toggleCategory(cat.value))}
                  />
                  <label className="form-check-label">{cat.label}</label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rect">
          <img src={rectangle}></img>
        </div>

        <div className="filters-switch">
          <span className="switch-text">Только требующие доработок</span>
          <label className="switch-label">
            <input
              type="checkbox"
              className="switch-input"
              checked={needsRevisionOnly}
              onChange={(e) => dispatch(setNeedsRevision(e.target.checked))}
            />
            <span className="switch-slider"></span>
          </label>
        </div>
      </div>

      <button className="reset-button" onClick={() => dispatch(reset())}>
        Сбросить фильтры
      </button>
    </div>
  );
}
export default Filters;
