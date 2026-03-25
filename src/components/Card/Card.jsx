import "./Card.css";

function Card({ title, description, price, Icon }) {
  return (
    <div className="card">
      <div className="left-section">
        {Icon ? <Icon className="card-icon" /> : null}
      </div>
      <div className="right-section">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        <span className="card-price">${price}</span>
      </div>
    </div>
  );
}

export default Card;