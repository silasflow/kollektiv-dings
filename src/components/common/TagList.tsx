type TagListProps = {
  items: string[];
  className?: string;
};

export default function TagList({ items, className = '' }: TagListProps) {
  if (items.length === 0) return null;

  return (
    <ul className={`tag-list ${className}`}>
      {items.map((item) => (
        <li className="tag-list__item paragraph" key={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}