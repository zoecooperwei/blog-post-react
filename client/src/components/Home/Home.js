import { Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { postService, postEventEmitter } from "../../services/post.service";
import "./Home.css";
import PostCard from "../Common/Card";
import Carousel from 'react-bootstrap/Carousel';
const TOP_VALUE = 3;
import { useSelector } from 'react-redux';

function Home() {
    const [fetchError, setFetchError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [topPost, setTopPost] = useState([]);
    const msgSender = new postService();
    const isLoggedOut = useSelector((state) => state.auth.isLoggedOut);

    useEffect(() => {
        // component did mount: load post data
        postEventEmitter.on('post_top_data', handlePostTopEvent);
        loadTopPost();

        return () => {
            postEventEmitter.removeListener('post_top_data', handlePostTopEvent);
        }
    }, [])

    const loadTopPost = () => {
        setLoading(true);
        msgSender.getTopPost(TOP_VALUE);
    }

    const handlePostTopEvent = (msg) => {
        // console.log(JSON.stringify(msg));
        if (msg.error) {
            // error handling
            setFetchError(true);
        } else {
            setTopPost(msg.top_data.data);
            setFetchError(false);
        };
        setLoading(false);
    }

    const refresh = () => {
        loadTopPost();
    }

    let cardRows = topPost.map((post, index) => {
        return (
          <PostCard
            key={index}
            data={post}
            showRating={false}
            isGrid={false}
          ></PostCard>
        )
    })

    // let images = [placeholder1, placeholder2, placeholer3]
    let carouselItems = topPost.map((data, index) => {
        let imgSrc = data.image.url;
        return (
            <Carousel.Item key={index}>
                <img
                className="d-block w-100"
                src={imgSrc}
                alt={data.title}
                />
                <Carousel.Caption>
                <h3>Welcome to post manager</h3>
                <p>Hope you had a good time here</p>
                </Carousel.Caption>
            </Carousel.Item>
        )
    })

    if (isLoggedOut) {
        return <Navigate to="/login" />
    }

    let sectionContent = (
        <section className="features-icons bg-light text-center">
            <div className="container">
                <div className="row">
                    <div className="col-lg-4">
                        <div className="features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3">
                            <div className="features-icons-icon d-flex">
                                <i className="fa-solid fa-film m-auto text-primary"></i>
                            </div>
                            <h3>Fully Responsive</h3>
                            <p className="lead mb-0">This theme will look great on any device, no matter the size!</p>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3">
                            <div className="features-icons-icon d-flex">
                                <i className="fa-solid fa-wand-magic-sparkles m-auto text-primary"></i>
                            </div>
                            <h3>Bootstrap 5 Ready</h3>
                            <p className="lead mb-0">Featuring the latest build of the new Bootstrap 5 framework!</p>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="features-icons-item mx-auto mb-0 mb-lg-3">
                            <div className="features-icons-icon d-flex">
                                <i className="fa-regular fa-lightbulb m-auto text-primary"></i>
                            </div>
                            <h3>Easy to Use</h3>
                            <p className="lead mb-0">Ready to use with your own content, or customize the source files!</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )

    let homeContent = null;
    if (loading) {
        homeContent = (
            <div className="loadingSpinner">
                <i className="fa-solid fa-circle-notch loading"></i>
            </div>
        )
    } else {
        if(fetchError) {
            homeContent = (
                <div className="error-msg">
                    <span className="error-msg-info">Something goes wrong...Please try again</span>
                    <button className="btn btn-primary" onClick={refresh}>Refresh</button>
                </div>
            )
        } else if (topPost.length > 0) {
            let postContent = (
                <div className="post-top-cards container">
                    <div className="row">
                        {cardRows}
                    </div>
                    <div className="col-sm-12 col-md-12 more-favorite">
                        <Link to="../post" className="more-favorite-link btn">
                            <span className="text-capitalize more-favorite-link-text">Visit more</span>
                            <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            );

            homeContent = (
                <>
                    <div className="head">
                        <header className="pb-4 app-header">
                            <Carousel>
                                {carouselItems}
                            </Carousel>
                        </header>
                    </div>
                
                    {postContent}
                    {sectionContent}
                </>
            )
        } else if (topPost.length == 0) {
            homeContent = (
                <>
                    <div className="head">
                        <header className="pb-4 app-header">
                            <div className="row d-flex justify-content-center align-items-center h-100 py-5">
                                <div className="col-md-9 col-lg-6 col-xl-6">
                                <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
                                    className="img-fluid" alt="Sample image" />
                                </div>
                                <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                                    <h1 className="mb-4">Hi There!</h1>
                                    <h4 className="mb-4">Welcome to post manager</h4>
                                    <p className="mb-4">It provides post management, including create, search, edit, and delete. Click below to check it out! Hope you had a good time here, enjoy!</p>
                                    <Link to="../post" className="more-favorite-link btn">
                                        <span className="text-capitalize more-favorite-link-text">Explore more</span>
                                        <i className="fas fa-arrow-right"></i>
                                    </Link>
                                </div>
                            </div>
                        </header>
                    </div>
                
                    {sectionContent}
                </>
            )
        }
    }
    
    return homeContent;
}

export default Home;