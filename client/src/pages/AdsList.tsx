import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { getItems } from "../api/items";
import {
  fetchAdsStart,
  fetchAdsSuccess,
  fetchAdsFailure,
  setTotalAll,
} from "../store/adsStore";
import {
  setSearch,
  setPage,
  setSort,
  toggleLayout,
} from "../store/filtersStore";
import ProductList from "../components/ProductList";
import Filters from "../components/Filters";
import union from "../assets/images/Union.svg";
import line from "../assets/images/Line 2.svg";
import arrowDown from "../assets/images/arrow-down.svg";
import arrowLeft from "../assets/images/Left.svg";
import arrowRight from "../assets/images/Right.svg";

function AdsList() {
  const dispatch = useDispatch();
  const { items, total, loading, error, totalAll } = useSelector(
    (state: RootState) => state.ads,
  );
  const {
    search,
    categories,
    needsRevisionOnly,
    page,
    sortColumn,
    sortDirection,
    layout,
  } = useSelector((state: RootState) => state.filters);
  const [inputValue, setInputValue] = useState(search);
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    const loadTotalAll = async () => {
      try {
        const data = await getItems({ limit: 1 });
        dispatch(setTotalAll(data.total));
      } catch (er) {
        console.log(er);
      }
    };
    loadTotalAll();
  }, [dispatch]);

  useEffect(() => {
    const loadAds = async () => {
      dispatch(fetchAdsStart());
      try {
        const params = {
          q: search || undefined,
          categories: categories.length > 0 ? categories.join(",") : undefined,
          needsRevision: needsRevisionOnly || undefined,
          sortColumn,
          sortDirection,
          limit: 10,
          skip: (page - 1) * 10,
        };
        const data = await getItems(params);
        dispatch(fetchAdsSuccess(data));
      } catch {
        dispatch(fetchAdsFailure());
      }
    };

    loadAds();
  }, [
    dispatch,
    search,
    categories,
    needsRevisionOnly,
    page,
    sortColumn,
    sortDirection,
  ]);

  const totalPages = Math.ceil(total / 10);

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  const declension = (
    number: number,
    words: [string, string, string],
  ): string => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return words[2];
    if (n1 > 1 && n1 < 5) return words[1];
    if (n1 === 1) return words[0];
    return words[2];
  };

  return (
    <div className="ads-list-container">
      <div className="stats">
        <div className="my">Мои объявления</div>
        <div className="total-count">
          {totalAll}{" "}
          {declension(totalAll, ["объявление", "объявления", "объявлений"])}
        </div>
      </div>
      <div className="top-panel">
        <div className="d-flex justify-content-between align-items-center">
          <div className="flex-grow-1 search-tab">
            <input
              type="text"
              className="search-tab-input"
              placeholder="Найти объявление..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              className="search-button"
              onClick={() => {
                if (inputValue) dispatch(setSearch(inputValue));
              }}
            >
              <img src={union} alt="Поиск" />
            </button>
          </div>
          <div style={{ width: "18px", padding: "0", margin: "0" }}></div>
          <div className="d-flex gap-3">
            <div className="layout-toggle">
              <button
                className={`layout-btn ${layout === "grid" ? "active" : ""}`}
                onClick={() => dispatch(toggleLayout())}
                disabled={layout === "grid"}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.03575 1.6084H1.92861C1.75182 1.6084 1.60718 1.75304 1.60718 1.92983V8.03697C1.60718 8.21376 1.75182 8.3584 1.92861 8.3584H8.03575C8.21254 8.3584 8.35718 8.21376 8.35718 8.03697V1.92983C8.35718 1.75304 8.21254 1.6084 8.03575 1.6084ZM6.99111 6.99233H2.97325V2.97447H6.99111V6.99233ZM16.0715 1.6084H9.96432C9.78754 1.6084 9.64289 1.75304 9.64289 1.92983V8.03697C9.64289 8.21376 9.78754 8.3584 9.96432 8.3584H16.0715C16.2483 8.3584 16.3929 8.21376 16.3929 8.03697V1.92983C16.3929 1.75304 16.2483 1.6084 16.0715 1.6084ZM15.0268 6.99233H11.009V2.97447H15.0268V6.99233ZM8.03575 9.64411H1.92861C1.75182 9.64411 1.60718 9.78876 1.60718 9.96554V16.0727C1.60718 16.2495 1.75182 16.3941 1.92861 16.3941H8.03575C8.21254 16.3941 8.35718 16.2495 8.35718 16.0727V9.96554C8.35718 9.78876 8.21254 9.64411 8.03575 9.64411ZM6.99111 15.028H2.97325V11.0102H6.99111V15.028ZM16.0715 9.64411H9.96432C9.78754 9.64411 9.64289 9.78876 9.64289 9.96554V16.0727C9.64289 16.2495 9.78754 16.3941 9.96432 16.3941H16.0715C16.2483 16.3941 16.3929 16.2495 16.3929 16.0727V9.96554C16.3929 9.78876 16.2483 9.64411 16.0715 9.64411ZM15.0268 15.028H11.009V11.0102H15.0268V15.028Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <div className="ms-auto mb-auto d-flex justify-items-center">
                <img src={line}></img>
              </div>
              <button
                className={`layout-btn ${layout === "list" ? "active" : ""}`}
                onClick={() => dispatch(toggleLayout())}
                disabled={layout === "list"}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.0363 2.57265H5.3042C5.21581 2.57265 5.14349 2.64498 5.14349 2.73337V3.85837C5.14349 3.94676 5.21581 4.01908 5.3042 4.01908H17.0363C17.1247 4.01908 17.1971 3.94676 17.1971 3.85837V2.73337C17.1971 2.64498 17.1247 2.57265 17.0363 2.57265ZM17.0363 8.27801H5.3042C5.21581 8.27801 5.14349 8.35033 5.14349 8.43873V9.56373C5.14349 9.65212 5.21581 9.72444 5.3042 9.72444H17.0363C17.1247 9.72444 17.1971 9.65212 17.1971 9.56373V8.43873C17.1971 8.35033 17.1247 8.27801 17.0363 8.27801ZM17.0363 13.9834H5.3042C5.21581 13.9834 5.14349 14.0557 5.14349 14.1441V15.2691C5.14349 15.3575 5.21581 15.4298 5.3042 15.4298H17.0363C17.1247 15.4298 17.1971 15.3575 17.1971 15.2691V14.1441C17.1971 14.0557 17.1247 13.9834 17.0363 13.9834ZM0.804199 3.29587C0.804199 3.44361 0.833298 3.5899 0.889835 3.72639C0.946371 3.86288 1.02924 3.9869 1.1337 4.09136C1.23817 4.19583 1.36219 4.2787 1.49868 4.33523C1.63517 4.39177 1.78146 4.42087 1.9292 4.42087C2.07694 4.42087 2.22323 4.39177 2.35972 4.33523C2.49621 4.2787 2.62023 4.19583 2.72469 4.09136C2.82916 3.9869 2.91203 3.86288 2.96856 3.72639C3.0251 3.5899 3.0542 3.44361 3.0542 3.29587C3.0542 3.14813 3.0251 3.00184 2.96856 2.86535C2.91203 2.72886 2.82916 2.60484 2.72469 2.50037C2.62023 2.39591 2.49621 2.31304 2.35972 2.2565C2.22323 2.19997 2.07694 2.17087 1.9292 2.17087C1.78146 2.17087 1.63517 2.19997 1.49868 2.2565C1.36219 2.31304 1.23817 2.39591 1.1337 2.50037C1.02924 2.60484 0.946371 2.72886 0.889835 2.86535C0.833298 3.00184 0.804199 3.14813 0.804199 3.29587ZM0.804199 9.00123C0.804199 9.14896 0.833298 9.29525 0.889835 9.43175C0.946371 9.56824 1.02924 9.69225 1.1337 9.79672C1.23817 9.90119 1.36219 9.98405 1.49868 10.0406C1.63517 10.0971 1.78146 10.1262 1.9292 10.1262C2.07694 10.1262 2.22323 10.0971 2.35972 10.0406C2.49621 9.98405 2.62023 9.90119 2.72469 9.79672C2.82916 9.69225 2.91203 9.56824 2.96856 9.43175C3.0251 9.29525 3.0542 9.14896 3.0542 9.00123C3.0542 8.85349 3.0251 8.7072 2.96856 8.57071C2.91203 8.43422 2.82916 8.3102 2.72469 8.20573C2.62023 8.10126 2.49621 8.0184 2.35972 7.96186C2.22323 7.90532 2.07694 7.87623 1.9292 7.87623C1.78146 7.87623 1.63517 7.90532 1.49868 7.96186C1.36219 8.0184 1.23817 8.10126 1.1337 8.20573C1.02924 8.3102 0.946371 8.43422 0.889835 8.57071C0.833298 8.7072 0.804199 8.85349 0.804199 9.00123ZM0.804199 14.7066C0.804199 14.8543 0.833298 15.0006 0.889835 15.1371C0.946371 15.2736 1.02924 15.3976 1.1337 15.5021C1.23817 15.6065 1.36219 15.6894 1.49868 15.7459C1.63517 15.8025 1.78146 15.8316 1.9292 15.8316C2.07694 15.8316 2.22323 15.8025 2.35972 15.7459C2.49621 15.6894 2.62023 15.6065 2.72469 15.5021C2.82916 15.3976 2.91203 15.2736 2.96856 15.1371C3.0251 15.0006 3.0542 14.8543 3.0542 14.7066C3.0542 14.5588 3.0251 14.4126 2.96856 14.2761C2.91203 14.1396 2.82916 14.0156 2.72469 13.9111C2.62023 13.8066 2.49621 13.7238 2.35972 13.6672C2.22323 13.6107 2.07694 13.5816 1.9292 13.5816C1.78146 13.5816 1.63517 13.6107 1.49868 13.6672C1.36219 13.7238 1.23817 13.8066 1.1337 13.9111C1.02924 14.0156 0.946371 14.1396 0.889835 14.2761C0.833298 14.4126 0.804199 14.5588 0.804199 14.7066Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <div className="sort-dropdown">
              <div
                className="sort-select-trigger"
                onClick={() => setIsSortOpen(!isSortOpen)}
              >
                <span>
                  {sortColumn === "createdAt" &&
                    sortDirection === "desc" &&
                    "По новизне (сначала новые)"}
                  {sortColumn === "createdAt" &&
                    sortDirection === "asc" &&
                    "По новизне (сначала старые)"}
                  {sortColumn === "title" &&
                    sortDirection === "asc" &&
                    "По названию (А-Я)"}
                  {sortColumn === "title" &&
                    sortDirection === "desc" &&
                    "По названию (Я-А)"}
                </span>
                <img src={arrowDown} alt="▼" />
              </div>
              {isSortOpen && (
                <div className="sort-dropdown-menu">
                  <div
                    className={`sort-option ${sortColumn === "createdAt" && sortDirection === "desc" ? "active" : ""}`}
                    onClick={() => {
                      dispatch(
                        setSort({ column: "createdAt", direction: "desc" }),
                      );
                      setIsSortOpen(false);
                    }}
                  >
                    По новизне (сначала новые)
                  </div>
                  <div
                    className={`sort-option ${sortColumn === "createdAt" && sortDirection === "asc" ? "active" : ""}`}
                    onClick={() => {
                      dispatch(
                        setSort({ column: "createdAt", direction: "asc" }),
                      );
                      setIsSortOpen(false);
                    }}
                  >
                    По новизне (сначала старые)
                  </div>
                  <div
                    className={`sort-option ${sortColumn === "title" && sortDirection === "asc" ? "active" : ""}`}
                    onClick={() => {
                      dispatch(setSort({ column: "title", direction: "asc" }));
                      setIsSortOpen(false);
                    }}
                  >
                    По названию (А-Я)
                  </div>
                  <div
                    className={`sort-option ${sortColumn === "title" && sortDirection === "desc" ? "active" : ""}`}
                    onClick={() => {
                      dispatch(setSort({ column: "title", direction: "desc" }));
                      setIsSortOpen(false);
                    }}
                  >
                    По названию (Я-А)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row main-content">
        <div className="col-md-3 filters-column">
          <Filters />
        </div>

        <div className="col-md-9 products-column">
          {loading ? (
            <div className="product-list-scroll d-flex align-items-center justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="product-list-scroll d-flex align-items-center justify-content-center">
              <p className="text-muted">Объявления не найдены</p>
            </div>
          ) : (
            <>
              <ProductList items={items} layout={layout} />
              {totalPages > 1 && (
                <div className="pagination-wrapper">
                  <nav className="mt-10px">
                    <ul className="pagination justify-content-end">
                      <li
                        className={`page-item ${page === 1 ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => dispatch(setPage(page - 1))}
                          disabled={page === 1}
                        >
                          <img
                            src={arrowLeft}
                            alt="Назад"
                            className={
                              page !== 1
                                ? "page-arrow--active"
                                : "page-arrow--disabled"
                            }
                          />
                        </button>
                      </li>

                      {Array.from({ length: totalPages }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <li
                            key={pageNum}
                            className={`page-item ${page === pageNum ? "active" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => null}
                              disabled
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}

                      <li
                        className={`page-item ${page === totalPages ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => dispatch(setPage(page + 1))}
                          disabled={page === totalPages}
                        >
                          <img
                            src={arrowRight}
                            alt="Вперед"
                            className={
                              page !== totalPages
                                ? "page-arrow--active"
                                : "page-arrow--disabled"
                            }
                          />
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdsList;
