import "./Card.css";
export default function Card(props) {
    return (
        <div className={`card ${props.color}`}>
            <p className="card-head">{props.head}</p>
            <h1 className="card-value">{props.value}</h1>
        </div>
    )
}