import { categoryLabel } from "../../lib/incidentMeta.js";
import { CategoryIcon } from "./icons.jsx";

export default function CategoryBadge({ category }) {
  return (
    <span className="category-badge">
      <CategoryIcon category={category} />
      {categoryLabel(category)}
    </span>
  );
}
