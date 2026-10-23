import { Link } from "react-router-dom";

function AnimeCard({ anime }) {
  const data = anime.node;

  return (
    <Link className="anime-card-link" to={`/anime/${data.id}`}>
      <article className="anime-card">
        {data.main_picture && (
          <div className="anime-card-poster">
            <img
              className="anime-card-image"
              src={data.main_picture.large}
              alt={data.title}
            />

            <span className="anime-type">{data.media_type}</span>
          </div>
        )}

        <div className="anime-card-content">
          <h2>{data.title}</h2>
        </div>
      </article>
    </Link>
  );
}

export default AnimeCard;
