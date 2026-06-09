type CardProps = {
  title: string;
  description: string;
  variant?: "default" | "timeline";
};

export default function Card({
  title,
  description,
  variant = "default",
}: CardProps) {
  return (
    <div className={`card ${variant}`}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
