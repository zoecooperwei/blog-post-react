import placeholder from "../../assets/placeholder.png";
import "./Card.css";
import Star from "../PostForm/PostStar";
import moment from "moment";

function PostCard(props) {
    let data = props.data;
    let imgSrc = data.image.url ? data.image.url : placeholder;
    let time = moment(data.createdAt).fromNow();
    return (
        <div className="post-card col-sm-6 col-md-4">
            <div className="post-card-body">
                <img className="post-card-image" src={imgSrc} alt="placeholder" />
          
                <div className="post-card-content">
                    <div className="post-card-subinfo post-card-content-field">
                        #{data.tags}
                    </div>
                    <div className="post-card-title post-card-content-field" title={data.title}>
                        {/* <Link to={`/post/${data._id}`} className="post-card-link"> */}
                        {data.title}
                        {/* </Link> */}
                    </div>
                    <div className="post-card-desp post-card-content-field">
                        <p title={data.desp}>
                            {data.desp}
                        </p>
                    </div>
                    {props.showRating &&
                    <div className="post-card-rating">
                        <Star
                            rating={data.rating}
                            disableClick={true}
                        ></Star>
                    </div>}
                    <div className="post-card-others post-card-content-field" title={`${time}`}>
                        {/* Directed by {data.director}, {data.year} */}
                        {data.username}, {time}
                    </div>
                    {props.isGrid &&
                        <div className="post-card-actions post-card-content-field">
                            <div className="post-card-action" 
                            onClick={() => props.editPost(data)}
                            title="Edit"
                            >
                                <i className="fa-solid fa-pen-to-square"></i>
                            </div>
                            <div className="post-card-action" 
                            onClick={() => props.deletePost(data._id)}
                            title="Delete"
                            >
                                <i className="fa-solid fa-trash"></i>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default PostCard;