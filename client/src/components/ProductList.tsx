import AdCard from "./AdCard";
import type { ItemsGetOut } from "../types";

interface ProductListProps {
  items: ItemsGetOut["items"];
  layout: "grid" | "list";
}

function ProductList({ items, layout }: ProductListProps) {
  if (layout === "grid") {
    return (
      <div className="product-list-scroll">
        <div className="product-grid">
          {items.map((item) => (
            <AdCard key={item.id} {...item} layout={layout} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-scroll hide-scrollbar">
      <div className="product-list">
        {items.map((item) => (
          <AdCard key={item.id} {...item} layout={layout} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
