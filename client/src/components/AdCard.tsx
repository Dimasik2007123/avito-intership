import type { AdCardProps } from "../types";
import { useNavigate } from "react-router-dom";
import placeholder from "../assets/images/placeholder.png";

const categoryNames: Record<string, string> = {
  auto: "Авто",
  real_estate: "Недвижимость",
  electronics: "Электроника",
};

function AdCard({
  id,
  title,
  price,
  category,
  needsRevision,
  layout,
}: AdCardProps) {
  const navigate = useNavigate();

  if (layout === "list") {
    return (
      <div className="product-list-item" onClick={() => navigate(`/ads/${id}`)}>
        <div className="product-list-item__image">
          <img src={placeholder} alt={title} />
        </div>
        <div className="product-list-item__content">
          <span className="product-list-item__category">
            {categoryNames[category]}
          </span>
          <h6 className="product-list-item__title">{title}</h6>
          <p className="product-list-item__price">{price.toLocaleString()} ₽</p>
          {needsRevision && (
            <span className="product-card__badge">Требует доработок</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="product-card" onClick={() => navigate(`/ads/${id}`)}>
      <div className="product-card__image">
        <img src={placeholder} alt={title} />
      </div>
      <div className="product-card__content">
        <span className="product-card__category">
          {categoryNames[category]}
        </span>
        <div className="product-card__info">
          <h6 className="product-card__title">{title}</h6>
          <p className="product-card__price">{price.toLocaleString()} ₽</p>
          {needsRevision && (
            <span className="product-card__badge">Требует доработок</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdCard;
